import { listingsService } from '@/src/services/listingsService';
import { ApiListing } from '@/src/types/api.types';
import { useQuery } from '@tanstack/react-query';

// Fetch function for individual listing details
const fetchListingDetails = async (id: string): Promise<ApiListing> => {
  try {
    const response = await listingsService.getListingById(id);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch listing');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw error;
  }
};

// Hook for fetching individual listing details
export const useListingDetails = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingDetails(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
