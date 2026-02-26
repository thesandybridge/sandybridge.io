import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Github, Linkedin, Twitter, Rss, Mail, FileText, Briefcase } from 'lucide-react';
import { PresenceIndicator } from './PresenceIndicator';
import { ContactModal } from './ContactModal';
import s from './Footer.module.css';

interface FooterProps {
  year: number;
}

export function Footer({ year }: FooterProps) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer>
      <PresenceIndicator />
      <div className={s.footerLinks}>
        <Link to="/blog">
          <FileText size={16} />
          <span>Blog</span>
        </Link>
        <Link to="/portfolio">
          <Briefcase size={16} />
          <span>Work</span>
        </Link>
        <Link to="/uses">
          <span>Uses</span>
        </Link>
        <a href="/feed.xml">
          <Rss size={16} />
          <span>RSS</span>
        </a>
      </div>

      <div className={s.footerSocial}>
        <a
          href="https://github.com/thesandybridge"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <Github size={18} />
        </a>
        <a
          href="https://linkedin.com/in/mattmillerdev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin size={18} />
        </a>
        <a
          href="https://x.com/sandybridge__"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <Twitter size={18} />
        </a>
        <button onClick={() => setContactOpen(true)} aria-label="Email">
          <Mail size={18} />
        </button>
      </div>

      <div className={s.footerMeta}>
        <span>&copy; {year} sandybridge</span>
        <span className={s.footerKbd}>
          <kbd>Ctrl</kbd>+<kbd>K</kbd> to search
        </span>
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
}
