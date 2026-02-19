---
title: "Network Topology Monitor"
date: 2025-10-01
description: "A real-time network topology visualizer that aggregates UniFi and Proxmox devices into an interactive hierarchical graph."
tags: ["rust", "axum", "nextjs", "react", "typescript"]
github: "https://github.com/thesandybridge/network-topology"
---

# Network Topology Monitor

A full-stack network monitoring tool that aggregates devices from UniFi (routers, switches, APs, clients) and Proxmox VE (VMs, containers) into a unified topology graph. The backend polls both APIs, normalizes the data into a common model, and the frontend renders a live hierarchical graph that auto-refreshes every 10 seconds.

## Features

- **Unified topology** — gateway at top, switches and APs below, clients grouped into collapsible VLAN boxes at the bottom
- **Multi-source aggregation** — UniFi Integration API v1 for network infrastructure, Proxmox VE API for virtualization hosts
- **Response caching** — Moka async cache with 10s TTL, reducing upstream API load by ~90%
- **Observability** — Prometheus metrics for request duration, cache hit/miss, external API latency and errors
- **Rate limiting** — per-IP rate limiting via tower-governor
- **OpenAPI docs** — auto-generated Swagger UI at `/api/docs` via utoipa
- **Dashboard management** — configurable quick-links page with CRUD and drag-and-drop reordering

## Architecture

A Turborepo monorepo with a Rust backend and Next.js frontend.

The **Axum backend** authenticates with both UniFi and Proxmox, fetches devices in parallel via `futures::join_all`, classifies device types by model string, and builds a connection graph from uplink metadata. Responses are cached in Moka and served with full Prometheus instrumentation.

The **Next.js frontend** renders the topology using React Flow with custom node types — `DeviceNode` for infrastructure and `VlanGroupNode` for client containers. A custom hierarchical layout algorithm computes node positions from the parent-child connection graph. TanStack Query handles polling with custom structural sharing that compares device counts and status hashes to prevent unnecessary re-renders.

VLAN group nodes are collapsible containers that subdivide clients into wired, wireless, and offline sections — keeping the graph readable even with hundreds of connected devices.

## Tech Stack

- **Rust / Axum** — API server with Moka cache, Prometheus, and OpenAPI
- **Next.js 16** — React 19 with React Flow topology visualization
- **TanStack Query** — polling with structural sharing
- **Turborepo** — monorepo orchestration
