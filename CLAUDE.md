# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev       # Start dev server (Turbopack)
npm run build     # Production build
npm start         # Start production server
```

No test runner is configured. No linter script in package.json.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Styling**: Hand-written CSS — `globals.css` for theme variables/Shiki tokens, co-located `.module.css` files for components. **No Tailwind.**
- **Content**: Markdown/MDX files in `content/` processed via unified/remark/rehype pipeline with Shiki syntax highlighting (CSS variables theme)
- **Database/Cache**: ioredis connected to Railway Redis (`REDIS_URL`)
- **Email**: Resend for contact form delivery
- **3D**: React Three Fiber for background scene
- **Search**: Fuse.js client-side fuzzy search
- **Themes**: `@thesandybridge/themes` package — 9 themes switchable via CSS variables on `[data-theme]`

## Architecture

### Content Pipeline

`content/` contains all site content as `.md`/`.mdx` files:
- `content/*.md` — blog posts
- `content/portfolio/*.md` — portfolio entries
- `content/til/` — today I learned
- `content/docs/` — documentation
- `content/pages/` — static pages

`lib/content.ts` is the central content engine: loads files with `gray-matter`, renders markdown through unified pipeline with Shiki, calculates read time, extracts headings for TOC. All content functions are cached.

Frontmatter schema: `title`, `date`, `description`, `tags[]`, optional `github`, `url`, `category`, `series`, `seriesOrder`, `featured`, `work`, `image`.

### Theming

Theme system uses CSS custom properties defined in `globals.css`. Theme switching sets `data-theme` and `data-mode` attributes on `<html>`. Each theme has full Shiki token color mappings. Default theme is gruvbox dark.

`lib/themes.ts` re-exports theme definitions from `@thesandybridge/themes`. `components/theme/ThemeProvider.tsx` manages state and persistence.

### View Tracking

Redis-backed analytics in `lib/views.ts`:
- Bot filtering by user agent
- IP deduplication with 24h TTL keys
- Daily + lifetime counters
- 90-day TTL on daily data

Dashboard at `/stats/views` with heatmap, flamegraph, sparklines — all hand-rolled SVG, no chart libraries.

### API Routes

| Route | Purpose |
|---|---|
| `POST /api/views/[slug]` | Record page view |
| `GET /api/views/stats` | Analytics dashboard data |
| `POST /api/contact` | Contact form (rate-limited, Resend) |
| `POST /api/commands` | Interactive terminal command handler |
| `GET /api/search` | Fuse.js search index |
| `GET/POST /api/presence` | User presence tracking |

### Key Directories

- `lib/` — core utilities (content, redis, views, themes, rate-limit, github, search-index)
- `components/effects/` — visual effects (cursor glow, grain overlay, corona scroll, 3D background)
- `components/features/` — site features (contact modal, portfolio grid, speed dial, vim bindings)
- `components/home/` — homepage components (boot sequence, hero, typewriter, tech stack)
- `components/analytics/` — stats dashboard components (heatmap, flamegraph, charts)
- `components/mdx/` — MDX component overrides and interactive demos

### Dynamic OG Images

`blog/[slug]/opengraph-image.tsx` and `portfolio/[slug]/opengraph-image.tsx` generate social share images at build time.

## Conventions

- **No Tailwind** — use CSS modules (`.module.css`) co-located with components, or add to `globals.css` for theme-level styles
- **Hand-rolled visualizations** — SVG-based charts/graphs, no chart libraries
- **Client components** use `'use client'` directive; heavy components have lazy-loaded variants (e.g., `BackgroundLazy.tsx`)
- **Redis optional** — `lib/redis.ts` returns `null` if `REDIS_URL` is unset; features degrade gracefully
- **Path alias**: `@/*` maps to project root

## Environment Variables

Required for full functionality (see `.env.example`):
- `REDIS_URL` — Railway Redis for views/rate-limiting
- `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` — contact form email
- `GITHUB_TOKEN` — GitHub API (contributions, repo stats)
- `NEXT_PUBLIC_UMAMI_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — analytics
- `NEXT_PUBLIC_GISCUS_*` — blog comments via GitHub Discussions
- `TURNSTILE_SECRET_KEY` — optional Cloudflare CAPTCHA

## Deployment

Deployed on Railway. `npm run build` produces static HTML + serverless functions. Redis instance on Railway provides caching and view tracking.
