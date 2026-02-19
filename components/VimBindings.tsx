'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from './ThemeProvider';

export function VimBindings() {
  const lastGRef = useRef(0);
  const { toggleMode } = useTheme();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+Shift+L to toggle light/dark mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      document.documentElement.classList.add('theme-transitioning');
      toggleMode();
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
      return;
    }

    // Ignore other shortcuts with modifiers
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (document.querySelector('.palette-overlay')) return;

    switch (e.key) {
      case 'j':
        e.preventDefault();
        window.scrollBy({ top: 100, behavior: 'smooth' });
        break;
      case 'k':
        e.preventDefault();
        window.scrollBy({ top: -100, behavior: 'smooth' });
        break;
      case 'G':
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        break;
      case 'g': {
        const now = Date.now();
        if (now - lastGRef.current < 500) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          lastGRef.current = 0;
        } else {
          lastGRef.current = now;
        }
        break;
      }
    }
  }, [toggleMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
