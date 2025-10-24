/**
 * Subscriptions Hooks
 * Custom hooks for subscription plans and user subscriptions
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionsService } from '../services/subscriptions.service';

/**
 * Hook to fetch subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await subscriptionsService.getPlans();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch plans');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to get current subscription
 */
export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const response = await subscriptionsService.getCurrentSubscription();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch current subscription');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to get subscription history
 */
export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ['subscriptionHistory'],
    queryFn: async () => {
      const response = await subscriptionsService.getSubscriptionHistory();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch subscription history');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to create subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      planId: string;
      billingCycle: 'monthly' | 'annual';
      paymentMethodId: string;
    }) => {
      const response = await subscriptionsService.createSubscription(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create subscription');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptionHistory'] });
      showSuccessToast('Subscription activated successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Subscription Failed');
    },
  });
}

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await subscriptionsService.cancelSubscription(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel subscription');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      showSuccessToast('Subscription cancelled', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Cancel Failed');
    },
  });
}

