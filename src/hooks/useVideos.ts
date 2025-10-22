/**
 * Videos Hook
 * Custom hooks for video management using the videos service
 * Optimized for client-side video management
 */

import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { CreateVideoData, FeedFilters, VideoFilters, videosService } from '../services/videos.service';

/**
 * Hook to fetch featured videos for home page
 */
export function useFeaturedVideos(limit: number = 8) {
  return useQuery({
    queryKey: ['featuredVideos', limit],
    queryFn: async () => {
      const response = await videosService.getFeaturedVideos(limit);
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch videos with filters
 */
export function useVideos(filters?: VideoFilters) {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: async () => {
      const response = await videosService.getVideos(filters);
      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch videos for a specific user
 */
export function useUserVideos(userId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['userVideos', userId, page, pageSize],
    queryFn: async () => {
      const response = await videosService.getUserVideos(userId, page, pageSize);
      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch videos related to a listing
 */
export function useListingVideos(listingId: string) {
  return useQuery({
    queryKey: ['listingVideos', listingId],
    queryFn: async () => {
      const response = await videosService.getListingVideos(listingId);
      return response.data || [];
    },
    enabled: !!listingId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch a single video by ID
 */
export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await videosService.getVideo(videoId);
      return response.data;
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to create a new video
 */
export function useCreateVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateVideoData) => {
      const response = await videosService.createVideo(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create video');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['featuredVideos'] });
      showSuccessToast('Video created successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to create video');
    },
  });
}

/**
 * Hook to update video metadata
 */
export function useUpdateVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateVideoData> }) => {
      const response = await videosService.updateVideo(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update video');
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['video', id] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      showSuccessToast('Video updated successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to update video');
    },
  });
}

/**
 * Hook to delete a video
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await videosService.deleteVideo(videoId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete video');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['featuredVideos'] });
      showSuccessToast('Video deleted successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to delete video');
    },
  });
}

/**
 * Hook to increment video views
 */
export function useIncrementViews() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      await videosService.incrementViews(videoId);
    },
    onError: (error: Error) => {
      console.error('Failed to increment views:', error);
    },
  });
}

/**
 * Hook to like/unlike a video
 */
export function useToggleVideoLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await videosService.toggleLike(videoId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to toggle like');
      }
      return response.data;
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to toggle like');
    },
  });
}

/**
 * Hook to share a video
 */
export function useShareVideo() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await videosService.shareVideo(videoId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to share video');
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast('Video shared successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to share video');
    },
  });
}

/**
 * Hook to get Bunny CDN upload URL
 */
export function useBunnyUploadUrl() {
  return useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      const response = await videosService.getBunnyUploadUrl(title, description);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get upload URL');
      }
      return response.data;
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to get upload URL');
    },
  });
}

/**
 * Hook to upload video to Bunny CDN
 */
export function useUploadVideoToBunny() {
  return useMutation({
    mutationFn: async ({ 
      uploadUrl, 
      videoFile, 
      onProgress 
    }: { 
      uploadUrl: string; 
      videoFile: File; 
      onProgress?: (progress: number) => void;
    }) => {
      const response = await videosService.uploadVideoToBunny(uploadUrl, videoFile, onProgress);
      if (!response.success) {
        throw new Error(response.error || 'Failed to upload video');
      }
      return response.data;
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to upload video');
    },
  });
}

/**
 * Hook to create video record in Supabase
 */
export function useCreateVideoRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      bunnyVideoId: string;
      title: string;
      description?: string;
      listingId?: string;
      category?: string;
      tags?: string[];
    }) => {
      const response = await videosService.createVideoRecord(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create video record');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      showSuccessToast('Video uploaded successfully! Processing...');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to create video record');
    },
  });
}

/**
 * Comprehensive video upload hook that handles the complete workflow
 */
export function useVideoUpload() {
  const queryClient = useQueryClient();
  
  const bunnyUploadUrlMutation = useBunnyUploadUrl();
  const uploadToBunnyMutation = useUploadVideoToBunny();
  const createRecordMutation = useCreateVideoRecord();
  
  return useMutation({
    mutationFn: async ({
      videoFile,
      title,
      description,
      listingId,
      category,
      tags,
      onProgress,
    }: {
      videoFile: File;
      title: string;
      description?: string;
      listingId?: string;
      category?: string;
      tags?: string[];
      onProgress?: (progress: number) => void;
    }) => {
      try {
        // Step 1: Get Bunny CDN upload URL
        const uploadUrlData = await bunnyUploadUrlMutation.mutateAsync({
          title,
          description,
        });
        
        if (!uploadUrlData) {
          throw new Error('Failed to get upload URL');
        }
        
        // Step 2: Upload video to Bunny CDN
        const uploadResult = await uploadToBunnyMutation.mutateAsync({
          uploadUrl: uploadUrlData.uploadUrl,
          videoFile,
          onProgress,
        });
        
        if (!uploadResult) {
          throw new Error('Failed to upload video to Bunny CDN');
        }
        
        // Step 3: Create video record in Supabase
        const videoRecord = await createRecordMutation.mutateAsync({
          bunnyVideoId: uploadResult.bunnyVideoId,
          title,
          description,
          listingId,
          category,
          tags,
        });
        
        return {
          videoRecord,
          bunnyVideoId: uploadResult.bunnyVideoId,
          uploadUrl: uploadUrlData.uploadUrl,
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['featuredVideos'] });
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to upload video');
    },
  });
}

/**
 * Hook to update video after encoding completion (webhook callback)
 */
export function useUpdateVideoAfterEncoding() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      videoId, 
      data 
    }: { 
      videoId: string; 
      data: {
        hlsUrl: string;
        thumbnailUrl?: string;
        duration?: number;
        status: 'active' | 'failed';
      };
    }) => {
      const response = await videosService.updateVideoAfterEncoding(videoId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update video');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['featuredVideos'] });
      showSuccessToast('Video processing completed!');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to update video');
    },
  });
}

/**
 * Hook to get video analytics
 */
export function useVideoAnalytics(videoId: string) {
  return useQuery({
    queryKey: ['videoAnalytics', videoId],
    queryFn: async () => {
      const response = await videosService.getVideoAnalytics(videoId);
      return response.data;
    },
    enabled: !!videoId,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook for infinite video feed with full metadata
 */
export function useVideoFeedWithMetadata(filters?: FeedFilters) {
  return useInfiniteQuery({
    queryKey: ['videoFeedWithMetadata', filters],
    queryFn: async ({ pageParam }) => {
      const response = await videosService.getFeedVideosWithMetadata({
        ...filters,
        page: pageParam,
      });
      return response.data || [];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have more pages based on page size
      const pageSize = 10;
      return lastPage && lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Hook for infinite video feed
 */
export function useVideoFeed(filters?: FeedFilters) {
  return useInfiniteQuery({
    queryKey: ['videoFeed', filters],
    queryFn: async ({ pageParam }) => {
      const response = await videosService.getNextFeedVideos(pageParam, filters);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage.nextCursor : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Hook to mark video as viewed
 */
export function useMarkVideoViewed() {
  return useMutation({
    mutationFn: async ({ videoId, watchTime }: { videoId: string; watchTime?: number }) => {
      await videosService.markVideoViewed(videoId, watchTime);
    },
    onError: (error: Error) => {
      console.error('Failed to mark video as viewed:', error);
    },
  });
}

/**
 * Hook to get video recommendations
 */
export function useVideoRecommendations(videoId: string, limit = 5) {
  return useQuery({
    queryKey: ['videoRecommendations', videoId, limit],
    queryFn: async () => {
      const response = await videosService.getVideoRecommendations(videoId, limit);
      return response.data || [];
    },
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to report video
 */
export function useReportVideo() {
  return useMutation({
    mutationFn: async ({ videoId, reason, details }: { videoId: string; reason: string; details?: string }) => {
      const response = await videosService.reportVideo(videoId, reason, details);
      if (!response.success) {
        throw new Error(response.error || 'Failed to report video');
      }
    },
    onSuccess: () => {
      showSuccessToast('Video reported successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to report video');
    },
  });
}

/**
 * Hook to block user
 */
export function useBlockUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await videosService.blockUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to block user');
      }
    },
    onSuccess: () => {
      showSuccessToast('User blocked successfully');
    },
    onError: (error: Error) => {
      showErrorToast(error.message || 'Failed to block user');
    },
  });
}

/**
 * Hook to get trending videos
 */
export function useTrendingVideos(limit = 20) {
  return useQuery({
    queryKey: ['trendingVideos', limit],
    queryFn: async () => {
      const response = await videosService.getTrendingVideos(limit);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to get nearby videos
 */
export function useNearbyVideos(lat: number, lng: number, radius = 10) {
  return useQuery({
    queryKey: ['nearbyVideos', lat, lng, radius],
    queryFn: async () => {
      const response = await videosService.getNearbyVideos(lat, lng, radius);
      return response.data || [];
    },
    enabled: !!(lat && lng),
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to get Bunny CDN URLs for video
 */
export function useBunnyVideoUrls(videoId: string) {
  return useCallback(() => {
    return {
      hlsUrl: videosService.getBunnyHlsUrl(videoId),
      videoUrl: videosService.getBunnyVideoUrl(videoId),
      lowQualityUrl: videosService.getBunnyVideoUrl(videoId, 'low'),
      mediumQualityUrl: videosService.getBunnyVideoUrl(videoId, 'medium'),
      highQualityUrl: videosService.getBunnyVideoUrl(videoId, 'high'),
    };
  }, [videoId]);
}

/**
 * Optimized hook for video feed with client-side management and full metadata
 */
export function useOptimizedVideoFeed(filters?: FeedFilters) {
  const feedQuery = useVideoFeedWithMetadata(filters);
  
  // Flatten paginated data
  const videos = feedQuery.data?.pages?.flatMap(page => page || []) || [];
  
  return {
    ...feedQuery,
    videos,
  };
}