'use client';

import { useEffect } from 'react';

const copySvg = '<svg xmlns="http://www.w3.org/2000/svg" class="button-copy" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>';

export function CopyButton() {
  useEffect(() => {
    const blocks = document.querySelectorAll('pre:not(.ascii, .ignore)');
    if (blocks.length === 0) return;

    const buttons: HTMLButtonElement[] = [];

    blocks.forEach((block, idx) => {
      block.setAttribute('id', `code-${idx}`);
      const button = document.createElement('button');
      button.innerHTML = copySvg;
      button.className = 'copy-button';
      block.appendChild(button);
      buttons.push(button);

      const handler = () => {
        navigator.clipboard.writeText(block.textContent || '').then(() => {
          button.innerHTML = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.innerHTML = copySvg;
            button.classList.remove('copied');
          }, 1000);
        });
      };

      button.addEventListener('click', handler);
      (button as unknown as Record<string, () => void>)._handler = handler;
    });

    return () => {
      buttons.forEach((button) => {
        const handler = (button as unknown as Record<string, () => void>)._handler;
        if (handler) button.removeEventListener('click', handler);
        button.remove();
      });
    };
  }, []);

  return null;
}
