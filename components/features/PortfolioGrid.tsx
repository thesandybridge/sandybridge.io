'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CoronaReveal, TiltCard } from '@/components/effects';
import { BLUR_DATA_URL } from '@/lib/blur-placeholder';
import type { PostMeta } from '@/lib/content';
import type { RepoStats } from '@/lib/github';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web Apps' },
  { id: 'cli', label: 'CLI Tools' },
  { id: 'systems', label: 'Systems' },
  { id: 'visualization', label: 'Visualization' },
  { id: 'library', label: 'Libraries' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  web: '#83a598',
  cli: '#b8bb26',
  systems: '#d3869b',
  visualization: '#fe8019',
  library: '#fabd2f',
  other: '#928374',
};

function inferCategory(tags: string[]): string {
  const t = tags.map((s) => s.toLowerCase());
  if (t.includes('cli') || t.includes('tooling')) return 'cli';
  if (t.includes('nextjs') || t.includes('react') || t.includes('svelte')) return 'web';
  if (t.includes('distributed-systems') || t.includes('algorithms')) return 'systems';
  if (t.includes('wasm') || t.includes('bevy') || t.includes('cryptography')) return 'visualization';
  if (t.includes('library') || t.includes('npm')) return 'library';
  return 'other';
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'pushed today';
  if (days === 1) return 'pushed yesterday';
  if (days < 7) return `pushed ${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `pushed ${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `pushed ${months}mo ago`;
  const years = Math.floor(days / 365);
  return `pushed ${years}y ago`;
}

interface PortfolioGridProps {
  items: PostMeta[];
  statsMap: Record<string, RepoStats>;
}

function PortfolioCard({
  item,
  stats,
  catColor,
}: {
  item: PostMeta;
  stats?: RepoStats;
  catColor: string;
}) {
  return (
    <TiltCard>
      <Link
        href={`/portfolio/${item.slug}`}
        className="portfolio-card"
        style={{ '--cat-color': catColor } as React.CSSProperties}
      >
        {item.image ? (
          <Image
            src={`/assets/portfolio/${item.image}`}
            alt={item.title}
            width={600}
            height={338}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <div className="portfolio-card-accent" />
        )}
        <div className="portfolio-card-body">
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          {stats ? (
            <div className="portfolio-stats">
              {stats.language && <span className="portfolio-stat">{stats.language}</span>}
              <span className="portfolio-stat">&#9733; {stats.stars} &middot; {stats.commits} commits</span>
              <span className="portfolio-stat">{relativeTime(stats.lastPush)}</span>
            </div>
          ) : item.work ? (
            <div className="portfolio-stats">
              <span className="portfolio-stat portfolio-stat-work">Work</span>
            </div>
          ) : null}
        </div>
      </Link>
    </TiltCard>
  );
}

export function PortfolioGrid({ items, statsMap }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const itemsWithCategory = items.map((item) => ({
    ...item,
    category: item.category || inferCategory(item.tags),
  }));

  // Sort by lastPush desc, then commits desc as tiebreaker
  function sortByActivity<T extends { slug: string }>(arr: T[]): T[] {
    return [...arr].sort((a, b) => {
      const ad = statsMap[a.slug]?.lastPush ?? '';
      const bd = statsMap[b.slug]?.lastPush ?? '';
      if (bd !== ad) return bd.localeCompare(ad);
      const ac = statsMap[a.slug]?.commits ?? 0;
      const bc = statsMap[b.slug]?.commits ?? 0;
      return bc - ac;
    });
  }

  // Dynamic featured: top 4 most recently pushed, manual pin override takes priority
  const featured = (() => {
    const pinned = itemsWithCategory.filter((item) => item.featured);
    const rest = sortByActivity(
      itemsWithCategory.filter((item) => !item.featured && statsMap[item.slug]),
    );
    return [...pinned, ...rest].slice(0, 4);
  })();

  const featuredSlugs = new Set(featured.map((item) => item.slug));
  const nonFeatured = sortByActivity(
    itemsWithCategory.filter((item) => !featuredSlugs.has(item.slug)),
  );

  // Category counts for filter pills (based on non-featured items)
  const categoryCounts: Record<string, number> = {};
  for (const item of nonFeatured) {
    const cat = item.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const filtered = activeCategory === 'all'
    ? nonFeatured
    : nonFeatured.filter((item) => item.category === activeCategory);

  function getCatColor(item: PostMeta & { category?: string }): string {
    return CATEGORY_COLORS[item.category || 'other'] || CATEGORY_COLORS.other;
  }

  return (
    <>
      {featured.length > 0 && (
        <section className="portfolio-featured">
          <h2>Recently Active</h2>
          <div className="portfolio-featured-grid">
            {[0, 1].map((col) => (
              <div key={col} className="portfolio-column">
                {featured.filter((_, i) => i % 2 === col).map((item) => (
                  <TiltCard key={item.slug}>
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="portfolio-card portfolio-featured-card"
                      style={{ '--cat-color': getCatColor(item) } as React.CSSProperties}
                    >
                      {item.image ? (
                        <Image
                          src={`/assets/portfolio/${item.image}`}
                          alt={item.title}
                          width={800}
                          height={450}
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          style={{ width: '100%', height: 'auto' }}
                        />
                      ) : (
                        <div className="portfolio-card-accent" />
                      )}
                      <div className="portfolio-card-body">
                        <h3>{item.title}</h3>
                        {item.description && <p>{item.description}</p>}
                        {statsMap[item.slug] ? (
                          <div className="portfolio-stats">
                            {statsMap[item.slug].language && (
                              <span className="portfolio-stat">{statsMap[item.slug].language}</span>
                            )}
                            <span className="portfolio-stat">&#9733; {statsMap[item.slug].stars} &middot; {statsMap[item.slug].commits} commits</span>
                            <span className="portfolio-stat">{relativeTime(statsMap[item.slug].lastPush)}</span>
                          </div>
                        ) : item.work ? (
                          <div className="portfolio-stats">
                            <span className="portfolio-stat portfolio-stat-work">Work</span>
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </TiltCard>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="portfolio-filters">
        {CATEGORIES.map((cat) => {
          const count = cat.id === 'all'
            ? nonFeatured.length
            : (categoryCounts[cat.id] || 0);
          if (count === 0 && cat.id !== 'all') return null;
          return (
            <button
              key={cat.id}
              className={`portfolio-filter-pill${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              <span className="portfolio-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      <CoronaReveal className="portfolio-masonry">
        {[0, 1].map((col) => (
          <div key={col} className="portfolio-column">
            {filtered.filter((_, i) => i % 2 === col).map((item) => (
              <PortfolioCard
                key={item.slug}
                item={item}
                stats={statsMap[item.slug]}
                catColor={getCatColor(item)}
              />
            ))}
          </div>
        ))}
      </CoronaReveal>
    </>
  );
}
