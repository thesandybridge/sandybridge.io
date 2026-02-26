# Migration: Next.js → TanStack Start + Bun

## Decisions

- **Framework:** TanStack Start (TanStack Router + server functions + Vite)
- **Runtime:** Bun
- **Approach:** Parallel build in `feat/tanstack-start` branch, swap when ready
- **Content pipeline:** Markdown rendered via unified/rehype + island hydration for 3 interactive demos
- **Rendering:** Prerender content pages at build time, API routes stay dynamic
- **OG images:** Satori + resvg-js in a server route
- **PWA:** Dropped

## Project Structure

```
src/
  routes/
    __root.tsx              # Root layout
    index.tsx               # Homepage
    blog/
      index.tsx
      $slug.tsx
      tag/$tag.tsx
    portfolio/
      index.tsx
      $slug.tsx
    til/
      index.tsx
      $slug.tsx
    docs/
      index.tsx
      $slug.tsx
    stats/
      index.tsx
      views.tsx
    uses/
      index.tsx
      nvim.tsx
      theme.tsx
    now.tsx
    changelog.tsx
    colophon.tsx
    api/
      views/$slug.tsx       # Server route: POST view recording
      views/stats.tsx       # Server route: GET analytics data
      contact.tsx           # Server route: POST contact form
      commands.tsx          # Server route: POST terminal commands
      search.tsx            # Server route: GET search index
      presence.tsx          # Server route: GET/POST presence
      nvim-config.tsx       # Server route: GET nvim config
      feed.xml.tsx          # Server route: RSS feed
      og/$type.$slug.tsx    # Server route: OG image generation
  components/               # Same structure, Next.js imports replaced
    analytics/
    blog/
    effects/
    features/
    home/
    mdx/
    nav/
    search/
    theme/
    ui/
  lib/                      # Mostly unchanged (framework-agnostic)
    content.ts
    redis.ts
    views.ts
    presence.ts
    rate-limit.ts
    github.ts
    search-index.ts
    themes.ts
    ...
  styles/
    globals.css
    *.module.css
content/                     # Unchanged
public/                      # Unchanged
app.tsx                      # TanStack Start entry
router.tsx                   # Router configuration
vite.config.ts               # Vite + tanstackStart plugin
```

## Content Pipeline

`lib/content.ts` ports as-is — pure Node (fs, gray-matter, unified/remark/rehype, shiki). No Next.js imports.

Data fetching moves from server components to route loaders + `createServerFn`:

- `generateStaticParams()` → Vite plugin `prerender` config
- `generateMetadata()` → `head()` on each route
- `react cache()` → Route loader deduplication (built-in)
- `next/headers` → Server function middleware for IP extraction

Interactive demos (RaftDemo, DragTreeDemo, Sha3Demo) use island hydration:
- Markdown contains `<div data-island="raft-demo"></div>`
- Client-side `IslandHydrator` scans rendered HTML and lazy-mounts React components

## API Routes

**Server functions** (typed RPC, called from components):
- Views recording and stats
- Search index
- Presence tracking
- Terminal commands
- Nvim config (moved to route loader)

**Server routes** (raw HTTP, need real URLs):
- `POST /api/contact` — Turnstile verification
- `GET /feed.xml` — RSS feed
- `GET /sitemap.xml` — Sitemap
- `GET /robots.txt` — Robots
- `GET /api/og/$type/$slug` — OG images via satori + resvg-js

Middleware via `createMiddleware` for IP extraction and rate limiting.

## Component Migration

Global import replacements:
- `next/link` → `@tanstack/react-router` Link (type-safe, uses `to` + `params`)
- `next/image` → `<img>` with `loading="lazy"` + blur placeholder
- `next/navigation` useRouter → `@tanstack/react-router` useRouter
- `next/navigation` usePathname → `@tanstack/react-router` useLocation
- `next/script` → `scripts` array in route `head()` config
- `next/font/local` → `@font-face` in globals.css

Components needing no changes: effects, home, analytics SVGs, theme system, command palette logic, vim bindings.

Components needing import swaps: Nav, Footer, all Link usages (~48 files).

Components needing moderate rework: ViewCounter, PresenceIndicator, TrendingPosts (fetch → server function calls), Giscus (script loading).

## Dependencies

**Dropped:** next, @ducanh2912/next-pwa, next-mdx-remote, @shikijs/rehype, @shikijs/transformers

**Added:** @tanstack/react-router, @tanstack/react-start, vite, satori, @resvg/resvg-js

**Kept:** react 19, three/r3f, dnd-kit, @tanstack/react-form, shiki, unified pipeline, ioredis, resend, fuse.js, gray-matter, howler, lucide-react, @thesandybridge/themes, @radix-ui

**Env vars:** `NEXT_PUBLIC_*` → `VITE_*` for client-exposed vars. Server-only vars unchanged.

## Migration Sequence

### Phase 1: Scaffold & Foundation
- Branch `feat/tanstack-start`
- Scaffold with vite.config.ts, app.tsx, router.tsx, __root.tsx
- Configure path alias `~/` → `src/`
- Copy content/, public/, lib/
- Verify `bun dev` starts

### Phase 2: Content Pipeline
- Verify lib/content.ts works unchanged
- Build island hydrator
- Create blog, portfolio, TIL, docs routes with loaders + head()
- Configure prerendering
- Verify Shiki highlighting

### Phase 3: Component Migration
- Move framework-agnostic components (effects, home, analytics)
- Swap Next.js imports in nav, links, footer
- Rework view counter, presence, giscus
- Port @font-face for Kode Mono

### Phase 4: Server Functions & API
- Create server functions for views, search, presence, commands
- Create withIP middleware
- Create server routes for contact, RSS, sitemap, robots
- Set up satori OG image route
- Wire up Redis, verify view tracking

### Phase 5: Static Pages & Polish
- Port uses, now, changelog, colophon, stats pages
- Port 404 page
- Add JSON-LD structured data
- Verify all head metadata and OG tags

### Phase 6: Testing & Cutover
- Build and verify prerendering
- Deploy to staging on Railway
- Smoke test all routes and features
- Compare memory usage
- Swap production domain
- Remove old Next.js code

## Expected Outcome

Memory: ~200-300 MB (down from 676 MB)
Build: Faster via Vite + Bun
DX: Type-safe routing, faster HMR, lighter runtime
