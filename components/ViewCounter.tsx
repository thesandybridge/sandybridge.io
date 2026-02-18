'use client';

import { useEffect, useState } from 'react';

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const key = `viewed:${slug}`;
    const already = sessionStorage.getItem(key);

    if (already) {
      setViews(parseInt(already, 10));
      return;
    }

    fetch(`/api/views/${slug}`, { method: 'POST' })
      .then((r) => r.json())
      .then((data) => {
        if (data.views !== null) {
          sessionStorage.setItem(key, String(data.views));
        }
        setViews(data.views);
      })
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  return <span className="view-count">{views.toLocaleString()} {views === 1 ? 'view' : 'views'}</span>;
}
