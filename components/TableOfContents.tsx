'use client';

import { useEffect, useRef } from 'react';
import type { Heading } from '@/lib/content';

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let activeLink: HTMLAnchorElement | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (activeLink) activeLink.classList.remove('toc-active');
            activeLink = nav.querySelector(`a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('toc-active');
            break;
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
    <nav className="toc" ref={navRef} aria-label="Table of contents">
      <details open>
        <summary>Table of Contents</summary>
        <ul>
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: (h.level - 2) * 1 + 'rem' }}>
              <a href={`#${h.id}`}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
