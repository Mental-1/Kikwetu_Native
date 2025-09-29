import { useState, useEffect, useCallback } from 'react';
import { paymentMethodsService, PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from '@/services/paymentMethodsService';

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPaymentMethod: (data: CreatePaymentMethodData) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (id: string, data: UpdatePaymentMethodData) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  setDefaultPaymentMethod: (id: string) => Promise<boolean>;
  togglePaymentMethodActive: (id: string, isActive: boolean) => Promise<boolean>;
}

export const usePaymentMethods = (): UsePaymentMethodsReturn => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentMethodsService.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
      } else {
        setError(response.message || 'Failed to fetch payment methods');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentMethod = useCallback(async (data: CreatePaymentMethodData): Promise<PaymentMethod | null> => {
    try {
      const response = await paymentMethodsService.createPaymentMethod(data);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to create payment method');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment method');
      return null;
    }
  }, [fetchPaymentMethods]);

  const updatePaymentMethod = useCallback(async (id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod | null> => {
    try {
      const response = await paymentMethodsService.updatePaymentMethod(id, data);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh the list
        return response.data;
      } else {
        setError(response.message || 'Failed to update payment method');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
      return null;
    }
  }, [fetchPaymentMethods]);

  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await paymentMethodsService.deletePaymentMethod(id);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to delete payment method');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment method');
      return false;
    }
  }, [fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await paymentMethodsService.setDefaultPaymentMethod(id);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to set default payment method');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default payment method');
      return false;
    }
  }, [fetchPaymentMethods]);

  const togglePaymentMethodActive = useCallback(async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const response = await paymentMethodsService.togglePaymentMethodActive(id, isActive);
      if (response.success) {
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        setError(response.message || 'Failed to toggle payment method status');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle payment method status');
      return false;
    }
  }, [fetchPaymentMethods]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refetch: fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    togglePaymentMethodActive,
  };
};
