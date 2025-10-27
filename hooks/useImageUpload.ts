import { supabase } from '@/lib/supabase';
import { IMAGE_PRESETS, ProcessedImage, cleanupTempFiles, processImages } from '@/utils/imageUtils';
import { BatchUploadResult, BucketType, generateFolderPath, uploadImages } from '@/utils/uploadService';
import { useCallback, useState, useRef } from 'react';

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

  const processedUrisRef = useRef<string[]>([]);

  const processAndUploadImages = useCallback(async (imageUris: string[]) => {
    if (state.isProcessing || state.isUploading) return null;
    const resolvedUserId =
      options.userId ??
      (await supabase.auth.getUser().then(r => r.data.user?.id).catch(() => null));
    if (!resolvedUserId) {
      setState(prev => ({ ...prev, error: 'User ID is required for upload' }));
      return null;
    }

    try {
      setState(prev => ({
        ...prev,
        isProcessing: true,
        isUploading: false,
        progress: 0,
        processedImages: [],
        uploadResults: null,
        error: null,
      }));

      if (imageUris.length > (options.maxImages || 10)) {
        throw new Error(`Maximum ${options.maxImages || 10} images allowed`);
      }

      const preset = options.preset ? IMAGE_PRESETS[options.preset] : IMAGE_PRESETS.LISTING;
      let processedImagesLocal = await processImages(imageUris, preset);
      processedUrisRef.current = processedImagesLocal.map(img => img.uri);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        isUploading: true,
        processedImages: processedImagesLocal,
        progress: 50 
      }));

      const folder = generateFolderPath(options.bucket, resolvedUserId, options.listingId);

      const uploadResults = await uploadImages(processedImagesLocal, options.bucket, folder);

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadResults,
        progress: 100 
      }));

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
    } finally {
      try {
        if (processedUrisRef.current.length) {
          await cleanupTempFiles(processedUrisRef.current);
        }
      } catch (cleanupError) {
        console.error('Error during image cleanup:', cleanupError);
      }
    }
  }, [options, state.isProcessing, state.isUploading]);
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

  const processAndUploadImagesWithUserCheck = useCallback(async (imageUris: string[]) => {
    await initializeUser();
    return uploadHook.processAndUploadImages(imageUris);
  }, [initializeUser, uploadHook]);

  return {
    ...uploadHook,
    processAndUploadImages: processAndUploadImagesWithUserCheck,
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

  const processAndUploadImagesWithUserCheck = useCallback(async (imageUris: string[]) => {
    await initializeUser();
    return uploadHook.processAndUploadImages(imageUris);
  }, [initializeUser, uploadHook]);

  return {
    ...uploadHook,
    processAndUploadImages: processAndUploadImagesWithUserCheck,
    initializeUser,
    userId,
  };
}
