/**
 * Analytics Hooks
 * Custom hooks for analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

/**
 * Hook to fetch dashboard analytics
 */
export function useDashboardAnalytics(period: '7d' | '30d' | '90d' | '1y') {
  return useQuery({
    queryKey: ['dashboardAnalytics', period],
    queryFn: async () => {
      const response = await analyticsService.getDashboardAnalytics(period);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch listing analytics
 */
export function useListingAnalytics(period: '7d' | '30d' | '90d' | '1y') {
  return useQuery({
    queryKey: ['listingAnalytics', period],
    queryFn: async () => {
      const response = await analyticsService.getListingAnalytics(period);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch listing analytics');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch revenue analytics
 */
export function useRevenueAnalytics() {
  return useQuery({
    queryKey: ['revenueAnalytics'],
    queryFn: async () => {
      const response = await analyticsService.getRevenueAnalytics();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch revenue analytics');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

