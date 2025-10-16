import { createListing, CreateListingData, deleteListing, getListingById, getUserListings, updateListing, updateListingStatus } from '@/src/services/listingsService';
import { uploadImages } from '@/src/utils/imageUpload';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch user's listings
 */
export function useUserListings(filters?: any) {
  return useQuery({
    queryKey: ['userListings', filters],
    queryFn: () => getUserListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single listing by ID
 */
export function useListingDetails(listingId: string) {
  return useQuery({
    queryKey: ['listingDetails', listingId],
    queryFn: () => getListingById(listingId),
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new listing with image upload
 */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingData: CreateListingData;
      imageUris?: string[];
      onUploadProgress?: (progress: number) => void;
    }) => {
      const { listingData, imageUris, onUploadProgress } = data;
      
      // Upload images first if provided
      let uploadedImages: string[] = [];
      if (imageUris && imageUris.length > 0) {
        onUploadProgress?.(10); // Start upload
        
        const uploadResults = await uploadImages(imageUris, {
          onProgress: (progress) => {
            // Map upload progress to 10-90% range
            const mappedProgress = 10 + (progress.percentage * 0.8);
            onUploadProgress?.(mappedProgress);
          },
        });
        
        uploadedImages = uploadResults.map(result => result.url);
        onUploadProgress?.(90); // Upload complete
      }

      // Create listing with uploaded image URLs
      const listingWithImages = {
        ...listingData,
        images: uploadedImages,
      };

      onUploadProgress?.(95); // Almost done
      const result = await createListing(listingWithImages);
      onUploadProgress?.(100); // Complete
      
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

/**
 * Hook to update an existing listing
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: string;
      listingData: Partial<CreateListingData>;
      imageUris?: string[];
      onUploadProgress?: (progress: number) => void;
    }) => {
      const { listingId, listingData, imageUris, onUploadProgress } = data;
      
      // Upload new images if provided
      let uploadedImages: string[] = [];
      if (imageUris && imageUris.length > 0) {
        onUploadProgress?.(10); // Start upload
        
        const uploadResults = await uploadImages(imageUris, {
          onProgress: (progress) => {
            // Map upload progress to 10-90% range
            const mappedProgress = 10 + (progress.percentage * 0.8);
            onUploadProgress?.(mappedProgress);
          },
        });
        
        uploadedImages = uploadResults.map(result => result.url);
        onUploadProgress?.(90); // Upload complete
      }

      // Update listing
      const updateData = {
        ...listingData,
        ...(uploadedImages.length > 0 && { images: uploadedImages }),
      };

      onUploadProgress?.(95); // Almost done
      const result = await updateListing(listingId, updateData);
      onUploadProgress?.(100); // Complete
      
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingDetails', variables.listingId] });
    },
  });
}

/**
 * Hook to delete a listing
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

/**
 * Hook to update listing status
 */
export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, status }: { listingId: string; status: string }) =>
      updateListingStatus(listingId, status),
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingDetails', variables.listingId] });
    },
  });
}

/**
 * Hook to save listing as draft (local storage)
 */
export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draftData: {
      title: string;
      description: string;
      price: number;
      category_id: number;
      subcategory_id?: number;
      condition: string;
      location: string;
      images: string[];
      tags: string[];
      negotiable: boolean;
      store_id?: number;
    }) => {
      // Save to local storage instead of database
      const draftKey = `listing_draft_${Date.now()}`;
      await localStorage.setItem(draftKey, JSON.stringify({
        ...draftData,
        created_at: new Date().toISOString(),
        status: 'draft',
      }));
      
      return { draftKey, ...draftData };
    },
    onSuccess: () => {
      // Optionally invalidate drafts query if we implement one
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

/**
 * Hook to load saved drafts
 */
export function useLoadDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: async () => {
      // Load from local storage
      const drafts: any[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('listing_draft_')) {
          try {
            const draftData = JSON.parse(localStorage.getItem(key) || '{}');
            drafts.push({ key, ...draftData });
          } catch (error) {
            console.error('Error parsing draft:', error);
          }
        }
      }
      
      return drafts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Fetch listings with infinite scrolling
 */
async function fetchListings(page: number = 1): Promise<{ data: any[]; hasMore: boolean; totalCount: number }> {
  try {
    const response = await fetch(`http://localhost:8081/api/listings?page=${page}&limit=20`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return {
      data: result.listings || [],
      hasMore: result.hasMore || false,
      totalCount: result.totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

/**
 * Hook for fetching listings with infinite scrolling
 */
export function useListings() {
  return useInfiniteQuery({
    queryKey: ['listings'],
    queryFn: ({ pageParam = 1 }) => fetchListings(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Hook for filtered listings with search
 */
export function useFilteredListings(searchQuery: string = '') {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useListings();

  const listings = data?.pages.flatMap(page => page.data) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  // Filter listings based on search query
  const filteredListings = searchQuery
    ? listings.filter((item: any) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  return {
    listings: filteredListings,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    totalCount,
  };
}