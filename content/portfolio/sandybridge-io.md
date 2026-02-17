---
title: "sandybridge.io"
date: 2026-02-17
description: "A personal site and blog built with Next.js App Router, React Three Fiber, and shiki, deployed on Railway."
tags: ["nextjs", "typescript", "react", "threejs"]
image: "sandybridge-io.png"
github: "https://github.com/thesandybridge/sandybridge.io"
url: "https://sandybridge.io"
---

# sandybridge.io

My personal site and blog, built with Next.js and deployed on Railway. Features a gruvbox dark theme, animated corona glow borders, a Three.js wireframe background, and an interactive browser terminal.

Previously built with [Go + HTMX](https://github.com/thesandybridge/sandybridge.io-go) and self-hosted on Proxmox.

## Stack

- **Next.js 16** (App Router) — static generation for all pages
- **TypeScript** — end to end
- **Markdown** — unified / remark / rehype pipeline with shiki syntax highlighting (gruvbox theme)
- **Three.js** via React Three Fiber — wireframe shapes in side gutters with mouse lookAt and scroll parallax
- **Kode Mono** — self-hosted monospace font

## Features

- Gruvbox dark theme with animated corona glow on nav and main borders (CSS `@property` + SVG feTurbulence filter)
- Interactive terminal (Ctrl+K) with command history, tab completion, and easter eggs
- Blog with tag filtering, read time estimates, share buttons, and code copy buttons
- Portfolio grid with project links
- RSS feed, sitemap, and robots.txt
- Mobile responsive — Three.js background disabled on small screens
