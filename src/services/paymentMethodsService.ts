import { apiClient, ApiResponse } from './api';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodData {
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentMethodData {
  name?: string;
  expiryDate?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

class PaymentMethodsService {
  private readonly baseEndpoint = '/payments/methods';

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get<PaymentMethod[]>(this.baseEndpoint);
  }

  async createPaymentMethod(data: CreatePaymentMethodData): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.post<PaymentMethod>(this.baseEndpoint, data);
  }

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodData): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.put<PaymentMethod>(`${this.baseEndpoint}/${id}`, data);
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async setDefaultPaymentMethod(id: string): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.patch<PaymentMethod>(`${this.baseEndpoint}/${id}/set-default`);
  }

  async togglePaymentMethodActive(id: string, isActive: boolean): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.patch<PaymentMethod>(`${this.baseEndpoint}/${id}/toggle`, { isActive });
  }
}

export const paymentMethodsService = new PaymentMethodsService();
