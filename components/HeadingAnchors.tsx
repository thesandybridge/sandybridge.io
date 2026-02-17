'use client';

import { useEffect } from 'react';

export function HeadingAnchors() {
  useEffect(() => {
    const headings = document.querySelectorAll('article h2[id], article h3[id], article h4[id]');
    const anchors: HTMLAnchorElement[] = [];

    headings.forEach((heading) => {
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${heading.id}`;
      anchor.textContent = '#';
      anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);

      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
        navigator.clipboard.writeText(url).then(() => {
          anchor.textContent = 'Copied!';
          anchor.classList.add('copied');
          setTimeout(() => {
            anchor.textContent = '#';
            anchor.classList.remove('copied');
          }, 1000);
        });
        history.replaceState(null, '', `#${heading.id}`);
      });

      heading.appendChild(anchor);
      anchors.push(anchor);
    });

    return () => {
      anchors.forEach((a) => a.remove());
    };
  }, []);

  return null;
}
