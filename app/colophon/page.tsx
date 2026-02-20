import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Colophon',
  description: 'How this site is built.',
};

export default function ColophonPage() {
  return (
    <>
      <h1>Colophon</h1>
      <p>Technical details about how this site is built and hosted.</p>

      <h2>Stack</h2>
      <ul>
        <li><strong>Framework:</strong> Next.js 16 with App Router and React Server Components</li>
        <li><strong>Styling:</strong> Plain CSS with CSS custom properties for theming</li>
        <li><strong>Content:</strong> MDX files processed with next-mdx-remote</li>
        <li><strong>Syntax Highlighting:</strong> Shiki with CSS variables theme</li>
        <li><strong>3D Background:</strong> React Three Fiber with custom wireframe geometry</li>
        <li><strong>Search:</strong> Fuse.js for client-side fuzzy search</li>
        <li><strong>Comments:</strong> Giscus (GitHub Discussions)</li>
      </ul>

      <h2>Hosting</h2>
      <ul>
        <li><strong>Platform:</strong> Railway</li>
        <li><strong>Cache:</strong> Redis for view counts and analytics</li>
        <li><strong>Domain:</strong> Managed through Cloudflare</li>
      </ul>

      <h2>Design</h2>
      <ul>
        <li><strong>Typography:</strong> Kode Mono - a monospace font throughout</li>
        <li><strong>Themes:</strong> 9 color themes including Gruvbox, Dracula, Nord, Catppuccin, and more</li>
        <li><strong>Dark/Light Mode:</strong> Respects system preference with manual override</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>Terminal emulator with custom commands (<code>Ctrl+K</code> then <code>&gt;</code>)</li>
        <li>Vim-style navigation (<code>j/k</code> to scroll, <code>gg/G</code> for top/bottom)</li>
        <li>Keyboard shortcuts throughout</li>
        <li>Theme-specific cursor particle effects</li>
        <li>Reading progress indicator</li>
        <li>View counts and analytics</li>
      </ul>

      <h2>Source</h2>
      <p>
        The source code for this site is available on{' '}
        <a href="https://github.com/thesandybridge/sandybridge.io" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>.
      </p>

      <p style={{ marginTop: '2rem' }}>
        <Link href="/uses" className="config-link">See my full setup →</Link>
      </p>
    </>
  );
}
