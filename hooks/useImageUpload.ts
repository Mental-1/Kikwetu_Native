import { supabase } from '@/lib/supabase';
import { IMAGE_PRESETS, ProcessedImage, cleanupTempFiles, processImages } from '@/utils/imageUtils';
import { BatchUploadResult, BucketType, generateFolderPath, uploadImages } from '@/utils/uploadService';
import { useCallback, useState } from 'react';

export interface ImageUploadState {
  isProcessing: boolean;
  isUploading: boolean;
  progress: number;
  processedImages: ProcessedImage[];
  uploadResults: BatchUploadResult | null;
  error: string | null;
}

export interface UseImageUploadOptions {
  bucket: BucketType;
  userId?: string;
  listingId?: string;
  maxImages?: number;
  preset?: keyof typeof IMAGE_PRESETS;
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [state, setState] = useState<ImageUploadState>({
    isProcessing: false,
    isUploading: false,
    progress: 0,
    processedImages: [],
    uploadResults: null,
    error: null,
  });

  const processAndUploadImages = useCallback(async (imageUris: string[]) => {
    if (!options.userId) {
      setState(prev => ({ ...prev, error: 'User ID is required for upload' }));
      return null;
    }

    try {
      // Reset state
      setState({
        isProcessing: true,
        isUploading: false,
        progress: 0,
        processedImages: [],
        uploadResults: null,
        error: null,
      });

      // Validate image count
      if (imageUris.length > (options.maxImages || 10)) {
        throw new Error(`Maximum ${options.maxImages || 10} images allowed`);
      }

      // Process images
      const preset = options.preset ? IMAGE_PRESETS[options.preset] : IMAGE_PRESETS.LISTING;
      const processedImages = await processImages(imageUris, preset);
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        isUploading: true,
        processedImages,
        progress: 50 
      }));

      // Generate folder path
      const folder = generateFolderPath(options.bucket, options.userId, options.listingId);

      // Upload images
      const uploadResults = await uploadImages(processedImages, options.bucket, folder);

      setState(prev => ({ 
        ...prev, 
        isUploading: false,
        uploadResults,
        progress: 100 
      }));

      // Cleanup temporary files
      await cleanupTempFiles(processedImages.map(img => img.uri));

      return uploadResults;
    } catch (error) {
      console.error('Image upload error:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed' 
      }));
      return null;
    }
  }, [options]);

  const resetState = useCallback(() => {
    setState({
      isProcessing: false,
      isUploading: false,
      progress: 0,
      processedImages: [],
      uploadResults: null,
      error: null,
    });
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    processAndUploadImages,
    resetState,
    getCurrentUser,
  };
}

/**
 * Hook for managing listing images specifically
 */
export function useListingImageUpload(listingId?: string) {
  const [userId, setUserId] = useState<string | null>(null);

  const uploadHook = useImageUpload({
    bucket: 'listings',
    userId: userId || undefined,
    listingId,
    maxImages: 10,
    preset: 'LISTING',
  });

  const initializeUser = useCallback(async () => {
    if (!userId) {
      const currentUserId = await uploadHook.getCurrentUser();
      if (currentUserId) {
        setUserId(currentUserId);
      }
    }
  }, [userId, uploadHook]);

  return {
    ...uploadHook,
    initializeUser,
    userId,
  };
}

/**
 * Hook for managing profile images specifically
 */
export function useProfileImageUpload() {
  const [userId, setUserId] = useState<string | null>(null);

  const uploadHook = useImageUpload({
    bucket: 'profiles',
    userId: userId || undefined,
    maxImages: 1,
    preset: 'PROFILE',
  });

  const initializeUser = useCallback(async () => {
    if (!userId) {
      const currentUserId = await uploadHook.getCurrentUser();
      if (currentUserId) {
        setUserId(currentUserId);
      }
    }
  }, [userId, uploadHook]);

  return {
    ...uploadHook,
    initializeUser,
    userId,
  };
}
