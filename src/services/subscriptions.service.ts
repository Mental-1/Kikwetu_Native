/**
 * Subscriptions Service
 * Handles subscription plans and user subscriptions
 */

import { ApiSubscription, ApiSubscriptionPlan } from '../types/api.types';
import { apiClient, ApiResponse } from './apiClient';

class SubscriptionsService {
  /**
   * Get all subscription plans
   */
  async getPlans(): Promise<ApiResponse<ApiSubscriptionPlan[]>> {
    return await apiClient.get<ApiSubscriptionPlan[]>('/subscriptions/plans');
  }

  /**
   * Get single plan
   */
  async getPlan(id: string): Promise<ApiResponse<ApiSubscriptionPlan>> {
    return await apiClient.get<ApiSubscriptionPlan>(`/subscriptions/plans/${id}`);
  }

  /**
   * Get user subscriptions
   */
  async getSubscriptions(): Promise<ApiResponse<ApiSubscription[]>> {
    return await apiClient.get<ApiSubscription[]>('/subscriptions');
  }

  /**
   * Get current active subscription
   */
  async getCurrentSubscription(): Promise<ApiResponse<ApiSubscription | null>> {
    return await apiClient.get<ApiSubscription | null>('/subscriptions/current');
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(): Promise<ApiResponse<ApiSubscription[]>> {
    return await apiClient.get<ApiSubscription[]>('/subscriptions/history');
  }

  /**
   * Create subscription
   */
  async createSubscription(data: {
    planId: string;
    billingCycle: 'monthly' | 'annual';
    paymentMethodId: string;
  }): Promise<ApiResponse<ApiSubscription>> {
    return await apiClient.post<ApiSubscription>('/subscriptions', data);
  }

  /**
   * Update subscription
   */
  async updateSubscription(id: string, data: any): Promise<ApiResponse<ApiSubscription>> {
    return await apiClient.put<ApiSubscription>(`/subscriptions/${id}`, data);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string): Promise<ApiResponse<ApiSubscription>> {
    return await apiClient.post<ApiSubscription>(`/subscriptions/${id}/cancel`);
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(id: string): Promise<ApiResponse<ApiSubscription>> {
    return await apiClient.post<ApiSubscription>(`/subscriptions/${id}/reactivate`);
  }
}

export const subscriptionsService = new SubscriptionsService();

