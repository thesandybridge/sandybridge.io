import { useEffect, useState, useCallback, useRef } from 'react';
import { cx } from '~/lib/cx';
import s from './BootSequence.module.css';

interface BootSequenceProps {
  postCount: number;
  projectCount: number;
  clientIP?: string;
}

export function BootSequence({ postCount, projectCount, clientIP = '127.0.0.1' }: BootSequenceProps) {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const getBootLines = useCallback(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const memMB = mem ? mem * 1024 : 16384;
    const res = `${screen.width}x${screen.height}`;
    const lang = navigator.language || 'en-US';
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Firefox/')) browser = 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] || '');
    else if (ua.includes('Edg/')) browser = 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] || '');
    else if (ua.includes('Chrome/')) browser = 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '');
    else if (ua.includes('Safari/')) browser = 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] || '');

    return [
      'BIOS v3.14 — sandybridge.io',
      `CPU: ${cores} cores detected`,
      `Memory check... ${memMB} MB OK`,
      `Display: ${res}`,
      `Browser: ${browser}`,
      `Locale: ${lang}`,
      'Loading kernel modules...',
      '  next.js ........................ OK',
      '  react .......................... OK',
      '  three.js ....................... OK',
      '  gruvbox-dark ................... OK',
      `Mounting filesystem... ${postCount} posts, ${projectCount} projects`,
      `Network: ${clientIP} — UP`,
      'System ready. Welcome, guest.',
    ];
  }, [postCount, projectCount, clientIP]);

  const dismiss = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    sessionStorage.setItem('boot-done', '1');
    document.dispatchEvent(new CustomEvent('boot-done'));
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
    const bootLines = getBootLines();

    let delay = 400;
    for (let i = 0; i < bootLines.length; i++) {
      const line = bootLines[i];
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, delay);
      timerRef.current.push(t);
      // module sub-lines tick faster, main lines are slower
      const isSubLine = line.startsWith('  ');
      delay += isSubLine ? 150 + Math.random() * 50 : 300 + Math.random() * 150;
    }

    const endTimer = setTimeout(() => {
      if (!doneRef.current) dismiss();
    }, delay + 800);
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
    <div className={cx(s.bootOverlay, fadingOut && s.fadeOut)}>
      <div className={s.bootLines}>
        {lines.map((line, i) => (
          <div key={i} className={s.bootLine}>
            {line.includes('OK') || line.includes('UP') || line.startsWith('System ready')
              ? <><span className={s.bootLineOk}>[OK]</span> {line}</>
              : <><span className={s.bootLineOk}>[&nbsp;&nbsp;]</span> {line}</>
            }
          </div>
        ))}
      </div>
      <div className={s.bootSkip}>click or press any key to skip</div>
    </div>
  );
}
