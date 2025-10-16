import { CreateSavedListingData, SavedListing, SavedListingFilters, savedListingsService, UpdateSavedListingData } from '@/src/services/savedListingsService';
import { useCallback, useEffect, useState } from 'react';

interface UseSavedListingsReturn {
  savedListings: SavedListing[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: {
    totalSaved: number;
    availableCount: number;
    soldCount: number;
    categoryCounts: Record<string, number>;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  saveListing: (data: CreateSavedListingData) => Promise<SavedListing | null>;
  unsaveListing: (listingId: string) => Promise<boolean>;
  updateSavedListing: (id: string, data: UpdateSavedListingData) => Promise<SavedListing | null>;
  deleteSavedListing: (id: string) => Promise<boolean>;
  clearAllSavedListings: () => Promise<boolean>;
  checkIfSaved: (listingId: string) => Promise<boolean>;
  exportSavedListings: (format?: 'csv' | 'json') => Promise<string | null>;
  setFilters: (filters: SavedListingFilters) => void;
}

export const useSavedListings = (initialFilters?: SavedListingFilters, initialPage: number = 1, pageSize: number = 20): UseSavedListingsReturn => {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalSaved: number;
    availableCount: number;
    soldCount: number;
    categoryCounts: Record<string, number>;
  } | null>(null);
  const [filters, setFilters] = useState<SavedListingFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchSavedListings = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await savedListingsService.getSavedListings(filters, {
        page,
        limit: pageSize,
      });

      if (response.success) {
        if (append) {
          setSavedListings(prev => [...prev, ...response.data]);
        } else {
          setSavedListings(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch saved listings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await savedListingsService.getSavedListingsStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch saved listings stats:', err);
    }
  }, []);

  const saveListing = useCallback(async (data: CreateSavedListingData): Promise<SavedListing | null> => {
    try {
      const response = await savedListingsService.saveListing(data);
      if (response.success) {
        await fetchSavedListings(1); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to save listing');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
      return null;
    }
  }, [fetchSavedListings]);

  const unsaveListing = useCallback(async (listingId: string): Promise<boolean> => {
    try {
      const response = await savedListingsService.unsaveListing(listingId);
      if (response.success) {
        await fetchSavedListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to unsave listing');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsave listing');
      return false;
    }
  }, [fetchSavedListings]);

  const updateSavedListing = useCallback(async (id: string, data: UpdateSavedListingData): Promise<SavedListing | null> => {
    try {
      const response = await savedListingsService.updateSavedListing(id, data);
      if (response.success) {
        await fetchSavedListings(1); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to update saved listing');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update saved listing');
      return null;
    }
  }, [fetchSavedListings]);

  const deleteSavedListing = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await savedListingsService.deleteSavedListing(id);
      if (response.success) {
        await fetchSavedListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete saved listing');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete saved listing');
      return false;
    }
  }, [fetchSavedListings]);

  const clearAllSavedListings = useCallback(async (): Promise<boolean> => {
    try {
      const response = await savedListingsService.clearAllSavedListings();
      if (response.success) {
        await fetchSavedListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to clear all saved listings');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear all saved listings');
      return false;
    }
  }, [fetchSavedListings]);

  const checkIfSaved = useCallback(async (listingId: string): Promise<boolean> => {
    try {
      const response = await savedListingsService.checkIfSaved(listingId);
      if (response.success) {
        return response.data.isSaved;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }, []);

  const exportSavedListings = useCallback(async (format: 'csv' | 'json' = 'csv'): Promise<string | null> => {
    try {
      const response = await savedListingsService.exportSavedListings(format);
      if (response.success) {
        return response.data.downloadUrl;
      } else {
        setError(response.message || 'Failed to export saved listings');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export saved listings');
      return null;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.totalPages) {
      await fetchSavedListings(currentPage + 1, true);
    }
  }, [currentPage, pagination, fetchSavedListings]);

  const handleSetFilters = useCallback((newFilters: SavedListingFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchSavedListings(1);
    fetchStats();
  }, [fetchSavedListings, fetchStats]);

  return {
    savedListings,
    loading,
    error,
    pagination,
    stats,
    refetch: () => fetchSavedListings(1),
    loadMore,
    saveListing,
    unsaveListing,
    updateSavedListing,
    deleteSavedListing,
    clearAllSavedListings,
    checkIfSaved,
    exportSavedListings,
    setFilters: handleSetFilters,
  };
};
