'use client';

import { useEffect, useRef } from 'react';

const GLYPHS = '!@#$%^&*<>[]{}░▒▓';

interface TextScrambleProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export function TextScramble({ children, as: Tag = 'h1', className }: TextScrambleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = children;
      return;
    }

    const chars = children.split('');
    el.textContent = '';
    const spans: HTMLSpanElement[] = [];

    for (const char of chars) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      span.style.display = 'inline-block';
      el.appendChild(span);
      spans.push(span);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        // Stagger resolution per character
        spans.forEach((span, i) => {
          const target = chars[i];
          setTimeout(() => {
            span.textContent = target === ' ' ? '\u00A0' : target;
          }, i * 30 + 200);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return <Tag ref={ref} className={className} />;
}
