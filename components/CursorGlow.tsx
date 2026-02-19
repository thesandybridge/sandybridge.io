'use client';

import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/lib/use-mobile';
import { useTheme, type Theme } from './ThemeProvider';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  hue?: number; // For prism/oil-spill color cycling
}

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const { colors, theme } = useTheme();
  const colorsRef = useRef(colors);
  const themeRef = useRef<Theme>(theme);
  colorsRef.current = colors;
  themeRef.current = theme;

  useEffect(() => {
    if (isMobile) return;

    const glow = glowRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const canvas = canvasRef.current;
    if (!glow || !dot || !ring || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isHovering = false;
    let isDown = false;
    let raf = 0;
    let running = false;
    let moveCount = 0;

    const particles: Particle[] = [];
    const MAX_PARTICLES = 20;

    const spawnParticle = (x: number, y: number) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const currentTheme = themeRef.current;

      // Theme-specific spawn parameters
      let hue: number | undefined;
      if (currentTheme === 'prism') {
        hue = Math.random() * 360; // Full rainbow spectrum
      } else if (currentTheme === 'oil-spill') {
        hue = 180 + Math.random() * 60; // Teal to purple range
      }

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 0.5,
        life: 800,
        maxLife: 800,
        size: 3 + Math.random() * 3,
        rotation: Math.random() * Math.PI * 2,
        hue,
      });
    };

    // Theme-specific particle drawing functions
    const drawTriangle = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(-p.size * 0.866, p.size * 0.5);
      ctx.lineTo(p.size * 0.866, p.size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSnowflake = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(${colorsRef.current.accentRgb}, 0.9)`;
      ctx.lineWidth = 1;
      // 6-pointed snowflake
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.size * 1.2);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    };

    const drawHexagon = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.7)`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = Math.cos(angle) * p.size;
        const y = Math.sin(angle) * p.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawCircle = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.6)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDiamond = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.75)`;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 1.2);
      ctx.lineTo(p.size * 0.7, 0);
      ctx.lineTo(0, p.size * 1.2);
      ctx.lineTo(-p.size * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawPrism = (p: Particle, alpha: number) => {
      // Rainbow refraction effect - multiple colored rays
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha * 0.8;

      // Draw a small prism shape with rainbow gradient
      const hue = p.hue ?? 0;
      ctx.fillStyle = `hsla(${hue}, 90%, 70%, 0.9)`;

      // Diamond/prism shape
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.6, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.6, 0);
      ctx.closePath();
      ctx.fill();

      // Add a subtle glow
      ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
      ctx.shadowBlur = 4;
      ctx.fill();

      ctx.restore();
    };

    const drawOilDrop = (p: Particle, alpha: number) => {
      // Iridescent bubble/drop effect
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = alpha * 0.7;

      const hue = p.hue ?? 200;

      // Gradient bubble
      const gradient = ctx.createRadialGradient(
        -p.size * 0.3, -p.size * 0.3, 0,
        0, 0, p.size
      );
      gradient.addColorStop(0, `hsla(${hue + 40}, 80%, 70%, 0.9)`);
      gradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.7)`);
      gradient.addColorStop(1, `hsla(${hue - 30}, 60%, 30%, 0.5)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Add highlight
      ctx.fillStyle = `hsla(${hue + 60}, 90%, 80%, 0.4)`;
      ctx.beginPath();
      ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawParticle = (p: Particle) => {
      const alpha = p.life / p.maxLife;
      const currentTheme = themeRef.current;

      switch (currentTheme) {
        case 'nord':
          drawSnowflake(p, alpha);
          break;
        case 'one-dark':
          drawHexagon(p, alpha);
          break;
        case 'solarized':
          drawCircle(p, alpha);
          break;
        case 'catppuccin':
        case 'dracula':
          drawDiamond(p, alpha);
          break;
        case 'prism':
          drawPrism(p, alpha);
          break;
        case 'oil-spill':
          drawOilDrop(p, alpha);
          break;
        default: // gruvbox
          drawTriangle(p, alpha);
          break;
      }
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(updateRing);
    };

    const updateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      // particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 16;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        drawParticle(p);
      }

      // Stop loop when idle: no particles and ring has converged
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      if (particles.length === 0 && dx * dx + dy * dy < 1) {
        running = false;
        return;
      }

      raf = requestAnimationFrame(updateRing);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';

      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      dot.style.opacity = '1';
      ring.style.opacity = '1';

      moveCount++;
      if (moveCount % 3 === 0) {
        spawnParticle(e.clientX, e.clientY);
      }

      startLoop();
    };

    const onMouseLeave = () => {
      glow.style.opacity = '0';
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], .portfolio-card');
      if (interactive && !isHovering) {
        isHovering = true;
        dot.classList.add('cursor-hover');
        ring.classList.add('cursor-hover');
      } else if (!interactive && isHovering) {
        isHovering = false;
        dot.classList.remove('cursor-hover');
        ring.classList.remove('cursor-hover');
      }
    };

    const onMouseDown = () => {
      isDown = true;
      dot.classList.add('cursor-down');
      ring.classList.add('cursor-down');
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        dot.classList.remove('cursor-down');
        ring.classList.remove('cursor-down');
      }
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${colors.accentRgb}, 0.06) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
