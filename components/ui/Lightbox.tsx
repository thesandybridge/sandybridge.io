'use client';

import { useEffect, useState, useCallback, type MouseEvent } from 'react';
import s from './Lightbox.module.css';

function stopPropagation(e: MouseEvent) {
  e.stopPropagation();
}

export function Lightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState('');

  const close = useCallback(() => {
    setSrc(null);
    setAlt('');
  }, []);

  useEffect(() => {
    const images = document.querySelectorAll('article img:not(.project-icon)');

    const handlers: Array<{ el: Element; handler: () => void }> = [];

    images.forEach((img) => {
      const el = img as HTMLImageElement;
      el.style.cursor = 'zoom-in';

      const handler = () => {
        setSrc(el.src);
        setAlt(el.alt || '');
      };

      el.addEventListener('click', handler);
      handlers.push({ el, handler });
    });

    return () => {
      handlers.forEach(({ el, handler }) => {
        el.removeEventListener('click', handler);
        (el as HTMLElement).style.cursor = '';
      });
    };
  }, []);

  useEffect(() => {
    if (!src) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [src, close]);

  if (!src) return null;

  return (
    <div className={s.lightboxOverlay} onClick={close}>
      <img src={src} alt={alt} className={s.lightboxImage} onClick={stopPropagation} />
    </div>
  );
}
