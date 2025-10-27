import { createListing, CreateListingData, deleteListing, getListingById, getListings, getUserListings, updateListing, updateListingStatus, ListingFilters } from '@/src/services/listingsService';
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
      
      let uploadedImages: string[] = [];
      if (imageUris && imageUris.length > 0) {
        onUploadProgress?.(10);
        
        const uploadResults = await uploadImages(imageUris, {
          onProgress: (progress) => {
            const mappedProgress = 10 + (progress.percentage * 0.8);
            onUploadProgress?.(mappedProgress);
          },
        });
        
        uploadedImages = uploadResults.map(result => result.url);
        onUploadProgress?.(90);
      }

      const listingWithImages = {
        ...listingData,
        images: uploadedImages,
        videos: listingData.videos,
      };

      onUploadProgress?.(95);
      const result = await createListing(listingWithImages);
      onUploadProgress?.(100);
      
      return result;
    },
    onSuccess: () => {
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
      
      let uploadedImages: string[] = [];
      if (imageUris && imageUris.length > 0) {
        onUploadProgress?.(10);
        
        const uploadResults = await uploadImages(imageUris, {
          onProgress: (progress) => {
            const mappedProgress = 10 + (progress.percentage * 0.8);
            onUploadProgress?.(mappedProgress);
          },
        });
        
        uploadedImages = uploadResults.map(result => result.url);
        onUploadProgress?.(90);
      }

      const updateData = {
        ...listingData,
        ...(uploadedImages.length > 0 && { images: uploadedImages }),
        ...(listingData.videos && { videos: listingData.videos }),
      };

      onUploadProgress?.(95);
      const result = await updateListing(listingId, updateData);
      onUploadProgress?.(100);
      
      return result;
    },
    onSuccess: (_, variables) => {
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
      const draftKey = `listing_draft_${Date.now()}`;
      await localStorage.setItem(draftKey, JSON.stringify({
        ...draftData,
        created_at: new Date().toISOString(),
        status: 'draft',
      }));
      
      return { draftKey, ...draftData };
    },
    onSuccess: () => {
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
    staleTime: 1 * 60 * 1000,
  });
}


/**
 * Hook for fetching listings with infinite scrolling
 */
export function useListings(filters: ListingFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: ({ pageParam = 1 }) => getListings(filters, pageParam),
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