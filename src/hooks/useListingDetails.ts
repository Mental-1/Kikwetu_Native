import type { ListingItem } from '@/types/types';
import { useQuery } from '@tanstack/react-query';

// Fetch function for individual listing details
const fetchListingDetails = async (id: string): Promise<ListingItem> => {
  try {
    const response = await fetch(`http://localhost:8081/api/listings/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data || result; // Handle different response formats
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
