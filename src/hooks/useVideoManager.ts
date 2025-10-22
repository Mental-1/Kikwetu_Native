/**
 * Video Manager Hook
 * Client-side video preloading and memory management
 * Follows TikTok/YouTube Shorts best practices
 */

import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface VideoManagerConfig {
  preloadRange?: number; // Number of videos to preload before/after current
  maxPreloadedVideos?: number; // Maximum videos to keep in memory
  preloadDuration?: number; // Duration to preload in seconds
}

export interface ManagedVideo {
  id: string;
  videoUrl: string;
  hlsUrl?: string;
  player?: any;
  isPreloaded: boolean;
  isPlaying: boolean;
  isVisible: boolean;
}

export interface VideoManagerReturn {
  videos: ManagedVideo[];
  currentVideoId: string | null;
  setCurrentVideoId: (videoId: string) => void;
  preloadAdjacentVideos: (currentIndex: number) => void;
  cleanupVideo: (videoId: string) => void;
  cleanupAllVideos: () => void;
  getVideoPlayer: (videoId: string) => any;
  isVideoPreloaded: (videoId: string) => boolean;
}

export function useVideoManager(
  videoData: { id: string; videoUrl: string; hlsUrl?: string }[],
  config: VideoManagerConfig = {}
): VideoManagerReturn {
  const {
    preloadRange = 2, // 2 before, 1 current, 2 after
  } = config;

  const [videos, setVideos] = useState<ManagedVideo[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const preloadedVideosRef = useRef<Map<string, any>>(new Map());
  const playersRef = useRef<Map<string, any>>(new Map());

  // Initialize videos from data
  useEffect(() => {
    const managedVideos: ManagedVideo[] = videoData.map(video => ({
      id: video.id,
      videoUrl: video.videoUrl,
      hlsUrl: video.hlsUrl,
      isPreloaded: false,
      isPlaying: false,
      isVisible: false,
    }));
    setVideos(managedVideos);
  }, [videoData]);

  // Get video player (create if doesn't exist)
  const getVideoPlayer = useCallback((videoId: string) => {
    if (playersRef.current.has(videoId)) {
      return playersRef.current.get(videoId);
    }

    const video = videos.find(v => v.id === videoId);
    if (!video) return null;

    // Use HLS URL if available, fallback to regular video URL
    const videoUrl = video.hlsUrl || video.videoUrl;
    
    // Note: This is a placeholder - actual implementation would need to be done
    // in the component where useVideoPlayer can be called
    console.log('Video URL for preloading:', videoUrl);
    return null;
  }, [videos]);

  // Preload video
  const preloadVideo = useCallback((videoId: string) => {
    if (preloadedVideosRef.current.has(videoId)) {
      return; // Already preloaded
    }

    const player = getVideoPlayer(videoId);
    if (!player) return;

    // Preload the video
    player.preload = true;
    preloadedVideosRef.current.set(videoId, {
      player,
      preloadedAt: Date.now(),
    });

    // Update video state
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isPreloaded: true }
        : video
    ));
  }, [getVideoPlayer]);

  // Unload video
  const unloadVideo = useCallback((videoId: string) => {
    const preloadedVideo = preloadedVideosRef.current.get(videoId);
    if (preloadedVideo) {
      // Release player resources
      preloadedVideo.player.release?.();
      preloadedVideosRef.current.delete(videoId);
    }

    // Remove player from ref
    playersRef.current.delete(videoId);

    // Update video state
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, isPreloaded: false, isPlaying: false }
        : video
    ));
  }, []);

  // Preload adjacent videos using sliding window pattern
  const preloadAdjacentVideos = useCallback((currentIndex: number) => {
    const startIndex = Math.max(0, currentIndex - preloadRange);
    const endIndex = Math.min(videos.length - 1, currentIndex + preloadRange);

    // Preload videos in range
    for (let i = startIndex; i <= endIndex; i++) {
      if (i !== currentIndex) {
        preloadVideo(videos[i].id);
      }
    }

    // Cleanup videos outside range to manage memory
    const cleanupStartIndex = Math.max(0, currentIndex - preloadRange - 1);
    const cleanupEndIndex = Math.min(videos.length - 1, currentIndex + preloadRange + 1);

    videos.forEach((video, index) => {
      if (index < cleanupStartIndex || index > cleanupEndIndex) {
        if (video.isPreloaded) {
          unloadVideo(video.id);
        }
      }
    });
  }, [videos, preloadRange, preloadVideo, unloadVideo]);

  // Cleanup specific video
  const cleanupVideo = useCallback((videoId: string) => {
    unloadVideo(videoId);
  }, [unloadVideo]);

  // Cleanup all videos
  const cleanupAllVideos = useCallback(() => {
    preloadedVideosRef.current.forEach((_, videoId) => {
      unloadVideo(videoId);
    });
    preloadedVideosRef.current.clear();
    playersRef.current.clear();
  }, [unloadVideo]);

  // Check if video is preloaded
  const isVideoPreloaded = useCallback((videoId: string) => {
    return preloadedVideosRef.current.has(videoId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAllVideos();
    };
  }, [cleanupAllVideos]);

  return {
    videos,
    currentVideoId,
    setCurrentVideoId,
    preloadAdjacentVideos,
    cleanupVideo,
    cleanupAllVideos,
    getVideoPlayer,
    isVideoPreloaded,
  };
}

/**
 * Hook for individual video component with optimized playback
 */
export function useOptimizedVideoPlayer(
  videoUrl: string,
  hlsUrl?: string,
  isActive: boolean = false,
  isMuted: boolean = true
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  
  // Use HLS URL if available, fallback to regular video URL
  const finalVideoUrl = hlsUrl || videoUrl;
  
  const player = useVideoPlayer(finalVideoUrl, player => {
    player.loop = true;
    player.muted = isMuted;
    player.volume = isMuted ? 0 : 0.8;
  });

  // Handle play/pause based on active state
  useEffect(() => {
    if (isActive) {
      player.play();
      setIsPlaying(true);
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, [isActive, player]);

  // Handle mute state changes
  useEffect(() => {
    player.muted = isMuted;
    player.volume = isMuted ? 0 : 0.8;
  }, [isMuted, player]);

  // Preload video when component mounts
  useEffect(() => {
    if (!isPreloaded) {
      // Note: preload property may not exist on all video players
      // This is a placeholder for the actual preload implementation
      setIsPreloaded(true);
    }
  }, [player, isPreloaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      player.release?.();
    };
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [player]);

  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    player.muted = newMutedState;
    player.volume = newMutedState ? 0 : 0.8;
  }, [isMuted, player]);

  return {
    player,
    isPlaying,
    isPreloaded,
    togglePlayPause,
    toggleMute,
  };
}
