'use client';

import { useEffect, useRef, useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TermTriangle } from './TermTriangle';

const COMMANDS = ['help', 'cd', 'ls', 'clear', 'github', 'echo', 'contact', 'cat', 'pwd'];
const CD_TARGETS = ['home', 'blog', 'portfolio'];

interface Message {
  id: number;
  html: string;
}

let msgId = 0;

export function Terminal() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [inputValue, setInputValue] = useState('');
  const [motdShown, setMotdShown] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const promptDir = pathname === '/' ? '~' : '~' + pathname.replace(/\/$/, '');

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const showMotd = useCallback(() => {
    if (motdShown) return;
    setMotdShown(true);
    setMessages((prev) => [
      ...prev,
      { id: ++msgId, html: '<pre class="ignore"><span class="term-info">sandybridge.io — type help to get started</span></pre>' },
    ]);
  }, [motdShown]);

  const open = useCallback(() => {
    setIsVisible(true);
    showMotd();
    setTimeout(() => {
      focusInput();
    }, 50);
  }, [showMotd, focusInput]);

  const close = useCallback(() => {
    setIsVisible(false);
    setInputValue('');
  }, []);

  const toggle = useCallback(() => {
    if (isVisible) {
      close();
    } else {
      open();
    }
  }, [isVisible, close, open]);

  // Terminal toggle click handler
  useEffect(() => {
    const toggleEl = document.getElementById('term-toggle');
    if (!toggleEl) return;

    const handleClick = () => toggle();
    const handleKeyDown = (e: Event) => {
      const ke = e as globalThis.KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };

    toggleEl.addEventListener('click', handleClick);
    toggleEl.addEventListener('keydown', handleKeyDown);

    return () => {
      toggleEl.removeEventListener('click', handleClick);
      toggleEl.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggle]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close, toggle]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Click outside to close
  const handleWrapperClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') {
      e.stopPropagation();
    } else {
      close();
    }
  }, [close]);

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

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    setCmdHistory((prev) => [...prev, val]);
    setHistoryIndex(-1);
    setInputValue('');

    // GTM tracking
    if (typeof window !== 'undefined') {
      const w = window as unknown as Record<string, unknown[]>;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: 'terminal_command',
        command: val,
      });
    }

    try {
      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ cmd: val, referer: window.location.pathname }),
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
  }, [inputValue, router, close, doesSomethingDangerous, rmRf]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      setHistoryIndex((prev) => {
        const next = prev < cmdHistory.length - 1 ? prev + 1 : prev;
        setInputValue(cmdHistory[cmdHistory.length - 1 - next]);
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex((prev) => {
        if (prev > 0) {
          const next = prev - 1;
          setInputValue(cmdHistory[cmdHistory.length - 1 - next]);
          return next;
        } else {
          setInputValue('');
          return -1;
        }
      });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputValue;
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
        setInputValue(prefix + candidates[0]);
      } else if (candidates.length > 1) {
        setMessages((prev) => [
          ...prev,
          { id: ++msgId, html: `<pre class='ignore'>${candidates.join('  ')}</pre>` },
        ]);
      }
    }
  }, [cmdHistory, inputValue]);

  // Track input for GTM
  const handleInput = useCallback((val: string) => {
    setInputValue(val);
    if (typeof window !== 'undefined') {
      const w = window as unknown as Record<string, unknown[]>;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: 'input_typing',
        input_value: val,
        input_id: 'cmd',
        input_name: 'cmd',
        input_placeholder: 'Try typing a command like: help',
      });
    }
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`terminal-wrapper${isVisible ? ' visible' : ''}`}
      onClick={handleWrapperClick}
    >
      <code id="terminal" ref={terminalRef}>
        <TermTriangle />
        <div className="msg">
          {messages.map((msg) => (
            <div key={msg.id} dangerouslySetInnerHTML={{ __html: msg.html }} />
          ))}
        </div>
        <form className="cmd-wrapper" onSubmit={handleSubmit}>
          <label htmlFor="cmd">[you@sandybridge <span className="prompt-dir">{promptDir}</span>]$ </label>
          <input
            ref={inputRef}
            name="cmd"
            id="cmd"
            type="text"
            spellCheck={false}
            autoComplete="off"
            placeholder="Try typing a command like: help"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </form>
      </code>
    </div>
  );
}
