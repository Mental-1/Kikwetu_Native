import { useCallback } from 'react';
import { FilterConfig, useFilters } from './useFilters';
import { usePagination } from './usePagination';
import { useSearch } from './useSearch';
import { useSorting } from './useSorting';

export interface CombinedDataManagementOptions<T> {
  searchFields: (keyof T)[];
  filterConfig: FilterConfig<T>;
  pagination?: {
    pageSize?: number;
    maxVisiblePages?: number;
  };
  search?: {
    debounceMs?: number;
    minLength?: number;
    caseSensitive?: boolean;
  };
  initialSort?: { key: string; direction: 'asc' | 'desc' };
}

export interface CombinedDataManagementReturn<T> {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  hasSearchResults: boolean;

  // Filters
  activeFilters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  filterCount: number;
  hasActiveFilters: boolean;

  // Sorting
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  handleSort: (key: string) => void;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  clearSorting: () => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  paginatedData: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  visiblePages: number[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;

  // Combined
  processedData: T[];
  resetAll: () => void;
}

export const useCombinedDataManagement = <T>(
  data: T[],
  options: CombinedDataManagementOptions<T>
): CombinedDataManagementReturn<T> => {
  const {
    searchFields,
    filterConfig,
    pagination = {},
    search = {},
    initialSort,
  } = options;

  // Initialize individual hooks
  const searchHook = useSearch(data, searchFields, search);
  const filtersHook = useFilters(searchHook.filteredData, filterConfig);
  const sortingHook = useSorting(filtersHook.filteredData, initialSort);
  const paginationHook = usePagination(sortingHook.sortedData, pagination);

  // Reset all filters, search, and pagination
  const resetAll = useCallback(() => {
    searchHook.clearSearch();
    filtersHook.clearAllFilters();
    sortingHook.clearSorting();
    paginationHook.resetPagination();
  }, [searchHook, filtersHook, sortingHook, paginationHook]);

  // Combined processed data (after all transformations)
  const processedData = paginationHook.paginatedData;

  return {
    // Search
    searchQuery: searchHook.searchQuery,
    setSearchQuery: searchHook.setSearchQuery,
    clearSearch: searchHook.clearSearch,
    isSearching: searchHook.isSearching,
    hasSearchResults: searchHook.hasResults,

    // Filters
    activeFilters: filtersHook.activeFilters,
    setFilter: filtersHook.setFilter,
    clearFilter: filtersHook.clearFilter,
    clearAllFilters: filtersHook.clearAllFilters,
    filterCount: filtersHook.filterCount,
    hasActiveFilters: filtersHook.hasActiveFilters,

    // Sorting
    sortConfig: sortingHook.sortConfig,
    handleSort: sortingHook.handleSort,
    setSortConfig: sortingHook.setSortConfig,
    clearSorting: sortingHook.clearSorting,

    // Pagination
    currentPage: paginationHook.currentPage,
    totalPages: paginationHook.totalPages,
    pageSize: paginationHook.pageSize,
    totalItems: paginationHook.totalItems,
    paginatedData: paginationHook.paginatedData,
    hasNextPage: paginationHook.hasNextPage,
    hasPreviousPage: paginationHook.hasPreviousPage,
    visiblePages: paginationHook.visiblePages,
    goToPage: paginationHook.goToPage,
    nextPage: paginationHook.nextPage,
    previousPage: paginationHook.previousPage,
    firstPage: paginationHook.firstPage,
    lastPage: paginationHook.lastPage,
    setPageSize: paginationHook.setPageSize,
    resetPagination: paginationHook.resetPagination,

    // Combined
    processedData,
    resetAll,
  };
};
