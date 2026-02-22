import Link from 'next/link';
import type { PostMeta } from '@/lib/content';

interface SeriesNavProps {
  currentSlug: string;
  seriesPosts: PostMeta[];
  seriesName: string;
}

export function SeriesNav({ currentSlug, seriesPosts, seriesName }: SeriesNavProps) {
  const currentIndex = seriesPosts.findIndex((p) => p.slug === currentSlug);
  const part = currentIndex + 1;
  const total = seriesPosts.length;

  return (
    <nav className="series-nav" aria-label={`${seriesName} series navigation`} data-nav>
      <div className="series-header">
        <span className="series-label">Series: {seriesName}</span>
        <span className="series-progress">Part {part} of {total}</span>
      </div>
      <ol className="series-list">
        {seriesPosts.map((post) => (
          <li key={post.slug} className={post.slug === currentSlug ? 'series-current' : ''}>
            {post.slug === currentSlug ? (
              <span>{post.title}</span>
            ) : (
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
