'use client';

import { useEffect, useState } from 'react';
import { SummaryCards } from './SummaryCards';
import { ContributionHeatmap } from './ContributionHeatmap';
import { TopPostsChart } from './TopPostsChart';
import { Flamegraph } from './Flamegraph';

interface PostInfo {
  slug: string;
  title: string;
  tags: string[];
}

export interface StatsData {
  totals: Record<string, number>;
  daily: Record<string, Record<string, number>>;
  summary: { totalViews: number; viewsThisWeek: number; topPost: string };
}

export function ViewsDashboard({ posts }: { posts: PostInfo[] }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/views/stats')
      .then((r) => r.json())
      .then((d: StatsData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="loading-text">Loading analytics data...</p>;
  }

  if (!data || Object.keys(data.totals).length === 0) {
    return <p className="loading-text">No view data available yet.</p>;
  }

  const titleMap = new Map(posts.map((p) => [p.slug, p.title]));
  const postCount = posts.length;
  const avgViews = postCount > 0 ? Math.round(data.summary.totalViews / postCount) : 0;
  const topPostTitle = titleMap.get(data.summary.topPost) ?? data.summary.topPost;

  return (
    <>
      <section className="dashboard-section">
        <SummaryCards
          totalViews={data.summary.totalViews}
          viewsThisWeek={data.summary.viewsThisWeek}
          topPost={topPostTitle}
          avgViews={avgViews}
        />
      </section>

      <section className="dashboard-section">
        <h2>Activity</h2>
        <ContributionHeatmap daily={data.daily} />
      </section>

      <section className="dashboard-section">
        <h2>Top Posts</h2>
        <TopPostsChart totals={data.totals} daily={data.daily} titleMap={titleMap} />
      </section>

      <section className="dashboard-section">
        <h2>Content Flamegraph</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary-fg)', marginBottom: '1rem' }}>Tags → Posts → Views breakdown. Posts with multiple tags appear under each.</p>
        <Flamegraph totals={data.totals} posts={posts} />
      </section>
    </>
  );
}
