---
title: "Agenda Tree"
date: 2025-06-15
description: "A real-time collaborative agenda editor with drag-and-drop reordering, built for Leadr's meeting platform."
tags: ["typescript", "react", "dnd-kit", "real-time", "ably"]
github: "https://github.com/thesandybridge/dnd-sandbox"
---

# Agenda Tree

A production meeting agenda editor I built for Leadr that supports nested drag-and-drop reordering with real-time multi-user collaboration. The architecture came out of R&D work I did in [dnd-sandbox](https://github.com/thesandybridge/dnd-sandbox), a standalone prototype for testing nested tree DnD patterns before bringing them into the product.

## The Problem

Leadr's meetings needed structured agendas — sections containing topics containing comments — that multiple users could edit simultaneously. Off-the-shelf DnD libraries didn't handle nested hierarchical reordering well, and real-time sync added another layer of complexity around conflict resolution and optimistic updates.

## Architecture

The system is built around two core providers:

- **BlockProvider** — manages the tree structure via a reducer. All agenda items are "blocks" with parent/child relationships, maintained through internal maps (`byId`, `byParent`) for O(1) lookups during drag operations.
- **TreeProvider** — generic context for rendering block content. Accepts a `Map<string, T>` of content and a user-supplied `ItemRenderer`, keeping the tree logic decoupled from the meeting domain.

### Drag & Drop

Built on `@dnd-kit/core` with a custom collision detection algorithm (`weightedVerticalCollision`) that uses edge-distance scoring with a bottom-placement bias for natural insertion feel. During drag, the system computes virtual blocks as a live preview without mutating actual state — debounced at 300ms to prevent excessive re-renders.

The drag lifecycle snapshots initial state on start, shows projected positions during drag-over via hierarchical reparenting calculations, and generates a minimal diff on drop for API persistence.

### Real-time Sync

Multi-user collaboration runs through Ably WebSocket channels with a diff-based protocol:

- Every mutation generates a `SerializedDiff` (ADD/UPDATE/DELETE/MOVE operations)
- Diffs are broadcast to other users and applied optimistically
- Conflicts resolved via timestamp ordering with automatic rollback
- Edit state coordination prevents simultaneous edits on the same block

## Features

- Hierarchical tree: sections, topics, and threaded comments
- Drag-and-drop reordering with custom collision detection
- Real-time collaboration via Ably WebSockets
- Optimistic updates with conflict resolution and rollback
- File attachments, bookmarks, and recurring item management
- Keyboard and screen reader accessible
- Private/public visibility toggles per item

## Tech Stack

- **React** — component architecture with context providers
- **@dnd-kit/core** — drag-and-drop primitives
- **Ably** — real-time WebSocket messaging
- **React Query** — server state and cache management
- **TypeScript** — end-to-end type safety
