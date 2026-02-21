'use client';

import { useEffect } from 'react';
import { useIsMobile } from '@/lib/use-mobile';

// Apply magnetic attraction to nav/footer/card interactive elements.
// Inline content links are intentionally excluded to avoid chaos in prose.
const SELECTOR = 'nav a, nav button, footer a, footer button, [data-magnetic]';

const RADIUS = 72;       // px - distance at which attraction begins
const STRENGTH = 0.16;   // fraction of dx/dy to pull toward cursor (keep subtle)
const SPRING = 0.14;     // spring stiffness
const DAMPING = 0.62;    // velocity damping (lower = more sticky/sluggish)

interface Spring {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function MagneticLinks() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const state = new Map<HTMLElement, Spring>();
    let rafId: number;
    let mouseX = 0;
    let mouseY = 0;
    // Cache elements, refresh periodically to handle route changes
    let elements: HTMLElement[] = [];
    let lastQuery = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      const now = performance.now();
      if (now - lastQuery > 400) {
        elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
        lastQuery = now;
      }

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Skip off-screen elements (rough check)
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let s = state.get(el);
        if (!s) {
          s = { x: 0, y: 0, vx: 0, vy: 0 };
          state.set(el, s);
        }

        let targetX = 0;
        let targetY = 0;

        if (dist < RADIUS) {
          // Attract toward cursor — stronger when closer
          const t = (1 - dist / RADIUS) * STRENGTH;
          targetX = dx * t;
          targetY = dy * t;
        }

        // Spring step
        s.vx = (s.vx + (targetX - s.x) * SPRING) * DAMPING;
        s.vy = (s.vy + (targetY - s.y) * SPRING) * DAMPING;
        s.x += s.vx;
        s.y += s.vy;

        const moving = Math.abs(s.vx) > 0.01 || Math.abs(s.vy) > 0.01;
        const displaced = Math.abs(s.x) > 0.05 || Math.abs(s.y) > 0.05;

        if (displaced || moving) {
          el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
        } else if (s.x !== 0 || s.y !== 0) {
          el.style.transform = '';
          s.x = 0;
          s.y = 0;
          s.vx = 0;
          s.vy = 0;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    animate();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      for (const el of elements) {
        el.style.transform = '';
      }
    };
  }, [isMobile]);

  return null;
}
