---
title: "Building Tileforge"
date: 2026-02-16
description: "How a browser-based tile slicer grew into a full-stack platform with server-side processing, PMTiles, OAuth, and Stripe billing."
tags: ["rust", "wasm", "webdev"]
---

# Building Tileforge

I play in a D&D campaign set in Eberron and the DM had this massive world map — something like 8000x5000 pixels. We wanted a way to display it in the browser so the whole party could pan and zoom around it, but trying to shove an image that size into a Leaflet map viewer directly was not going to work. What you actually need are XYZ tiles — small square images organized in a `{zoom}/{x}/{y}.png` folder structure that map libraries know how to lazy-load as you pan and zoom around.

There are tools out there that do this but they all either require uploading your image to someone's server or running some Python script with a dozen dependencies. I wanted something that runs entirely in the browser with no uploads. Your image never leaves your machine.

So I built Tileforge. The tiling engine is written in Rust, compiled to WebAssembly, and runs inside a Web Worker in the browser. There's also a native CLI if you prefer working from the terminal. This post walks through how it works and some of the decisions I made along the way.

## The Problem

Map libraries like Leaflet, MapLibre and OpenLayers all expect tile sets. At zoom level 0 you have a single tile showing the whole image. At zoom 1 you have a 2x2 grid, at zoom 2 a 4x4 grid, and so on. Each zoom level doubles the grid in both dimensions. The library only loads the tiles visible in the viewport so you can have an absurdly large image and it still feels snappy because you're only ever rendering a few small PNGs at a time.

The math for figuring out how many zoom levels you need is straightforward:

```
max_zoom = ceil(log2(max(width, height) / tile_size))
```

A 10,000 pixel image with 256px tiles gives you `ceil(log2(39.06))` = 6 zoom levels. At zoom 6 that's a 64x64 grid = 4,096 tiles. Add in all the lower zoom levels and you end up with 5,461 tiles total. The key insight is that each tile is tiny (256x256 PNG) so even thousands of them compress well into a zip.

## Architecture

I wanted the tiling engine to be completely separate from any browser or WASM concerns. This way I can test and benchmark it natively without any browser overhead. The project is a Rust workspace split into three parts:

```
tileforge/
├── crates/
│   ├── core/    # Pure Rust tiling library. No WASM awareness.
│   └── wasm/    # Thin wasm-bindgen wrapper over core
├── cli/         # Native CLI binary (uses core directly)
└── web/         # Next.js app with Web Worker
```

The `core` crate does all the actual work — decoding images, resizing, cropping tiles, encoding PNGs, writing zip files. It has no idea whether it's running natively or in a browser. The `wasm` crate is just a thin binding layer that accepts `&[u8]` from JavaScript and calls into core. The CLI binary also uses core directly.

This separation is the most important architectural decision in the whole project. It means I can run `cargo test` and get full coverage of the tiling logic without spinning up a browser, and native benchmarks give me real performance numbers without WASM overhead muddying things up.

## Tiling Math

At zoom level `z` the grid is `2^z × 2^z` tiles. To figure out where each tile's pixels come from in the source image you need to map canvas coordinates back to source coordinates. The canvas at zoom `z` is `grid * tile_size` pixels on a side, and the source image gets scaled uniformly to fit inside that canvas.

```rust
let grid_size = 1u32 << z;          // 2^z
let canvas_size = grid_size * tile_size;

let max_dim = width.max(height) as u64;
let scaled_w = ((width as u64 * canvas_size as u64) / max_dim).max(1) as u32;
let scaled_h = ((height as u64 * canvas_size as u64) / max_dim).max(1) as u32;
```

Uniform scaling based on `max(width, height)` means non-square images preserve their aspect ratio. Tiles that extend beyond the image area are just transparent. This is important because the tile grid is always square but most images aren't.

For each tile at position `(x, y)` you crop a `tile_size × tile_size` region from the scaled canvas. The source coordinates for that crop are:

```rust
let src_x_start = tile_col as f64 * tile_size as f64 * max_dim / canvas as f64;
let src_y_start = tile_row as f64 * tile_size as f64 * max_dim / canvas as f64;
```

Then you crop that region from the source, resize it to tile dimensions, encode it as PNG, and write it into the zip.

## The Rust Core

The core crate is built on the `image` crate for decoding and the `png` crate for streaming row-by-row access to large PNGs. Here's what the main entry point looks like:

```rust
pub fn process_bytes<W, F>(
    &self,
    bytes: &[u8],
    writer: W,
    on_progress: F,
) -> Result<TileOutput, TilerError>
where
    W: Write + Seek,
    F: Fn(TileProgress),
{
    let is_png = streaming::read_png_dimensions(bytes).is_some();
    let is_large = streaming::should_use_streaming(bytes, STREAMING_THRESHOLD);

    if is_png && is_large {
        let streaming = StreamingTiler::new(self.config.clone());
        streaming.process_png(std::io::Cursor::new(bytes), writer, on_progress)
    } else if !is_png && is_large {
        let img = image::load_from_memory(bytes)?;
        let streaming = StreamingTiler::new(self.config.clone());
        streaming.process_image(&img, writer, on_progress)
    } else {
        let img = image::load_from_memory(bytes)?;
        self.process_image(&img, writer, on_progress)
    }
}
```

Three strategies, automatically selected based on the image. The progress callback lets both the CLI and WASM wrapper report tile-by-tile progress back to the user.

## Processing Strategies

### Naive (small images)

Full decode into memory, resize to each zoom level's canvas size, crop tiles from the canvas. Simple and fast. For a 5,000 pixel image this takes maybe a second or two natively.

```rust
let resized = img.resize_exact(scaled_w, scaled_h, FilterType::Lanczos3);
let mut canvas_buf = RgbaImage::new(canvas_size, canvas_size);
image::imageops::overlay(&mut canvas_buf, &resized.to_rgba8(), 0, 0);
```

The problem is memory. A 10,000x10,000 image is ~381 MB just for the decoded RGBA pixels. Add a resized copy for each zoom level and you're looking at multiple gigabytes. WASM linear memory has a practical ceiling around 1.5-2 GB in most browsers so this approach hits a wall quickly.

### Streaming PNG (large PNGs)

For large PNGs I use the `png` crate to decode row-by-row instead of loading the whole thing into memory. For each tile row at max zoom you only need to decode the source rows that contribute to those tiles. Once the tiles for that row are extracted, the source rows get dropped.

Lower zoom levels are built by merging tiles bottom-up. Every pair of tile rows triggers a merge: four tiles (2x2) get composited into one tile at the parent zoom level. This cascades all the way down to zoom 0.

```rust
fn push_row(&mut self, zoom: u32, row_tiles: Vec<RgbaImage>, ...) {
    if let Some(prev_row) = self.pending[z].take() {
        let merged = merge_tile_rows(&prev_row, &row_tiles, self.tile_size);
        // write merged tiles to zip, then cascade to zoom-1
        if parent_zoom > self.min_zoom {
            self.push_row(parent_zoom, merged, ...)?;
        }
    } else {
        self.pending[z] = Some(row_tiles);
    }
}
```

This pyramid builder means lower zoom levels are generated with no additional source image access. Peak memory drops to roughly one tile row's worth of source data instead of the entire image.

### Strip Extraction (large non-PNGs)

JPEG and WebP don't support row-by-row decoding the way PNG does, so you have to fully decode them. But you can still avoid creating resized copies at every zoom level. Each tile is individually cropped and resampled from the source image, and the pyramid builder handles lower zooms the same way.

The auto-selection threshold is 256 MB of decoded RGBA. Below that the naive approach is fine. Above that the streaming strategies kick in.

## Mercator Projection

The default flat projection works great for fantasy maps, floor plans, artwork — anything that isn't a real-world geographic map. But I also wanted Mercator support for equirectangular world maps.

Web Mercator (EPSG:3857) remaps the Y axis so that equal-size tile rows cover equal latitude bands in Mercator space rather than equal pixel bands. The math converts between canvas position and source position through latitude:

```rust
pub fn canvas_y_to_source_y(t: f64) -> f64 {
    let lat = (PI * (1.0 - 2.0 * t)).sinh().atan();
    (MAX_LAT - lat) / (2.0 * MAX_LAT)
}
```

Where `t` is the normalized canvas position (0 = top, 1 = bottom) and `MAX_LAT` is about 85.051 degrees — the standard Web Mercator cutoff. The X axis doesn't change between the two projections since both are linear in longitude.

In practice this means near the poles the tiles pull from a narrow band of source pixels (stretching them) and near the equator they pull from a wider band (compressing them). The result matches what you'd see on Google Maps or OpenStreetMap.

## WASM and the Browser

The `wasm` crate is intentionally thin. It takes image bytes and a config object from JavaScript, calls into core, and returns a zip as `Vec<u8>`:

```rust
#[wasm_bindgen(js_name = processTiles)]
pub fn process_tiles(
    image_bytes: &[u8],
    config: WasmTileConfig,
    on_progress: &js_sys::Function,
) -> Result<Vec<u8>, JsError> {
    let core_config = TileConfig {
        tile_size: config.tile_size,
        min_zoom: config.min_zoom,
        max_zoom: config.max_zoom,
        projection,
    };

    let tiler = Tiler::new(core_config);
    let mut buf = std::io::Cursor::new(Vec::new());

    tiler.process_bytes(image_bytes, &mut buf, |p| {
        let _ = on_progress.call3(
            &JsValue::NULL,
            &JsValue::from(p.tiles_done),
            &JsValue::from(p.tiles_total),
            &JsValue::from(p.zoom),
        );
    })?;

    Ok(buf.into_inner())
}
```

Built with `wasm-pack --target no-modules` so the output is a plain script that works with `importScripts()` in a Web Worker. The `--target web` option would give you ES module output but that doesn't play nice with workers in all bundlers.

## The Web Worker Problem

This is where things got interesting. The WASM processing is synchronous — it blocks whatever thread it's running on. If you run it on the main thread your entire UI freezes. So it has to run in a Web Worker.

The problem is that Next.js with Turbopack cannot bundle WASM imports inside Web Workers. I tried a few approaches and they all ended with Turbopack either stalling or throwing cryptic errors. The solution was to just put the worker as a plain JavaScript file in `public/` alongside the WASM output:

```javascript
// public/tileforge.worker.js
importScripts("/wasm/tileforge_wasm.js");

self.onmessage = async function(e) {
    const msg = e.data;
    if (msg.type === "init") {
        await wasm_bindgen("/wasm/tileforge_wasm_bg.wasm");
        self.postMessage({ type: "ready" });
    } else if (msg.type === "process") {
        // call into WASM, post progress and result back
    }
};
```

On the React side a custom hook manages the worker lifecycle:

```typescript
useEffect(() => {
    const worker = new Worker("/tileforge.worker.js");
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        // handle ready, progress, complete, error
    };

    const init: WorkerRequest = { type: "init" };
    worker.postMessage(init);

    return () => worker.terminate();
}, []);
```

The image ArrayBuffer is sent to the worker via `postMessage` with `Transferable` so it's a zero-copy transfer instead of a clone. The worker sends progress updates back as tiles are generated, and eventually returns the zip bytes.

One thing worth noting is that progress updates can feel batchy. Since the WASM execution is synchronous within the worker, the progress `postMessage` calls queue up and only get dispatched when the engine yields. For most images this is fine but on really large ones you might see the progress bar jump in chunks.

## The CLI

The CLI is a straightforward `clap` binary that reads a file, calls into core, and writes a zip:

```bash
tileforge world_map.png -o tiles.zip --tile-size 256 --max-zoom 5 --projection mercator
```

It supports `--streaming` and `--naive` flags to force a specific strategy, but by default it auto-selects based on image size. The progress output goes to stderr so you can pipe stdout if needed.

The CLI shares the exact same tiling engine as the browser version. If something works in the CLI it works in WASM and vice versa.

## What I Learned

**Separate your core logic from your platform bindings.** Having the Rust core crate be completely platform-agnostic was the best decision I made. It made testing trivial, made the WASM binding layer almost zero code, and meant the CLI came for free.

**WASM bundling in modern frameworks is still rough.** Turbopack, Vite, Webpack — they all have some level of WASM support but the moment you need it inside a Web Worker things get complicated. Dropping back to plain scripts in `public/` felt like giving up but it's the approach that actually works reliably.

**Memory matters in WASM.** The streaming pipeline was originally a "nice to have" but it turned out to be necessary. Fantasy maps can easily be 15,000+ pixels and that blows past the WASM memory ceiling fast. The row-by-row PNG decoder and pyramid builder brought peak memory down to something manageable.

**The pyramid builder is the clever bit.** Instead of accessing the source image at every zoom level you only decode it once at max zoom and then build everything else by merging tiles. Four tiles become one. The code is recursive and kind of elegant once you see it working.

## What Came After

Everything above describes the original browser-only prototype. Since then Tileforge has grown into a full-stack platform. Here's what got added.

### PMTiles Output

ZIP files work but they're inconvenient to serve — you need to extract thousands of small PNGs to a file server or S3 bucket. [PMTiles](https://protomaps.com/docs/pmtiles) is a single-file archive format designed for this: a client fetches individual tiles via HTTP range requests against one file hosted on any static file server.

The core crate now has both a `ZipTileWriter` and a `PmTilesTileWriter`. A `TeeTileWriter` wraps both and generates ZIP + PMTiles simultaneously in a single pass over the tiles — no second processing run needed.

The tileset detail page uses PMTiles for preview. Instead of downloading the full archive, it streams only the tiles visible in the current viewport via range requests. You can pan and zoom around a tileset without downloading more than a few hundred KB.

### Server-Side Processing

The browser WASM pipeline works great for most images but it has limits. WASM linear memory caps out around 1.5-2 GB, and even with the streaming pipeline you're bottlenecked by the browser's single-threaded worker.

Pro users can upload images to a native Rust API built on Axum. The API writes the upload to S3, enqueues a job in Redis, and a background worker picks it up. The worker runs the same core tiling engine natively — same code, no WASM overhead, no memory ceiling. Progress is pushed to Redis and polled by the frontend.

The architecture now has four Rust crates:

```
crates/
├── core/      # Tiling engine (unchanged, still platform-agnostic)
├── wasm/      # Browser bindings (unchanged)
├── api/       # Axum HTTP API — uploads, downloads, CRUD, auth, keys
└── worker/    # Background job consumer — tiling, thumbnails
```

### Auth and Billing

GitHub OAuth via Auth.js v5. The tricky part was sharing authentication between Next.js and the Rust API — both need to validate the same JWT. The solution was HS256 tokens with a shared secret: Next.js mints them and the Axum API verifies them on every request.

Stripe handles billing. Free users get browser-only processing. Pro users get server-side processing, 5 GB of S3 storage, API keys, and notifications.

### Tileset Gallery

Public tilesets show up in a browseable gallery with auto-generated thumbnails. The background worker generates a 480px JPEG thumbnail for every processed tileset. Users can manage their own tilesets — rename, toggle visibility, delete — from a dashboard page.

### API Keys

Pro users can generate `tf_...` bearer tokens for programmatic access. This lets you build scripts or integrations that upload images and download tiles without going through the web UI.

### Notifications

An in-app notification system backed by Postgres. Pro users get notifications when their server-side tiling jobs complete, when thumbnails are generated, and for billing events.

### What I'd Do Differently

The original decision to keep `core` platform-agnostic paid off enormously. Adding server-side processing was just writing a new binary that calls the same `Tiler::process_bytes()` function. No tiling code was duplicated.

The one thing I'd change is the worker architecture. Right now it polls Redis for jobs on a timer. A proper message queue (NATS, RabbitMQ) would give cleaner delivery guarantees and reduce latency between job submission and pickup.

---

If you want to try it out, [Tileforge](https://tileforge.sandybridge.io/) is live and the source is on [GitHub](https://github.com/thesandybridge/tileforge).
