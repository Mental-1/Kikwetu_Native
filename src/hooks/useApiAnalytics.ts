/**
 * Analytics Hooks
 * Custom hooks for analytics data
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

/**
 * Hook to fetch dashboard analytics
 */
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const response = await analyticsService.getDashboardAnalytics();
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
export function useListingAnalytics() {
  return useQuery({
    queryKey: ['listingAnalytics'],
    queryFn: async () => {
      const response = await analyticsService.getListingAnalytics();
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

