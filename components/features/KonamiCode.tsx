'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import s from './KonamiCode.module.css';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function KonamiCode() {
  const inputRef = useRef<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; hue: number }>>([]);

  const spawnFireworks = useCallback(() => {
    const newParticles: typeof particles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        hue: Math.random() * 360,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      inputRef.current.push(e.key);
      inputRef.current = inputRef.current.slice(-KONAMI_CODE.length);

      if (inputRef.current.join(',') === KONAMI_CODE.join(',')) {
        setActivated(true);
        spawnFireworks();

        // Rainbow mode!
        document.documentElement.classList.add('konami-active');
        setTimeout(() => {
          document.documentElement.classList.remove('konami-active');
          setActivated(false);
        }, 5000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [spawnFireworks]);

  if (!activated && particles.length === 0) return null;

  return (
    <div className={s.overlay} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className={s.particle}
          style={{
            left: p.x,
            top: p.y,
            '--hue': p.hue,
          } as React.CSSProperties}
        />
      ))}
      {activated && (
        <div className={s.message}>
          KONAMI CODE ACTIVATED!
        </div>
      )}
    </div>
  );
}
