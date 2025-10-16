import { CreatePlanData, plansService, SubscriptionPlan, UpdatePlanData } from '@/src/services/plansService';
import { useCallback, useEffect, useState } from 'react';

interface UsePlansReturn {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPlan: (data: CreatePlanData) => Promise<SubscriptionPlan | null>;
  updatePlan: (id: string, data: UpdatePlanData) => Promise<SubscriptionPlan | null>;
  deletePlan: (id: string) => Promise<boolean>;
  calculatePricing: (planId: string, billingCycle: 'monthly' | 'annual') => Promise<{ price: number; discount?: string } | null>;
}

export const usePlans = (billingCycle?: 'monthly' | 'annual'): UsePlansReturn => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plansService.getPlans(billingCycle);
      if (response.success) {
        setPlans(response.data);
      } else {
        setError(response.message || 'Failed to fetch plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [billingCycle]);

  const createPlan = useCallback(async (data: CreatePlanData): Promise<SubscriptionPlan | null> => {
    try {
      const response = await plansService.createPlan(data);
      if (response.success) {
        await fetchPlans();
        return response.data;
      } else {
        setError(response.message || 'Failed to create plan');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
      return null;
    }
  }, [fetchPlans]);

  const updatePlan = useCallback(async (id: string, data: UpdatePlanData): Promise<SubscriptionPlan | null> => {
    try {
      const response = await plansService.updatePlan(id, data);
      if (response.success) {
        await fetchPlans(); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to update plan');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update plan');
      return null;
    }
  }, [fetchPlans]);

  const deletePlan = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await plansService.deletePlan(id);
      if (response.success) {
        await fetchPlans(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete plan');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plan');
      return false;
    }
  }, [fetchPlans]);

  const calculatePricing = useCallback(async (planId: string, billingCycle: 'monthly' | 'annual'): Promise<{ price: number; discount?: string } | null> => {
    try {
      const response = await plansService.calculatePricing(planId, billingCycle);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to calculate pricing');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate pricing');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    calculatePricing,
  };
};
