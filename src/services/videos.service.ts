/**
 * Videos Service
 * Handles video-related API calls with Bunny CDN integration
 */

import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

export interface Video {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  hlsUrl?: string;
  thumbnail?: string;
  duration?: number;
  views: number;
  likes: number;
  shares: number;
  user_id: string;
  listing_id?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  status: 'active' | 'pending' | 'rejected' | 'processing' | 'failed';
  
  // Bunny CDN Integration Fields
  bunny_video_id?: string;
  thumbnail_url?: string;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  bunny_video_id: string;
  listing_id?: string;
  category?: string;
  tags?: string[];
  status?: 'processing' | 'active' | 'failed';
}

export interface VideoFilters {
  category?: string;
  user_id?: string;
  listing_id?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface FeedVideo extends Video {
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
  listing?: {
    id: string;
    title: string;
    price: number;
    location: string;
    condition?: string;
    images?: string[];
  };
  engagement: {
    isLiked: boolean;
    isSaved: boolean;
    isFollowing: boolean;
  };
}

export interface FeedFilters {
  algorithm?: 'for_you' | 'following' | 'trending' | 'nearby';
  category?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  exclude_seen?: boolean;
  page?: number;
  pageSize?: number;
}

class VideosService {
  private readonly baseEndpoint = '/videos';

  /**
   * Get all videos with filters
   */
  async getVideos(filters?: VideoFilters): Promise<PaginatedResponse<Video>> {
    const params: Record<string, string> = {
      page: '1',
      pageSize: '20',
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([key, value]) => [key, String(value)])
      ),
    };

    return await apiClient.get<Video[]>(this.baseEndpoint, params) as any;
  }

  /**
   * Get featured/recommended videos for home page
   */
  async getFeaturedVideos(limit: number = 8): Promise<ApiResponse<Video[]>> {
    return await apiClient.get<Video[]>(`${this.baseEndpoint}/featured`, { limit: limit.toString() });
  }

  /**
   * Get videos for a specific user
   */
  async getUserVideos(userId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<Video>> {
    return await apiClient.get<Video[]>(`${this.baseEndpoint}/user/${userId}`, {
      page: page.toString(),
      pageSize: pageSize.toString(),
    }) as any;
  }

  /**
   * Get videos related to a listing
   */
  async getListingVideos(listingId: string): Promise<ApiResponse<Video[]>> {
    return await apiClient.get<Video[]>(`${this.baseEndpoint}/listing/${listingId}`);
  }

  /**
   * Get a single video by ID
   */
  async getVideo(id: string): Promise<ApiResponse<Video>> {
    return await apiClient.get<Video>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a new video
   */
  async createVideo(data: CreateVideoData): Promise<ApiResponse<Video>> {
    return await apiClient.post<Video>(this.baseEndpoint, data);
  }

  /**
   * Update video metadata
   */
  async updateVideo(id: string, data: Partial<CreateVideoData>): Promise<ApiResponse<Video>> {
    return await apiClient.put<Video>(`${this.baseEndpoint}/${id}`, data);
  }

  /**
   * Delete a video
   */
  async deleteVideo(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Increment video views
   */
  async incrementViews(id: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`${this.baseEndpoint}/${id}/views`);
  }

  /**
   * Like/unlike a video
   */
  async toggleLike(id: string): Promise<ApiResponse<{ liked: boolean; likes: number }>> {
    return await apiClient.post<{ liked: boolean; likes: number }>(`${this.baseEndpoint}/${id}/like`);
  }

  /**
   * Share a video
   */
  async shareVideo(id: string): Promise<ApiResponse<{ shareUrl: string }>> {
    return await apiClient.post<{ shareUrl: string }>(`${this.baseEndpoint}/${id}/share`);
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(id: string): Promise<ApiResponse<{
    views: number;
    likes: number;
    shares: number;
    watchTime: number;
    engagement: number;
  }>> {
    return await apiClient.get<{
      views: number;
      likes: number;
      shares: number;
      watchTime: number;
      engagement: number;
    }>(`${this.baseEndpoint}/${id}/analytics`);
  }

  /**
   * Get Bunny CDN upload URL for direct upload
   */
  async getBunnyUploadUrl(title: string, description?: string): Promise<ApiResponse<{
    uploadUrl: string;
    videoId: string;
    bunnyVideoId: string;
  }>> {
    return await apiClient.post<{
      uploadUrl: string;
      videoId: string;
      bunnyVideoId: string;
    }>(`${this.baseEndpoint}/upload-url`, {
      title,
      description,
    });
  }

  /**
   * Upload video directly to Bunny CDN
   */
  async uploadVideoToBunny(
    uploadUrl: string,
    videoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{
    success: boolean;
    bunnyVideoId: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('file', videoFile);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: videoFile,
        headers: {
          'Content-Type': videoFile.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Extract video ID from upload URL or response
      const bunnyVideoId = uploadUrl.split('/').pop() || 'unknown';

      return {
        success: true,
        data: {
          success: true,
          bunnyVideoId,
        },
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Create video record in Supabase after successful upload
   */
  async createVideoRecord(data: {
    bunnyVideoId: string;
    title: string;
    description?: string;
    listingId?: string;
    category?: string;
    tags?: string[];
  }): Promise<ApiResponse<Video>> {
    return await apiClient.post<Video>(this.baseEndpoint, {
      bunny_video_id: data.bunnyVideoId,
      title: data.title,
      description: data.description,
      listing_id: data.listingId,
      category: data.category,
      tags: data.tags,
      status: 'processing',
    });
  }

  /**
   * Find video by Bunny CDN video ID
   */
  async findVideoByBunnyId(bunnyVideoId: string): Promise<ApiResponse<Video>> {
    return await apiClient.get<Video>(`${this.baseEndpoint}/bunny/${bunnyVideoId}`);
  }

  /**
   * Update video with HLS URL after encoding completion (webhook callback)
   */
  async updateVideoAfterEncoding(videoId: string, data: {
    hlsUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    status: 'active' | 'failed';
  }): Promise<ApiResponse<Video>> {
    return await apiClient.put<Video>(`${this.baseEndpoint}/${videoId}`, {
      hls_url: data.hlsUrl,
      thumbnail_url: data.thumbnailUrl,
      duration: data.duration,
      status: data.status,
    });
  }

  /**
   * Get Bunny CDN upload URL
   */
  async getUploadUrl(): Promise<ApiResponse<{ uploadUrl: string; videoId: string }>> {
    return await apiClient.get<{ uploadUrl: string; videoId: string }>(`${this.baseEndpoint}/upload-url`);
  }

  /**
   * Get feed videos with full metadata including listing information
   */
  async getFeedVideosWithMetadata(filters?: FeedFilters): Promise<PaginatedResponse<FeedVideo>> {
    const params: Record<string, string> = {
      page: '1',
      pageSize: '10',
      algorithm: 'for_you',
      include_listing: 'true', // Flag to include listing metadata
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([key, value]) => {
          if (key === 'location' && typeof value === 'object') {
            return [key, JSON.stringify(value)];
          }
          return [key, String(value)];
        })
      ),
    };

    return await apiClient.get<FeedVideo[]>(`${this.baseEndpoint}/feed/metadata`, params) as any;
  }

  /**
   * Get feed videos optimized for feed page
   */
  async getFeedVideos(filters?: FeedFilters): Promise<PaginatedResponse<FeedVideo>> {
    const params: Record<string, string> = {
      page: '1',
      pageSize: '10',
      algorithm: 'for_you',
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([key, value]) => {
          if (key === 'location' && typeof value === 'object') {
            return [key, JSON.stringify(value)];
          }
          return [key, String(value)];
        })
      ),
    };

    return await apiClient.get<FeedVideo[]>(`${this.baseEndpoint}/feed`, params) as any;
  }

  /**
   * Get next batch of feed videos for infinite scroll
   */
  async getNextFeedVideos(cursor?: string, filters?: FeedFilters): Promise<ApiResponse<{
    videos: FeedVideo[];
    nextCursor?: string;
    hasMore: boolean;
  }>> {
    const params: Record<string, string> = {
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([key, value]) => {
          if (key === 'location' && typeof value === 'object') {
            return [key, JSON.stringify(value)];
          }
          return [key, String(value)];
        })
      ),
    };

    if (cursor) {
      params.cursor = cursor;
    }

    return await apiClient.get<{
      videos: FeedVideo[];
      nextCursor?: string;
      hasMore: boolean;
    }>(`${this.baseEndpoint}/feed/next`, params);
  }

  /**
   * Mark video as viewed for algorithm optimization
   */
  async markVideoViewed(videoId: string, watchTime?: number): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`${this.baseEndpoint}/${videoId}/viewed`, {
      watchTime: watchTime?.toString(),
    });
  }

  /**
   * Get video recommendations based on current video
   */
  async getVideoRecommendations(videoId: string, limit = 5): Promise<ApiResponse<FeedVideo[]>> {
    return await apiClient.get<FeedVideo[]>(`${this.baseEndpoint}/${videoId}/recommendations`, {
      limit: limit.toString(),
    });
  }

  /**
   * Report video for inappropriate content
   */
  async reportVideo(videoId: string, reason: string, details?: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`${this.baseEndpoint}/${videoId}/report`, {
      reason,
      details,
    });
  }

  /**
   * Block user from video feed
   */
  async blockUser(userId: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`${this.baseEndpoint}/block-user`, { userId });
  }

  /**
   * Get trending videos
   */
  async getTrendingVideos(limit = 20): Promise<ApiResponse<FeedVideo[]>> {
    return await apiClient.get<FeedVideo[]>(`${this.baseEndpoint}/trending`, {
      limit: limit.toString(),
    });
  }

  /**
   * Get nearby videos based on location
   */
  async getNearbyVideos(lat: number, lng: number, radius = 10): Promise<ApiResponse<FeedVideo[]>> {
    return await apiClient.get<FeedVideo[]>(`${this.baseEndpoint}/nearby`, {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
  }

  /**
   * Get Bunny CDN HLS URL for video (automatic adaptive bitrate)
   */
  getBunnyHlsUrl(videoId: string): string {
    return `https://your-bunny-cdn.com/videos/${videoId}/playlist.m3u8`;
  }

  /**
   * Get Bunny CDN video URL with quality options
   */
  getBunnyVideoUrl(videoId: string, quality?: 'low' | 'medium' | 'high'): string {
    const baseUrl = `https://your-bunny-cdn.com/videos/${videoId}`;
    
    if (quality) {
      return `${baseUrl}_${quality}.mp4`;
    }
    
    return `${baseUrl}.mp4`;
  }
}

export const videosService = new VideosService();
