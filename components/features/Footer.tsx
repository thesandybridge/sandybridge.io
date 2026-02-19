import Link from 'next/link';
import { Github, Linkedin, Twitter, Rss, Mail, FileText, Briefcase } from 'lucide-react';

interface FooterProps {
  year: number;
}

export function Footer({ year }: FooterProps) {
  return (
    <footer>
      <div className="footer-links">
        <Link href="/blog">
          <FileText size={16} />
          <span>Blog</span>
        </Link>
        <Link href="/portfolio">
          <Briefcase size={16} />
          <span>Work</span>
        </Link>
        <Link href="/uses">
          <span>Uses</span>
        </Link>
        <a href="/feed.xml">
          <Rss size={16} />
          <span>RSS</span>
        </a>
      </div>

      <div className="footer-social">
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
          href="https://x.com/thesandybridge"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
        >
          <Twitter size={18} />
        </a>
        <a href="mailto:matt@mattmillerdev.io" aria-label="Email">
          <Mail size={18} />
        </a>
      </div>

      <div className="footer-meta">
        <span>&copy; {year} sandybridge</span>
        <span className="footer-kbd">
          <kbd>Ctrl</kbd>+<kbd>K</kbd> to search
        </span>
      </div>
    </footer>
  );
}
