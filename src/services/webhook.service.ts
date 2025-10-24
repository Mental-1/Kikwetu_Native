/**
 * Webhook Service
 * Handles webhook notifications and real-time payment updates
 */

import { apiClient, ApiResponse } from './apiClient';

interface WebhookEvent {
  id: string;
  type: 'payment.completed' | 'payment.failed' | 'payment.processing' | 'payment.cancelled';
  transactionId: string;
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    provider: string;
    providerTransactionId?: string;
    failureReason?: string;
    processedAt?: string;
  };
  timestamp: string;
}

class WebhookService {
  /**
   * Register webhook listener for payment events
   */
  async registerWebhookListener(userId: string): Promise<ApiResponse<{
    webhookId: string;
    endpoint: string;
  }>> {
    return await apiClient.post<any>('/webhooks/register', {
      userId,
      events: ['payment.completed', 'payment.failed', 'payment.processing', 'payment.cancelled'],
    });
  }

  /**
   * Unregister webhook listener
   */
  async unregisterWebhookListener(webhookId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/webhooks/${webhookId}`);
  }

  /**
   * Get webhook events for a user
   */
  async getWebhookEvents(params: {
    userId: string;
    page?: number;
    pageSize?: number;
    eventType?: string;
    transactionId?: string;
  }): Promise<ApiResponse<{
    events: WebhookEvent[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>> {
    const queryParams: Record<string, string> = {
      userId: params.userId,
    };
    
    if (params.page !== undefined) queryParams.page = params.page.toString();
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize.toString();
    if (params.eventType) queryParams.eventType = params.eventType;
    if (params.transactionId) queryParams.transactionId = params.transactionId;
    
    return await apiClient.get<any>('/webhooks/events', queryParams);
  }

  /**
   * Mark webhook event as processed
   */
  async markWebhookProcessed(eventId: string): Promise<ApiResponse<void>> {
    return await apiClient.patch<void>(`/webhooks/events/${eventId}/processed`);
  }

  /**
   * Get real-time payment updates using Server-Sent Events (SSE)
   * Note: This will be implemented using a WebSocket or SSE connection
   * For now, we'll use polling as a fallback
   */
  async getRealtimeUpdates(userId: string): Promise<ApiResponse<WebhookEvent[]>> {
    return await apiClient.get<any>(`/webhooks/realtime/${userId}`);
  }
}

export const webhookService = new WebhookService();
