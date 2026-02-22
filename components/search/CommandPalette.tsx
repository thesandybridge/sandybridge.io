'use client';

import { useEffect, useRef, useState, useCallback, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type Fuse from 'fuse.js';
import type { SearchItem } from '@/lib/search-index';
import { PaletteTitlebar } from './PaletteTitlebar';
import { useTheme, type ParticleDensity } from '../theme/ThemeProvider';
import { useIsMobile } from '@/lib/use-mobile';
import s from './CommandPalette.module.css';

const COMMANDS = ['help', 'cd', 'ls', 'clear', 'github', 'x', 'whoami', 'echo', 'contact', 'cat', 'pwd', 'grep', 'man', 'tree', 'history', 'ascii', 'neofetch', 'matrix', 'theme'];
const CD_TARGETS = ['home', 'blog', 'portfolio', 'uses'];
const HISTORY_KEY = 'terminal-history';
const MAX_HISTORY = 100;

function escapeHtmlClient(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stopPropagation(e: MouseEvent) {
  e.stopPropagation();
}

interface Message {
  id: number;
  html: string;
}

let msgId = 0;

export function CommandPalette() {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Terminal state
  const [messages, setMessages] = useState<Message[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [motdShown, setMotdShown] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Search state
  const [searchIndex, setSearchIndex] = useState<SearchItem[] | null>(null);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { colors, setParticleDensity } = useTheme();
  const isMobile = useIsMobile();

  // Terminal mode disabled on mobile - search only
  const isTerminalMode = !isMobile && inputValue.startsWith('>');
  const promptDir = pathname === '/' ? '~' : '~' + pathname.replace(/\/$/, '');

  // Load search index + Fuse.js on first open
  useEffect(() => {
    if (!isVisible || searchIndex) return;
    Promise.all([
      fetch('/api/search').then((r) => r.json()),
      import('fuse.js').then((m) => m.default),
    ]).then(([data, FuseClass]: [SearchItem[], typeof Fuse]) => {
      setSearchIndex(data);
      fuseRef.current = new FuseClass(data, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.3,
      });
    });
  }, [isVisible, searchIndex]);

  // Load terminal history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCmdHistory(parsed.slice(-MAX_HISTORY));
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save terminal history to localStorage when it changes
  useEffect(() => {
    if (cmdHistory.length > 0) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(cmdHistory.slice(-MAX_HISTORY)));
      } catch {
        // Ignore storage errors
      }
    }
  }, [cmdHistory]);

  // Search when in search mode
  useEffect(() => {
    if (isTerminalMode) {
      setSearchResults([]);
      return;
    }
    if (!fuseRef.current || !inputValue.trim()) {
      setSearchResults(searchIndex || []);
      setSelectedIndex(0);
      return;
    }
    const res = fuseRef.current.search(inputValue).map((r) => r.item);
    setSearchResults(res);
    setSelectedIndex(0);
  }, [inputValue, searchIndex, isTerminalMode]);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  const showMotd = useCallback(() => {
    if (motdShown) return;
    setMotdShown(true);

    const text = 'sandybridge.io — type help to get started';
    const id = ++msgId;
    let i = 0;

    setMessages((prev) => [
      ...prev,
      { id, html: '<pre class="ignore"><span class="term-info"></span></pre>' },
    ]);

    const interval = setInterval(() => {
      i++;
      if (i > text.length) {
        clearInterval(interval);
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, html: `<pre class="ignore"><span class="term-info">${text.slice(0, i)}<span class="term-cursor">_</span></span></pre>` }
            : m
        )
      );
    }, 30);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, html: `<pre class="ignore"><span class="term-info">${text}</span></pre>` }
            : m
        )
      );
    }, 30 * (text.length + 2));
  }, [motdShown]);

  // Re-focus input when mode switches and show MOTD when entering terminal
  useEffect(() => {
    if (!isVisible) return;
    requestAnimationFrame(() => {
      if (isTerminalMode) {
        termInputRef.current?.focus();
        showMotd();
      } else {
        searchInputRef.current?.focus();
      }
    });
  }, [isTerminalMode, isVisible, showMotd]);

  const open = useCallback(() => {
    setIsVisible(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setInputValue('');
  }, []);

  const toggle = useCallback(() => {
    if (isVisible) close();
    else open();
  }, [isVisible, close, open]);

  // Button click handlers
  useEffect(() => {
    const paletteBtn = document.getElementById('palette-toggle');
    if (!paletteBtn) return;
    const handler = () => toggle();
    paletteBtn.addEventListener('click', handler);
    return () => paletteBtn.removeEventListener('click', handler);
  }, [toggle]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggle();
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        open();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close, toggle, open]);

  // Scroll messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // rm -rf easter egg
  const rmRf = useCallback(() => {
    setIsVisible(false);
    const els = document.querySelectorAll('.container > *');
    let delay = 0;
    els.forEach((el) => {
      setTimeout(() => {
        (el as HTMLElement).style.transition = 'opacity 0.4s ease';
        (el as HTMLElement).style.opacity = '0';
      }, delay);
      delay += 300;
    });
    setTimeout(() => {
      const container = document.querySelector('.container');
      if (container) container.innerHTML = '';
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#151515;z-index:9999;';
      const img = document.createElement('img');
      img.src = 'https://media1.tenor.com/m/EWZCUGkCcIsAAAAC/old-man-my-computer.gif';
      img.alt = 'rm -rf /';
      img.style.cssText = 'max-width:480px;width:100%;border-radius:8px;';
      overlay.appendChild(img);
      document.body.appendChild(overlay);
    }, delay + 400);
  }, []);

  // Malware easter egg
  const doesSomethingDangerous = useCallback(() => {
    setIsVisible(false);
    const originalContent = document.querySelector('body')?.innerHTML || '';
    const maxX = window.innerWidth;
    const maxY = window.innerHeight;
    const interval = setInterval(() => {
      const newDiv = document.createElement('div');
      newDiv.classList.add('replicated-content');
      newDiv.style.left = Math.random() * maxX + 'px';
      newDiv.style.top = Math.random() * maxY + 'px';
      newDiv.innerHTML = originalContent;
      document.body.appendChild(newDiv);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const triggerMatrix = useCallback(() => {
    setIsVisible(false);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:fixed;inset:0;z-index:9999;background:${colors.background};`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const matrixColor = colors.accent;

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = matrixColor;
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const dismiss = () => {
      clearInterval(interval);
      canvas.remove();
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('click', dismiss);
    };

    setTimeout(dismiss, 8000);
    setTimeout(() => {
      document.addEventListener('keydown', dismiss);
      document.addEventListener('click', dismiss);
    }, 100);
  }, [colors]);

  const triggerFireworks = useCallback(() => {
    setIsVisible(false);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:fixed;inset:0;z-index:9999;background:transparent;pointer-events:auto;`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }
    const particles: Particle[] = [];

    const explode = (x: number, y: number) => {
      const hue = Math.random() * 360;
      for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 100,
          color: `hsl(${hue + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
          size: 2 + Math.random() * 2,
        });
      }
    };

    let frame = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (frame % 30 === 0) {
        explode(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 1;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life / 100;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame++;
    };

    const interval = setInterval(draw, 16);
    const dismiss = () => { clearInterval(interval); canvas.remove(); document.removeEventListener('keydown', dismiss); document.removeEventListener('click', dismiss); };
    setTimeout(dismiss, 6000);
    setTimeout(() => { document.addEventListener('keydown', dismiss); document.addEventListener('click', dismiss); }, 100);
  }, []);

  const triggerConfetti = useCallback(() => {
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 100; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;width:10px;height:10px;background:hsl(${Math.random()*360},100%,50%);z-index:9999;pointer-events:none;border-radius:2px;`;
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = '-20px';
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      document.body.appendChild(p);
      particles.push(p);
      const duration = 2 + Math.random() * 2;
      p.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(100vh) rotate(${360 + Math.random()*360}deg)`, opacity: 0 }
      ], { duration: duration * 1000, easing: 'ease-in' }).onfinish = () => p.remove();
    }
  }, []);

  const triggerRain = useCallback(() => {
    setIsVisible(false);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `position:fixed;inset:0;z-index:9999;background:${colors.background};`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;

    interface Drop { x: number; y: number; speed: number; length: number; }
    const drops: Drop[] = [];
    for (let i = 0; i < 200; i++) {
      drops.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 5 + Math.random() * 10, length: 10 + Math.random() * 20 });
    }

    const draw = () => {
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.length; d.x = Math.random() * canvas.width; }
      }
    };

    const interval = setInterval(draw, 16);
    const dismiss = () => { clearInterval(interval); canvas.remove(); document.removeEventListener('keydown', dismiss); document.removeEventListener('click', dismiss); };
    setTimeout(dismiss, 6000);
    setTimeout(() => { document.addEventListener('keydown', dismiss); document.addEventListener('click', dismiss); }, 100);
  }, [colors]);

  const toggleMode = useCallback(() => {
    const current = document.documentElement.getAttribute('data-mode') || 'dark';
    const newMode = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', newMode);
    localStorage.setItem('mode', newMode);
  }, []);

  const setMode = useCallback((mode: string) => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);
  }, []);

  const navigateSearch = useCallback((item: SearchItem) => {
    const url = item.type === 'blog' ? `/blog/${item.slug}` : `/portfolio/${item.slug}`;
    router.push(url);
    close();
  }, [router, close]);

  const handleTerminalSubmit = useCallback(async (cmd: string) => {
    setCmdHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    if (typeof window !== 'undefined') {
      const w = window as unknown as Record<string, unknown[]>;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: 'terminal_command', command: cmd });
    }

    try {
      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ cmd, referer: window.location.pathname }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        switch (data.action) {
          case 'clear':
            setMessages([]);
            break;
          case 'open-url':
            window.open(data.url, '_blank');
            break;
          case 'navigate':
            router.push(data.url);
            close();
            break;
          case 'rotate':
            document.body.style.transform = 'rotate(45deg)';
            break;
          case 'malware':
            doesSomethingDangerous();
            break;
          case 'rm-rf':
            rmRf();
            break;
          case 'matrix':
            triggerMatrix();
            break;
          case 'theme':
            if (data.theme) {
              document.documentElement.setAttribute('data-theme', data.theme);
              localStorage.setItem('theme', data.theme);
            }
            if (data.message) {
              setMessages((prev) => [...prev, { id: ++msgId, html: `<pre class='ignore'>&gt; ${escapeHtmlClient(cmd)}\n${data.message}</pre>` }]);
            }
            break;
          case 'history': {
            const historyHtml = cmdHistory.length === 0
              ? '<span class="term-info">No history</span>'
              : cmdHistory.map((c, i) => `  ${i + 1}  ${escapeHtmlClient(c)}`).join('\n');
            setMessages((prev) => [
              ...prev,
              { id: ++msgId, html: `<pre class='ignore'>&gt; history\n${historyHtml}</pre>` },
            ]);
            break;
          }
          case 'fireworks':
            triggerFireworks();
            break;
          case 'confetti':
            triggerConfetti();
            break;
          case 'rain':
            triggerRain();
            break;
          case 'toggle-mode':
            toggleMode();
            break;
          case 'set-mode':
            if (data.theme) setMode(data.theme);
            break;
          case 'particles':
            if (data.theme) setParticleDensity(data.theme as ParticleDensity);
            break;
        }
      } else {
        const html = await res.text();
        if (html) {
          setMessages((prev) => [...prev, { id: ++msgId, html }]);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: ++msgId, html: '<pre class="ignore"><span class="term-error">Error: failed to execute command</span></pre>' },
      ]);
    }
  }, [router, close, doesSomethingDangerous, rmRf, triggerMatrix, triggerFireworks, triggerConfetti, triggerRain, toggleMode, setMode, setParticleDensity, cmdHistory]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (isTerminalMode) {
      const cmd = val.slice(1).trim();
      if (!cmd) return;
      handleTerminalSubmit(cmd);
    } else {
      // Search mode: navigate to selected result
      if (searchResults[selectedIndex]) {
        navigateSearch(searchResults[selectedIndex]);
      }
    }

    setInputValue(isTerminalMode ? '>' : '');
  }, [inputValue, isTerminalMode, handleTerminalSubmit, searchResults, selectedIndex, navigateSearch]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isTerminalMode) {
      if (e.key === 'Backspace' && inputValue === '>') {
        e.preventDefault();
        setInputValue('');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length === 0) return;
        setHistoryIndex((prev) => {
          const next = prev < cmdHistory.length - 1 ? prev + 1 : prev;
          setInputValue('>' + cmdHistory[cmdHistory.length - 1 - next]);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((prev) => {
          if (prev > 0) {
            const next = prev - 1;
            setInputValue('>' + cmdHistory[cmdHistory.length - 1 - next]);
            return next;
          } else {
            setInputValue('>');
            return -1;
          }
        });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const val = inputValue.slice(1);
        let candidates: string[] = [];
        let prefix = '';

        if (val.startsWith('cd ')) {
          prefix = 'cd ';
          const partial = val.slice(3);
          candidates = CD_TARGETS.filter((t) => t.startsWith(partial));
        } else {
          candidates = COMMANDS.filter((c) => c.startsWith(val));
        }

        if (candidates.length === 1) {
          setInputValue('>' + prefix + candidates[0]);
        } else if (candidates.length > 1) {
          setMessages((prev) => [
            ...prev,
            { id: ++msgId, html: `<pre class='ignore'>${candidates.join('  ')}</pre>` },
          ]);
        }
      }
    } else {
      // Search mode navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
    }
  }, [isTerminalMode, cmdHistory, inputValue, searchResults.length]);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
    setIsMaximized(false);
  }, []);

  const handleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const handleHeaderClick = useCallback(() => {
    if (isMinimized) setIsMinimized(false);
  }, [isMinimized]);

  const handleTerminalInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue('>' + e.target.value);
  }, []);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedIndex(0);
  }, []);

  const handleResultClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    const item = searchResults[index];
    if (item) navigateSearch(item);
  }, [searchResults, navigateSearch]);

  const handleResultMouseEnter = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    setSelectedIndex(index);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={wrapperRef}
      className={s.overlay}
      onClick={close}
    >
      <div className={`${s.modal}${isMinimized ? ` ${s.minimized}` : ''}${isMaximized ? ` ${s.maximized}` : ''}`} onClick={stopPropagation}>
        {isTerminalMode ? (
          <>
            <PaletteTitlebar
              title={`you@sandybridge: ${promptDir}`}
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onClose={close}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onHeaderClick={handleHeaderClick}
            />
            {!isMinimized && (
              <>
                <div className={s.messages} ref={messagesRef}>
                  <div className={s.msg}>
                    {messages.map((msg) => (
                      <div key={msg.id} dangerouslySetInnerHTML={{ __html: msg.html }} />
                    ))}
                  </div>
                </div>
                <form className={s.cmdWrapper} onSubmit={handleSubmit}>
                  <label htmlFor="palette-input">$</label>
                  <input
                    ref={termInputRef}
                    id="palette-input"
                    type="text"
                    spellCheck={false}
                    autoComplete="off"
                    value={inputValue.slice(1)}
                    onChange={handleTerminalInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="help"
                  />
                </form>
                <div className={s.hint}>
                  <span><kbd>Ctrl+K</kbd> toggle</span>
                  <span><kbd>↑↓</kbd> history</span>
                  <span><kbd>Tab</kbd> complete</span>
                  <span><kbd>Backspace</kbd> to exit</span>
                  <span><kbd>Esc</kbd> close</span>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <PaletteTitlebar
              title="search"
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onClose={close}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onHeaderClick={handleHeaderClick}
            />
            {!isMinimized && (
              <>
                <form onSubmit={handleSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={s.searchInput}
                    placeholder={isMobile ? "Search posts..." : "Search posts... or type > for terminal"}
                    value={inputValue}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                  />
                </form>
                <div className={s.searchResults}>
                  {searchResults.slice(0, 10).map((item, i) => (
                    <button
                      key={`${item.type}-${item.slug}`}
                      className={`${s.searchResult}${i === selectedIndex ? ` ${s.selected}` : ''}`}
                      data-index={i}
                      onClick={handleResultClick}
                      onMouseEnter={handleResultMouseEnter}
                    >
                      <span className={s.searchResultType}>{item.type}</span>
                      <span className={s.searchResultTitle}>{item.title}</span>
                      {item.description && <span className={s.searchResultDesc}>{item.description}</span>}
                    </button>
                  ))}
                  {searchResults.length === 0 && inputValue.trim() && (
                    <div className={s.searchEmpty}>No results found</div>
                  )}
                </div>
                <div className={s.hint}>
                  {!isMobile && <span><kbd>/</kbd> or <kbd>Ctrl+K</kbd> open</span>}
                  <span><kbd>↑↓</kbd> navigate</span>
                  <span><kbd>Enter</kbd> select</span>
                  {!isMobile && <span><kbd>&gt;</kbd> terminal mode</span>}
                  <span><kbd>Esc</kbd> close</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
