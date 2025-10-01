import type { ListingItem } from '@/types/types';
import { useInfiniteQuery } from '@tanstack/react-query';

// API base URL
const API_BASE_URL = 'http://localhost:8081';

interface ListingsResponse {
  data: ListingItem[];
  total: number;
  page: number;
  pageSize: number;
}

// Fetch function for listings
const fetchListings = async (pageParam: number = 1): Promise<ListingsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/listings?page=${pageParam}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

// Hook for infinite scrolling listings
export const useListings = () => {
  return useInfiniteQuery({
    queryKey: ['listings'],
    queryFn: ({ pageParam = 1 }) => fetchListings(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than pageSize, we've reached the end
      if (!lastPage.data || lastPage.data.length < 20) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// Hook for filtered listings (for search functionality)
export const useFilteredListings = (searchQuery: string) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useListings();
  
  // Flatten all pages into a single array
  const allListings = data?.pages.flatMap(page => page.data) || [];
  
  // Filter listings based on search query
  const filteredListings = allListings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (listing.location && listing.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return {
    listings: filteredListings,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    totalCount: allListings.length,
  };
};
