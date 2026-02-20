// Cookie utilities for cross-subdomain theme sharing
// Sets cookies on .sandybridge.io so all subdomains share the same theme

const COOKIE_DOMAIN = '.sandybridge.io';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function setCookie(name: string, value: string): void {
  const isProduction = typeof window !== 'undefined' && window.location.hostname.endsWith('sandybridge.io');

  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

  if (isProduction) {
    cookie += `; domain=${COOKIE_DOMAIN}`;
  }

  document.cookie = cookie;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

// Inline script version for generateThemeScript (no dependencies)
export function getCookieScript(): string {
  return `function gc(n){var m=document.cookie.match(new RegExp('(^| )'+n+'=([^;]+)'));return m?decodeURIComponent(m[2]):null;}`;
}
