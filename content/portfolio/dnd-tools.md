---
title: "DnD Tools"
date: 2024-04-10
description: "A web-based toolset for Dungeons & Dragons with guild management, interactive maps, calculators, and draggable widgets."
tags: ["typescript", "nextjs", "react", "prisma", "tailwind"]
github: "https://github.com/thesandybridge/dnd-tools"
url: "https://dungeonsyndrome.sandybridge.io"
category: "web"
---

# DnD Tools

A web-based toolset for Dungeons & Dragons built for tabletop gameplay. Features guild management with role-based permissions, interactive maps via TileForge, D&D calculators, and a draggable widget system.

## Features

- **Guild system** — create/join guilds, role-based hierarchy, invite flow with 7-day expiry
- **Interactive maps** — [TileForge](/portfolio/tileforge) integration with per-guild API key management
- **D&D calculators** — item pricing, mounts, services, travel costs, and currency conversion
- **Widget system** — draggable desktop widgets (dice roller, initiative tracker, NPC generator, condition reference, quick convert) with margin-based grid layout and drag-to-swap via dnd-kit
- **Members directory** — paginated user search with guild invite flow
- **SpeedDial navigation** — expanding action menu on desktop, drawer toggle on mobile, with animated flame effect
- **Theming** — multiple themes with corona glow system, custom cursor with particle effects

## Tech Stack

- **Next.js 15** — React 19 with server components
- **TypeScript** — end-to-end type safety
- **Tailwind CSS + shadcn/ui** — styling and component library
- **Prisma** — database ORM with PostgreSQL
- **NextAuth** — authentication
- **Framer Motion** — animations and transitions
- **dnd-kit** — drag-and-drop for widget grid
