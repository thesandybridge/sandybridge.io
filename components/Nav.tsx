import { NavLinks } from './NavLinks';

export function Nav() {
  return (
    <nav>
      <div className="corona-glow" aria-hidden="true" />
      <ul id="main-nav">
        <NavLinks />
        <li className="nav-shortcuts">
          <button id="palette-toggle" className="nav-shortcut" aria-label="Command palette">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <kbd>Ctrl+K</kbd>
          </button>
        </li>
      </ul>
    </nav>
  );
}
