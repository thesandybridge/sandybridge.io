'use client';

import { useEffect, useRef } from 'react';

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        const pct = scrollHeight > 0 ? (el.scrollTop / scrollHeight) * 100 : 0;
        bar.style.width = `${pct}%`;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="reading-progress"
    />
  );
}
