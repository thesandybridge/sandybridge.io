'use client';

import { useState, useEffect } from 'react';

/**
 * Detects mobile/tablet devices via pointer capability and viewport width.
 * Returns true for touch-primary devices (tablets in landscape included)
 * or viewports narrower than the breakpoint.
 */
export function useIsMobile(breakpoint = 900): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px), (pointer: coarse)`);
    setIsMobile(mql.matches);

    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}
