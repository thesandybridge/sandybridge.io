'use client';

import { useEffect, useRef } from 'react';
import s from './TechStack.module.css';

const technologies = [
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Rust', color: '#dea584' },
  { name: 'Go', color: '#00add8' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'Neovim', color: '#57a143' },
  { name: 'tmux', color: '#1bb91f' },
  { name: 'Arch Linux', color: '#1793d1' },
];

export function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('.' + s.techItem);
    items.forEach((item, i) => {
      (item as HTMLElement).style.animationDelay = `${i * 0.1}s`;
    });
  }, []);

  return (
    <div className={s.techStack} ref={containerRef}>
      <span className={s.techLabel}>Tech I work with</span>
      <div className={s.techItems}>
        {technologies.map((tech) => (
          <span
            key={tech.name}
            className={s.techItem}
            style={{ '--tech-color': tech.color } as React.CSSProperties}
          >
            {tech.name}
          </span>
        ))}
      </div>
    </div>
  );
}
