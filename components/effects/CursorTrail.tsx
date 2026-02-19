'use client';

import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/lib/use-mobile';
import { useTheme } from '../theme/ThemeProvider';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const { colors, cursorTrail } = useTheme();
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    if (isMobile || !cursorTrail) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const trail: TrailPoint[] = [];
    const maxTrailLength = 20;
    let mouseX = 0;
    let mouseY = 0;
    let raf = 0;
    let running = false;

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(update);
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Age all points
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 1;
        if (trail[i].age > 30) {
          trail.splice(i, 1);
        }
      }

      // Draw trail
      if (trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          const alpha = Math.max(0, 1 - p1.age / 30);
          const size = Math.max(1, (1 - p1.age / 30) * 4);

          ctx.strokeStyle = `rgba(${colorsRef.current.accentRgb}, ${alpha * 0.6})`;
          ctx.lineWidth = size;

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }

        // Draw glow at head
        if (trail.length > 0) {
          const head = trail[trail.length - 1];
          const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 15);
          gradient.addColorStop(0, `rgba(${colorsRef.current.accentRgb}, 0.3)`);
          gradient.addColorStop(1, `rgba(${colorsRef.current.accentRgb}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Stop when idle
      if (trail.length === 0) {
        running = false;
        return;
      }

      raf = requestAnimationFrame(update);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add point to trail
      trail.push({ x: mouseX, y: mouseY, age: 0 });
      if (trail.length > maxTrailLength) {
        trail.shift();
      }

      startLoop();
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [isMobile, cursorTrail]);

  if (isMobile || !cursorTrail) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
