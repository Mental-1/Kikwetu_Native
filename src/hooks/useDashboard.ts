/**
 * Dashboard Hook
 * Custom hook for dashboard data and stats
 */

import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { UserStats } from '../types/api.types';

/**
 * Hook to fetch user statistics for dashboard
 */
export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: ['userStats'],
    queryFn: async () => {
      const response = await userService.getStats();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch user stats');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

