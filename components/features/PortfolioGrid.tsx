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

function inferCategory(tags: string[]): string {
  const t = tags.map((s) => s.toLowerCase());
  if (t.includes('cli') || t.includes('tooling')) return 'cli';
  if (t.includes('nextjs') || t.includes('react') || t.includes('svelte')) return 'web';
  if (t.includes('distributed-systems') || t.includes('algorithms')) return 'systems';
  if (t.includes('wasm') || t.includes('bevy') || t.includes('cryptography')) return 'visualization';
  if (t.includes('library') || t.includes('npm')) return 'library';
  return 'other';
}

interface PortfolioGridProps {
  items: PostMeta[];
  statsMap: Record<string, RepoStats>;
}

function PortfolioCard({ item, stats }: { item: PostMeta; stats?: RepoStats }) {
  return (
    <TiltCard>
      <Link href={`/portfolio/${item.slug}`} className="portfolio-card">
        {item.image && (
          <Image
            src={`/assets/portfolio/${item.image}`}
            alt={item.title}
            width={600}
            height={338}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ width: '100%', height: 'auto' }}
          />
        )}
        <div className="portfolio-card-body">
          <h3>{item.title}</h3>
          {item.description && <p>{item.description}</p>}
          {stats && (
            <div className="portfolio-stats">
              {stats.language && <span className="portfolio-stat">{stats.language}</span>}
              <span className="portfolio-stat">&#9733; {stats.stars}</span>
              <span className="portfolio-stat">Updated {stats.lastPush}</span>
            </div>
          )}
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

  const featured = itemsWithCategory.filter((item) => item.featured);
  const nonFeatured = itemsWithCategory.filter((item) => !item.featured);

  const filtered = activeCategory === 'all'
    ? nonFeatured
    : nonFeatured.filter((item) => item.category === activeCategory);

  return (
    <>
      {featured.length > 0 && (
        <section className="portfolio-featured">
          <h2>Featured</h2>
          <div className="portfolio-featured-grid">
            {featured.map((item) => (
              <TiltCard key={item.slug}>
                <Link href={`/portfolio/${item.slug}`} className="portfolio-card portfolio-featured-card">
                  {item.image && (
                    <Image
                      src={`/assets/portfolio/${item.image}`}
                      alt={item.title}
                      width={800}
                      height={450}
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  )}
                  <div className="portfolio-card-body">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    {statsMap[item.slug] && (
                      <div className="portfolio-stats">
                        {statsMap[item.slug].language && (
                          <span className="portfolio-stat">{statsMap[item.slug].language}</span>
                        )}
                        <span className="portfolio-stat">&#9733; {statsMap[item.slug].stars}</span>
                        <span className="portfolio-stat">Updated {statsMap[item.slug].lastPush}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      <div className="portfolio-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`portfolio-filter-pill${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <CoronaReveal className="portfolio-masonry">
        {[0, 1].map((col) => (
          <div key={col} className="portfolio-column">
            {filtered.filter((_, i) => i % 2 === col).map((item) => (
              <PortfolioCard key={item.slug} item={item} stats={statsMap[item.slug]} />
            ))}
          </div>
        ))}
      </CoronaReveal>
    </>
  );
}
