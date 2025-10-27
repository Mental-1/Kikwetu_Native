import { useCallback, useEffect, useMemo, useState } from 'react';

export interface PaginationOptions {
  pageSize?: number;
  maxVisiblePages?: number;
}

export interface UsePaginationReturn<T> {
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
}

export const usePagination = <T>(
  data: T[],
  options: PaginationOptions = {}
): UsePaginationReturn<T> => {
  const {
    pageSize: initialPageSize = 10,
    maxVisiblePages = 5,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  // Reset to page 1 when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    hasNextPage,
    hasPreviousPage,
    visiblePages,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize: handleSetPageSize,
    resetPagination,
  };
};
