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
  const { colors, theme, particleMultiplier, mode } = useTheme();
  const colorsRef = useRef(colors);
  const themeRef = useRef<Theme>(theme);
  const multiplierRef = useRef(particleMultiplier);
  const modeRef = useRef(mode);
  colorsRef.current = colors;
  themeRef.current = theme;
  multiplierRef.current = particleMultiplier;
  modeRef.current = mode;

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
    const BASE_MAX_PARTICLES = 20;

    const spawnParticle = (x: number, y: number) => {
      const mult = multiplierRef.current;
      if (mult === 0) return; // Particles disabled
      const maxParticles = Math.floor(BASE_MAX_PARTICLES * mult);
      if (particles.length >= maxParticles) particles.shift();
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

    // Nord aurora borealis effect
    const drawNordAurora = (cursorX: number, cursorY: number, frame: number) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.3;
      const isLight = modeRef.current === 'light';

      // Cursor influence on aurora position
      const offsetX = (cursorX - centerX) / centerX;
      const offsetY = (cursorY - canvas.height / 2) / (canvas.height / 2);

      ctx.save();

      // Draw multiple aurora bands - use darker/more saturated colors for light mode
      const bands = isLight ? [
        { color: '94, 129, 172', yOffset: 0 },       // Nord frost darker
        { color: '104, 157, 106', yOffset: 40 },    // Nord green darker
        { color: '143, 103, 136', yOffset: 80 },    // Nord purple darker
      ] : [
        { color: '136, 192, 208', yOffset: 0 },      // Nord frost
        { color: '163, 190, 140', yOffset: 40 },     // Nord green
        { color: '180, 142, 173', yOffset: 80 },     // Nord purple
      ];

      // Higher opacity for light mode
      const opacityMult = isLight ? 2.5 : 1;

      bands.forEach((band, i) => {
        const waveOffset = frame * 0.01 + i * 0.5;
        const baseY = centerY + band.yOffset + offsetY * 30;

        ctx.beginPath();
        ctx.moveTo(0, baseY);

        for (let x = 0; x <= canvas.width; x += 20) {
          const wave1 = Math.sin(x * 0.005 + waveOffset) * 30;
          const wave2 = Math.sin(x * 0.01 + waveOffset * 1.5) * 15;
          const cursorWave = Math.sin((x - cursorX) * 0.01) * 20 * (1 - Math.abs(x - cursorX) / canvas.width);
          const y = baseY + wave1 + wave2 + cursorWave + offsetX * 20;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, baseY - 50, 0, baseY + 100);
        gradient.addColorStop(0, `rgba(${band.color}, 0)`);
        gradient.addColorStop(0.3, `rgba(${band.color}, ${0.15 * opacityMult})`);
        gradient.addColorStop(0.6, `rgba(${band.color}, ${0.08 * opacityMult})`);
        gradient.addColorStop(1, `rgba(${band.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      ctx.restore();
    };

    // Solarized sun rays effect
    const drawSolarizedRays = (cursorX: number, cursorY: number, frame: number) => {
      // Sun position in corner, rays follow cursor
      const sunX = canvas.width * 0.9;
      const sunY = canvas.height * 0.1;
      const isLight = modeRef.current === 'light';

      // Use orange/red tones for light mode for better contrast
      const rayColor = isLight ? '203, 75, 22' : '181, 137, 0';  // Solarized orange in light, yellow in dark
      const opacityMult = isLight ? 2 : 1;

      const angleToMouse = Math.atan2(cursorY - sunY, cursorX - sunX);
      const rayCount = 12;
      const maxLength = Math.max(canvas.width, canvas.height);

      ctx.save();

      for (let i = 0; i < rayCount; i++) {
        const baseAngle = (Math.PI * 2 * i) / rayCount + frame * 0.002;
        // Rays bend slightly toward cursor
        const bendFactor = 0.1;
        const angle = baseAngle + Math.sin(baseAngle - angleToMouse) * bendFactor;

        const gradient = ctx.createLinearGradient(
          sunX, sunY,
          sunX + Math.cos(angle) * maxLength,
          sunY + Math.sin(angle) * maxLength
        );

        gradient.addColorStop(0, `rgba(${rayColor}, ${0.2 * opacityMult})`);
        gradient.addColorStop(0.3, `rgba(${rayColor}, ${0.08 * opacityMult})`);
        gradient.addColorStop(1, `rgba(${rayColor}, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isLight ? 4 : 3;

        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(
          sunX + Math.cos(angle) * maxLength,
          sunY + Math.sin(angle) * maxLength
        );
        ctx.stroke();
      }

      // Sun glow
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, isLight ? 80 : 60);
      sunGradient.addColorStop(0, `rgba(${rayColor}, ${0.3 * opacityMult})`);
      sunGradient.addColorStop(0.5, `rgba(${rayColor}, ${0.1 * opacityMult})`);
      sunGradient.addColorStop(1, `rgba(${rayColor}, 0)`);

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, isLight ? 80 : 60, 0, Math.PI * 2);
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

    const drawPawPrint = (p: Particle, alpha: number) => {
      const s = p.size * 0.8;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = `rgba(${colorsRef.current.accentRgb}, 0.85)`;

      // Main pad (oval)
      ctx.beginPath();
      ctx.ellipse(0, s * 0.3, s * 0.6, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Toe beans (4 small circles)
      const toePositions = [
        { x: -s * 0.45, y: -s * 0.3 },
        { x: -s * 0.15, y: -s * 0.5 },
        { x: s * 0.15, y: -s * 0.5 },
        { x: s * 0.45, y: -s * 0.3 },
      ];
      toePositions.forEach(({ x, y }) => {
        ctx.beginPath();
        ctx.arc(x, y, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawSunRay = (p: Particle, alpha: number) => {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha * 0.7;

      // Glowing circle with rays
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
      gradient.addColorStop(0, `rgba(${colorsRef.current.accentRgb}, 0.9)`);
      gradient.addColorStop(0.5, `rgba(${colorsRef.current.accentRgb}, 0.4)`);
      gradient.addColorStop(1, `rgba(${colorsRef.current.accentRgb}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();

      // Small rays
      ctx.strokeStyle = `rgba(${colorsRef.current.accentRgb}, 0.6)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * s * 0.6, Math.sin(angle) * s * 0.6);
        ctx.lineTo(Math.cos(angle) * s * 1.2, Math.sin(angle) * s * 1.2);
        ctx.stroke();
      }

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
          drawSunRay(p, alpha);
          break;
        case 'catppuccin':
          drawPawPrint(p, alpha);
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

      // Draw fullscreen theme effects
      switch (themeRef.current) {
        case 'prism':
          drawPrismRefraction(mouseX, mouseY);
          break;
        case 'nord':
          drawNordAurora(mouseX, mouseY, frameCount);
          break;
        case 'solarized':
          drawSolarizedRays(mouseX, mouseY, frameCount);
          break;
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

      // Stop loop when idle: no particles, ring converged, and no fullscreen effect
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      const hasFullscreenEffect = ['prism', 'nord', 'solarized'].includes(themeRef.current);
      if (particles.length === 0 && dx * dx + dy * dy < 1 && !hasFullscreenEffect) {
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
      const mult = multiplierRef.current;
      // Spawn rate: every 3rd move for medium, every 2nd for high, every 6th for low
      const spawnInterval = mult === 0 ? Infinity : Math.max(1, Math.floor(3 / mult));
      if (moveCount % spawnInterval === 0) {
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
