'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import s from './CachedPages.module.css';

interface CachedPage {
  url: string;
  title: string;
}

export function CachedPages() {
  const [pages, setPages] = useState<CachedPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCachedPages() {
      if (!('caches' in window)) {
        setLoading(false);
        return;
      }

      try {
        const cache = await caches.open('blog-pages');
        const keys = await cache.keys();

        const cachedPages: CachedPage[] = [];

        for (const request of keys) {
          const url = new URL(request.url);
          if (url.pathname.startsWith('/blog/') && url.pathname !== '/blog/') {
            const slug = url.pathname.replace('/blog/', '').replace(/\/$/, '');
            cachedPages.push({
              url: url.pathname,
              title: slug.replace(/-/g, ' ').replace(/_/g, ' '),
            });
          }
        }

        setPages(cachedPages);
      } catch {
        // Cache access failed
      }

      setLoading(false);
    }

    getCachedPages();
  }, []);

  if (loading) {
    return <p className={s.loading}>Checking cache...</p>;
  }

  if (pages.length === 0) {
    return <p className={s.empty}>No cached pages found. Visit some blog posts while online to cache them.</p>;
  }

  return (
    <ul className={s.list}>
      {pages.map((page) => (
        <li key={page.url}>
          <Link href={page.url}>{page.title}</Link>
        </li>
      ))}
    </ul>
  );
}
