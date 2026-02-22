'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '@/lib/use-mobile';
import type { Heading } from '@/lib/content';
import s from './TableOfContents.module.css';

interface Props {
  headings: Heading[];
}

export function TableOfContents({ headings }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile(600);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      target.classList.add('heading-pulse');
      setTimeout(() => target.classList.remove('heading-pulse'), 1000);
    }, 500);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let activeLink: HTMLAnchorElement | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (activeLink) activeLink.classList.remove(s.tocActive);
            activeLink = nav.querySelector(`a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add(s.tocActive);
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
    <nav className={s.toc} ref={navRef} aria-label="Table of contents" data-nav>
      <details open={!isMobile}>
        <summary>Table of Contents</summary>
        <ul>
          {headings.map((h) => (
            <li key={h.id} style={{ paddingLeft: (h.level - 2) * 1 + 'rem' }}>
              <a href={`#${h.id}`} onClick={handleClick}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
