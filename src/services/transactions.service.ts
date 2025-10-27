/**
 * Transactions Service
 * Handles transaction-related API calls
 */

import { ApiTransaction } from '../types/api.types';
import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

interface TransactionFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
}

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  failedAmount: number;
}

class TransactionsService {
  /**
   * Get transactions with filters
   */
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedResponse<ApiTransaction>> {
    const params: Record<string, string> = {};

    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.pageSize) params.pageSize = filters.pageSize.toString();
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
    }

    return await apiClient.get('/transactions', params) as any;
  }

  /**
   * Get single transaction
   */
  async getTransaction(id: string): Promise<ApiResponse<ApiTransaction>> {
    return await apiClient.get<ApiTransaction>(`/transactions/${id}`);
  }

  /**
   * Get transaction statistics
   */
  async getStats(): Promise<ApiResponse<TransactionStats>> {
    return await apiClient.get<TransactionStats>('/transactions/stats/overview');
  }

  /**
   * Download receipt
   */
  async downloadReceipt(transactionId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return await apiClient.get<{ downloadUrl: string }>(`/transactions/${transactionId}/receipt`);
  }

  /**
   * Download invoice
   */
  async downloadInvoice(transactionId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return await apiClient.get<{ downloadUrl: string }>(`/transactions/${transactionId}/invoice`);
  }

  /**
   * Export transactions
   */
  async exportTransactions(format: 'csv' | 'pdf' | 'excel'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return await apiClient.post<{ downloadUrl: string }>('/transactions/export', { format });
  }

  /**
   * Get transaction categories
   */
  async getCategories(): Promise<ApiResponse<{ id: string; name: string; icon: string; color: string }[]>> {
    return await apiClient.get<{ id: string; name: string; icon: string; color: string }[]>(
      '/transactions/categories/list'
    );
  }
}

export const transactionsService = new TransactionsService();

