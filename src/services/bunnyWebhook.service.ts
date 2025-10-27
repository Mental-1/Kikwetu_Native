/**
 * Bunny CDN Webhook Handler Service
 * Handles encoding completion callbacks from Bunny CDN
 * For React Native - this would typically be handled by your backend API
 */

import { videosService } from './videos.service';

export interface BunnyWebhookPayload {
  videoId: string;
  status: 'processing' | 'completed' | 'failed';
  hlsUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

export class BunnyWebhookService {
  /**
   * Process webhook payload from Bunny CDN
   * This method should be called by your backend API when receiving Bunny CDN webhooks
   */
  static async processWebhook(payload: BunnyWebhookPayload): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Validate webhook payload
      if (!payload.videoId || !payload.status) {
        return {
          success: false,
          error: 'Invalid webhook payload',
        };
      }

      // Find the video record by bunny_video_id
      const videoResponse = await videosService.findVideoByBunnyId(payload.videoId);
      
      if (!videoResponse.success || !videoResponse.data) {
        console.error('Video not found for bunny_video_id:', payload.videoId);
        return {
          success: false,
          error: 'Video not found',
        };
      }

      const video = videoResponse.data;
      
      if (payload.status === 'completed') {
        // Update video with HLS URL and mark as active
        const updateData = {
          hlsUrl: payload.hlsUrl || '',
          thumbnailUrl: payload.thumbnailUrl,
          duration: payload.duration,
          status: 'active' as const,
        };

        const response = await videosService.updateVideoAfterEncoding(
          video.id,
          updateData
        );

        if (!response.success) {
          console.error('Failed to update video after encoding:', response.error);
          return {
            success: false,
            error: 'Failed to update video',
          };
        }

        console.log(`Video ${video.id} (bunny: ${payload.videoId}) encoding completed successfully`);
        
      } else if (payload.status === 'failed') {
        // Mark video as failed
        const updateData = {
          hlsUrl: '',
          status: 'failed' as const,
        };

        const response = await videosService.updateVideoAfterEncoding(
          video.id,
          updateData
        );

        if (!response.success) {
          console.error('Failed to mark video as failed:', response.error);
          return {
            success: false,
            error: 'Failed to update video status',
          };
        }

        console.log(`Video ${video.id} (bunny: ${payload.videoId}) encoding failed:`, payload.error);
      }

      return { success: true };
      
    } catch (error) {
      console.error('Webhook handler error:', error);
      return {
        success: false,
        error: 'Internal server error',
      };
    }
  }

  /**
   * Get webhook URL for Bunny CDN configuration
   * This URL should be configured in your Bunny CDN dashboard
   */
  static getWebhookUrl(): string {
    // Replace with your actual backend API endpoint
    return 'https://your-backend-api.com/api/webhooks/bunny-cdn';
  }

  /**
   * Validate webhook signature (if Bunny CDN provides one)
   * This helps ensure the webhook is actually from Bunny CDN
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // Implement signature validation based on Bunny CDN's method
    // This is a placeholder - check Bunny CDN documentation for actual implementation
    return true;
  }
}

export const bunnyWebhookService = new BunnyWebhookService();
