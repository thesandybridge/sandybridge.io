'use client';

import { useEffect } from 'react';
import { initAudio, unlock, isUnlocked, playSound } from '@/lib/audio';

const INTERACTIVE = 'a, button, [role="button"]';

export function SoundEffects() {
  useEffect(() => {
    initAudio();

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) return;

    let lastHovered: Element | null = null;

    const onPointerDown = (e: Event) => {
      unlock();
      const el = (e.target as Element)?.closest?.(INTERACTIVE);
      if (el) playSound('click');
    };

    const onKeyDown = (e: Event) => {
      unlock();
      const key = (e as KeyboardEvent).key;
      if (key === 'Enter' || key === ' ') {
        const el = (e.target as Element)?.closest?.(INTERACTIVE);
        if (el) playSound('click');
      }
    };

    const onPointerOver = (e: Event) => {
      if (!isUnlocked()) return;
      const el = (e.target as Element)?.closest?.(INTERACTIVE);
      if (el && el !== lastHovered) {
        lastHovered = el;
        playSound('hover');
      }
    };

    const onPointerOut = (e: Event) => {
      const related = (e as PointerEvent).relatedTarget as Element | null;
      const el = (e.target as Element)?.closest?.(INTERACTIVE);
      if (el === lastHovered && related?.closest?.(INTERACTIVE) !== el) {
        lastHovered = null;
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerover', onPointerOver, true);
    document.addEventListener('pointerout', onPointerOut, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerover', onPointerOver, true);
      document.removeEventListener('pointerout', onPointerOut, true);
    };
  }, []);

  return null;
}
