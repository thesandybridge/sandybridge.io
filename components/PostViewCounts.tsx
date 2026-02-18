'use client';

import { useEffect } from 'react';

export function PostViewCounts() {
  useEffect(() => {
    const spans: HTMLSpanElement[] = [];

    fetch('/api/views')
      .then((r) => r.json())
      .then((counts: Record<string, number>) => {
        for (const [slug, views] of Object.entries(counts)) {
          const link = document.querySelector<HTMLAnchorElement>(
            `a[href="/blog/${slug}"]`,
          );
          if (!link) continue;

          const span = document.createElement('span');
          span.className = 'view-count';
          span.textContent = `${views.toLocaleString()} ${views === 1 ? 'view' : 'views'}`;
          link.appendChild(span);
          spans.push(span);
        }
      })
      .catch(() => {});

    return () => {
      spans.forEach((s) => s.remove());
    };
  }, []);

  return null;
}
