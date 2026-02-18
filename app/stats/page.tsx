import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stats',
  description: 'Site statistics for sandybridge.io.',
};

function countLines(dir: string, extensions: string[]): number {
  let total = 0;

  function walk(d: string) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
        walk(full);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(full, 'utf-8');
        total += content.split('\n').length;
      }
    }
  }

  walk(dir);
  return total;
}

function countWords(dir: string): number {
  let total = 0;
  function walk(d: string) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf-8');
        total += content.split(/\s+/).filter(Boolean).length;
      }
    }
  }
  walk(dir);
  return total;
}

export default function StatsPage() {
  const blogPosts = getAllPosts('blog');
  const portfolioItems = getAllPosts('portfolio');
  const tags = getAllTags();
  const totalWords = countWords(path.join(process.cwd(), 'content'));
  const codeLines = countLines(process.cwd(), ['.ts', '.tsx', '.css']);
  const contentDir = path.join(process.cwd(), 'content');

  const tagCounts: Record<string, number> = {};
  for (const post of blogPosts) {
    for (const tag of post.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const readTimeTotal = blogPosts.reduce((sum, p) => sum + p.readTime, 0);

  // Find newest and oldest posts
  const newest = blogPosts[0];
  const oldest = blogPosts[blogPosts.length - 1];

  return (
    <>
      <h1>Stats</h1>
      <p>Numbers from the build at {new Date().toISOString().split('T')[0]}.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{blogPosts.length}</span>
          <span className="stat-label">Blog Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{portfolioItems.length}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalWords.toLocaleString()}</span>
          <span className="stat-label">Words Written</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{readTimeTotal}</span>
          <span className="stat-label">Min Total Read Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tags.length}</span>
          <span className="stat-label">Unique Tags</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{codeLines.toLocaleString()}</span>
          <span className="stat-label">Lines of Code</span>
        </div>
      </div>

      <h2>Tags</h2>
      <div className="post-tags" style={{ marginBottom: '2rem' }}>
        {sortedTags.map(([tag, count]) => (
          <span key={tag} className="tag">{tag} ({count})</span>
        ))}
      </div>

      {newest && oldest && (
        <>
          <h2>Timeline</h2>
          <p>First post: {oldest.date} &mdash; Latest post: {newest.date}</p>
        </>
      )}

      <h2>Analytics</h2>
      <p><Link href="/stats/views">View analytics dashboard</Link> — blog post view counts, heatmaps, and visualizations.</p>
      {process.env.NEXT_PUBLIC_UMAMI_URL && (
        <p>View the <a href={`${process.env.NEXT_PUBLIC_UMAMI_URL.replace('/script.js', '')}/share`} target="_blank" rel="noopener">Umami analytics dashboard</a>.</p>
      )}
    </>
  );
}
