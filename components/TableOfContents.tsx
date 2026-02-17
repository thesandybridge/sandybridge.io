'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/content';

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="toc" aria-label="Table of contents">
      <details open>
        <summary>Table of Contents</summary>
        <ul>
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: (h.level - 2) * 1 + 'rem' }}>
              <a
                href={`#${h.id}`}
                className={activeId === h.id ? 'toc-active' : ''}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
