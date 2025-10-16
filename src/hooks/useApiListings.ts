/**
 * API Listings Hook
 * Custom hooks for listings using the new API
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listingsService } from '../services/listings.service';
import { ApiListing } from '../types/api.types';

/**
 * Hook to fetch user's listings
 */
export function useUserListings(userId: string, status?: string) {
  return useQuery({
    queryKey: ['userListings', userId, status],
    queryFn: async () => {
      const response = await listingsService.getUserListings(userId, {
        status,
        page: 1,
        pageSize: 100,
      });

      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to delete listing
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await listingsService.deleteListing(listingId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete listing');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      showSuccessToast('Listing deleted successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Delete Failed');
    },
  });
}

/**
 * Hook to update listing status
 */
export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await listingsService.updateListingStatus(id, status);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update listing status');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      showSuccessToast('Listing status updated', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Update Failed');
    },
  });
}

/**
 * Hook to update listing
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ApiListing> }) => {
      const response = await listingsService.updateListing(id, data as any);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update listing');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      showSuccessToast('Listing updated successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Update Failed');
    },
  });
}

/**
 * Hook to create listing
 */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await listingsService.createListing(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create listing');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      showSuccessToast('Listing created successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Creation Failed');
    },
  });
}

