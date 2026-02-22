'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, FileText, Briefcase } from 'lucide-react';
import { useSearch } from '@/lib/use-search';
import { CONTENT_TYPES, getContentUrl, type ContentType } from '@/lib/constants';
import { haptic } from '@/lib/haptics';
import s from './MobileSearch.module.css';

export function MobileSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const { query, setQuery, results, loadIndex, isLoading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for custom event to open search
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      loadIndex();
    };
    window.addEventListener('open-mobile-search', handleOpen);
    return () => window.removeEventListener('open-mobile-search', handleOpen);
  }, [loadIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    haptic('light');
    setIsOpen(false);
    setQuery('');
  }, [setQuery]);

  const handleResultClick = useCallback((url: string) => {
    haptic('light');
    router.push(url);
    handleClose();
  }, [router, handleClose]);

  if (!isOpen) return null;

  return (
    <div className={s.overlay}>
      <div className={s.header}>
        <div className={s.inputWrapper}>
          <Search size={20} className={s.icon} />
          <input
            ref={inputRef}
            type="text"
            className={s.input}
            placeholder="Search posts and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
        <button className={s.close} onClick={handleClose} aria-label="Close search">
          <X size={24} />
        </button>
      </div>

      <div className={s.results}>
        {isLoading ? (
          <div className={s.loading}>Loading...</div>
        ) : results.length === 0 && query.trim() ? (
          <div className={s.empty}>No results found</div>
        ) : (
          results.slice(0, 20).map((item) => (
            <button
              key={`${item.type}-${item.slug}`}
              className={s.result}
              onClick={() => handleResultClick(getContentUrl(item.type as ContentType, item.slug))}
            >
              <span className={s.resultIcon}>
                {item.type === CONTENT_TYPES.BLOG ? <FileText size={18} /> : <Briefcase size={18} />}
              </span>
              <span className={s.resultContent}>
                <span className={s.resultTitle}>{item.title}</span>
                {item.description && (
                  <span className={s.resultDesc}>{item.description}</span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
