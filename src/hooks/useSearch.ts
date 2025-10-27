import { useCallback, useEffect, useMemo, useState } from 'react';

export interface SearchOptions {
  debounceMs?: number;
  minLength?: number;
  caseSensitive?: boolean;
}

export interface UseSearchReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  filteredData: T[];
  isSearching: boolean;
  hasResults: boolean;
}

export const useSearch = <T>(
  data: T[],
  searchFields: (keyof T)[],
  options: SearchOptions = {}
): UseSearchReturn<T> => {
  const {
    debounceMs = 300,
    minLength = 1,
    caseSensitive = false,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, debounceMs]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const filteredData = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minLength) {
      return data;
    }

    const query = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (typeof fieldValue === 'string') {
          const value = caseSensitive ? fieldValue : fieldValue.toLowerCase();
          return value.includes(query);
        } else if (typeof fieldValue === 'number') {
          return fieldValue.toString().includes(query);
        }
        return false;
      });
    });
  }, [data, debouncedQuery, searchFields, minLength, caseSensitive]);

  const hasResults = filteredData.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    filteredData,
    isSearching,
    hasResults,
  };
};
