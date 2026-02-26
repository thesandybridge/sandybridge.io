import { useEffect, useRef } from 'react';
import { useLocation } from '@tanstack/react-router';

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!ref.current) return;

    // Clear previous instance on route change
    ref.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', import.meta.env.VITE_GISCUS_REPO || '');
    script.setAttribute('data-repo-id', import.meta.env.VITE_GISCUS_REPO_ID || '');
    script.setAttribute('data-category', import.meta.env.VITE_GISCUS_CATEGORY || '');
    script.setAttribute('data-category-id', import.meta.env.VITE_GISCUS_CATEGORY_ID || '');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    ref.current.appendChild(script);
  }, [pathname]);

  return <div ref={ref} className="giscus-wrapper" />;
}
