import { useCallback, useMemo, useState } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
  color?: string;
  icon?: string;
}

export interface FilterConfig<T> {
  [key: string]: {
    field: keyof T;
    options: FilterOption[];
    multiSelect?: boolean;
    type?: 'select' | 'range' | 'date' | 'boolean';
  };
}

export interface UseFiltersReturn<T> {
  activeFilters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  filteredData: T[];
  filterCount: number;
  hasActiveFilters: boolean;
}

export const useFilters = <T>(
  data: T[],
  filterConfig: FilterConfig<T>,
  initialFilters: Record<string, any> = {}
): UseFiltersReturn<T> => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(initialFilters);

  const setFilter = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(activeFilters).every(([filterKey, filterValue]) => {
        const config = filterConfig[filterKey];
        if (!config || filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }

        const itemValue = item[config.field];

        switch (config.type) {
          case 'range':
            if (typeof filterValue === 'object' && filterValue.min !== undefined && filterValue.max !== undefined) {
              return itemValue >= filterValue.min && itemValue <= filterValue.max;
            }
            return true;

          case 'date':
            if (filterValue.start && filterValue.end) {
              const itemDate = new Date(String(itemValue));
              const startDate = new Date(filterValue.start);
              const endDate = new Date(filterValue.end);
              return itemDate >= startDate && itemDate <= endDate;
            }
            return true;

          case 'boolean':
            return Boolean(itemValue) === Boolean(filterValue);

          case 'select':
          default:
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue);
            } else {
              return itemValue === filterValue;
            }
        }
      });
    });
  }, [data, activeFilters, filterConfig]);

  const filterCount = Object.keys(activeFilters).length;
  const hasActiveFilters = filterCount > 0;

  return {
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    filteredData,
    filterCount,
    hasActiveFilters,
  };
};
