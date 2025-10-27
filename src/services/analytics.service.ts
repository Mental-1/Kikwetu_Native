/**
 * Analytics Service
 * Handles analytics and reporting API calls
 */

import { apiClient, ApiResponse } from './apiClient';

interface DashboardAnalytics {
  activeListings: any[];
  pendingListings: any[];
  transactions: any[];
  stats: {
    totalViews: number;
    activeListings: number;
    totalListings: number;
  };
}

interface ListingAnalytics {
  listings: any[];
  totalViews: number;
  averageViews: number;
  totalListings: number;
}

class AnalyticsService {
  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(period: '7d' | '30d' | '90d' | '1y'): Promise<ApiResponse<DashboardAnalytics>> {
    return await apiClient.get<DashboardAnalytics>('/analytics/dashboard', { period });
  }

  /**
   * Get listing analytics
   */
  async getListingAnalytics(period: '7d' | '30d' | '90d' | '1y'): Promise<ApiResponse<ListingAnalytics>> {
    return await apiClient.get<ListingAnalytics>('/analytics/listings', { period });
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<ApiResponse<any>> {
    return await apiClient.get<any>('/analytics/revenue');
  }

  /**
   * Get traffic analytics
   */
  async getTrafficAnalytics(): Promise<ApiResponse<any>> {
    return await apiClient.get<any>('/analytics/traffic');
  }

  /**
   * Get conversion analytics
   */
  async getConversionAnalytics(): Promise<ApiResponse<any>> {
    return await apiClient.get<any>('/analytics/conversions');
  }

  /**
   * Export analytics
   */
  async exportAnalytics(format: 'csv' | 'pdf' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return await apiClient.get<{ downloadUrl: string }>('/analytics/export', { format });
  }
}

export const analyticsService = new AnalyticsService();

