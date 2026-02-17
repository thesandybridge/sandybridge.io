'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import type { SearchItem } from '@/lib/search-index';

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  // Load index on first open
  useEffect(() => {
    if (!isOpen || index) return;
    fetch('/api/search')
      .then((r) => r.json())
      .then((data: SearchItem[]) => {
        setIndex(data);
        fuseRef.current = new Fuse(data, {
          keys: ['title', 'description', 'tags'],
          threshold: 0.3,
        });
      });
  }, [isOpen, index]);

  // Search
  useEffect(() => {
    if (!fuseRef.current || !query.trim()) {
      setResults(index || []);
      setSelectedIndex(0);
      return;
    }
    const res = fuseRef.current.search(query).map((r) => r.item);
    setResults(res);
    setSelectedIndex(0);
  }, [query, index]);

  // Keyboard shortcut: /
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Nav button click
  useEffect(() => {
    const btn = document.getElementById('search-toggle');
    if (!btn) return;
    const handler = () => setIsOpen(true);
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, []);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigate = useCallback((item: SearchItem) => {
    const url = item.type === 'blog' ? `/blog/${item.slug}` : `/portfolio/${item.slug}`;
    router.push(url);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) navigate(results[selectedIndex]);
    }
  }, [results, selectedIndex, navigate]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={() => { setIsOpen(false); setQuery(''); }}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search posts and projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="search-results">
          {results.slice(0, 10).map((item, i) => (
            <button
              key={`${item.type}-${item.slug}`}
              className={`search-result${i === selectedIndex ? ' selected' : ''}`}
              onClick={() => navigate(item)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="search-result-type">{item.type}</span>
              <span className="search-result-title">{item.title}</span>
              {item.description && <span className="search-result-desc">{item.description}</span>}
            </button>
          ))}
          {results.length === 0 && query.trim() && (
            <div className="search-empty">No results found</div>
          )}
        </div>
        <div className="search-hint">
          <kbd>/</kbd> to search &middot; <kbd>↑↓</kbd> to navigate &middot; <kbd>Enter</kbd> to select &middot; <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
