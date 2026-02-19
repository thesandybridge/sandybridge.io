'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/uses', label: 'Uses' },
];

export function NavLinks() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth < 900) return;

    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const anchors = nav.querySelectorAll<HTMLAnchorElement>('li > a');

    const onMouseMove = (e: MouseEvent) => {
      for (const a of anchors) {
        const rect = a.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 60) {
          a.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
        }
      }
    };

    const onMouseLeave = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      a.style.transform = 'translate(0, 0)';
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    for (const a of anchors) {
      a.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      for (const a of anchors) {
        a.removeEventListener('mouseleave', onMouseLeave);
        a.style.transform = '';
      }
    };
  }, []);

  return (
    <>
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link
            href={href}
            className={pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}
          >
            {label}
          </Link>
        </li>
      ))}
    </>
  );
}
