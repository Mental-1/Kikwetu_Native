import { CreateListingData, Listing, ListingFilters, listingsService, UpdateListingData } from '@/src/services/listingsService';
import { useCallback, useEffect, useState } from 'react';

interface UseMyListingsReturn {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: {
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    expiredListings: number;
    totalViews: number;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  createListing: (data: CreateListingData) => Promise<Listing | null>;
  updateListing: (id: string, data: UpdateListingData) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
  renewListing: (id: string, planId: string) => Promise<boolean>;
  markAsSold: (id: string) => Promise<boolean>;
  requestReview: (id: string, notes?: string) => Promise<boolean>;
  uploadImages: (listingId: string, images: FormData) => Promise<boolean>;
  deleteImage: (listingId: string, imageId: string) => Promise<boolean>;
  setFilters: (filters: ListingFilters) => void;
}

export const useMyListings = (initialFilters?: ListingFilters, initialPage: number = 1, pageSize: number = 20): UseMyListingsReturn => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    expiredListings: number;
    totalViews: number;
  } | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchListings = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await listingsService.getMyListings(filters, {
        page,
        limit: pageSize,
      });

      if (response.success) {
        if (append) {
          setListings(prev => [...prev, ...response.data]);
        } else {
          setListings(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch listings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await listingsService.getListingStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch listing stats:', err);
    }
  }, []);

  const createListing = useCallback(async (data: CreateListingData): Promise<Listing | null> => {
    try {
      const response = await listingsService.createListing(data);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to create listing');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      return null;
    }
  }, [fetchListings]);

  const updateListing = useCallback(async (id: string, data: UpdateListingData): Promise<Listing | null> => {
    try {
      const response = await listingsService.updateListing(id, data);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to update listing');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      return null;
    }
  }, [fetchListings]);

  const deleteListing = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await listingsService.deleteListing(id);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete listing');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
      return false;
    }
  }, [fetchListings]);

  const renewListing = useCallback(async (id: string, planId: string): Promise<boolean> => {
    try {
      const response = await listingsService.renewListing(id, planId);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to renew listing');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to renew listing');
      return false;
    }
  }, [fetchListings]);

  const markAsSold = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await listingsService.markAsSold(id);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to mark listing as sold');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark listing as sold');
      return false;
    }
  }, [fetchListings]);

  const requestReview = useCallback(async (id: string, notes?: string): Promise<boolean> => {
    try {
      const response = await listingsService.requestReview(id, notes);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to request review');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request review');
      return false;
    }
  }, [fetchListings]);

  const uploadImages = useCallback(async (listingId: string, images: FormData): Promise<boolean> => {
    try {
      const response = await listingsService.uploadListingImages(listingId, images);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to upload images');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      return false;
    }
  }, [fetchListings]);

  const deleteImage = useCallback(async (listingId: string, imageId: string): Promise<boolean> => {
    try {
      const response = await listingsService.deleteListingImage(listingId, imageId);
      if (response.success) {
        await fetchListings(1); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete image');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      return false;
    }
  }, [fetchListings]);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.totalPages) {
      await fetchListings(currentPage + 1, true);
    }
  }, [currentPage, pagination, fetchListings]);

  const handleSetFilters = useCallback((newFilters: ListingFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchListings(1);
    fetchStats();
  }, [fetchListings, fetchStats]);

  return {
    listings,
    loading,
    error,
    pagination,
    stats,
    refetch: () => fetchListings(1),
    loadMore,
    createListing,
    updateListing,
    deleteListing,
    renewListing,
    markAsSold,
    requestReview,
    uploadImages,
    deleteImage,
    setFilters: handleSetFilters,
  };
};
