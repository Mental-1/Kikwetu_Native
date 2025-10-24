/**
 * Payments Hooks
 * Custom hooks for payment operations including M-Pesa and Paystack
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '../services/payments.service';

/**
 * Hook to fetch payment methods
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const response = await paymentsService.getPaymentMethods();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch payment methods');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to add payment method
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await paymentsService.addPaymentMethod(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to add payment method');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccessToast('Payment method added successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Add Failed');
    },
  });
}

/**
 * Hook to delete payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await paymentsService.deletePaymentMethod(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete payment method');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccessToast('Payment method deleted', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Delete Failed');
    },
  });
}

/**
 * Hook to set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await paymentsService.setDefaultPaymentMethod(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to set default payment method');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      showSuccessToast('Default payment method updated', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Update Failed');
    },
  });
}

/**
 * Hook to initiate M-Pesa payment
 */
export function useInitiateMpesaPayment() {
  return useMutation({
    mutationFn: async ({ amount, phoneNumber }: { amount: number; phoneNumber: string }) => {
      const response = await paymentsService.initiateMpesaPayment(amount, phoneNumber);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to initiate M-Pesa payment');
      }
      return response.data;
    },
    onSuccess: (data) => {
      showSuccessToast(data.message || 'Payment initiated. Check your phone.', 'M-Pesa');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'M-Pesa Payment Failed');
    },
  });
}

/**
 * Hook to initialize Paystack payment
 */
export function useInitializePaystackPayment() {
  return useMutation({
    mutationFn: async ({ amount, email }: { amount: number; email: string }) => {
      const response = await paymentsService.initializePaystackPayment(amount, email);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to initialize Paystack payment');
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast('Redirecting to payment page...', 'Paystack');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Paystack Payment Failed');
    },
  });
}

/**
 * Hook to verify Paystack payment
 */
export function useVerifyPaystackPayment() {
  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await paymentsService.verifyPaystackPayment(reference);
      if (!response.success) {
        throw new Error(response.error || 'Failed to verify payment');
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast('Payment verified successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Verification Failed');
    },
  });
}

/**
 * Hook to get payment status
 */
export function usePaymentStatus(transactionId: string) {
  return useQuery({
    queryKey: ['paymentStatus', transactionId],
    queryFn: async () => {
      const response = await paymentsService.getPaymentStatus(transactionId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch payment status');
      }
      return response.data;
    },
    enabled: !!transactionId,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
}

/**
 * Hook to get payment history
 */
export function usePaymentHistory(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  paymentType?: string;
} = {}) {
  return useQuery({
    queryKey: ['paymentHistory', params],
    queryFn: async () => {
      const response = await paymentsService.getPaymentHistory(params);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch payment history');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to retry failed payment
 */
export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await paymentsService.retryPayment(transactionId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to retry payment');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      showSuccessToast('Payment retry initiated', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Retry Failed');
    },
  });
}

