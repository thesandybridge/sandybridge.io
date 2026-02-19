'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PostInfo {
  slug: string;
  title: string;
}

interface StatsResponse {
  totals: Record<string, number>;
}

export function TrendingPosts({ posts }: { posts: PostInfo[] }) {
  const [trending, setTrending] = useState<{ slug: string; title: string; views: number }[]>([]);

  useEffect(() => {
    fetch('/api/views/stats')
      .then((r) => r.json())
      .then((data: StatsResponse) => {
        const titleMap = new Map(posts.map((p) => [p.slug, p.title]));
        const ranked = Object.entries(data.totals)
          .filter(([slug]) => titleMap.has(slug))
          .map(([slug, views]) => ({ slug, title: titleMap.get(slug)!, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        if (ranked.length > 0) setTrending(ranked);
      })
      .catch(() => {});
  }, [posts]);

  if (trending.length === 0) return null;

  return (
    <section className="trending-section">
      <h2>Trending</h2>
      <ol className="trending-list">
        {trending.map((item, i) => (
          <li key={item.slug} className="trending-item">
            <span className="trending-rank">{i + 1}</span>
            <Link href={`/blog/${item.slug}`} className="trending-title">{item.title}</Link>
            <span className="trending-views">{item.views.toLocaleString()} views</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
