# sandybridge.io

[![Deploy on Railway](https://img.shields.io/badge/deploy-Railway-blueviolet?logo=railway)](https://railway.com)
[![License: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

My personal site and blog, built with TanStack Start and deployed on Railway.

> This is a full rewrite of the [original Go + HTMX version](https://github.com/thesandybridge/sandybridge.io-go).

## Stack

- **Framework** — [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)
- **Runtime** — [Bun](https://bun.sh)
- **Language** — TypeScript
- **Styling** — Hand-written CSS modules (no Tailwind)
- **Markdown** — [unified](https://unifiedjs.com) / remark / rehype with [Shiki](https://shiki.style) syntax highlighting (CSS variables theme)
- **3D Background** — [Three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Themes** — [@thesandybridge/themes](https://www.npmjs.com/package/@thesandybridge/themes) — 9 switchable themes via CSS custom properties
- **Cache** — [ioredis](https://github.com/redis/ioredis) (Railway Redis)
- **Search** — [Fuse.js](https://www.fusejs.io) client-side fuzzy search
- **Hosting** — [Railway](https://railway.com)

## Features

- 9 color themes with animated corona glow borders (CSS `@property` + SVG filter)
- Three.js wireframe shapes with mouse lookAt and scroll parallax
- Interactive command palette (Ctrl+K) with search, navigation, and easter eggs
- Blog with tag filtering, series navigation, read time, share buttons, and code copy
- React island architecture — interactive components embedded in server-rendered markdown
- Portfolio grid with GitHub workflow status badges
- Redis-backed view tracking with analytics dashboard (heatmap, flamegraph, sparklines)
- RSS feed, sitemap, and robots.txt

## Getting Started

```sh
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```sh
bun run build
bun run start
```

## Project Structure

```
src/
  routes/
    __root.tsx          # Root layout: meta, nav, footer, effects
    index.tsx           # Homepage: boot sequence, hero, projects
    blog/               # Blog list, $slug, tag/$tag
    portfolio/          # Portfolio list, $slug
    til/                # Today I learned
    docs/               # Documentation
    api/                # Server routes (views, contact, search, feed, etc.)
  components/
    effects/            # Visual effects (3D background, cursor glow, grain)
    features/           # Site features (contact modal, portfolio grid, speed dial)
    home/               # Homepage (boot sequence, hero, typewriter, tech stack)
    blog/               # Blog components (TOC, series nav, share, view counter)
    mdx/                # MDX islands (Sha3Demo, RaftDemo, DragTreeDemo)
    theme/              # Theme provider, picker, settings
    search/             # Command palette, mobile search
    nav/                # Navigation bar, mobile nav
    ui/                 # Shared UI (copy button, lightbox, skeleton)
    analytics/          # Stats dashboard (heatmap, flamegraph, charts)
  lib/
    content.ts          # Markdown pipeline (gray-matter + unified + shiki)
    themes.ts           # Theme definitions from @thesandybridge/themes
    views.ts            # Redis-backed view tracking
    redis.ts            # Redis client (optional, degrades gracefully)
    github.ts           # GitHub API (contributions, workflow runs)
  styles/
    globals.css         # Theme variables, Shiki tokens, base styles
content/
  *.md                  # Blog posts (YAML frontmatter)
  portfolio/*.md        # Portfolio items
  til/*.md              # TIL entries
server-entry.ts         # Bun HTTP server wrapping TanStack Start fetch handler
```

## License

This repository has a **dual license**:

- The **code** is licensed under the [MIT License](LICENSE).
- The **blog content** (posts, articles, media) is licensed under [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

For full details, see the [LICENSE](LICENSE) file.
