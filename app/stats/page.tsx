import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getAllPosts, getAllTags } from '@/lib/content';
import { CoronaReveal } from '@/components/effects';
import { GitHubContributions } from '@/components/features';
import { TextScramble } from '@/components/home';
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

export default async function StatsPage() {
  const blogPosts = getAllPosts('blog');
  const portfolioItems = getAllPosts('portfolio');
  const tags = getAllTags();
  const totalWords = countWords(path.join(process.cwd(), 'content'));
  const codeLines = countLines(process.cwd(), ['.ts', '.tsx', '.css']);

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

  const statCards = [
    { value: blogPosts.length, label: 'Blog Posts' },
    { value: portfolioItems.length, label: 'Projects' },
    { value: totalWords.toLocaleString(), label: 'Words Written' },
    { value: readTimeTotal, label: 'Min Total Read Time' },
    { value: tags.length, label: 'Unique Tags' },
    { value: codeLines.toLocaleString(), label: 'Lines of Code' },
  ];

  return (
    <>
      <TextScramble>Stats</TextScramble>
      <p>Numbers from the build at {new Date().toISOString().split('T')[0]}.</p>

      <div className="stats-grid">
        {statCards.map((card, i) => (
          <CoronaReveal key={card.label} delay={i * 80}>
            <div className="stat-card">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </CoronaReveal>
        ))}
      </div>

      <h2>Tags</h2>
      <div className="post-tags" style={{ marginBottom: '2rem' }}>
        {sortedTags.map(([tag, count]) => (
          <span key={tag} className="tag">{tag} ({count})</span>
        ))}
      </div>

      <h2>GitHub Activity</h2>
      <GitHubContributions username="sandypockets" />

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
