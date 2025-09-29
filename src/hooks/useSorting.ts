import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface UseSortingReturn<T> {
  sortConfig: SortConfig | null;
  sortedData: T[];
  handleSort: (key: string) => void;
  setSortConfig: (config: SortConfig | null) => void;
  clearSorting: () => void;
}

export const useSorting = <T>(
  data: T[],
  initialSort?: SortConfig
): UseSortingReturn<T> => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);

  const handleSort = useCallback((key: string) => {
    setSortConfig(prevConfig => {
      // If clicking the same key, toggle direction
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      
      // If clicking a new key, start with ascending
      return {
        key,
        direction: 'asc',
      };
    });
  }, []);

  const clearSorting = useCallback(() => {
    setSortConfig(null);
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Convert to strings for comparison as fallback
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      const comparison = aString.localeCompare(bString);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  return {
    sortConfig,
    sortedData,
    handleSort,
    setSortConfig,
    clearSorting,
  };
};
