'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Heading } from '@/lib/docs';

interface DocLink {
  slug: string;
  title: string;
  headings: Heading[];
}

export function DocsSidebar({ docs }: { docs: DocLink[] }) {
  const pathname = usePathname();
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const activeSlug = pathname.startsWith('/docs/')
    ? pathname.replace('/docs/', '')
    : null;

  const activeDoc = activeSlug
    ? docs.find((d) => d.slug === activeSlug)
    : null;

  const updateActiveHeading = useCallback(() => {
    if (!activeDoc || activeDoc.headings.length === 0) return;

    const scrollY = window.scrollY + 120;
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
    <aside className="docs-sidebar">
      <nav aria-label="Documentation">
        <Link
          href="/docs"
          className={`docs-sidebar-link${pathname === '/docs' ? ' active' : ''}`}
        >
          Overview
        </Link>
        {docs.map((doc) => (
          <div key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className={`docs-sidebar-link${activeSlug === doc.slug ? ' active' : ''}`}
            >
              {doc.title}
            </Link>
            {activeSlug === doc.slug && doc.headings.length > 0 && (
              <div className="docs-sidebar-headings">
                {doc.headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`docs-sidebar-heading${activeHeadingId === heading.id ? ' active' : ''}`}
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
