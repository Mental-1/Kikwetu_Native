import { ExportTransactionsData, Transaction, TransactionFilters, transactionsService } from '@/src/services/transactionsService';
import { useCallback, useEffect, useState } from 'react';

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: {
    totalTransactions: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
    failedAmount: number;
    refundedAmount: number;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  downloadReceipt: (transactionId: string) => Promise<string | null>;
  downloadInvoice: (transactionId: string) => Promise<string | null>;
  exportTransactions: (data: ExportTransactionsData) => Promise<string | null>;
  setFilters: (filters: TransactionFilters) => void;
}

export const useTransactions = (initialFilters?: TransactionFilters, initialPage: number = 1, pageSize: number = 20): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalTransactions: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
    failedAmount: number;
    refundedAmount: number;
  } | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchTransactions = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await transactionsService.getTransactions(filters, {
        page,
        limit: pageSize,
      });

      if (response.success) {
        if (append) {
          setTransactions(prev => [...prev, ...response.data]);
        } else {
          setTransactions(response.data);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, pageSize]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await transactionsService.getTransactionStats(filters);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch transaction stats:', err);
    }
  }, [filters]);

  const downloadReceipt = useCallback(async (transactionId: string): Promise<string | null> => {
    try {
      const response = await transactionsService.downloadReceipt(transactionId);
      if (response.success) {
        return response.data.downloadUrl;
      } else {
        setError(response.message || 'Failed to download receipt');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download receipt');
      return null;
    }
  }, []);

  const downloadInvoice = useCallback(async (transactionId: string): Promise<string | null> => {
    try {
      const response = await transactionsService.downloadInvoice(transactionId);
      if (response.success) {
        return response.data.downloadUrl;
      } else {
        setError(response.message || 'Failed to download invoice');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice');
      return null;
    }
  }, []);

  const exportTransactions = useCallback(async (data: ExportTransactionsData): Promise<string | null> => {
    try {
      const response = await transactionsService.exportTransactions(data);
      if (response.success) {
        return response.data.downloadUrl;
      } else {
        setError(response.message || 'Failed to export transactions');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export transactions');
      return null;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (pagination && currentPage < pagination.totalPages) {
      await fetchTransactions(currentPage + 1, true);
    }
  }, [currentPage, pagination, fetchTransactions]);

  const handleSetFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchTransactions(1);
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  return {
    transactions,
    loading,
    error,
    pagination,
    stats,
    refetch: () => fetchTransactions(1),
    loadMore,
    downloadReceipt,
    downloadInvoice,
    exportTransactions,
    setFilters: handleSetFilters,
  };
};
