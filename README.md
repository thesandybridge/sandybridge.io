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

## Production operation

The app lives in `src/` (TanStack Start). The old Next.js application has been
removed. Start production with `bun run start`, not Vite's development server.

- Install using `bun install --frozen-lockfile`. The theme package requires an
  authorized GitHub Packages read token in `NPM_TOKEN` (see `.npmrc`).
- Build using `bun run build`. If Vite runs under Node, use Node 20.19+ or 22.12+;
  `bun --bun run build` runs the tooling under Bun instead.
- The build snapshots Git history and site statistics into the server bundle. Make Git history
  available **during the build** for changelog entries and last-modified dates.
  If unavailable, the build warns and those fields degrade gracefully. Git and
  `.git` are not needed at runtime.
- Keep `content/` alongside the deployed app: markdown is read at runtime.
  Keep `dist/client`, `dist/server`, `server-entry.ts`, and `scripts/static-files.ts`.
- Use `NODE_ENV=production`; the Bun server binds Railway's `PORT` on `0.0.0.0`.
- Redis is optional, but supports persistent views, presence, and shared rate
  limits. Set `REDIS_URL` to the Redis service's private URL in the same Railway
  environment. Verify host, port, credentials, TLS scheme, and private DNS from
  the running service. IPv4/IPv6 lookup is enabled. A timeout alone does not
  identify which network setting is wrong.
- Without Redis, analytics return empty data and rate limits use bounded local
  counters. Those limits are per process and reset on restart; Redis is needed
  for shared limits across replicas.
- Client settings use `VITE_*`, not the legacy `NEXT_PUBLIC_*` names. Set these
  before building. In particular, pair `VITE_TURNSTILE_SITE_KEY` with the runtime
  `TURNSTILE_SECRET_KEY`, or contact submissions may fail verification.
- IP-based limits rely on Railway's edge-provided `X-Real-IP`. If adding another
  proxy or exposing the process directly, review the trusted proxy boundary.
- Static responses support ETags and HEAD; hashed assets have immutable caching.
  Cache headers alone do not establish that a shared CDN cache is configured.

Run `bun run test` for production regression checks and `bun run typecheck`
for TypeScript. A build or dev run generates TanStack's route types.

To investigate traffic, inspect Railway **HTTP logs**, independently of runtime
logs. Group by path, status, method, source IP, user agent, and transmitted bytes.
Useful filters include `@httpStatus:400..499`, `@txBytes:>1000000`, and
`@path:/api/presence`. Compare requests with browser analytics and normal asset
loading/navigation sequences. Presence generates up to ten requests per minute
per visible tab; bot labels based on user agents alone are unreliable.

Measure process RSS and heap after cold start, ordinary page loads, OG rendering,
and the Neovim explorer before changing memory limits. Lazy image-renderer imports
and bounded caches remove specific retention/work risks; they do not establish
how much of an observed 410 MB baseline they account for.

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
    server/             # Filesystem, Redis, GitHub, content rendering, server functions
    types/              # Browser-safe data contracts; no runtime service imports
    search-client.ts    # Shared on-demand search index and Fuse instance
    themes.ts           # Theme definitions from @thesandybridge/themes
    use-desktop-effects.ts # Gate WebGL loading by device and motion preference
  generated/            # Build metadata, generated before dev/build/test/typecheck
  styles/
    globals.css         # Theme variables, Shiki tokens, base styles
content/
  *.md                  # Blog posts (YAML frontmatter)
  portfolio/*.md        # Portfolio items
  til/*.md              # TIL entries
scripts/build-metadata.ts # Build-time Git history and source/content statistics
server-entry.ts         # Bun HTTP server wrapping TanStack Start fetch handler
```

## Architecture and performance

Routes own loaders and HTTP handlers. Server implementations live in
`src/lib/server`; components receive serializable data rather than calling
filesystem, credentialed API, or Redis modules. Shared types live in
`src/lib/types`. Regression tests guard against server imports in components.

Rendered posts are cached by file revision (mtime, ctime, and size), with a
64-entry limit and five-minute expiry. Concurrent reads share the same render.
Page loaders omit raw markdown after deriving headings, avoiding duplicate
content in the serialized page response. GitHub data uses bounded five-minute
caches and five-second request timeouts. An upstream failure currently returns
empty data for that cache interval; it does not block the page indefinitely.

Site word/line counts and the build date are generated once at build time.
The stats route does not recursively scan the deployed filesystem. Contributions
are loaded by its server function and rendered by a synchronous React component.

WebGL effects remain lazy chunks and are not rendered during SSR. Their wrappers
load them only on desktop with a fine pointer and no reduced-motion preference.
This reduced the measured uncompressed main entry from 1,405,688 to 452,027 bytes
in the cleanup build. Desktop still downloads the separate 3D chunks; this is an
initial-bundle improvement, not a claim that all transferred bytes disappeared.
Desktop and mobile search share one index request and Fuse instance per page.

Further work should be driven by production/browser measurements: desktop GPU
cost (two full-screen canvases), cold portfolio GitHub latency, cache hit rates,
and static-transfer compression. Consider build-time markdown rendering if cold
rendering remains significant; avoid adding infrastructure without that evidence.
Runtime logs alone still cannot explain traffic or egress totals.

## License

This repository has a **dual license**:

- The **code** is licensed under the [MIT License](LICENSE).
- The **blog content** (posts, articles, media) is licensed under [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

For full details, see the [LICENSE](LICENSE) file.
