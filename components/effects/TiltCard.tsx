'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useIsMobile } from '@/lib/use-mobile';
import s from './TiltCard.module.css';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const isDesktop = useRef(false);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    const shine = shineRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;

    if (shine) {
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(215,153,33,0.08), transparent 60%)`;
      shine.style.opacity = '1';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = containerRef.current;
    const shine = shineRef.current;
    if (el) {
      el.style.transition = 'transform 0.4s ease';
      el.style.transform = 'rotateY(0) rotateX(0)';
      resetTimeout.current = setTimeout(() => { if (el) el.style.transition = ''; }, 400);
    }
    if (shine) shine.style.opacity = '0';
  }, []);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (isMobile) return;
    isDesktop.current = true;

    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(resetTimeout.current);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, isMobile]);

  return (
    <div className={s.tiltContainer + (className ? ' ' + className : '')} ref={containerRef}>
      {children}
      <div className={s.tiltShine} ref={shineRef} />
    </div>
  );
}
