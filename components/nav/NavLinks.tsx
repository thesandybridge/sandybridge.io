'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/til', label: 'TIL' },
  { href: '/uses', label: 'Uses' },
];

export function NavLinks() {
  const pathname = usePathname();

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
