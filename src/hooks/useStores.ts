import { CreateStoreData, StoreImageData, storesService } from '@/src/services/storesService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch user stores
 */
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: storesService.getUserStores,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if auth fails
    throwOnError: false, // Don't throw, return error in query result
  });
}

/**
 * Hook to create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeData, images }: { storeData: CreateStoreData; images?: StoreImageData }) =>
      storesService.createStore(storeData, images),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Hook to update a store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, storeData, images }: { 
      storeId: string; 
      storeData: Partial<CreateStoreData>; 
      images?: StoreImageData;
    }) =>
      storesService.updateStore(storeId, storeData, images),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Hook to delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => storesService.deleteStore(storeId),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Hook to get a single store by ID
 */
export function useStore(storeId: string) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storesService.getStoreById(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to toggle store status
 */
export function useToggleStoreStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => storesService.toggleStoreStatus(storeId),
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Hook to get store statistics
 */
export function useStoreStats(storeId: string) {
  return useQuery({
    queryKey: ['store-stats', storeId],
    queryFn: () => storesService.getStoreStats(storeId),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change more frequently
  });
}
