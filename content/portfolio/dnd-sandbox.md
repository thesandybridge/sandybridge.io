---
title: "DnD Sandbox"
date: 2025-04-24
description: "A generic, performant drag-and-drop tree architecture for building nested, reorderable block editors."
tags: ["typescript", "react", "dnd-kit", "architecture"]
github: "https://github.com/thesandybridge/dnd-sandbox"
url: "https://dnd-sandbox-swart.vercel.app"
---

# DnD Sandbox

A drag-and-drop tree editor built on @dnd-kit with a strict separation between block structure and content. The architecture is generic — block management and tree rendering are fully decoupled from whatever data you put inside, so the same system can power an agenda builder, a page editor, or any nested sortable UI.

## Architecture

Two factory-based providers form the core:

- **`createBlockContext<T>()`** — returns a typed `BlockProvider` and `useBlocks` hook. State is a normalized `BlockIndex` (Map-based `byId` + `byParent` lookups) managed by a reducer. Supports add, insert, delete, move, and diff application.
- **`createTreeContext<TContent, TBlock>()`** — wraps `BlockProvider` and adds expand/collapse, drag state, modifier keys, virtual rendering, and a pluggable `ItemRenderer`. Content data is a separate `Map`, fully decoupled from the tree structure.

This factory pattern means both providers are reusable for entirely different block and content schemas without modification.

## Features

- **Normalized block state** — O(1) lookups via `byId` and `byParent` Maps, reordering is array splicing
- **Virtual rendering** — `@tanstack/react-virtual` with 10-item overscan for trees with thousands of nodes
- **Minimap** — structural diff visualization showing added, removed, and changed blocks with color coding
- **Serialization and diffing** — blocks serialize to compact tuples with SHA-256 hashing; diffs can be staged and applied as batches, simulating real-time sync
- **Modifier key interactions** — holding Shift during drag collapses all sections; scoped and global modifier key hooks
- **Inline editing** — TipTap rich text editors per block, writing directly to the React Query cache
- **Parameterized test harness** — `/test?sections=100&topics=10` generates large trees for stress testing

## Testing

Three layers: Jest unit tests for the reducer and reparenting logic, randomized performance tests (1,000-10,000 moves against normalized state), and Playwright E2E tests that drag every block in a 1,000-node tree.

## Tech Stack

- **Next.js 14** — App Router
- **@dnd-kit** — drag-and-drop engine
- **TanStack React Query** — server-state cache
- **TanStack Virtual** — virtualized tree rendering
- **TipTap** — inline rich text editing
- **Jest + Playwright** — unit, performance, and E2E tests
