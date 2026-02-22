'use client';

import { useEffect, useRef } from 'react';
import s from './HeroText.module.css';

const TEXT = "Hey, I'm Matt.";

export function HeroText() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.querySelectorAll('.' + s.heroChar).forEach((span) => span.classList.add(s.visible));
      return;
    }

    const reveal = () => {
      const spans = el.querySelectorAll('.' + s.heroChar);
      spans.forEach((span, i) => {
        setTimeout(() => span.classList.add(s.visible), i * 30);
      });
    };

    if (sessionStorage.getItem('boot-done')) {
      reveal();
      return;
    }

    const onBoot = () => {
      setTimeout(reveal, 400);
    };

    document.addEventListener('boot-done', onBoot);
    return () => document.removeEventListener('boot-done', onBoot);
  }, []);

  return (
    <h1 ref={ref} className={s.heroText}>
      {TEXT.split('').map((char, i) => (
        <span key={i} className={s.heroChar}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}
