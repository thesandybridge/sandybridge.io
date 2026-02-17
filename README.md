# sandybridge.io

[![Build](https://img.shields.io/github/actions/workflow/status/thesandybridge/sandybridge.io/ci.yml?branch=main&label=build)](https://github.com/thesandybridge/sandybridge.io/actions)
[![Deploy on Railway](https://img.shields.io/badge/deploy-Railway-blueviolet?logo=railway)](https://railway.com)
[![License: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

My personal site and blog, built with Next.js App Router and deployed on Railway.

> This is a full rewrite of the [original Go + HTMX version](https://github.com/thesandybridge/sandybridge.io-go).

## Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, static generation)
- **Language** — TypeScript
- **Markdown** — [unified](https://unifiedjs.com) / remark / rehype with [shiki](https://shiki.style) syntax highlighting (gruvbox theme)
- **3D Background** — [Three.js](https://threejs.org) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Font** — [Kode Mono](https://fonts.google.com/specimen/Kode+Mono) (self-hosted)
- **Hosting** — [Railway](https://railway.com)

## Features

- Gruvbox dark theme with animated corona glow borders (CSS `@property` + SVG filter)
- Three.js wireframe shapes in side gutters with mouse lookAt and scroll parallax
- Interactive terminal (Ctrl+K) with command history, tab completion, and easter eggs
- Blog with tag filtering, read time, share buttons, and code copy buttons
- Portfolio grid with project links
- RSS feed, sitemap, and robots.txt
- Fully static — all pages prerendered at build time

## Getting Started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```sh
npm run build
npm start
```

## Project Structure

```
app/
  layout.tsx          # Root layout: font, meta, corona SVG, nav, footer
  page.tsx            # Homepage: ASCII art, recent posts, portfolio cards
  blog/               # Blog list, [slug], tag/[tag]
  portfolio/          # Portfolio list, [slug]
  api/commands/       # Terminal command handler
  feed.xml/           # RSS 2.0
  sitemap.ts          # Auto-generated sitemap
  robots.ts           # Robots.txt
components/
  Background.tsx      # Three.js R3F background scene
  Terminal.tsx         # Interactive terminal overlay
  TermTriangle.tsx    # Spinning wireframe tetrahedron
  Nav.tsx             # Navigation bar
  NavLinks.tsx        # Client-side active link highlighting
  CopyButton.tsx      # Code block copy buttons
  ShareButtons.tsx    # Social share links
lib/
  content.ts          # Markdown pipeline (gray-matter + unified + shiki)
content/
  *.md                # Blog posts (YAML frontmatter)
  portfolio/*.md      # Portfolio items
```

## License

This repository has a **dual license**:

- The **code** is licensed under the [MIT License](LICENSE).
- The **blog content** (posts, articles, media) is licensed under [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

For full details, see the [LICENSE](LICENSE) file.
