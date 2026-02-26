import {
  HeadContent,
  Scripts,
  createRootRoute,
  Link,
  Outlet,
  useLocation,
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
import { generateThemeScript } from '~/lib/themes'
import globalsCss from '~/styles/globals.css?url'
import notFoundStyles from '~/styles/not-found.module.css'

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
  component: RootComponent,
})

function RootComponent() {
  return <Outlet />
}

function NotFound() {
  const { pathname } = useLocation()
  const s = notFoundStyles

  return (
    <div className={s.notFound}>
      <pre className={s.ascii} aria-hidden="true">
{` █  █  ███  █  █
 █  █ █   █ █  █
 ████ █   █ ████
    █ █   █    █
    █  ███     █`}
      </pre>
      <div className={s.terminal}>
        <div className={s.line}>
          <span className={s.prompt}>guest@sandybridge:~$</span> cd {pathname}
        </div>
        <div className={`${s.line} ${s.error}`}>
          bash: cd: No such file or directory
        </div>
        <div className={s.line}>
          <span className={s.prompt}>guest@sandybridge:~$</span> ls
        </div>
        <div className={s.line}>
          home&nbsp;&nbsp;blog&nbsp;&nbsp;portfolio&nbsp;&nbsp;uses
        </div>
      </div>
      <div className={s.actions}>
        <Link to="/">cd ~</Link>
        <span className={s.hint}>
          Press <kbd>Ctrl+K</kbd> to open command palette
        </span>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()
  // generateThemeScript() returns a trusted static string from @thesandybridge/themes — no user input
  const themeScript = generateThemeScript()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
