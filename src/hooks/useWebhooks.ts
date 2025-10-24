/**
 * Webhook Hooks
 * Custom hooks for webhook operations and real-time payment updates
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { webhookService } from '../services/webhook.service';

/**
 * Hook to register webhook listener
 */
export function useRegisterWebhookListener() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await webhookService.registerWebhookListener(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to register webhook listener');
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast('Webhook listener registered', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Registration Failed');
    },
  });
}

/**
 * Hook to unregister webhook listener
 */
export function useUnregisterWebhookListener() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await webhookService.unregisterWebhookListener(webhookId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to unregister webhook listener');
      }
      return response;
    },
    onSuccess: () => {
      showSuccessToast('Webhook listener unregistered', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Unregistration Failed');
    },
  });
}

/**
 * Hook to get webhook events
 */
export function useWebhookEvents(params: {
  userId: string;
  page?: number;
  pageSize?: number;
  eventType?: string;
  transactionId?: string;
}) {
  return useQuery({
    queryKey: ['webhookEvents', params],
    queryFn: async () => {
      const response = await webhookService.getWebhookEvents(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch webhook events');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

/**
 * Hook to mark webhook event as processed
 */
export function useMarkWebhookProcessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await webhookService.markWebhookProcessed(eventId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark webhook as processed');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhookEvents'] });
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Processing Failed');
    },
  });
}

/**
 * Hook to get real-time payment updates
 * This uses polling as a fallback for real-time updates
 */
export function useRealtimePaymentUpdates(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['realtimePaymentUpdates', userId],
    queryFn: async () => {
      const response = await webhookService.getRealtimeUpdates(userId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch real-time updates');
      }
      return response.data;
    },
    enabled: enabled && !!userId,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fetch fresh data
  });
}

/**
 * Hook to handle payment status updates from webhooks
 * This can be used to update local state when webhook events are received
 */
export function usePaymentStatusUpdate() {
  const queryClient = useQueryClient();

  return {
    updatePaymentStatus: (transactionId: string, status: string, data?: any) => {
      // Invalidate payment status queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['paymentStatus', transactionId] });
      
      // Invalidate payment history to show updated status
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      
      // Show appropriate toast based on status
      switch (status) {
        case 'completed':
          showSuccessToast('Payment completed successfully!', 'Success');
          break;
        case 'failed':
          showErrorToast(data?.failureReason || 'Payment failed', 'Payment Failed');
          break;
        case 'processing':
          showSuccessToast('Payment is being processed...', 'Processing');
          break;
        case 'cancelled':
          showErrorToast('Payment was cancelled', 'Payment Cancelled');
          break;
      }
    }
  };
}
