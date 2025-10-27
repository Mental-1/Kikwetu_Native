import { supabase } from '@/lib/supabase';
import { File } from 'expo-file-system';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Upload a single image to Supabase Storage
 */
export async function uploadImage(
  imageUri: string,
  options: UploadOptions = {}
): Promise<UploadResult | null> {
  try {
    const { bucket = 'listings', folder = 'images', onProgress } = options;
    
    // Get file info using the modern File API
    const file = new File(imageUri);
    const fileInfo = await file.info();
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = imageUri.split('.').pop() || 'jpg';
    const filename = `${timestamp}_${randomString}.${extension}`;
    const filePath = folder ? `${folder}/${filename}` : filename;

    // Read file as blob directly
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (onProgress) {
      onProgress({
        loaded: fileInfo.size || 0,
        total: fileInfo.size || 0,
        percentage: 100,
      });
    }

    return {
      url: urlData.publicUrl,
      filename,
      size: fileInfo.size || 0,
      type: `image/${extension}`,
    };
  } catch (error) {
    console.error('Upload image utility error:', error);
    throw error;
  }
}

/**
 * Upload multiple images with progress tracking
 */
export async function uploadImages(
  imageUris: string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  try {
    const results: UploadResult[] = [];
    const totalImages = imageUris.length;

    for (let i = 0; i < totalImages; i++) {
      try {
        const result = await uploadImage(imageUris[i], {
          ...options,
          onProgress: (progress) => {
            if (options.onProgress) {
              // Calculate overall progress across all images
              const overallProgress = {
                loaded: (i * 100) + progress.percentage,
                total: totalImages * 100,
                percentage: Math.round(((i * 100) + progress.percentage) / totalImages),
              };
              options.onProgress!(overallProgress);
            }
          },
        });

        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }

    return results;
  } catch (error) {
    console.error('Upload images utility error:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'listings'
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete image utility error:', error);
    return false;
  }
}

/**
 * Delete multiple images from Supabase Storage
 */
export async function deleteImages(
  imageUrls: string[],
  bucket: string = 'listings'
): Promise<boolean> {
  try {
    const filePaths = imageUrls.map(url => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    });

    const { error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      console.error('Error deleting images:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete images utility error:', error);
    return false;
  }
}

/**
 * Compress image for upload (basic implementation)
 * In a production app, you might want to use a more sophisticated compression library
 */
export async function compressImage(
  imageUri: string,
  quality: number = 0.8
): Promise<string> {
  try {
    // For now, return the original URI
    // In production, implement actual compression using a library like expo-image-manipulator
    return imageUri;
  } catch (error) {
    console.error('Compress image utility error:', error);
    return imageUri;
  }
}
