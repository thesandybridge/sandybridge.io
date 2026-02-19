import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Nav } from '@/components/Nav';
import { CommandPalette } from '@/components/CommandPalette';
import { BackgroundLazy as Background } from '@/components/BackgroundLazy';
import { CursorGlow } from '@/components/CursorGlow';
import { MobileNav } from '@/components/MobileNav';
import { VimBindings } from '@/components/VimBindings';
import { TriangleBurst } from '@/components/TriangleBurst';
import { CoronaScroll } from '@/components/CoronaScroll';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var m=localStorage.getItem('mode');if(t)document.documentElement.setAttribute('data-theme',t);if(m)document.documentElement.setAttribute('data-mode',m);})();`,
          }}
        />
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-NFSBFRPK');`}
        </Script>
        {umamiUrl && umamiId && (
          <Script
            async
            src={umamiUrl}
            data-website-id={umamiId}
            strategy="afterInteractive"
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
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-NFSBFRPK"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
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
          <CursorGlow />
          <div className="grain-overlay" />
          <CoronaScroll />
          <CommandPalette />
          <VimBindings />
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
