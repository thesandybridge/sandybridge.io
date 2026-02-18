'use client';

import { useEffect, useRef, createElement, type ReactNode, type CSSProperties, type ElementType } from 'react';

interface CoronaRevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}

export function CoronaReveal({ children, className, as: tag = 'div', style }: CoronaRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('revealed');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return createElement(
    tag,
    { ref, className: `corona-reveal${className ? ' ' + className : ''}`, style },
    children
  );
}
