/**
 * Transactions Hooks
 * Custom hooks for transactions using the new API
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transactionsService } from '../services/transactions.service';

/**
 * Hook to fetch transactions
 */
export function useTransactions(status?: string) {
  return useQuery({
    queryKey: ['transactions', status],
    queryFn: async () => {
      const response = await transactionsService.getTransactions({
        status,
        page: 1,
        pageSize: 100,
      });

      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to get transaction stats
 */
export function useTransactionStats() {
  return useQuery({
    queryKey: ['transactionStats'],
    queryFn: async () => {
      const response = await transactionsService.getStats();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch transaction stats');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to download receipt
 */
export function useDownloadReceipt() {
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await transactionsService.downloadReceipt(transactionId);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to download receipt');
      }
      return response.data.downloadUrl;
    },
    onSuccess: (downloadUrl) => {
      showSuccessToast('Receipt download started', 'Success');
      // In a real app, you would open the URL or download the file
      console.log('Download URL:', downloadUrl);
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Download Failed');
    },
  });
}

/**
 * Hook to export transactions
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'excel') => {
      const response = await transactionsService.exportTransactions(format);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to export transactions');
      }
      return response.data.downloadUrl;
    },
    onSuccess: (downloadUrl) => {
      showSuccessToast('Export download started', 'Success');
      console.log('Download URL:', downloadUrl);
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Export Failed');
    },
  });
}

