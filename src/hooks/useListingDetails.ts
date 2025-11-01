import { listingsService } from '@/src/services/listings.service';
import { ApiListing } from '@/src/types/api.types';
import { useQuery } from '@tanstack/react-query';
/**
 * 
 * @param id 
 * @returns listing details for a specific listing id.
 */

const fetchListingDetails = async (id: string): Promise<ApiListing> => {
  try {
    const response = await listingsService.getListing(id);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch listing');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw new Error('Failed to fetch listing details. Please try again.');
  }
};

export const useListingDetails = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingDetails(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
