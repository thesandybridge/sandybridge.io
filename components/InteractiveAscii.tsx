'use client';

import { useEffect, useRef, useState } from 'react';

const ASCII = `███████╗ █████╗ ███╗   ██╗██████╗ ██╗   ██╗██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗
██╔════╝██╔══██╗████╗  ██║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝
███████╗███████║██╔██╗ ██║██║  ██║ ╚████╔╝ ██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗
╚════██║██╔══██║██║╚██╗██║██║  ██║  ╚██╔╝  ██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝
███████║██║  ██║██║ ╚████║██████╔╝   ██║   ██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗
╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝    ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝`;

const GLYPHS = '░▒▓█▀▄';

export function InteractiveAscii() {
  const containerRef = useRef<HTMLPreElement>(null);
  const gridRef = useRef<{ spans: HTMLSpanElement[][]; original: string[][] }>({ spans: [], original: [] });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktop = window.innerWidth >= 900 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsDesktop(desktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const container = containerRef.current;
    if (!container) return;

    // Build spans from the text already inside the <pre>
    const text = ASCII;
    const lines = text.split('\n');
    const spans: HTMLSpanElement[][] = [];
    const original: string[][] = [];

    // Clear and rebuild with spans, keeping layout identical to plain text
    container.innerHTML = '';

    for (let r = 0; r < lines.length; r++) {
      const row: HTMLSpanElement[] = [];
      const origRow: string[] = [];

      for (const char of lines[r]) {
        const span = document.createElement('span');
        span.textContent = char;
        container.appendChild(span);
        row.push(span);
        origRow.push(char);
      }

      if (r < lines.length - 1) {
        container.appendChild(document.createTextNode('\n'));
      }

      spans.push(row);
      original.push(origRow);
    }

    gridRef.current = { spans, original };

    let restoreTimeout: ReturnType<typeof setTimeout>;
    let cachedCharW = 0;

    const measureCharWidth = () => {
      const { spans: grid } = gridRef.current;
      if (grid[0]?.[0]) {
        cachedCharW = grid[0][0].getBoundingClientRect().width;
      }
    };
    measureCharWidth();

    const onResize = () => { cachedCharW = 0; };
    window.addEventListener('resize', onResize);

    const onMouseMove = (e: MouseEvent) => {
      const { spans: grid, original: orig } = gridRef.current;
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (!grid[0]?.[0]) return;

      if (!cachedCharW) measureCharWidth();
      const charW = cachedCharW;
      const lineH = rect.height / grid.length;

      for (let r = 0; r < grid.length; r++) {
        // compute line offset — chars are centered via text-align
        const lineWidth = grid[r].length * charW;
        const lineOffsetX = (rect.width - lineWidth) / 2;

        for (let c = 0; c < grid[r].length; c++) {
          const cx = lineOffsetX + (c + 0.5) * charW;
          const cy = (r + 0.5) * lineH;
          const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
          const o = orig[r][c];

          if (o === ' ') continue;

          if (dist < 40) {
            grid[r][c].textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          } else if (dist < 80) {
            grid[r][c].textContent = o;
            grid[r][c].style.opacity = '0.7';
          } else {
            grid[r][c].textContent = o;
            grid[r][c].style.opacity = '';
          }
        }
      }
    };

    const onMouseLeave = () => {
      restoreTimeout = setTimeout(() => {
        const { spans: grid, original: orig } = gridRef.current;
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            grid[r][c].textContent = orig[r][c];
            grid[r][c].style.opacity = '';
          }
        }
      }, 200);
    };

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      clearTimeout(restoreTimeout);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <pre className="ascii" aria-hidden="true">
        {ASCII}
      </pre>
    );
  }

  return (
    <pre
      className="ascii"
      aria-hidden="true"
      ref={containerRef}
      style={{ display: 'block', textAlign: 'center', cursor: 'crosshair' }}
    >
      {ASCII}
    </pre>
  );
}
