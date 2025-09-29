import { apiClient, ApiResponse, PaginatedResponse, PaginationParams } from './api';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'one-time' | 'refund' | 'payout';
  category: 'plan' | 'listing' | 'feature' | 'refund' | 'withdrawal';
  description: string;
  paymentMethod: string;
  reference: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  status?: string;
  category?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExportTransactionsData {
  format: 'csv' | 'pdf' | 'excel';
  filters?: TransactionFilters;
  dateRange?: {
    from: string;
    to: string;
  };
}

class TransactionsService {
  private readonly baseEndpoint = '/transactions';

  async getTransactions(
    filters?: TransactionFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Transaction>> {
    const params = {
      ...filters,
      ...pagination,
    };
    return apiClient.get<Transaction[]>(this.baseEndpoint, params) as Promise<PaginatedResponse<Transaction>>;
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return apiClient.get<Transaction>(`${this.baseEndpoint}/${id}`);
  }

  async downloadReceipt(transactionId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get<{ downloadUrl: string }>(`${this.baseEndpoint}/${transactionId}/receipt`);
  }

  async downloadInvoice(transactionId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get<{ downloadUrl: string }>(`${this.baseEndpoint}/${transactionId}/invoice`);
  }

  async exportTransactions(data: ExportTransactionsData): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.post<{ downloadUrl: string }>(`${this.baseEndpoint}/export`, data);
  }

  async getTransactionCategories(): Promise<ApiResponse<{ id: string; name: string; icon: string; color: string }[]>> {
    return apiClient.get<{ id: string; name: string; icon: string; color: string }[]>(`${this.baseEndpoint}/categories`);
  }

  async getTransactionStats(filters?: TransactionFilters): Promise<ApiResponse<{
    totalTransactions: number;
    totalAmount: number;
    completedAmount: number;
    pendingAmount: number;
    failedAmount: number;
    refundedAmount: number;
  }>> {
    return apiClient.get<{
      totalTransactions: number;
      totalAmount: number;
      completedAmount: number;
      pendingAmount: number;
      failedAmount: number;
      refundedAmount: number;
    }>(`${this.baseEndpoint}/stats`, filters);
  }
}

export const transactionsService = new TransactionsService();
