'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Heading } from '@/lib/docs';
import s from './docs-sidebar.module.css';

interface DocLink {
  slug: string;
  title: string;
  headings: Heading[];
}

export function DocsSidebar({ docs }: { docs: DocLink[] }) {
  const pathname = usePathname();
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const activeSlug = pathname.startsWith('/docs/')
    ? pathname.slice('/docs/'.length).replace(/\/$/, '')
    : null;

  const activeDoc = activeSlug
    ? docs.find((d) => d.slug === activeSlug)
    : null;

  const updateActiveHeading = useCallback(() => {
    if (!activeDoc || activeDoc.headings.length === 0) return;

    const scrollY = window.scrollY + 100;
    let current: string | null = null;

    for (const heading of activeDoc.headings) {
      const el = document.getElementById(heading.id);
      if (el && el.offsetTop <= scrollY) {
        current = heading.id;
      }
    }

    setActiveHeadingId(current);
  }, [activeDoc]);

  useEffect(() => {
    if (!activeDoc) return;

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [activeDoc, updateActiveHeading]);

  return (
    <aside className={s.sidebar}>
      <nav aria-label="Documentation">
        <Link
          href="/docs"
          className={`${s.link}${pathname === '/docs' ? ` ${s.linkActive}` : ''}`}
        >
          Overview
        </Link>
        {docs.map((doc) => (
          <div key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className={`${s.link}${activeSlug === doc.slug ? ` ${s.linkActive}` : ''}`}
            >
              {doc.title}
            </Link>
            {activeSlug === doc.slug && doc.headings.length > 0 && (
              <div className={s.headings}>
                {doc.headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`${s.heading}${activeHeadingId === heading.id ? ` ${s.headingActive}` : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(heading.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {heading.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
