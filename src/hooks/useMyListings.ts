import { CreateListingData, ListingFilters, listingsService, UpdateListingData } from '@/src/services/listingsService';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

export function useMyListings(filters?: ListingFilters) {
  return useInfiniteQuery({
    queryKey: ['my-listings', filters],
    queryFn: ({ pageParam = 1 }) => listingsService.getUserListings(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.pagination) return undefined;
      return lastPage.pagination.page < lastPage.pagination.totalPages ? allPages.length + 1 : undefined;
    },
  });
}

export function useListingStats() {
  return useQuery({
    queryKey: ['listing-stats'],
    queryFn: () => listingsService.getListingStats(),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingData) => listingsService.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useUpdateListing(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateListingData) => listingsService.updateListing(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

export function useDeleteListing(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => listingsService.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
}

export function useRenewListing(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => listingsService.renewListing(listingId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

export function useMarkAsSold(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => listingsService.markAsSold(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

export function useRequestReview(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => listingsService.requestReview(listingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

export function useUploadListingImages(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageUris: string[]) => listingsService.uploadListingImages(listingId, imageUris),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}

export function useDeleteListingImage(listingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageUrl: string) => listingsService.deleteListingImage(listingId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
    },
  });
}