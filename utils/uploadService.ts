import { supabase } from '@/lib/supabase';
import { generateUniqueFilename, ProcessedImage } from './imageUtils';

// Import FileSystem for the upload service
import * as FileSystem from 'expo-file-system';

export type BucketType = 'listings' | 'profiles';

export interface UploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
}

export interface BatchUploadResult {
  results: UploadResult[];
  successCount: number;
  errorCount: number;
  totalSize: number;
}

/**
 * Upload a single processed image to Supabase storage
 */
export async function uploadImage(
  processedImage: ProcessedImage,
  bucket: BucketType,
  folder?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const filename = generateUniqueFilename(undefined, processedImage.format);
    const path = folder ? `${folder}/${filename}` : filename;

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(processedImage.uri);

    // Convert base64 to ArrayBuffer
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: `image/${processedImage.format}`,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        url: '',
        path: '',
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      success: true,
    };
  } catch (error) {
    console.error('Upload service error:', error);
    return {
      url: '',
      path: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload multiple processed images to Supabase storage
 */
export async function uploadImages(
  processedImages: ProcessedImage[],
  bucket: BucketType,
  folder?: string
): Promise<BatchUploadResult> {
  const results: UploadResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  let totalSize = 0;

  for (const processedImage of processedImages) {
    try {
      const result = await uploadImage(processedImage, bucket, folder);
      results.push(result);
      
      if (result.success) {
        successCount++;
        totalSize += processedImage.size;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error('Batch upload error:', error);
      results.push({
        url: '',
        path: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      errorCount++;
    }
  }

  return {
    results,
    successCount,
    errorCount,
    totalSize,
  };
}

/**
 * Delete an image from Supabase storage
 */
export async function deleteImage(bucket: BucketType, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete service error:', error);
    return false;
  }
}

/**
 * Delete multiple images from Supabase storage
 */
export async function deleteImages(bucket: BucketType, paths: string[]): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error('Batch delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Batch delete service error:', error);
    return false;
  }
}

/**
 * Get storage usage for a user
 */
export async function getStorageUsage(bucket: BucketType, userId?: string): Promise<{
  totalFiles: number;
  totalSize: number;
  usedQuota: number;
  maxQuota: number;
}> {
  try {
    // This would require a custom function in Supabase
    // For now, return mock data
    return {
      totalFiles: 0,
      totalSize: 0,
      usedQuota: 0,
      maxQuota: 100 * 1024 * 1024, // 100MB default quota
    };
  } catch (error) {
    console.error('Storage usage error:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      usedQuota: 0,
      maxQuota: 100 * 1024 * 1024,
    };
  }
}

/**
 * Check if user has enough storage quota
 */
export async function checkStorageQuota(
  bucket: BucketType,
  additionalSize: number,
  userId?: string
): Promise<{ hasQuota: boolean; remainingQuota: number }> {
  try {
    const usage = await getStorageUsage(bucket, userId);
    const remainingQuota = usage.maxQuota - usage.usedQuota;
    
    return {
      hasQuota: remainingQuota >= additionalSize,
      remainingQuota,
    };
  } catch (error) {
    console.error('Quota check error:', error);
    return {
      hasQuota: false,
      remainingQuota: 0,
    };
  }
}

/**
 * Generate folder path for organized storage
 */
export function generateFolderPath(bucket: BucketType, userId: string, listingId?: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  switch (bucket) {
    case 'listings':
      return listingId ? `listings/${userId}/${listingId}` : `listings/${userId}/${timestamp}`;
    case 'profiles':
      return `profiles/${userId}`;
    default:
      return `${bucket}/${userId}`;
  }
}
