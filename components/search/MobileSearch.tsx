'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, FileText, Briefcase } from 'lucide-react';
import { useSearch } from '@/lib/use-search';
import { CONTENT_TYPES, getContentUrl, type ContentType } from '@/lib/constants';
import { haptic } from '@/lib/haptics';

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
    <div className="mobile-search-overlay">
      <div className="mobile-search-header">
        <div className="mobile-search-input-wrapper">
          <Search size={20} className="mobile-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="mobile-search-input"
            placeholder="Search posts and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
        <button className="mobile-search-close" onClick={handleClose} aria-label="Close search">
          <X size={24} />
        </button>
      </div>

      <div className="mobile-search-results">
        {isLoading ? (
          <div className="mobile-search-loading">Loading...</div>
        ) : results.length === 0 && query.trim() ? (
          <div className="mobile-search-empty">No results found</div>
        ) : (
          results.slice(0, 20).map((item) => (
            <button
              key={`${item.type}-${item.slug}`}
              className="mobile-search-result"
              onClick={() => handleResultClick(getContentUrl(item.type as ContentType, item.slug))}
            >
              <span className="mobile-search-result-icon">
                {item.type === CONTENT_TYPES.BLOG ? <FileText size={18} /> : <Briefcase size={18} />}
              </span>
              <span className="mobile-search-result-content">
                <span className="mobile-search-result-title">{item.title}</span>
                {item.description && (
                  <span className="mobile-search-result-desc">{item.description}</span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
