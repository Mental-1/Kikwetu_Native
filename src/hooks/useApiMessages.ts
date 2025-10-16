/**
 * Messages Hooks
 * Custom hooks for messaging functionality
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesService } from '../services/messages.service';

/**
 * Hook to fetch conversations
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await messagesService.getConversations();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch conversations');
      }
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    refetchInterval: 30000, // Refetch every 30 seconds for new messages
  });
}

/**
 * Hook to get unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const response = await messagesService.getUnreadCount();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch unread count');
      }
      return response.data.unreadCount;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to send message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { recipient_id: string; message: string }) => {
      const response = await messagesService.sendMessage(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showSuccessToast('Message sent', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Send Failed');
    },
  });
}

/**
 * Hook to delete message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await messagesService.deleteMessage(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete message');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      showSuccessToast('Message deleted', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Delete Failed');
    },
  });
}

