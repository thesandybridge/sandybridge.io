'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PostInfo {
  slug: string;
  title: string;
}

interface StatsResponse {
  totals: Record<string, number>;
  daily: Record<string, Record<string, number>>;
  summary: { totalViews: number; viewsThisWeek: number; topPost: string };
}

export function TrendingPosts({ posts }: { posts: PostInfo[] }) {
  const [trending, setTrending] = useState<{ slug: string; title: string; views: number }[]>([]);

  useEffect(() => {
    fetch('/api/views/stats')
      .then((r) => r.json())
      .then((data: StatsResponse) => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.toISOString().split('T')[0];

        // Sum views per slug over last 7 days
        const recentViews: Record<string, number> = {};
        for (const [date, slugCounts] of Object.entries(data.daily)) {
          if (date >= weekStr) {
            for (const [slug, count] of Object.entries(slugCounts)) {
              recentViews[slug] = (recentViews[slug] || 0) + count;
            }
          }
        }

        // If no daily data, fall back to totals
        const source = Object.keys(recentViews).length > 0 ? recentViews : data.totals;

        const titleMap = new Map(posts.map((p) => [p.slug, p.title]));
        const ranked = Object.entries(source)
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
