import { getListingById } from '@/src/services/listingsService';
import type { ApiListing } from '@/src/types/api.types';
import { useQuery } from '@tanstack/react-query';
/**
 * 
 * @param id 
 * @returns listing details for a specific listing id.
 */

const fetchListingDetails = async (id: string): Promise<ApiListing> => {
  try {
    const raw = await getListingById(id.trim());
    if (!raw) {
      throw new Error('Listing not found');
    }
    const maybeWrapped: any = raw as any;
    const listing: any = (maybeWrapped && typeof maybeWrapped === 'object' && 'success' in maybeWrapped)
      ? maybeWrapped.data
      : maybeWrapped;

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (!Array.isArray(listing.images)) listing.images = listing.images ? [listing.images] : [];
    if (!Array.isArray(listing.tags)) listing.tags = [];

    return listing as ApiListing;
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
