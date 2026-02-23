import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Nav, MobileNav } from '@/components/nav';
import { CommandPalette, MobileSearch } from '@/components/search';
import { BackgroundLazy as Background, SkillEffectsLazy as SkillEffects, CursorGlow, CursorTrail, MagneticLinks, SoundEffects, TriangleBurst, CoronaScroll, GrainOverlay } from '@/components/effects';
import { DesktopSpeedDial, VimBindings, KonamiCode, Footer } from '@/components/features';
import { DynamicFavicon, ThemeProvider } from '@/components/theme';
import { generateThemeScript } from '@/lib/themes';
import './globals.css';

const kodeMono = localFont({
  src: [
    { path: '../public/fonts/KodeMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/KodeMono-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-kode-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'sandybridge.io',
    template: '%s | sandybridge.io',
  },
  description: 'Software engineer focused on frontend development and expanding into systems work.',
  metadataBase: new URL('https://sandybridge.io'),
  openGraph: {
    type: 'website',
    siteName: 'sandybridge.io',
  },
  twitter: {
    card: 'summary',
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  icons: {
    icon: [
      { url: '/assets/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/assets/favicon/apple-touch-icon.png',
  },
  manifest: '/assets/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html lang="en" className={kodeMono.variable} suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        <script
          dangerouslySetInnerHTML={{ __html: generateThemeScript() }}
        />
        {umamiUrl && umamiId && (
          <script
            async
            src={umamiUrl}
            data-website-id={umamiId}
          />
        )}
      </head>
      <body style={{ fontFamily: 'var(--font-kode-mono), monospace' }}>
        <ThemeProvider>
          <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
            <filter id="corona-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves={4} seed="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={6} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <a href="#content" className="skip-link">Skip to content</a>
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
      </body>
    </html>
  );
}
