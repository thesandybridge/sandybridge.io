import Link from 'next/link';
import type { PostMeta } from '@/lib/content';
import s from './SeriesNav.module.css';

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
    <nav className={s.seriesNav} aria-label={`${seriesName} series navigation`} data-nav>
      <div className={s.header}>
        <span className={s.label}>Series: {seriesName}</span>
        <span className={s.progress}>Part {part} of {total}</span>
      </div>
      <ol className={s.list}>
        {seriesPosts.map((post) => (
          <li key={post.slug} className={post.slug === currentSlug ? s.current : ''}>
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
