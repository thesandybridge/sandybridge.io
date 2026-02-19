'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type Fuse from 'fuse.js';
import type { SearchItem } from '@/lib/search-index';

export function useSearch() {
  const [searchIndex, setSearchIndex] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  // Load search index + Fuse.js on demand
  const loadIndex = useCallback(async () => {
    if (searchIndex || isLoading) return;
    setIsLoading(true);
    try {
      const [data, FuseClass] = await Promise.all([
        fetch('/api/search').then((r) => r.json()),
        import('fuse.js').then((m) => m.default),
      ]) as [SearchItem[], typeof Fuse];
      setSearchIndex(data);
      fuseRef.current = new FuseClass(data, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.3,
      });
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  }, [searchIndex, isLoading]);

  // Search when query changes
  useEffect(() => {
    if (!fuseRef.current || !searchIndex) {
      return;
    }
    if (!query.trim()) {
      setResults(searchIndex);
      return;
    }
    const res = fuseRef.current.search(query).map((r) => r.item);
    setResults(res);
  }, [query, searchIndex]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    loadIndex,
    isReady: !!searchIndex,
  };
}
