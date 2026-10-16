import { openContact } from '~/lib/contact';
import { Search } from 'lucide-react';
import { NavLinks } from './NavLinks';
import s from './Nav.module.css';

export function Nav() {
  return (
    <nav aria-label="Main navigation">
      <div className="corona-glow" aria-hidden="true" />
      <ul id="main-nav">
        <NavLinks />
        <li><button className={s.contact} onClick={openContact}>Contact</button></li>
        <li className={s.navShortcuts}>
          <button id="palette-toggle" className={s.navShortcut} aria-label="Command palette">
            <Search size={14} />
            <kbd>Ctrl+K</kbd>
          </button>
        </li>
      </ul>
    </nav>
  );
}
