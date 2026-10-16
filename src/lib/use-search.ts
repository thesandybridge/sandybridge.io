import { loadSearch } from './search-client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type Fuse from 'fuse.js';
import type { SearchItem } from '~/lib/types/search';

export function useSearch() {
  const [searchIndex, setSearchIndex] = useState<SearchItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  // Load search index + Fuse.js on demand
  const loadIndex = useCallback(async () => {
    if (searchIndex || isLoading) return;
    setIsLoading(true);
    try {
      setError(null);
      const { data, fuse } = await loadSearch();
      setSearchIndex(data);
      fuseRef.current = fuse;
      setResults(data);
    } catch {
      setError('Search is temporarily unavailable. Close and reopen to retry.');
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
    error,
    query,
    setQuery,
    results,
    isLoading,
    loadIndex,
    isReady: !!searchIndex,
  };
}
