import { useState, useEffect, useCallback } from 'react';
import { subscriptionsService, Subscription, CreateSubscriptionData, UpdateSubscriptionData, CancelSubscriptionData } from '@/src/services/subscriptionsService';

interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSubscription: (data: CreateSubscriptionData) => Promise<Subscription | null>;
  updateSubscription: (id: string, data: UpdateSubscriptionData) => Promise<Subscription | null>;
  cancelSubscription: (id: string, data?: CancelSubscriptionData) => Promise<boolean>;
  reactivateSubscription: (id: string) => Promise<boolean>;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all subscriptions and current subscription in parallel
      const [subscriptionsResponse, currentResponse] = await Promise.all([
        subscriptionsService.getSubscriptions(),
        subscriptionsService.getCurrentSubscription()
      ]);

      if (subscriptionsResponse.success) {
        setSubscriptions(subscriptionsResponse.data);
      } else {
        setError(subscriptionsResponse.message || 'Failed to fetch subscriptions');
      }

      if (currentResponse.success) {
        setCurrentSubscription(currentResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubscription = useCallback(async (data: CreateSubscriptionData): Promise<Subscription | null> => {
    try {
      const response = await subscriptionsService.createSubscription(data);
      if (response.success) {
        await fetchSubscriptions(); // Refresh the data
        return response.data;
      } else {
        setError(response.message || 'Failed to create subscription');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subscription');
      return null;
    }
  }, [fetchSubscriptions]);

  const updateSubscription = useCallback(async (id: string, data: UpdateSubscriptionData): Promise<Subscription | null> => {
    try {
      const response = await subscriptionsService.updateSubscription(id, data);
      if (response.success) {
        await fetchSubscriptions(); // Refresh the data
        return response.data;
      } else {
        setError(response.message || 'Failed to update subscription');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      return null;
    }
  }, [fetchSubscriptions]);

  const cancelSubscription = useCallback(async (id: string, data?: CancelSubscriptionData): Promise<boolean> => {
    try {
      const response = await subscriptionsService.cancelSubscription(id, data);
      if (response.success) {
        await fetchSubscriptions(); // Refresh the data
        return true;
      } else {
        setError(response.message || 'Failed to cancel subscription');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      return false;
    }
  }, [fetchSubscriptions]);

  const reactivateSubscription = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await subscriptionsService.reactivateSubscription(id);
      if (response.success) {
        await fetchSubscriptions(); // Refresh the data
        return true;
      } else {
        setError(response.message || 'Failed to reactivate subscription');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
      return false;
    }
  }, [fetchSubscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    currentSubscription,
    loading,
    error,
    refetch: fetchSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
  };
};
