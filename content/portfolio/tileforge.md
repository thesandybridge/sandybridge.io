---
title: "Tileforge"
date: 2026-02-16
description: "A browser-based XYZ tile slicer built with Rust and WebAssembly."
tags: ["rust", "wasm", "webdev"]
image: "tileforge.png"
github: "https://github.com/thesandybridge/tileforge"
url: "https://tileforge.sandybridge.io"
blog: "/blog/building_tileforge"
---

# Tileforge

Tileforge is a tool for slicing large images into XYZ tiles that can be used with map libraries like Leaflet. The tiling engine is written in Rust, compiled to WebAssembly, and runs entirely in the browser — your image never leaves your machine.

## Features

- Browser-based tile slicing with no server uploads
- Rust/WASM tiling engine running inside a Web Worker
- Native CLI for terminal-based workflows
- Configurable tile size and zoom levels
- Outputs standard `{z}/{x}/{y}.png` folder structure

## How It Works

The app takes a large image and divides it into a grid of small square tiles at multiple zoom levels. At zoom level 0, the entire image fits in a single tile. Each subsequent zoom level doubles the resolution, splitting tiles into four quadrants. The WASM module handles the image processing in a Web Worker to keep the UI responsive.

## Tech Stack

- **Rust** — core tiling engine
- **WebAssembly** — browser runtime via wasm-bindgen
- **Web Workers** — background processing
- **JavaScript** — UI and worker orchestration
