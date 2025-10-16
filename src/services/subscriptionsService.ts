import { apiClient, ApiResponse, PaginatedResponse } from './api';

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'free';
  billingCycle: 'monthly' | 'annual';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  autoRenew: boolean;
  amount: number;
  currency: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  planId: string;
  billingCycle: 'monthly' | 'annual';
  paymentMethodId: string;
  autoRenew?: boolean;
}

export interface UpdateSubscriptionData {
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  autoRenew?: boolean;
}

export interface CancelSubscriptionData {
  reason?: string;
  cancelAtPeriodEnd?: boolean;
}

class SubscriptionsService {
  private readonly baseEndpoint = '/subscriptions';

  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return apiClient.get<Subscription[]>(this.baseEndpoint);
  }

  async getCurrentSubscription(): Promise<ApiResponse<Subscription | null>> {
    return apiClient.get<Subscription | null>(`${this.baseEndpoint}/current`);
  }

  async getSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.get<Subscription>(`${this.baseEndpoint}/${id}`);
  }

  async createSubscription(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(this.baseEndpoint, data);
  }

  async updateSubscription(id: string, data: UpdateSubscriptionData): Promise<ApiResponse<Subscription>> {
    return apiClient.put<Subscription>(`${this.baseEndpoint}/${id}`, data);
  }

  async cancelSubscription(id: string, data?: CancelSubscriptionData): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`${this.baseEndpoint}/${id}/cancel`, data);
  }

  async reactivateSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiClient.post<Subscription>(`${this.baseEndpoint}/${id}/reactivate`);
  }

  async getSubscriptionHistory(userId?: string): Promise<PaginatedResponse<Subscription>> {
    const params = userId ? { user_id: userId } : undefined;
    return apiClient.get<Subscription[]>(`${this.baseEndpoint}/history`, params) as Promise<PaginatedResponse<Subscription>>;
  }
}

export const subscriptionsService = new SubscriptionsService();
