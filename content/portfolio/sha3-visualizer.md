---
title: "SHA-3 Visualizer"
date: 2025-08-21
description: "A real-time 3D visualization of the SHA-3 (Keccak) hash function, built with Rust and Bevy."
tags: ["rust", "bevy", "cryptography", "visualization"]
github: "https://github.com/thesandybridge/sha3-visualizer"
category: "visualization"
---

# SHA-3 Visualizer

A real-time 3D visualization of the SHA-3 (Keccak) cryptographic hash function with step-by-step execution, built with Rust and Bevy. The internal 1600-bit state is rendered as a 5x5x64 matrix of cubes, with each transformation step color-coded across 24 rounds.

<Sha3Demo />

## Visual Elements

- **Red** — Theta (column mixing)
- **Green** — Rho (bit rotation)
- **Blue** — Pi (lane rearrangement)
- **Magenta** — Chi (non-linear transformation)
- **Yellow** — Iota (round constant addition)

## Controls

- Left mouse + drag to orbit, right mouse to pan, scroll to zoom
- ENTER to step through transformations
- P to toggle auto-animation, R to reset, F to fast-forward

## Tech Stack

- **Rust** — core implementation
- **Bevy 0.14** — 3D rendering engine
- **Keccak-f[1600]** — complete permutation with SHA3-256 verification
