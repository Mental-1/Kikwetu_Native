import { createStore, CreateStoreData, deleteStore, getUserStores, updateStore } from '@/src/services/storesService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch user stores
 */
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: getUserStores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
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
    mutationFn: ({ storeId, data }: { storeId: number; data: Partial<CreateStoreData> }) =>
      updateStore(storeId, data),
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
    mutationFn: deleteStore,
    onSuccess: () => {
      // Invalidate and refetch stores
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
