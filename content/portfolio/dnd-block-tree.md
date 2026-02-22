---
title: "dnd-block-tree"
date: 2025-04-24
description: "A headless React library for building hierarchical drag-and-drop interfaces. Published on npm with full TypeScript support."
tags: ["typescript", "react", "dnd-kit", "library", "npm"]
github: "https://github.com/thesandybridge/dnd-block-tree"
npm: "https://www.npmjs.com/package/dnd-block-tree"
url: "https://blocktree.sandybridge.io"
category: "library"
---

# dnd-block-tree

A headless drag-and-drop tree library for React, built on @dnd-kit. Bring your own components — we handle the complexity of nested, reorderable block structures.

Published on [npm](https://www.npmjs.com/package/dnd-block-tree) with full TypeScript support and cryptographic provenance via GitHub Actions OIDC.

## Live Demo

<DragTreeDemo />

Drag items to reorder or reparent. Sections can nest inside other sections. The minimap shows a live structural diff — yellow indicates moved blocks.

## Installation

```bash
npm install dnd-block-tree
```

## Quick Start

```tsx
import { BlockTree, type BaseBlock, type BlockRenderers } from 'dnd-block-tree'

interface MyBlock extends BaseBlock {
  type: 'section' | 'task' | 'note'
  title: string
}

const CONTAINER_TYPES = ['section'] as const

const renderers: BlockRenderers<MyBlock, typeof CONTAINER_TYPES> = {
  section: (props) => <SectionBlock {...props} />,
  task: (props) => <TaskBlock {...props} />,
  note: (props) => <NoteBlock {...props} />,
}

function App() {
  const [blocks, setBlocks] = useState<MyBlock[]>(initialBlocks)
  return (
    <BlockTree
      blocks={blocks}
      renderers={renderers}
      containerTypes={CONTAINER_TYPES}
      onChange={setBlocks}
    />
  )
}
```

## Key Features

- **Weighted Collision Detection** — Custom algorithm using edge distance with bottom bias for natural drag behavior
- **Smart Drop Zones** — Only one before-zone rendered, none around active block
- **8px Activation Distance** — Prevents accidental drags while allowing normal clicks
- **Snapshot-Based Computation** — State captured at drag start for consistent behavior
- **Debounced Preview** — 150ms debounced virtual state for smooth drag previews
- **Type-Safe Renderers** — Container blocks automatically get `isExpanded` and `onToggleExpand` props

## Architecture

The library uses a normalized `BlockIndex` structure with Map-based `byId` and `byParent` lookups for O(1) operations. Block state is managed through a reducer supporting add, insert, delete, and move operations.

Two factory-based providers form the core:

- **`createBlockState<T>()`** — returns a typed `BlockStateProvider` and `useBlockState` hook
- **`createTreeState<T>()`** — adds expand/collapse and drag state management

## Tech Stack

- **@dnd-kit** — drag-and-drop primitives
- **TypeScript** — full type inference for container vs non-container renderers
- **React 18+** — hooks-based API
