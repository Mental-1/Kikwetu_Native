import { z } from 'zod';

// Base listing validation schema
export const listingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,!?]+$/, 'Title contains invalid characters'),
  
  description: z
    .string()
    .min(1, 'Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  
  price: z
    .number()
    .min(1, 'Price must be greater than 0')
    .max(10000000, 'Price must be less than 10,000,000'),
  
  category_id: z
    .number()
    .min(1, 'Category is required'),
  
  subcategory_id: z
    .number()
    .min(1, 'Subcategory is required')
    .optional(),
  
  condition: z
    .string()
    .min(1, 'Condition is required')
    .refine(
      (val) => ['New', 'Like New', 'Good', 'Fair', 'Poor'].includes(val),
      'Invalid condition selected'
    ),
  
  location: z
    .string()
    .min(1, 'Location is required')
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must be less than 100 characters'),
  
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .nullable()
    .optional(),
  
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .nullable()
    .optional(),
  
  negotiable: z
    .boolean()
    .default(false),
  
  images: z
    .array(z.string())
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  videos: z
    .array(z.string())
    .max(3, 'Maximum 3 videos allowed')
    .default([]),
  
  tags: z
    .array(z.string())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),
  
  store_id: z
    .number()
    .nullable()
    .optional(),
});

// Step 1 validation (basic info)
export const step1Schema = z.object({
  title: listingSchema.shape.title,
  category_id: listingSchema.shape.category_id,
  subcategory_id: listingSchema.shape.subcategory_id,
  condition: listingSchema.shape.condition,
  price: listingSchema.shape.price,
  store_id: listingSchema.shape.store_id,
});

// Step 2 validation (media and location)
export const step2Schema = z.object({
  images: listingSchema.shape.images,
  videos: listingSchema.shape.videos,
  location: listingSchema.shape.location,
  latitude: listingSchema.shape.latitude,
  longitude: listingSchema.shape.longitude,
});

// Step 3 validation (description and tags)
export const step3Schema = z.object({
  description: listingSchema.shape.description,
  tags: listingSchema.shape.tags,
  negotiable: listingSchema.shape.negotiable,
});

// Validation functions
export function validateStep1(data: any) {
  try {
    return { success: true, data: step1Schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateStep2(data: any) {
  try {
    return { success: true, data: step2Schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateStep3(data: any) {
  try {
    return { success: true, data: step3Schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

export function validateCompleteListing(data: any) {
  try {
    return { success: true, data: listingSchema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.reduce((acc, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {} as Record<string, string>),
      };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Helper functions for specific validations
export function validatePrice(price: string | number): { valid: boolean; value?: number; error?: string } {
  try {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
    
    if (isNaN(numericPrice)) {
      return { valid: false, error: 'Invalid price format' };
    }
    
    if (numericPrice <= 0) {
      return { valid: false, error: 'Price must be greater than 0' };
    }
    
    if (numericPrice > 10000000) {
      return { valid: false, error: 'Price must be less than 10,000,000' };
    }
    
    return { valid: true, value: numericPrice };
  } catch (error) {
    return { valid: false, error: 'Invalid price format' };
  }
}

export function validateImages(images: string[]): { valid: boolean; error?: string } {
  if (!images || images.length === 0) {
    return { valid: false, error: 'At least one image is required' };
  }
  
  if (images.length > 10) {
    return { valid: false, error: 'Maximum 10 images allowed' };
  }
  
  // Check if all images are valid URIs
  const validImagePattern = /^(file:\/\/|content:\/\/|https?:\/\/)/;
  const invalidImages = images.filter(img => !validImagePattern.test(img));
  
  if (invalidImages.length > 0) {
    return { valid: false, error: 'Invalid image format detected' };
  }
  
  return { valid: true };
}

export function validateVideos(videos: string[]): { valid: boolean; error?: string } {
  if (videos && videos.length > 3) {
    return { valid: false, error: 'Maximum 3 videos allowed' };
  }
  
  // Check if all videos are valid URIs
  const validVideoPattern = /^(file:\/\/|content:\/\/|https?:\/\/)/;
  const invalidVideos = videos.filter(vid => !validVideoPattern.test(vid));
  
  if (invalidVideos.length > 0) {
    return { valid: false, error: 'Invalid video format detected' };
  }
  
  return { valid: true };
}

export function validateTags(tags: string[]): { valid: boolean; error?: string } {
  if (tags && tags.length > 10) {
    return { valid: false, error: 'Maximum 10 tags allowed' };
  }
  
  // Check tag format (alphanumeric with spaces and hyphens)
  const tagPattern = /^[a-zA-Z0-9\s\-]+$/;
  const invalidTags = tags.filter(tag => !tagPattern.test(tag) || tag.length < 2 || tag.length > 20);
  
  if (invalidTags.length > 0) {
    return { valid: false, error: 'Tags must be 2-20 characters, alphanumeric with spaces and hyphens only' };
  }
  
  return { valid: true };
}

// Type exports
export type ListingFormData = z.infer<typeof listingSchema>;
export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
export type ValidationResult = {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
};
