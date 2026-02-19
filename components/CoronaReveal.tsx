'use client';

import { useEffect, useRef, createElement, type ReactNode, type CSSProperties, type ElementType } from 'react';

interface CoronaRevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

export function CoronaReveal({ children, className, as: tag = 'div', style, delay = 0, direction = 'up' }: CoronaRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const skip = window.matchMedia('(pointer: coarse)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (skip) {
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

  const combinedStyle: CSSProperties = {
    ...style,
    ...(delay > 0 ? { transitionDelay: `${delay}ms` } : {}),
  };

  return createElement(
    tag,
    {
      ref,
      className: `corona-reveal${className ? ' ' + className : ''}`,
      style: combinedStyle,
      ...(direction !== 'up' ? { 'data-direction': direction } : {}),
    },
    children
  );
}
