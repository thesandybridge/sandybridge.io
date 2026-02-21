---
title: "Safe Route Intelligence"
date: 2026-01-15
description: "A weather-adaptive road risk assessment system that combines crash data, weather, and road geometry to score segment-level danger."
tags: ["rust", "postgresql", "geospatial", "nextjs"]
github: "https://github.com/thesandybridge/safe-route"
category: "systems"
---

# Safe Route Intelligence

A weather-adaptive road risk assessment system for the Lehigh Valley region of Pennsylvania. It ingests historical crash data from PennDOT, real-time weather observations from NOAA, and road geometry from OpenStreetMap, then computes per-segment risk scores through a multi-factor model.

## How It Works

Each road segment receives a composite risk score (0-100) based on four factors:

- **Base risk** — crashes-per-mile normalized from PennDOT historical data
- **Weather multiplier** — condition-specific crash rates (snow 3x, fog 2.5x, blowing snow 4x)
- **Infrastructure factor** — bridges ice first (1.5x), steep grades (1.8x), high curvature (1.3x)
- **Time factor** — rush hour (1.3x weekdays), nighttime (1.5x)

Segments under 200m use total crash count instead of crashes-per-mile to avoid inflated scores from short denominators.

## Architecture

A Rust workspace with six crates:

| Crate | Purpose |
|---|---|
| `safe-route-core` | Domain models — crashes, road segments, weather observations, risk scores |
| `safe-route-db` | Repository pattern over PostgreSQL/PostGIS with compile-time checked queries (sqlx) |
| `safe-route-ingest` | Three data pipelines — PA DOT crash CSV/GeoJSON, NOAA ISD hourly weather, OpenStreetMap PBF road extraction |
| `safe-route-risk` | Multi-factor scoring engine with spatial crash-to-segment matching |
| `safe-route-cli` | CLI for data ingestion, risk calculation, and database management |
| `safe-route-api` | Axum REST API with spatial queries, live Socrata data refresh, and CSV upload |

The database uses PostGIS for spatial indexing and nearest-neighbor queries via `ST_DWithin` and the `<->` GiST operator. The OSM ingestion does a two-pass parse — first collecting all node coordinates, then resolving ways into coordinate arrays with parallel processing.

## Dashboard

A Next.js frontend with Mapbox GL JS renders an interactive risk heatmap over the Lehigh Valley. Users can filter by county, weather condition, and risk range, with segment detail panels showing contributing factors.

## Tech Stack

- **Rust** — workspace with 6 crates
- **PostgreSQL + PostGIS** — spatial database with GiST indexes
- **sqlx** — compile-time verified SQL queries
- **Axum** — REST API server
- **Next.js** — dashboard with Mapbox GL JS
- **Data sources** — PA DOT Crash Information System, NOAA/NWS ISD, OpenStreetMap
