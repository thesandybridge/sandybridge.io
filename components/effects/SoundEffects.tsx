'use client';

import { useEffect } from 'react';
import { initAudio, unlock, isUnlocked, playSound } from '@/lib/audio';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="menuitem"], [tabindex]:not([tabindex="-1"]), summary, input, select';

/** Find the closest clickable ancestor (by selector or cursor: pointer). */
function findClickable(target: Element | null): Element | null {
  if (!target) return null;
  // Fast path: check semantic selector
  const match = target.closest(INTERACTIVE);
  if (match) return match;
  // Slow path: check computed cursor style (catches divs/spans with cursor: pointer)
  if (getComputedStyle(target).cursor === 'pointer') {
    // Walk up to find the element that actually sets cursor: pointer
    let el: Element | null = target;
    while (el?.parentElement && el.parentElement !== document.documentElement) {
      if (getComputedStyle(el.parentElement).cursor !== 'pointer') return el;
      el = el.parentElement;
    }
    return el;
  }
  return null;
}

export function SoundEffects() {
  useEffect(() => {
    initAudio();

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse) return;

    let lastHovered: Element | null = null;

    const onPointerDown = (e: Event) => {
      unlock();
      if (findClickable(e.target as Element)) playSound('click');
    };

    const onKeyDown = (e: Event) => {
      unlock();
      const key = (e as KeyboardEvent).key;
      if (key === 'Enter' || key === ' ') {
        if (findClickable(e.target as Element)) playSound('click');
      }
    };

    const onPointerOver = (e: Event) => {
      if (!isUnlocked()) return;
      const el = findClickable(e.target as Element);
      if (el && el !== lastHovered) {
        lastHovered = el;
        playSound('hover');
      }
    };

    const onPointerOut = (e: Event) => {
      const related = (e as PointerEvent).relatedTarget as Element | null;
      const el = findClickable(e.target as Element);
      if (el === lastHovered && findClickable(related) !== el) {
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
