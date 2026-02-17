'use client';

import { useEffect, useRef, useState, useCallback, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { TermTriangle } from './TermTriangle';
import type { SearchItem } from '@/lib/search-index';

const COMMANDS = ['help', 'cd', 'ls', 'clear', 'github', 'echo', 'contact', 'cat', 'pwd', 'grep', 'man', 'tree', 'history', 'ascii'];
const CD_TARGETS = ['home', 'blog', 'portfolio'];

function escapeHtmlClient(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  const isTerminalMode = inputValue.startsWith('>');
  const promptDir = pathname === '/' ? '~' : '~' + pathname.replace(/\/$/, '');

  // Load search index on first open
  useEffect(() => {
    if (!isVisible || searchIndex) return;
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setSearchIndex(data);
        fuseRef.current = new Fuse(data, {
          keys: ['title', 'description', 'tags'],
          threshold: 0.3,
        });
      });
  }, [isVisible, searchIndex]);

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

  // Re-focus input when mode switches
  useEffect(() => {
    if (!isVisible) return;
    requestAnimationFrame(() => {
      if (isTerminalMode) {
        termInputRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    });
  }, [isTerminalMode, isVisible]);

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
  }, [router, close, doesSomethingDangerous, rmRf, cmdHistory]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (isTerminalMode) {
      const cmd = val.slice(1).trim();
      if (!cmd) return;
      showMotd();
      handleTerminalSubmit(cmd);
    } else {
      // Search mode: navigate to selected result
      if (searchResults[selectedIndex]) {
        navigateSearch(searchResults[selectedIndex]);
      }
    }

    setInputValue(isTerminalMode ? '>' : '');
  }, [inputValue, isTerminalMode, handleTerminalSubmit, showMotd, searchResults, selectedIndex, navigateSearch]);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isTerminalMode) {
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

  if (!isVisible) return null;

  return (
    <div
      ref={wrapperRef}
      className="palette-overlay"
      onClick={close}
    >
      <div className="palette-modal" onClick={(e) => e.stopPropagation()}>
        {isTerminalMode ? (
          <>
            <TermTriangle />
            <div className="term-messages" ref={messagesRef}>
              <div className="msg">
                {messages.map((msg) => (
                  <div key={msg.id} dangerouslySetInnerHTML={{ __html: msg.html }} />
                ))}
              </div>
            </div>
            <form className="cmd-wrapper" onSubmit={handleSubmit}>
              <label htmlFor="palette-input">[you@sandybridge <span className="prompt-dir">{promptDir}</span>]$ </label>
              <input
                ref={termInputRef}
                id="palette-input"
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={inputValue.slice(1)}
                onChange={(e) => setInputValue('>' + e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="help"
              />
            </form>
            <div className="palette-hint">
              <span><kbd>Ctrl+K</kbd> toggle</span>
              <span><kbd>↑↓</kbd> history</span>
              <span><kbd>Tab</kbd> complete</span>
              <span>Backspace <kbd>&gt;</kbd> to search</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <input
                ref={searchInputRef}
                type="text"
                className="palette-search-input"
                placeholder="Search posts... or type > for terminal"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
            </form>
            <div className="search-results">
              {searchResults.slice(0, 10).map((item, i) => (
                <button
                  key={`${item.type}-${item.slug}`}
                  className={`search-result${i === selectedIndex ? ' selected' : ''}`}
                  onClick={() => navigateSearch(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="search-result-type">{item.type}</span>
                  <span className="search-result-title">{item.title}</span>
                  {item.description && <span className="search-result-desc">{item.description}</span>}
                </button>
              ))}
              {searchResults.length === 0 && inputValue.trim() && (
                <div className="search-empty">No results found</div>
              )}
            </div>
            <div className="palette-hint">
              <span><kbd>/</kbd> or <kbd>Ctrl+K</kbd> open</span>
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>Enter</kbd> select</span>
              <span><kbd>&gt;</kbd> terminal mode</span>
              <span><kbd>Esc</kbd> close</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
