'use client';

import { useEffect } from 'react';
import { useIsMobile } from '@/lib/use-mobile';

export function CoronaScroll() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const glows = document.querySelectorAll<HTMLElement>('.corona-glow');
    if (glows.length === 0) return;

    let lastY = window.scrollY;
    let lastTime = performance.now();
    let intensity = 0;
    let raf = 0;
    let running = false;

    const applyOpacity = (v: number) => {
      const s = String(v);
      for (let i = 0; i < glows.length; i++) {
        glows[i].style.opacity = s;
      }
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(decay);
    };

    const decay = () => {
      intensity *= 0.92;
      if (intensity < 0.001) {
        intensity = 0;
        applyOpacity(0);
        running = false;
        return;
      }
      applyOpacity(Math.min(intensity, 1));
      raf = requestAnimationFrame(decay);
    };

    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt < 1) return;
      const dy = Math.abs(window.scrollY - lastY);
      const velocity = dy / dt;
      intensity = Math.min(intensity + velocity * 0.8, 1);
      lastY = window.scrollY;
      lastTime = now;
      startLoop();
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('scroll', onScroll);
      applyOpacity(0);
    };
  }, [isMobile]);

  return null;
}
