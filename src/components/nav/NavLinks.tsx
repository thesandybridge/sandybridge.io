import { Link, useLocation } from '@tanstack/react-router';

const links = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/til', label: 'TIL' },
  { href: '/uses', label: 'Uses' },
];

export function NavLinks() {
  const { pathname } = useLocation();

  return (
    <>
      {links.map(({ href, label }) => (
        <li key={href}>
          <Link
            to={href}
            className={pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}
          >
            {label}
          </Link>
        </li>
      ))}
    </>
  );
}
