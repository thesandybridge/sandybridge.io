import { NavLinks } from './NavLinks';

export function Nav() {
  return (
    <nav>
      <ul id="main-nav">
        <NavLinks />
        <li className="nav-shortcuts">
          <button id="search-toggle" className="nav-shortcut" aria-label="Search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <kbd>/</kbd>
          </button>
          <button id="term-toggle" className="nav-shortcut" aria-label="Toggle terminal">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <kbd>Ctrl+K</kbd>
          </button>
        </li>
      </ul>
    </nav>
  );
}
