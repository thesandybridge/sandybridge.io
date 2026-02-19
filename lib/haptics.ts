'use client';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 100, 50],
};

/**
 * Trigger haptic feedback on supported devices.
 * Falls back silently on unsupported devices.
 */
export function haptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // Ignore errors on unsupported devices
    }
  }
}
