import { getAllPosts } from '@/lib/content';
import { ViewsDashboard } from '@/components/analytics/ViewsDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Analytics',
  description: 'Blog post view analytics and visualizations.',
};

export default function ViewStatsPage() {
  const posts = getAllPosts('blog').map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
  }));

  return (
    <>
      <h1>View Analytics</h1>
      <p>Visualizations of blog post view data over time.</p>
      <ViewsDashboard posts={posts} />
    </>
  );
}
