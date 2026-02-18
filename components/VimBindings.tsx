'use client';

import { useEffect, useRef } from 'react';

export function VimBindings() {
  const lastGRef = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (document.querySelector('.palette-overlay')) return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          window.scrollBy({ top: 100, behavior: 'smooth' });
          break;
        case 'k':
          e.preventDefault();
          window.scrollBy({ top: -100, behavior: 'smooth' });
          break;
        case 'G':
          e.preventDefault();
          window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          break;
        case 'g': {
          const now = Date.now();
          if (now - lastGRef.current < 500) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            lastGRef.current = 0;
          } else {
            lastGRef.current = now;
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return null;
}
