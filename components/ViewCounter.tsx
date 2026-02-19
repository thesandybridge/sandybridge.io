'use client';

import { useEffect, useState, useRef } from 'react';

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);
  const depthSent = useRef(false);

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

  // Scroll depth tracking
  useEffect(() => {
    const depthKey = `depth:${slug}`;
    if (sessionStorage.getItem(depthKey)) return;

    let maxDepth = 0;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(scrollTop / docHeight, 1) * 100;
      const bucket = Math.floor(pct / 10) * 10;
      if (bucket > maxDepth) maxDepth = bucket;
    };

    const sendDepth = () => {
      if (depthSent.current || maxDepth < 10) return;
      depthSent.current = true;
      sessionStorage.setItem(depthKey, '1');
      const depth = Math.min(maxDepth, 100);
      navigator.sendBeacon?.(
        `/api/views/${slug}/depth`,
        JSON.stringify({ depth })
      ) || fetch(`/api/views/${slug}/depth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depth }),
        keepalive: true,
      }).catch(() => {});
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') sendDepth();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    const idleTimer = setTimeout(sendDepth, 60000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTimeout(idleTimer);
      sendDepth();
    };
  }, [slug]);

  if (views === null) return null;

  return (
    <>
      <span className="meta-dot">&middot;</span>
      <span className="view-count">{views.toLocaleString()} {views === 1 ? 'view' : 'views'}</span>
    </>
  );
}
