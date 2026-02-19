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
    let frameCount = 0;

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

    const drawBat = (p: Particle, alpha: number) => {
      const s = p.size * 1.2;
      // Flapping animation based on life
      const flapAngle = Math.sin(p.life * 0.02) * 0.3;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * 0.3); // Subtle rotation
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.9)`;

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left wing
      ctx.save();
      ctx.rotate(flapAngle);
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, -s * 0.1);
      ctx.quadraticCurveTo(-s * 0.8, -s * 0.6, -s * 1.2, -s * 0.2);
      ctx.quadraticCurveTo(-s * 0.9, 0, -s * 0.7, s * 0.2);
      ctx.quadraticCurveTo(-s * 0.5, 0, -s * 0.2, s * 0.1);
      ctx.fill();
      ctx.restore();

      // Right wing
      ctx.save();
      ctx.rotate(-flapAngle);
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -s * 0.1);
      ctx.quadraticCurveTo(s * 0.8, -s * 0.6, s * 1.2, -s * 0.2);
      ctx.quadraticCurveTo(s * 0.9, 0, s * 0.7, s * 0.2);
      ctx.quadraticCurveTo(s * 0.5, 0, s * 0.2, s * 0.1);
      ctx.fill();
      ctx.restore();

      // Ears
      ctx.beginPath();
      ctx.moveTo(-s * 0.15, -s * 0.4);
      ctx.lineTo(-s * 0.25, -s * 0.7);
      ctx.lineTo(-s * 0.05, -s * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.4);
      ctx.lineTo(s * 0.25, -s * 0.7);
      ctx.lineTo(s * 0.05, -s * 0.5);
      ctx.fill();

      ctx.restore();
    };

    const drawPrism = (p: Particle, alpha: number) => {
      // Small sparkle particle for prism theme
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = alpha * 0.6;
      const hue = p.hue ?? 0;
      ctx.fillStyle = `hsla(${hue}, 90%, 75%, 0.8)`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // 3D pyramid - fixed square base, cursor is the apex
    const drawPrismRefraction = (cursorX: number, cursorY: number) => {
      // Fixed square at page boundary (base of pyramid)
      const basePoints = [
        { x: 0, y: 0 },                           // top-left
        { x: canvas.width, y: 0 },                // top-right
        { x: canvas.width, y: canvas.height },    // bottom-right
        { x: 0, y: canvas.height },               // bottom-left
      ];

      ctx.save();

      // Draw lines from each corner to cursor (pyramid edges)
      basePoints.forEach((point, i) => {
        const hue = (i * 90) + 0; // Red, Yellow, Green, Cyan

        const gradient = ctx.createLinearGradient(point.x, point.y, cursorX, cursorY);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.4)`);
        gradient.addColorStop(0.7, `hsla(${hue}, 85%, 65%, 0.2)`);
        gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0.05)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(cursorX, cursorY);
        ctx.stroke();
      });

      // Add midpoints on each edge for more rays
      for (let i = 0; i < basePoints.length; i++) {
        const p1 = basePoints[i];
        const p2 = basePoints[(i + 1) % basePoints.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const hue = (i * 90) + 45;

        const gradient = ctx.createLinearGradient(midX, midY, cursorX, cursorY);
        gradient.addColorStop(0, `hsla(${hue}, 95%, 75%, 0.3)`);
        gradient.addColorStop(0.7, `hsla(${hue}, 90%, 65%, 0.15)`);
        gradient.addColorStop(1, `hsla(${hue}, 85%, 60%, 0.02)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(cursorX, cursorY);
        ctx.stroke();
      }

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
          drawDiamond(p, alpha);
          break;
        case 'dracula':
          drawBat(p, alpha);
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
      frameCount++;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fullscreen prism refraction if theme is prism
      if (themeRef.current === 'prism') {
        drawPrismRefraction(mouseX, mouseY);
      }

      // Draw particles
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

      // Stop loop when idle: no particles, ring converged, and not prism theme
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      const isPrism = themeRef.current === 'prism';
      if (particles.length === 0 && dx * dx + dy * dy < 1 && !isPrism) {
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
