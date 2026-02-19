'use client';

import { useEffect, useRef } from 'react';

const TEXT = "Hey, I'm Matt.";

export function HeroText() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.querySelectorAll('.hero-char').forEach((s) => s.classList.add('visible'));
      return;
    }

    const reveal = () => {
      const spans = el.querySelectorAll('.hero-char');
      spans.forEach((span, i) => {
        setTimeout(() => span.classList.add('visible'), i * 30);
      });
    };

    // If boot already done, reveal immediately
    if (sessionStorage.getItem('boot-done')) {
      reveal();
      return;
    }

    // Otherwise wait for boot-done event
    const onBoot = () => {
      setTimeout(reveal, 400); // small gap after boot fades
    };

    document.addEventListener('boot-done', onBoot);
    return () => document.removeEventListener('boot-done', onBoot);
  }, []);

  return (
    <h1 ref={ref} className="hero-text">
      {TEXT.split('').map((char, i) => (
        <span key={i} className="hero-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
}
