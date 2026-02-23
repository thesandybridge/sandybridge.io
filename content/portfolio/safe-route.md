---
title: "Safe Route Intelligence"
date: 2026-01-15
description: "A weather-adaptive road risk assessment system that combines crash data, weather, and road geometry to score segment-level danger."
tags: ["rust", "postgresql", "geospatial", "nextjs"]
category: "systems"
github: "https://github.com/thesandybridge/safe-route"
---

# Safe Route Intelligence

A weather-adaptive road risk intelligence system that predicts road-level danger by combining historical crash data, real-time weather, road geometry, and time-of-day patterns. It assigns a 0-100 risk score to individual road segments, currently targeting the Lehigh Valley region of Pennsylvania.

## How It Works

Each road segment receives a composite risk score based on a multi-factor model:

- **Base risk** — crash density normalized from PennDOT and NHTSA FARS historical data
- **Weather multiplier** — condition-specific crash rates (snow 3x, fog 2.5x, blowing snow 4x)
- **Infrastructure factor** — bridges ice first (1.5x), steep grades (1.8x), high curvature (1.3x)
- **Time factor** — rush hour (1.3x weekdays), nighttime (1.5x)

Segments under 200m use total crash count instead of crashes-per-mile to avoid inflated scores from short denominators.

## Architecture

A Rust workspace split into focused crates with a read/write service separation:

| Crate | Purpose |
|---|---|
| `safe-route-core` | Domain models, traits — crashes, road segments, weather observations, risk scores |
| `safe-route-db` | Repository pattern over PostgreSQL/PostGIS with compile-time checked queries (sqlx) |
| `safe-route-ingest` | Data pipelines — PA DOT crash CSV/GeoJSON, NOAA weather, OpenStreetMap PBF extraction |
| `safe-route-query` | Read-only API server (port 3000) — spatial queries, segment lookups, SSE streaming |
| `safe-route-worker` | Write operations + scheduler (port 3001) — ingestion jobs, risk recalculation, cron tasks |

The query/worker split keeps read-heavy dashboard traffic isolated from write-heavy ingestion and scoring jobs. The database uses PostGIS for spatial indexing and nearest-neighbor queries via `ST_DWithin` and the `<->` GiST operator.

Real-time updates flow through SSE and WebSocket channels, with delta sync support so clients only receive changed segments. Multi-region configuration is driven by TOML files, and API access is gated by role-based key management.

## Dashboard

A Next.js frontend with MapLibre GL JS renders an interactive risk heatmap over the Lehigh Valley. Users can filter by county, weather condition, and risk range, with segment detail panels showing contributing factors. Mobile-optimized payloads strip unnecessary data for compact delivery.

## Tech Stack

- **Rust** — workspace with Axum 0.7, tokio-cron-scheduler, moka/Redis caching
- **PostgreSQL + PostGIS** — spatial database with GiST indexes
- **sqlx** — compile-time verified SQL queries
- **Next.js** — dashboard with MapLibre GL JS, Tailwind, shadcn/ui
- **Documentation** — utoipa + Swagger UI
- **Data sources** — PA DOT Crash Information System, NHTSA FARS, NOAA NCEI, OpenStreetMap
