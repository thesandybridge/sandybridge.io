'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface BootSequenceProps {
  postCount: number;
  projectCount: number;
}

export function BootSequence({ postCount, projectCount }: BootSequenceProps) {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bootLines = [
    'BIOS v3.14 — sandybridge.io',
    'Memory check... 16384 MB OK',
    'Loading kernel modules...',
    '  next.js ........................ OK',
    '  react .......................... OK',
    '  three.js ....................... OK',
    '  gruvbox-dark ................... OK',
    `Mounting filesystem... ${postCount} posts, ${projectCount} projects`,
    'Network: 192.168.30.7 — UP',
    'System ready. Welcome, guest.',
  ];

  const dismiss = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    sessionStorage.setItem('boot-done', '1');
    setFadingOut(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('boot-done')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('boot-done', '1');
      return;
    }

    setVisible(true);

    let delay = 300;
    for (let i = 0; i < bootLines.length; i++) {
      const line = bootLines[i];
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, delay);
      timerRef.current.push(t);
      delay += 120 + Math.random() * 80;
    }

    const endTimer = setTimeout(() => {
      if (!doneRef.current) dismiss();
    }, delay + 600);
    timerRef.current.push(endTimer);

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;

    const handler = () => dismiss();
    document.addEventListener('click', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div className={`boot-overlay${fadingOut ? ' fade-out' : ''}`}>
      <div className="boot-lines">
        {lines.map((line, i) => (
          <div key={i} className="boot-line">
            {line.includes('OK') || line.includes('UP') || line.startsWith('System ready')
              ? <><span className="boot-line-ok">[OK]</span> {line}</>
              : <><span className="boot-line-ok">[&nbsp;&nbsp;]</span> {line}</>
            }
          </div>
        ))}
      </div>
      <div className="boot-skip">click or press any key to skip</div>
    </div>
  );
}
