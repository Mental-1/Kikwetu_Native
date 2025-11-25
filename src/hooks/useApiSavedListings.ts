/**
 * Saved Listings Hooks
 * Custom hooks for saved listings using the new API
 */

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savedListingsService } from "../services/savedListings.service";

/**
 * Hook to fetch saved listings
 */
export function useSavedListings() {
  return useQuery({
    queryKey: ["savedListings"],
    queryFn: async () => {
      const response = await savedListingsService.getSavedListings(1, 100);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to save a listing
 */
export function useSaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      { listingId, notes }: { listingId: string; notes?: string },
    ) => {
      const response = await savedListingsService.saveListing(listingId, notes);
      if (!response.success) {
        throw new Error(response.error || "Failed to save listing");
      }
      return { data: response.data, listingId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savedListings"] });
      queryClient.invalidateQueries({ queryKey: ["isSaved", data.listingId] });
      showSuccessToast("Listing saved successfully", "Success");
    },
    onError: (error: Error) => {
      showErrorToast(error.message, "Save Failed");
    },
  });
}

/**
 * Hook to unsave a listing
 */
export function useUnsaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await savedListingsService.unsaveListing(listingId);
      if (!response.success) {
        throw new Error(response.error || "Failed to unsave listing");
      }
      return { response, listingId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savedListings"] });
      queryClient.invalidateQueries({ queryKey: ["isSaved", data.listingId] });
      showSuccessToast("Listing removed from saved", "Success");
    },
    onError: (error: Error) => {
      showErrorToast(error.message, "Remove Failed");
    },
  });
}

/**
 * Hook to clear all saved listings
 */
export function useClearAllSavedListings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await savedListingsService.clearAllSavedListings();
      if (!response.success) {
        throw new Error(response.error || "Failed to clear saved listings");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedListings"] });
      showSuccessToast("All saved listings cleared", "Success");
    },
    onError: (error: Error) => {
      showErrorToast(error.message, "Clear Failed");
    },
  });
}

/**
 * Hook to check if listing is saved
 */
export function useCheckIfSaved(listingId: string) {
  return useQuery({
    queryKey: ["isSaved", listingId],
    queryFn: async () => {
      const response = await savedListingsService.checkIfSaved(listingId);
      if (!response.success || !response.data) {
        return { isSaved: false };
      }
      return response.data;
    },
    enabled: !!listingId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}


