---
title: "@dnd-block-tree"
date: 2025-04-24
description: "A modular toolkit for hierarchical drag-and-drop interfaces. Split into a framework-agnostic core and a React adapter, published under the @dnd-block-tree org on npm."
tags: ["typescript", "react", "dnd-kit", "library", "npm", "monorepo"]
github: "https://github.com/thesandybridge/dnd-block-tree"
npm: "https://www.npmjs.com/package/@dnd-block-tree/react"
url: "https://blocktree.sandybridge.io"
category: "library"
---

# @dnd-block-tree

A modular drag-and-drop tree toolkit split into two packages — a framework-agnostic core and a React adapter. Bring your own components; the library handles the complexity of nested, reorderable block structures.

| Package | Description |
|---------|------------|
| [`@dnd-block-tree/core`](https://www.npmjs.com/package/@dnd-block-tree/core) | Framework-agnostic core — zero dependencies, pure TypeScript |
| [`@dnd-block-tree/react`](https://www.npmjs.com/package/@dnd-block-tree/react) | React adapter — drag-and-drop hierarchical block trees |

Published on npm with full TypeScript support and cryptographic provenance via GitHub Actions OIDC.

## Live Demo

<DragTreeDemo />

Drag items to reorder or reparent. Sections can nest inside other sections. The minimap shows a live structural diff — yellow indicates moved blocks.

## Installation

```bash
npm install @dnd-block-tree/react
```

The React package depends on `@dnd-block-tree/core`, which is installed automatically.

## Quick Start

```tsx
import { BlockTree, type BaseBlock, type BlockRenderers } from '@dnd-block-tree/react'

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
- **Framework-Agnostic Core** — Core logic has zero dependencies and can be used with any framework

## Architecture

The library is split into two packages:

- **`@dnd-block-tree/core`** — Normalized `BlockIndex` with Map-based `byId` and `byParent` lookups for O(1) operations. Block state managed through a reducer supporting add, insert, delete, and move operations. Framework-agnostic with zero dependencies.
- **`@dnd-block-tree/react`** — React bindings built on @dnd-kit. Two factory-based providers: `createBlockState<T>()` (typed state management) and `createTreeState<T>()` (expand/collapse and drag state). Includes `BlockTree`, `BlockTreeSSR`, and `BlockTreeDevTools` components.

## Tech Stack

- **@dnd-kit** — drag-and-drop primitives
- **TypeScript** — full type inference for container vs non-container renderers
- **React 18+** — hooks-based API
