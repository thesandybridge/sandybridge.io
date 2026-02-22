'use client';

import { useEffect, useRef, useState } from 'react';
import s from './Typewriter.module.css';

interface TypewriterProps {
  lines: string[];
  speed?: number;
}

export function Typewriter({ lines, speed = 18 }: TypewriterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef(lines);
  const speedRef = useRef(speed);
  const [skip, setSkip] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || sessionStorage.getItem('typewriter-done')) {
      setSkip(true);
      setDone(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const fullText = linesRef.current.join('\n\n');
    const charSpeed = speedRef.current;
    let cancelled = false;

    // Build initial DOM structure: empty paragraphs with cursor in last one
    const paragraphs = fullText.split('\n\n');
    const pElements: HTMLParagraphElement[] = [];
    container.innerHTML = '';
    for (let pi = 0; pi < paragraphs.length; pi++) {
      const p = document.createElement('p');
      p.style.display = pi === 0 ? '' : 'none';
      container.appendChild(p);
      pElements.push(p);
    }
    const cursor = document.createElement('span');
    cursor.className = s.typewriterCursor;
    cursor.textContent = '_';
    pElements[0].appendChild(cursor);

    const startTyping = () => {
      sessionStorage.setItem('typewriter-done', '1');
      const heroDelay = 900;
      setTimeout(() => {
        let globalIdx = 0; // index into fullText
        let pIdx = 0;      // current paragraph index
        let charIdx = 0;   // index within current paragraph

        const type = () => {
          if (cancelled || globalIdx >= fullText.length) {
            if (!cancelled) setDone(true);
            return;
          }

          const char = fullText[globalIdx];
          globalIdx++;

          // Handle paragraph breaks (\n\n)
          if (char === '\n' && globalIdx < fullText.length && fullText[globalIdx] === '\n') {
            globalIdx++; // skip second \n
            pIdx++;
            charIdx = 0;
            if (pIdx < pElements.length) {
              pElements[pIdx].style.display = '';
              // Move cursor to new paragraph
              pElements[pIdx].appendChild(cursor);
            }
            setTimeout(type, charSpeed);
            return;
          }

          // Append character before cursor
          const textNode = document.createTextNode(char);
          pElements[pIdx].insertBefore(textNode, cursor);
          charIdx++;

          setTimeout(type, charSpeed);
        };
        type();
      }, heroDelay);
    };

    if (sessionStorage.getItem('boot-done')) {
      startTyping();
    }

    const onBoot = () => startTyping();
    document.addEventListener('boot-done', onBoot);

    return () => {
      cancelled = true;
      document.removeEventListener('boot-done', onBoot);
    };
  }, []);

  if (skip) {
    return (
      <div>
        {lines.map((line, i) => (
          <p key={i}>
            {line}
            {i === lines.length - 1 && <span className={s.typewriterCursor}>_</span>}
          </p>
        ))}
      </div>
    );
  }

  return <div ref={containerRef} />;
}
