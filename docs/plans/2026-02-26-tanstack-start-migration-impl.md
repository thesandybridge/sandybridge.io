# TanStack Start Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate sandybridge.io from Next.js 16 to TanStack Start + Bun for lower memory, faster builds, and type-safe routing.

**Architecture:** Parallel build in `feat/tanstack-start` branch. TanStack Start with file-based routing, server functions for data fetching, server routes for HTTP endpoints, prerendered content pages via Vite plugin. Markdown + island hydration for interactive demos.

**Tech Stack:** TanStack Start, TanStack Router, Vite, Bun, React 19, Satori + resvg-js (OG images), ioredis, Shiki, unified/remark/rehype

**Design doc:** `docs/plans/2026-02-26-tanstack-start-migration-design.md`

---

## Phase 1: Scaffold & Foundation

### Task 1: Create branch and scaffold project

**Files:**
- Create: `src/app.tsx`
- Create: `src/router.tsx`
- Create: `vite.config.ts`
- Create: `tsconfig.json` (replace existing)
- Create: `package.json` (replace existing)

**Step 1: Create branch**

```bash
git checkout -b feat/tanstack-start
```

**Step 2: Remove Next.js files**

Remove Next.js-specific config and the `app/` directory. Keep `content/`, `public/`, `lib/`, `components/`.

```bash
rm -rf app/ next.config.ts next-env.d.ts .next
```

**Step 3: Initialize with Bun**

```bash
rm -rf node_modules package-lock.json
```

Replace `package.json`:

```json
{
  "name": "sandybridge.io",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  },
  "dependencies": {
    "@dnd-block-tree/react": "^2.0.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@react-three/fiber": "^9.5.0",
    "@react-three/postprocessing": "^3.0.4",
    "@resvg/resvg-js": "^2.6.2",
    "@tanstack/react-form": "^1.28.3",
    "@tanstack/react-router": "^1.114.3",
    "@tanstack/react-start": "^1.114.3",
    "@thesandybridge/themes": "^1.5.0",
    "@types/three": "^0.182.0",
    "fuse.js": "^7.1.0",
    "gray-matter": "^4.0.3",
    "howler": "^2.2.4",
    "ioredis": "^5.9.3",
    "lucide-react": "^0.575.0",
    "postprocessing": "^6.38.3",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "rehype-raw": "^7.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-stringify": "^10.0.1",
    "remark-gfm": "^4.0.1",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.1.2",
    "resend": "^6.9.2",
    "sanitize-html": "^2.17.0",
    "satori": "^0.12.0",
    "shiki": "^3.22.0",
    "three": "^0.182.0",
    "unified": "^11.0.5"
  },
  "devDependencies": {
    "@types/howler": "^2.2.12",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/sanitize-html": "^2.16.0",
    "typescript": "^5",
    "vite": "^6.0.0",
    "vite-tsconfig-paths": "^5.1.0"
  }
}
```

```bash
bun install
```

**Step 4: Create `vite.config.ts`**

```ts
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      prerender: {
        routes: [
          '/',
          '/blog',
          '/portfolio',
          '/til',
          '/docs',
          '/uses',
          '/uses/nvim',
          '/uses/theme',
          '/now',
          '/changelog',
          '/colophon',
          '/stats',
          '/stats/views',
          '/blog/*',
          '/portfolio/*',
          '/til/*',
          '/docs/*',
          '/blog/tag/*',
        ],
        crawlLinks: true,
      },
    }),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
```

**Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "paths": {
      "~/*": ["./src/*"],
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "lib/**/*.ts", "lib/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Step 6: Create `src/app.tsx`**

```tsx
import { createStart } from '@tanstack/react-start'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { createRouter } from './router'

export default createStart({
  router: createRouter,
  manifest: getRouterManifest,
})
```

**Step 7: Create `src/router.tsx`**

```tsx
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold TanStack Start project with Bun"
```

---

### Task 2: Create root layout

**Files:**
- Create: `src/routes/__root.tsx`
- Move: `app/globals.css` → `src/styles/globals.css`
- Move: `app/not-found.module.css` → `src/styles/not-found.module.css`

**Step 1: Add `@font-face` to `globals.css`**

Add at the top of `src/styles/globals.css` (replacing `next/font/local`):

```css
@font-face {
  font-family: 'Kode Mono';
  src: url('/fonts/KodeMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Kode Mono';
  src: url('/fonts/KodeMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

**Step 2: Create `src/routes/__root.tsx`**

```tsx
import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { Nav, MobileNav } from '~/components/nav'
import { CommandPalette, MobileSearch } from '~/components/search'
import {
  BackgroundLazy as Background,
  SkillEffectsLazy as SkillEffects,
  CursorGlow,
  CursorTrail,
  MagneticLinks,
  SoundEffects,
  TriangleBurst,
  CoronaScroll,
  GrainOverlay,
} from '~/components/effects'
import {
  DesktopSpeedDial,
  VimBindings,
  KonamiCode,
  Footer,
} from '~/components/features'
import { DynamicFavicon, ThemeProvider } from '~/components/theme'
import { generateThemeScript } from '@/lib/themes'
import globalsCss from '~/styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'sandybridge.io' },
      {
        name: 'description',
        content: 'Software engineer focused on frontend development and expanding into systems work.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'sandybridge.io' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'darkreader-lock' },
    ],
    links: [
      { rel: 'stylesheet', href: globalsCss },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/assets/favicon/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/assets/favicon/favicon-16x16.png',
      },
      {
        rel: 'apple-touch-icon',
        href: '/assets/favicon/apple-touch-icon.png',
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'sandybridge.io',
        href: '/feed.xml',
      },
    ],
    scripts: [
      ...(import.meta.env.VITE_UMAMI_URL
        ? [
            {
              src: import.meta.env.VITE_UMAMI_URL,
              'data-website-id': import.meta.env.VITE_UMAMI_WEBSITE_ID,
              async: true,
            },
          ]
        : []),
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="not-found">
      <pre aria-hidden="true">
        {` █  █  ███  █  █
 █  █ █   █ █  █
 ████ █   █ ████
    █ █   █    █
    █  ███     █`}
      </pre>
      <div>
        <span>guest@sandybridge:~$</span> cd {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
      </div>
      <div>bash: cd: No such file or directory</div>
      <a href="/">cd ~</a>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Theme script runs before paint to prevent flash. Content is a trusted static string from our themes package. */}
        <script dangerouslySetInnerHTML={{ __html: generateThemeScript() }} />
      </head>
      <body style={{ fontFamily: "'Kode Mono', monospace" }}>
        <ThemeProvider>
          <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
            <filter id="corona-filter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04 0.06"
                numOctaves={4}
                seed="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={6}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>
          <a href="#content" className="skip-link">
            Skip to content
          </a>
          <div className="container">
            <header>
              <Nav />
            </header>
            <main id="content">
              <div className="corona-glow" aria-hidden="true" />
              {children}
            </main>
            <Footer year={year} />
          </div>
          <TriangleBurst />
          <Background />
          <SkillEffects />
          <CursorGlow />
          <CursorTrail />
          <GrainOverlay />
          <CoronaScroll />
          <SoundEffects />
          <MagneticLinks />
          <CommandPalette />
          <VimBindings />
          <MobileNav />
          <MobileSearch />
          <DesktopSpeedDial />
          <KonamiCode />
          <DynamicFavicon />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: create root layout with theme provider and global effects"
```

---

### Task 3: Move lib/ and components/ into src/

**Step 1: Restructure directories**

```bash
mkdir -p src/components src/lib src/styles
cp -r components/* src/components/
cp -r lib/* src/lib/
cp app/globals.css src/styles/globals.css
```

Copy all co-located CSS modules from `components/` into `src/components/` (they travel with their components).

**Step 2: Update path alias references**

All `@/lib/` imports in `src/lib/` files become `~/lib/`. All `@/components/` imports become `~/components/`.

Run a global find-and-replace across `src/`:
- `from '@/lib/` → `from '~/lib/`
- `from '@/components/` → `from '~/components/`
- `from '@/` → `from '~/` (catch remaining)

The `@/*` alias still works for files outside `src/` (like `content/`), but prefer `~/` for everything inside `src/`.

**Step 3: Remove `'use client'` directives**

TanStack Start doesn't use React Server Components. All components are client components by default. Remove every `'use client'` directive from all files in `src/components/`.

```bash
find src/components -name '*.tsx' -exec sed -i "s/^'use client';//" {} +
find src/components -name '*.tsx' -exec sed -i "s/^'use client'//" {} +
```

**Step 4: Replace `next/link` imports globally**

```bash
grep -rl "from 'next/link'" src/components/ src/lib/
```

In each file, replace:
- `import Link from 'next/link'` → `import { Link } from '@tanstack/react-router'`
- `<Link href=` → `<Link to=`
- Internal links like `href={/blog/${slug}}` → `to="/blog/$slug" params={{ slug }}`
- Simple string hrefs like `href="/blog"` → `to="/blog"`

**Step 5: Replace `next/navigation` imports globally**

```bash
grep -rl "from 'next/navigation'" src/components/
```

In each file:
- `import { useRouter } from 'next/navigation'` → `import { useRouter } from '@tanstack/react-router'`
- `import { usePathname } from 'next/navigation'` → `import { useLocation } from '@tanstack/react-router'`
- `const pathname = usePathname()` → `const { pathname } = useLocation()`
- `router.push(url)` → `router.navigate({ to: url })`

**Step 6: Replace `next/image` imports**

```bash
grep -rl "from 'next/image'" src/components/
```

Replace `<Image>` with `<img>`:
- Remove `width`, `height` props (use CSS)
- Add `loading="lazy" decoding="async"`
- Replace `placeholder="blur" blurDataURL={...}` with `style={{ backgroundImage: \`url(${BLUR_DATA_URL})\`, backgroundSize: 'cover' }}`

**Step 7: Remove `next/script` usage**

Any `<Script>` components move into route-level `head()` `scripts` arrays.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: move components and lib into src/, replace Next.js imports"
```

---

### Task 4: Verify dev server starts

**Step 1: Generate route tree**

```bash
bunx tsr generate
```

This creates `src/routeTree.gen.ts` from any routes in `src/routes/`.

**Step 2: Start dev server**

```bash
bun dev
```

Expected: Vite dev server starts. The page loads with the root layout (may have broken component imports — that's expected, we fix them in Phase 3).

**Step 3: Fix any immediate import errors**

Address TypeScript errors and broken imports. Common issues:
- Missing `~/` alias resolution → check `vite-tsconfig-paths` is working
- CSS module imports may need `?url` suffix for global CSS or `.module.css` extension
- Remove any remaining `next/` imports that were missed

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: verify dev server starts with TanStack Start"
```

---

## Phase 2: Content Pipeline & Routes

### Task 5: Verify and adapt content pipeline

**Files:**
- Modify: `src/lib/content.ts`

**Step 1: Test content loading**

`lib/content.ts` is pure Node (fs, gray-matter, unified, shiki). It should work as-is. Verify by importing in a test route:

Create a temporary `src/routes/index.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'

const fetchPosts = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllPosts('blog')
})

export const Route = createFileRoute('/')({
  loader: () => fetchPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <div>
      <h1>Posts: {posts.length}</h1>
      {posts.map((p) => (
        <div key={p.slug}>{p.title}</div>
      ))}
    </div>
  )
}
```

**Step 2: Fix content directory path**

`content.ts` uses `path.join(process.cwd(), 'content')`. This should still work since `content/` is at project root. Verify the path resolves correctly in the Vite/Bun environment.

If `process.cwd()` differs in Vite, update the `contentDir` constant to use `import.meta.dirname` or an env var.

**Step 3: Verify Shiki highlighting**

Load a blog post with code blocks and confirm syntax highlighting works. The Shiki lazy init pattern should work identically.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: verify content pipeline works in TanStack Start"
```

---

### Task 6: Build island hydrator for interactive demos

**Files:**
- Create: `src/components/mdx/IslandHydrator.tsx`

**Step 1: Create the hydrator**

```tsx
import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'

const ISLANDS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'raft-demo': lazy(() => import('~/components/mdx/RaftDemo')),
  'drag-tree-demo': lazy(() => import('~/components/mdx/DragTreeDemo')),
  'sha3-demo': lazy(() => import('~/components/mdx/Sha3Demo')),
}

export function IslandHydrator({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [islands, setIslands] = useState<{ id: string; element: HTMLElement }[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    const found: { id: string; element: HTMLElement }[] = []
    containerRef.current.querySelectorAll<HTMLElement>('[data-island]').forEach((el) => {
      const id = el.dataset.island
      if (id && ISLANDS[id]) {
        found.push({ id, element: el })
      }
    })
    setIslands(found)
  }, [html])

  return (
    <>
      {/* Content is pre-rendered HTML from our markdown pipeline (sanitized by rehype) */}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
      {islands.map(({ id, element }) => {
        const Component = ISLANDS[id]
        return (
          <Suspense key={id} fallback={null}>
            <IslandPortal element={element}>
              <Component />
            </IslandPortal>
          </Suspense>
        )
      })}
    </>
  )
}

function IslandPortal({
  element,
  children,
}: {
  element: HTMLElement
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const portalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrapper = document.createElement('div')
    element.innerHTML = ''
    element.appendChild(wrapper)
    portalRef.current = wrapper
    setMounted(true)
    return () => {
      element.innerHTML = ''
    }
  }, [element])

  if (!mounted || !portalRef.current) return null
  return createPortal(children, portalRef.current)
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add island hydrator for interactive MDX demos"
```

---

### Task 7: Create blog routes

**Files:**
- Create: `src/routes/blog/index.tsx`
- Create: `src/routes/blog/$slug.tsx`
- Create: `src/routes/blog/tag/$tag.tsx`
- Create: `src/lib/server/content-fns.ts`

**Step 1: Create shared server functions**

```tsx
// src/lib/server/content-fns.ts
import { createServerFn } from '@tanstack/react-start'
import {
  getAllPosts,
  getPost,
  getAdjacentPosts,
  getRelatedPosts,
  getSeriesPosts,
  getPostsByTag,
  getAllTags,
  extractHeadings,
  type ContentDir,
} from '~/lib/content'

export const fetchAllPosts = createServerFn({ method: 'GET' })
  .validator((data: { dir: ContentDir; limit?: number }) => data)
  .handler(async ({ data }) => {
    return getAllPosts(data.dir, data.limit)
  })

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((data: { dir: ContentDir; slug: string }) => data)
  .handler(async ({ data }) => {
    const post = await getPost(data.dir, data.slug)
    if (!post) throw new Error('Not found')
    const adjacent = getAdjacentPosts(data.dir, data.slug)
    const headings = extractHeadings(post.rawContent)
    const related = data.dir === 'blog' ? getRelatedPosts(data.slug, post.tags) : []
    const series = post.series ? getSeriesPosts(post.series) : []
    return { post, adjacent, headings, related, series }
  })

export const fetchPostsByTag = createServerFn({ method: 'GET' })
  .validator((tag: string) => tag)
  .handler(async ({ data: tag }) => {
    return { tag, posts: getPostsByTag(tag) }
  })

export const fetchAllTags = createServerFn({ method: 'GET' }).handler(async () => {
  return getAllTags()
})
```

**Step 2: Create `/blog` listing route**

```tsx
// src/routes/blog/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchAllPosts } from '~/lib/server/content-fns'

export const Route = createFileRoute('/blog/')({
  loader: () => fetchAllPosts({ data: { dir: 'blog' } }),
  head: () => ({
    meta: [
      { title: 'Blog | sandybridge.io' },
      { name: 'description', content: 'Blog posts, guides, and notes.' },
    ],
  }),
  component: BlogIndex,
})

function BlogIndex() {
  const posts = Route.useLoaderData()
  // Port the existing blog listing JSX from app/blog/page.tsx
  // Replace Next.js Link with TanStack Link
  return <div>{/* blog listing UI */}</div>
}
```

**Step 3: Create `/blog/$slug` route**

```tsx
// src/routes/blog/$slug.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { fetchPost } from '~/lib/server/content-fns'
import { IslandHydrator } from '~/components/mdx/IslandHydrator'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    try {
      return await fetchPost({ data: { dir: 'blog', slug: params.slug } })
    } catch {
      throw notFound()
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.post.title} | sandybridge.io` },
      { name: 'description', content: loaderData.post.description },
      { property: 'og:title', content: loaderData.post.title },
      { property: 'og:description', content: loaderData.post.description },
      { property: 'og:type', content: 'article' },
      { property: 'og:image', content: `/api/og/blog/${loaderData.post.slug}` },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: loaderData.post.title,
          datePublished: loaderData.post.date,
          dateModified: loaderData.post.lastModified || loaderData.post.date,
          description: loaderData.post.description,
          author: { '@type': 'Person', name: 'Matt Miller' },
        }),
      },
    ],
  }),
  component: BlogPost,
  notFoundComponent: () => <div>Post not found</div>,
})

function BlogPost() {
  const { post, adjacent, headings, related, series } = Route.useLoaderData()
  // Port the blog post JSX from app/blog/[slug]/page.tsx
  // Use <IslandHydrator html={post.content} /> instead of MDXRemote
  return (
    <article>
      <h1>{post.title}</h1>
      <IslandHydrator html={post.content} />
    </article>
  )
}
```

**Step 4: Create `/blog/tag/$tag` route**

```tsx
// src/routes/blog/tag/$tag.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchPostsByTag } from '~/lib/server/content-fns'

export const Route = createFileRoute('/blog/tag/$tag')({
  loader: ({ params }) => fetchPostsByTag({ data: params.tag }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `Posts tagged "${loaderData.tag}" | sandybridge.io` },
    ],
  }),
  component: TagPage,
})

function TagPage() {
  const { tag, posts } = Route.useLoaderData()
  return <div>{/* tag listing UI */}</div>
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: create blog routes with loaders and head metadata"
```

---

### Task 8: Create portfolio and TIL routes

**Files:**
- Create: `src/routes/portfolio/index.tsx`
- Create: `src/routes/portfolio/$slug.tsx`
- Create: `src/routes/til/index.tsx`
- Create: `src/routes/til/$slug.tsx`

Same pattern as blog routes. Portfolio loader also fetches GitHub repo stats:

```tsx
// src/routes/portfolio/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'
import { parseGitHubUrl, getRepoStats } from '~/lib/github'

const fetchPortfolio = createServerFn({ method: 'GET' }).handler(async () => {
  const posts = getAllPosts('portfolio')
  const stats: Record<string, Awaited<ReturnType<typeof getRepoStats>>> = {}
  await Promise.all(
    posts.map(async (p) => {
      if (p.github) {
        const parsed = parseGitHubUrl(p.github)
        if (parsed) {
          stats[p.slug] = await getRepoStats(parsed.owner, parsed.repo)
        }
      }
    }),
  )
  return { posts, stats }
})

export const Route = createFileRoute('/portfolio/')({
  loader: () => fetchPortfolio(),
  head: () => ({
    meta: [
      { title: 'Portfolio | sandybridge.io' },
      { name: 'description', content: 'Projects and work.' },
    ],
  }),
  component: PortfolioIndex,
})

function PortfolioIndex() {
  const { posts, stats } = Route.useLoaderData()
  return <div>{/* portfolio grid UI */}</div>
}
```

TIL, docs routes follow the same pattern — loader calls `fetchAllPosts`/`fetchPost` with the appropriate `dir`.

**Commit after each route pair.**

---

### Task 9: Create docs routes

**Files:**
- Create: `src/routes/docs/index.tsx`
- Create: `src/routes/docs/$slug.tsx`

Same loader pattern using `getAllDocs()`/`getDocBySlug()` from `src/lib/docs.ts`.

**Commit.**

---

## Phase 3: Component Migration

### Task 10: Migrate framework-agnostic components

**Files:** All files in `src/components/effects/`, `src/components/home/`, `src/components/analytics/`

These components only use React APIs (useState, useEffect, useRef, Canvas, etc.). They need:
- Remove `'use client'` directives (already done in Task 3)
- Verify no `next/` imports remain
- Fix any path alias issues (`@/` → `~/`)

**Test:** Import each in the root layout or a test route. Verify no import errors.

**Commit:**
```bash
git commit -m "feat: verify framework-agnostic components compile"
```

---

### Task 11: Migrate nav and navigation components

**Files:**
- Modify: `src/components/nav/NavLinks.tsx`
- Modify: `src/components/nav/Nav.tsx`
- Modify: `src/components/nav/MobileNav.tsx`
- Modify: `src/components/features/Footer.tsx`
- Modify: `src/components/features/DesktopSpeedDial.tsx`

Key changes for NavLinks:

```tsx
// Before (Next.js)
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const pathname = usePathname()
<Link href="/blog" className={pathname.startsWith('/blog') ? 'active' : ''}>

// After (TanStack Router)
import { Link, useLocation } from '@tanstack/react-router'
const { pathname } = useLocation()
<Link to="/blog" className={pathname.startsWith('/blog') ? 'active' : ''}>
```

For DesktopSpeedDial and similar components using `router.push()`:

```tsx
// Before
const router = useRouter()
router.push('/blog')

// After
const router = useRouter()
router.navigate({ to: '/blog' })
```

**Commit:**
```bash
git commit -m "feat: migrate nav components to TanStack Router"
```

---

### Task 12: Migrate blog/portfolio/search components

**Files:**
- Modify: `src/components/blog/ViewCounter.tsx`
- Modify: `src/components/blog/TrendingPosts.tsx`
- Modify: `src/components/blog/PostViewCounts.tsx`
- Modify: `src/components/features/PresenceIndicator.tsx`
- Modify: `src/components/blog/Giscus.tsx`
- Modify: `src/components/search/CommandPalette.tsx`
- Modify: `src/components/blog/Share.tsx`
- Modify: `src/components/blog/TableOfContents.tsx`

Components that `fetch('/api/...')` keep using fetch — the server routes will be at the same paths. The main changes are:
- `next/link` → `@tanstack/react-router`
- `next/navigation` → `@tanstack/react-router`
- `next/script` → inline `<script>` tags

For Giscus, replace `<Script>` with a `useEffect` that creates and appends the script element.

For CommandPalette, update navigation to use `router.navigate()`.

**Commit:**
```bash
git commit -m "feat: migrate blog, search, and feature components"
```

---

### Task 13: Migrate theme system

**Files:**
- Modify: `src/components/theme/ThemeProvider.tsx`
- Modify: `src/components/theme/ThemePicker.tsx`
- Modify: `src/components/theme/DynamicFavicon.tsx`

ThemeProvider is pure React context + localStorage. Only change: remove `'use client'` directive. Everything else stays.

ThemePicker may use `next/link` — replace if so.

**Commit:**
```bash
git commit -m "feat: migrate theme system"
```

---

## Phase 4: Server Functions & API

### Task 14: Create server middleware for IP extraction

**Files:**
- Create: `src/lib/server/middleware.ts`

```tsx
import { createMiddleware } from '@tanstack/react-start'

export const withIP = createMiddleware({ type: 'function' }).server(
  ({ next, context }) => {
    const request = context.request
    const forwarded = request.headers.get('x-forwarded-for')
    const real = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || real || 'unknown'
    return next({ context: { ip } })
  },
)
```

**Commit:**
```bash
git commit -m "feat: add IP extraction middleware"
```

---

### Task 15: Create view tracking server routes

**Files:**
- Create: `src/routes/api/views/$slug.tsx`
- Create: `src/routes/api/views/index.tsx`
- Create: `src/routes/api/views/stats.tsx`

```tsx
// src/routes/api/views/$slug.tsx
import { createServerFileRoute } from '@tanstack/react-start'
import redis from '~/lib/redis'
import { recordView } from '~/lib/views'

const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/

export const ServerRoute = createServerFileRoute('/api/views/$slug')({
  POST: async ({ request, params }) => {
    const { slug } = params
    if (!redis || !SLUG_RE.test(slug)) {
      return Response.json({ views: null })
    }
    try {
      const views = await recordView(slug, request)
      return Response.json({ views })
    } catch {
      return Response.json({ views: null })
    }
  },
})
```

Port `views/index.tsx` (GET all counts) and `views/stats.tsx` (GET dashboard data) similarly — replace `NextResponse.json()` with `Response.json()`, keep all Redis logic identical.

**Commit:**
```bash
git commit -m "feat: create view tracking server routes"
```

---

### Task 16: Create contact form server route

**Files:**
- Create: `src/routes/api/contact.tsx`

Port `app/api/contact/route.ts` directly. Changes:
- `NextResponse.json()` → `Response.json()`
- `getClientIP(req)` works as-is (reads headers from Request object)
- All validation, Turnstile, rate-limit, Resend logic stays identical

**Commit:**
```bash
git commit -m "feat: create contact form server route"
```

---

### Task 17: Create search, presence, and commands server routes

**Files:**
- Create: `src/routes/api/search.tsx`
- Create: `src/routes/api/presence.tsx`
- Create: `src/routes/api/commands.tsx`

Same pattern — port existing route handlers, replace `NextResponse` with `Response`.

For commands route:
- Keep all command logic identical
- Replace `NextResponse` with `Response` and `new NextResponse(html, ...)` with `new Response(html, ...)`

**Commit:**
```bash
git commit -m "feat: create search, presence, and commands server routes"
```

---

### Task 18: Create RSS, sitemap, and robots server routes

**Files:**
- Create: `src/routes/feed.xml.tsx`
- Create: `src/routes/sitemap.xml.tsx`
- Create: `src/routes/robots.txt.tsx`

```tsx
// src/routes/feed.xml.tsx
import { createServerFileRoute } from '@tanstack/react-start'
import { getAllPosts } from '~/lib/content'

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export const ServerRoute = createServerFileRoute('/feed.xml')({
  GET: async () => {
    const posts = getAllPosts('blog')
    const items = posts
      .map(
        (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://sandybridge.io/blog/${post.slug}</link>
      <guid>https://sandybridge.io/blog/${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`,
      )
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>sandybridge.io</title>
    <link>https://sandybridge.io</link>
    <description>Blog posts from sandybridge.io</description>
    <language>en-us</language>
    <atom:link href="https://sandybridge.io/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    })
  },
})
```

```tsx
// src/routes/sitemap.xml.tsx
import { createServerFileRoute } from '@tanstack/react-start'
import { getAllPosts, getAllTags } from '~/lib/content'

export const ServerRoute = createServerFileRoute('/sitemap.xml')({
  GET: async () => {
    const base = 'https://sandybridge.io'
    const staticPages = [
      { loc: base, freq: 'weekly', priority: '1' },
      { loc: `${base}/blog`, freq: 'weekly', priority: '0.8' },
      { loc: `${base}/portfolio`, freq: 'monthly', priority: '0.8' },
      { loc: `${base}/til`, freq: 'daily', priority: '0.7' },
      { loc: `${base}/now`, freq: 'weekly', priority: '0.5' },
      { loc: `${base}/changelog`, freq: 'weekly', priority: '0.4' },
      { loc: `${base}/colophon`, freq: 'monthly', priority: '0.4' },
    ]

    const blogs = getAllPosts('blog').map((p) => ({
      loc: `${base}/blog/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.6',
    }))
    const tags = getAllTags().map((t) => ({
      loc: `${base}/blog/tag/${t}`, freq: 'weekly', priority: '0.4',
    }))
    const portfolio = getAllPosts('portfolio').map((p) => ({
      loc: `${base}/portfolio/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.6',
    }))
    const til = getAllPosts('til').map((p) => ({
      loc: `${base}/til/${p.slug}`, lastmod: p.date, freq: 'monthly', priority: '0.5',
    }))

    const all = [...staticPages, ...blogs, ...tags, ...portfolio, ...til]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  },
})
```

```tsx
// src/routes/robots.txt.tsx
import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/robots.txt')({
  GET: async () => {
    return new Response(
      `User-agent: *\nAllow: /\n\nSitemap: https://sandybridge.io/sitemap.xml`,
      { headers: { 'Content-Type': 'text/plain' } },
    )
  },
})
```

**Commit:**
```bash
git commit -m "feat: create RSS, sitemap, and robots server routes"
```

---

### Task 19: Create OG image server route

**Files:**
- Create: `src/routes/api/og/$type.$slug.tsx`

Use satori to generate SVG from the same layout as the current OG images (gruvbox dark, site name, title, tags, date). Convert SVG to PNG via `@resvg/resvg-js`. Load Kode Mono font from `public/fonts/`. Cache response with `Cache-Control: public, max-age=86400`.

The satori call uses the object syntax (not JSX) since this is a server route:

```tsx
import { createServerFileRoute } from '@tanstack/react-start'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPost, type ContentDir } from '~/lib/content'

const fontData = readFileSync(join(process.cwd(), 'public/fonts/KodeMono-Regular.woff2'))

export const ServerRoute = createServerFileRoute('/api/og/$type/$slug')({
  GET: async ({ params }) => {
    const post = await getPost(params.type as ContentDir, params.slug)
    const title = post?.title || params.slug
    const date = post?.date || ''
    const tags = post?.tags || []

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: '60px 80px', background: '#151515',
            fontFamily: 'Kode Mono',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', gap: 16 },
                children: [
                  { type: 'div', props: { style: { fontSize: 28, color: '#928374' }, children: 'sandybridge.io' } },
                  { type: 'div', props: { style: { fontSize: 56, color: '#d79921', lineHeight: 1.2, maxWidth: '90%' }, children: title } },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', gap: 12 },
                      children: tags.slice(0, 4).map((tag: string) => ({
                        type: 'div',
                        props: {
                          style: { fontSize: 20, color: '#928374', border: '1px solid #303030', borderRadius: 4, padding: '4px 12px' },
                          children: tag,
                        },
                      })),
                    },
                  },
                  ...(date ? [{ type: 'div', props: { style: { fontSize: 22, color: '#928374' }, children: date } }] : []),
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Kode Mono', data: fontData, weight: 400, style: 'normal' as const }],
      },
    )

    const resvg = new Resvg(svg, { fitTo: { mode: 'width' as const, value: 1200 } })
    const png = resvg.render().asPng()

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  },
})
```

**Commit:**
```bash
git commit -m "feat: create satori-based OG image server route"
```

---

## Phase 5: Static Pages & Polish

### Task 20: Port remaining static pages

**Files:**
- Create: `src/routes/uses/index.tsx`
- Create: `src/routes/uses/nvim.tsx`
- Create: `src/routes/uses/theme.tsx`
- Create: `src/routes/now.tsx`
- Create: `src/routes/changelog.tsx`
- Create: `src/routes/colophon.tsx`
- Create: `src/routes/stats/index.tsx`
- Create: `src/routes/stats/views.tsx`

Each follows the same pattern:

```tsx
// src/routes/now.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/now')({
  head: () => ({
    meta: [{ title: 'Now | sandybridge.io' }],
  }),
  component: NowPage,
})

function NowPage() {
  // Port JSX from app/now/page.tsx
  return <div>{/* ... */}</div>
}
```

For pages that fetch data (changelog uses `getChangelog()`, stats/views loads dashboard data), wrap in `createServerFn` loaders.

**Commit after each page or batch of similar pages.**

---

### Task 21: Port nvim config server route

**Files:**
- Create: `src/routes/api/nvim-config.tsx`

Port `app/api/nvim-config/route.ts` — replace `NextResponse` with `Response`.

**Commit.**

---

### Task 22: Update environment variables

**Files:**
- Modify: `.env` (or `.env.local`)

Rename:
- `NEXT_PUBLIC_GISCUS_REPO` → `VITE_GISCUS_REPO`
- `NEXT_PUBLIC_GISCUS_REPO_ID` → `VITE_GISCUS_REPO_ID`
- `NEXT_PUBLIC_GISCUS_CATEGORY` → `VITE_GISCUS_CATEGORY`
- `NEXT_PUBLIC_GISCUS_CATEGORY_ID` → `VITE_GISCUS_CATEGORY_ID`
- `NEXT_PUBLIC_UMAMI_URL` → `VITE_UMAMI_URL`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` → `VITE_UMAMI_WEBSITE_ID`

Update all references:
- `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*` (in client code)
- Server-only vars (`REDIS_URL`, `GITHUB_TOKEN`, etc.) stay as `process.env.*`

**Commit:**
```bash
git commit -m "chore: update environment variables from NEXT_PUBLIC to VITE"
```

---

## Phase 6: Testing & Cutover

### Task 23: Build and verify prerendering

**Step 1: Generate route tree**

```bash
bunx tsr generate
```

**Step 2: Build**

```bash
bun run build
```

Expected: Vite builds successfully, prerendered pages listed in output.

**Step 3: Verify prerendered output**

Check `.output/` for generated HTML files for all content pages.

**Step 4: Start production server locally**

```bash
bun run start
```

Navigate to:
- `/` — homepage loads
- `/blog` — blog listing
- `/blog/{any-slug}` — blog post with syntax highlighting
- `/portfolio` — portfolio grid
- `/feed.xml` — RSS feed XML
- `/sitemap.xml` — sitemap XML
- `/api/og/blog/{slug}` — OG image PNG

**Step 5: Commit**

```bash
git commit -m "chore: verify production build and prerendering"
```

---

### Task 24: Deploy to staging on Railway

**Step 1: Create staging deployment**

Either create a new Railway service pointing to the `feat/tanstack-start` branch, or use Railway's PR preview feature.

**Step 2: Set environment variables**

Set all `VITE_*` and server vars in Railway dashboard.

**Step 3: Configure build command**

```
Build: bun install && bun run build
Start: bun run start
```

**Step 4: Smoke test staging**

Test every route, form submission, view tracking, theme switching, command palette, search.

**Step 5: Compare memory**

Check Railway metrics. Target: 200-300 MB (down from 676 MB).

---

### Task 25: Cutover

**Step 1: Merge branch**

```bash
git checkout main
git merge feat/tanstack-start
```

**Step 2: Clean up old files**

Verify no `app/`, `next.config.ts`, `next-env.d.ts` remain.

**Step 3: Push and deploy**

```bash
git push origin main
```

**Step 4: Verify production**

Monitor Railway for successful deployment and memory usage.

**Step 5: Update CLAUDE.md**

Update project CLAUDE.md to reflect the new stack:
- Next.js → TanStack Start
- npm → Bun
- `app/` → `src/routes/`
- Build commands updated
- Environment variable prefix changes

**Commit:**
```bash
git commit -m "docs: update CLAUDE.md for TanStack Start migration"
```
