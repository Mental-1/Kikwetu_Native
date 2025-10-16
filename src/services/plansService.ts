import { apiClient, ApiResponse } from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  billingCycle: 'monthly' | 'annual';
  duration: number; // in days
  maxListings?: number;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  color: string;
  icon: string;
  annualDiscount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  duration: number;
  maxListings?: number;
  features: string[];
  color: string;
  icon: string;
  annualDiscount?: string;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  monthlyPrice?: number;
  annualPrice?: number;
  duration?: number;
  maxListings?: number;
  features?: string[];
  color?: string;
  icon?: string;
  annualDiscount?: string;
  isPopular?: boolean;
}

class PlansService {
  private readonly baseEndpoint = '/plans';

  async getPlans(billingCycle?: 'monthly' | 'annual'): Promise<ApiResponse<SubscriptionPlan[]>> {
    const params = billingCycle ? { billing_cycle: billingCycle } : undefined;
    return apiClient.get<SubscriptionPlan[]>(this.baseEndpoint, params);
  }

  async getPlan(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient.get<SubscriptionPlan>(`${this.baseEndpoint}/${id}`);
  }

  async createPlan(data: CreatePlanData): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient.post<SubscriptionPlan>(this.baseEndpoint, data);
  }

  async updatePlan(id: string, data: UpdatePlanData): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient.put<SubscriptionPlan>(`${this.baseEndpoint}/${id}`, data);
  }

  async deletePlan(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async calculatePricing(planId: string, billingCycle: 'monthly' | 'annual'): Promise<ApiResponse<{ price: number; discount?: string }>> {
    return apiClient.get<{ price: number; discount?: string }>(`${this.baseEndpoint}/${planId}/pricing`, { billing_cycle: billingCycle });
  }
}

export const plansService = new PlansService();
