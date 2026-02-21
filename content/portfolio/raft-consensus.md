---
title: "Raft Consensus"
date: 2025-12-01
description: "An implementation of the Raft distributed consensus protocol in Rust, built from the original paper."
tags: ["rust", "distributed-systems", "algorithms"]
github: "https://github.com/thesandybridge/raft-consensus"
---

# Raft Consensus

An implementation of the Raft distributed consensus protocol in Rust, built by working through [the original paper](https://raft.github.io/raft.pdf). A learning project for understanding distributed systems from first principles.

<RaftDemo />

The simulation above runs a live 5-node Raft cluster compiled to WASM. Click any node to kill or revive it. Use **Partition** to introduce a network split between two nodes. Type a command and hit **Submit** to send it to the current leader — watch it replicate across the cluster.

## What's Implemented

- **Leader election** — randomized timeouts, vote counting, term-based ordering
- **Log replication** — AppendEntries RPC with conflict resolution
- **Safety guarantees** — majority voting, log matching, commit rules
- **Async runtime** — tokio-based event loop with timer management
- **In-memory network** — message routing for testing cluster behavior

## Architecture

Uses an action/effect pattern: event handlers return `Vec<Action>` describing state changes, which are then executed. This separation makes the protocol logic testable independent of side effects. Core types map directly to the paper's Figure 2 specification.

```bash
# Creates a 3-node cluster, one node wins election within ~200-300ms
cargo run
```

## Tech Stack

- **Rust** — core implementation
- **Tokio** — async runtime
