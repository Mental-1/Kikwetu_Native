/**
 * Payments Service
 * Handles payment-related API calls including M-Pesa and Paystack
 */

import { ApiPaymentMethod, MpesaPaymentResponse, PaystackPaymentResponse } from '../types/api.types';
import { apiClient, ApiResponse } from './apiClient';

class PaymentsService {
  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<ApiPaymentMethod[]>> {
    return await apiClient.get<ApiPaymentMethod[]>('/payments/methods');
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(data: {
    type: 'card' | 'bank' | 'mobile';
    name: string;
    lastFour: string;
    expiryDate?: string;
  }): Promise<ApiResponse<ApiPaymentMethod>> {
    return await apiClient.post<ApiPaymentMethod>('/payments/methods', data);
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    id: string,
    data: Partial<ApiPaymentMethod>
  ): Promise<ApiResponse<ApiPaymentMethod>> {
    return await apiClient.put<ApiPaymentMethod>(`/payments/methods/${id}`, data);
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/payments/methods/${id}`);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(id: string): Promise<ApiResponse<ApiPaymentMethod>> {
    return await apiClient.patch<ApiPaymentMethod>(`/payments/methods/${id}/default`);
  }

  /**
   * M-PESA: Initiate STK Push
   */
  async initiateMpesaPayment(
    amount: number,
    phoneNumber: string
  ): Promise<ApiResponse<MpesaPaymentResponse>> {
    return await apiClient.post<MpesaPaymentResponse>('/payments/mpesa/stk-push', {
      amount,
      phone_number: phoneNumber,
    });
  }

  /**
   * PAYSTACK: Initialize Payment
   */
  async initializePaystackPayment(
    amount: number,
    email: string
  ): Promise<ApiResponse<PaystackPaymentResponse>> {
    return await apiClient.post<PaystackPaymentResponse>('/payments/paystack/initialize', {
      amount,
      email,
    });
  }

  /**
   * PAYSTACK: Verify Payment
   */
  async verifyPaystackPayment(reference: string): Promise<ApiResponse<any>> {
    return await apiClient.get<any>(`/payments/paystack/verify/${reference}`);
  }
}

export const paymentsService = new PaymentsService();

