---
title: "DnD Sandbox"
date: 2025-04-24
description: "A generic drag-and-drop tree library for building nested, reorderable block editors with real-time collaboration support."
tags: ["typescript", "react", "dnd-kit", "library"]
github: "https://github.com/thesandybridge/dnd-sandbox"
url: "https://dnd-sandbox-swart.vercel.app"
---

# DnD Sandbox

A drag-and-drop tree library built on @dnd-kit with strict separation between block structure and content. The architecture is fully generic — block management, tree rendering, and drag behavior are decoupled from your data schema, so the same system can power an agenda builder, a page editor, or any nested sortable UI.

Currently being packaged as a standalone library for use across projects.

## Live Demo

<DragTreeDemo />

Drag items to reorder or reparent. Sections can nest inside other sections. The minimap shows a live structural diff — yellow indicates moved blocks.

## Architecture

Two factory-based providers form the core:

- **`createBlockContext<T>()`** — returns a typed `BlockProvider` and `useBlocks` hook. State is a normalized `BlockIndex` (Map-based `byId` + `byParent` lookups) managed by a reducer. Supports add, insert, delete, move, and diff application.
- **`createTreeContext<TContent, TBlock>()`** — wraps `BlockProvider` and adds expand/collapse, drag state, modifier keys, virtual rendering, and a pluggable `ItemRenderer`. Content data lives in a separate `Map`, fully decoupled from tree structure.

This factory pattern means both providers are reusable for entirely different block and content schemas without modification.

## Collision Detection

Custom `weightedVerticalCollision` algorithm optimized for thin horizontal drop zones:

- Uses **edge distance** (distance to top/bottom of each droppable) instead of center distance or overlap area
- **Bottom bias** (-5px) when pointer is below zone center — prevents flickering between adjacent zones
- Returns single winner — no ambiguity about which zone is active
- Far more reliable than dnd-kit's built-in `rectIntersection` or `closestCenter` for tree UIs

## Virtual Preview

During drag, the tree shows a live preview of where the item will land:

- **Snapshot on drag start** — all computations run against the initial state, preventing accumulated drift
- **Debounced updates** (150ms) — prevents React from re-rendering on every pointer move
- **Virtual state swap** — `effectiveState` transparently switches between real and preview state
- Drop zones for the dragged item are hidden to prevent self-drops

## Features

- **Normalized block state** — O(1) lookups via `byId` and `byParent` Maps
- **Virtual rendering** — `@tanstack/react-virtual` with overscan for large trees
- **Structural diffing** — blocks serialize to tuples; diffs show added/removed/changed
- **Modifier key interactions** — Shift during drag collapses all sections
- **Inline editing** — TipTap editors per block, synced to React Query cache
- **Real-time ready** — diff-based updates work with WebSocket sync (Ably, etc.)

## Testing

Three layers: Jest unit tests for reducer and reparenting logic, randomized performance tests (1,000-10,000 moves), and Playwright E2E tests that drag every block in a 1,000-node tree.

## Tech Stack

- **@dnd-kit** — drag-and-drop primitives
- **TanStack Virtual** — virtualized rendering
- **TanStack React Query** — server-state cache
- **TipTap** — rich text editing
- **Jest + Playwright** — testing
