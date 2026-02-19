---
title: "Tileforge"
date: 2026-02-16
description: "A full-stack XYZ tile slicer with browser-based WASM processing, server-side Pro tier, PMTiles output, and a public tileset gallery."
tags: ["rust", "wasm", "nextjs", "axum"]
image: "tileforge.png"
github: "https://github.com/thesandybridge/tileforge"
url: "https://tileforge.sandybridge.io"
blog: "/blog/building_tileforge"
---

# Tileforge

Tileforge slices large images into XYZ map tiles for use with Leaflet, MapLibre, and similar libraries. The free tier runs entirely in the browser via a Rust/WASM engine in a Web Worker — your image never leaves your machine. The Pro tier offloads processing to a native Rust API for larger images and higher zoom levels.

## Features

- **Browser-based WASM processing** — drop an image, configure, download. No server uploads for the free tier.
- **Server-side processing** — Pro users upload to a native Rust API with background job workers for larger images.
- **ZIP and PMTiles output** — download tiles as a ZIP or a single PMTiles archive. TeeWriter generates both simultaneously in a single pass.
- **PMTiles preview** — tileset detail pages stream only visible tiles via HTTP range requests instead of downloading the full archive.
- **Tileset gallery** — browse public tilesets with auto-generated thumbnails. Manage your own with rename, visibility toggle, and delete.
- **Interactive tile preview** — Leaflet viewer renders tiles directly from in-memory ZIP or PMTiles.
- **Three processing strategies** — naive (small images), streaming PNG (row-by-row decode), and strip extraction (large JPEG/WebP). Auto-selected based on image size.
- **Flat and Mercator projections** — flat for fictional maps and artwork, Web Mercator for real-world geographic maps.
- **GitHub OAuth** — Auth.js v5 with JWT shared between Next.js and the Rust API.
- **API keys** — Pro users generate `tf_...` bearer tokens for programmatic tileset access.
- **Stripe billing** — free/pro tiers with billing portal.
- **Notifications** — in-app notification system backed by Postgres.
- **Native CLI** — same tiling engine for scripting and batch jobs.

## Architecture

A Rust workspace with four crates and a Next.js frontend:

| Component | Purpose |
|---|---|
| `crates/core` | Tiling engine — decoding, resizing, tile extraction, ZIP/PMTiles writers, pyramid builder |
| `crates/wasm` | Thin wasm-bindgen wrapper over core for browser processing |
| `crates/api` | Axum HTTP API — uploads, downloads, CRUD, auth, notifications, API keys |
| `crates/worker` | Background job consumer — async tiling, thumbnail generation |
| `cli` | Native CLI binary using core directly |
| `web` | Next.js 16, Tailwind v4, shadcn/ui, Leaflet tile preview |

Backed by Redis (job queue, rate limiting, progress cache), Postgres (users, tilesets, notifications, API keys), and S3 (uploads, tiles, thumbnails).

## Tech Stack

- **Rust** — core tiling engine, Axum API, background worker
- **WebAssembly** — browser runtime via wasm-bindgen + Web Worker
- **Next.js 16** — React 19, Tailwind v4, shadcn/ui
- **PostgreSQL** — persistence
- **Redis** — job queue, caching, rate limiting
- **S3** — object storage for tiles and thumbnails
- **Stripe** — billing integration
