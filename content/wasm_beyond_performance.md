---
title: "WASM Beyond Performance"
date: 2026-02-21
description: "The dominant narrative around WebAssembly is performance. That's the least interesting reason to use it."
tags: ["rust", "wasm", "architecture"]
---

Every conversation about WebAssembly starts the same way: *it's fast*. Near-native speed in the browser. Tight loops. Number crunching. The elevator pitch writes itself.

But after shipping three production WASM projects — all in Rust, all following the same pattern — I've come to a different conclusion. Performance is a bonus. The real value is **portability, correctness, and runtime decoupling**. Write your logic once in a real systems language, compile it to multiple targets, and stop maintaining separate implementations of the same thing.

## The Pattern: Lib Crate → Thin Bindings

All three of my WASM projects share the same architecture:

1. A Rust library crate that knows nothing about browsers, servers, or runtimes
2. Thin `wasm-bindgen` bindings added after the core logic is complete
3. Multiple deployment targets consuming the same crate

The WASM layer is never the starting point. It's a deployment target bolted on after the fact. This distinction matters — it changes how you think about what WASM is for.

### TileForge

A tile processing engine that slices large images into XYZ map tiles. The free tier runs entirely in the browser via WASM in a Web Worker. The Pro tier runs the same Rust binary natively on an Axum API with background workers. One `core` crate, two deployment targets. Stripe billing, auth, S3 storage — real infrastructure, real product.

### Keccak/SHA-3 Visualizer

A Rust library implementing the Keccak permutation, built as a lib crate. WASM bindings expose a 2D browser demo. The same crate also powers a 3D Bevy visualization natively. One library, four consumers.

### Raft Consensus

A from-scratch implementation of the Raft consensus protocol, built as a lib crate with WASM bindings consumed by an interactive visualization on my portfolio.

Same pattern, three times. Not because I'm dogmatic about it — because it keeps working.

## One Codebase, Multiple Targets

TileForge's tiling engine is a single Rust crate. It compiles to native for the server API, CLI, and background workers. It compiles to WASM for the browser. A bug fix or a new feature lands everywhere simultaneously.

The alternative is maintaining two implementations of the same logic: a JavaScript version for the browser and a Rust version for the server. Two codebases, two sets of edge cases, two testing strategies, and zero guarantee of behavioral parity. Every divergence is a potential bug that only surfaces in one environment.

With the shared crate approach, parity isn't something you verify — it's something you get for free.

## Real Testing Without Browser Infrastructure

The Rust core has a full test suite that runs with `cargo test` in CI. No browser. No DOM. No jsdom. No Canvas API quirks. No Web Worker mocking.

The same code that runs in the user's browser is tested natively with real assertions in a real test harness. This matters more than it sounds. JavaScript testing for computationally heavy logic is either flaky (real browser, real timing issues) or incomplete (mocked environments that don't match production behavior). Rust's test infrastructure is deterministic, fast, and requires zero configuration beyond what Cargo provides.

When TileForge processes a 4096×4096 image into tiles, the test suite verifies every tile dimension, every pixel boundary, every edge case — in milliseconds, on every commit, with no browser in the loop.

## Offline Processing Without Server Costs

TileForge's free tier processes images entirely client-side. The user's image never leaves their machine.

This isn't just a privacy feature (though it is). It eliminates server compute costs for the free tier entirely. The WASM engine handles decoding, resizing, and tile extraction in a Web Worker. No upload, no server-side processing, no egress charges.

This architectural split — free = client WASM, Pro = server native — is only possible because the same crate powers both. If the browser implementation were a separate JavaScript codebase, you'd be maintaining two engines with independent bug surfaces. The shared crate makes this a deployment decision, not an engineering one.

## Performance Is a Bonus, Not the Justification

WASM may or may not be faster than an equivalent JavaScript implementation for any given task. For image processing — tight loops over pixel buffers with predictable memory access patterns — it likely is. But I haven't benchmarked TileForge against a hypothetical JS version, and I don't need to.

The engineering arguments — shared implementation, native testability, runtime decoupling — stand on their own regardless of benchmark results. If the bundle size is competitive and the performance is at least equivalent, you've already won on maintainability alone.

This is the part that gets lost in the WASM conversation. People reach for it when they need speed, then abandon it when the benchmarks don't show a 10x improvement. They're optimizing for the wrong variable.

## The Source Is Decoupled From the Runtime

This is the core insight.

WASM lets you write logic that doesn't belong to any runtime. It's not browser code. It's not server code. It's just code — compiled to a portable target. The browser is one consumer. A CLI is another. A native API is another. A Bevy game engine is another.

The Keccak crate demonstrates this directly. The same Rust library powers:

- A 2D browser visualization (via WASM)
- A 3D Bevy visualization (native)
- A standalone library (for any Rust consumer)
- A test suite (via `cargo test`)

Four deployment targets, one implementation. No conditional compilation, no runtime detection, no platform-specific branches in the core logic. The bindings are thin adapters that translate between the crate's API and each target's expectations.

This is what runtime decoupling looks like in practice. The library doesn't know or care where it runs. That's the point.

## The Reframe

If you're reaching for WebAssembly only when you need speed, you're missing the point.

WASM is a deployment target, not a performance optimization. It's the answer to "how do I run this logic in one more place?" — not "how do I make this loop faster?" The performance story is real, but it's a side effect of the actual value proposition: write it once, in a language with a real type system and real tooling, and deploy it everywhere your users are.

The next time someone asks why you'd use WASM, try leading with portability instead of performance. The conversation gets a lot more interesting.
