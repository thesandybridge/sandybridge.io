import { Search } from 'lucide-react';
import { NavLinks } from './NavLinks';

export function Nav() {
  return (
    <nav>
      <div className="corona-glow" aria-hidden="true" />
      <ul id="main-nav">
        <NavLinks />
        <li className="nav-shortcuts">
          <button id="palette-toggle" className="nav-shortcut" aria-label="Command palette">
            <Search size={14} />
            <kbd>Ctrl+K</kbd>
          </button>
        </li>
      </ul>
    </nav>
  );
}
