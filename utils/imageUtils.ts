import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSize?: number; // in bytes
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number; // file size in bytes
  format: string;
}

export const DEFAULT_IMAGE_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  format: 'webp',
};

/**
 * Process and compress an image with WebP conversion
 */
export async function processImage(
  imageUri: string,
  options: ImageProcessingOptions = DEFAULT_IMAGE_OPTIONS
): Promise<ProcessedImage> {
  try {
    // Get original image info
    const originalInfo = await FileSystem.getInfoAsync(imageUri);
    if (!originalInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Check original file size
    const originalSize = 'size' in originalInfo ? originalInfo.size : 0;
    if (originalSize > (options.maxFileSize || DEFAULT_IMAGE_OPTIONS.maxFileSize!)) {
      throw new Error(`Image is too large. Maximum size: ${formatFileSize(options.maxFileSize || DEFAULT_IMAGE_OPTIONS.maxFileSize!)}`);
    }

    // Manipulate the image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: options.maxWidth || DEFAULT_IMAGE_OPTIONS.maxWidth,
            height: options.maxHeight || DEFAULT_IMAGE_OPTIONS.maxHeight,
          },
        },
      ],
      {
        compress: options.quality || DEFAULT_IMAGE_OPTIONS.quality,
        format: ImageManipulator.SaveFormat[options.format?.toUpperCase() as keyof typeof ImageManipulator.SaveFormat] || ImageManipulator.SaveFormat.WEBP,
      }
    );

    // Get processed image info
    const processedInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
    const processedSize = 'size' in processedInfo ? processedInfo.size : 0;

    // Check if processed image is still too large
    if (processedSize > (options.maxFileSize || DEFAULT_IMAGE_OPTIONS.maxFileSize!)) {
      // Try with lower quality
      const lowerQuality = ((options.quality || DEFAULT_IMAGE_OPTIONS.quality) || 0.8) * 0.7;
      const recompressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: options.maxWidth || DEFAULT_IMAGE_OPTIONS.maxWidth,
              height: options.maxHeight || DEFAULT_IMAGE_OPTIONS.maxHeight,
            },
          },
        ],
        {
          compress: lowerQuality,
          format: ImageManipulator.SaveFormat[options.format?.toUpperCase() as keyof typeof ImageManipulator.SaveFormat] || ImageManipulator.SaveFormat.WEBP,
        }
      );

      const recompressedInfo = await FileSystem.getInfoAsync(recompressedImage.uri);
      const recompressedSize = 'size' in recompressedInfo ? recompressedInfo.size : 0;

      if (recompressedSize > (options.maxFileSize || DEFAULT_IMAGE_OPTIONS.maxFileSize!)) {
        throw new Error(`Unable to compress image below ${formatFileSize(options.maxFileSize || DEFAULT_IMAGE_OPTIONS.maxFileSize!)}. Please try a smaller image.`);
      }

      return {
        uri: recompressedImage.uri,
        width: recompressedImage.width,
        height: recompressedImage.height,
        size: recompressedSize,
        format: options.format || 'webp',
      };
    }

    return {
      uri: manipulatedImage.uri,
      width: manipulatedImage.width,
      height: manipulatedImage.height,
      size: processedSize,
      format: options.format || 'webp',
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

/**
 * Process multiple images in batch
 */
export async function processImages(
  imageUris: string[],
  options: ImageProcessingOptions = DEFAULT_IMAGE_OPTIONS
): Promise<ProcessedImage[]> {
  const processedImages: ProcessedImage[] = [];
  
  for (const uri of imageUris) {
    try {
      const processed = await processImage(uri, options);
      processedImages.push(processed);
    } catch (error) {
      console.error(`Failed to process image ${uri}:`, error);
      throw error;
    }
  }
  
  return processedImages;
}

/**
 * Validate image file size
 */
export function validateImageSize(uri: string, maxSize: number = DEFAULT_IMAGE_OPTIONS.maxFileSize!): Promise<boolean> {
  return FileSystem.getInfoAsync(uri).then(info => {
    const size = 'size' in info ? info.size : 0;
    return size <= maxSize;
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { format: ImageManipulator.SaveFormat.PNG }
    );
    return { width: result.width, height: result.height };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw error;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(uris: string[]): Promise<void> {
  for (const uri of uris) {
    try {
      if (uri.startsWith('file://')) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.warn(`Failed to cleanup file ${uri}:`, error);
    }
  }
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName?: string, extension: string = 'webp'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}.${extension}`;
}

/**
 * Image processing presets for different use cases
 */
export const IMAGE_PRESETS = {
  // For listing images - high quality, larger size
  LISTING: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    format: 'webp' as const,
  },
  
  // For profile images - medium quality, smaller size
  PROFILE: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    format: 'webp' as const,
  },
  
  // For thumbnails - low quality, small size
  THUMBNAIL: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.6,
    maxFileSize: 500 * 1024, // 500KB
    format: 'webp' as const,
  },
};
