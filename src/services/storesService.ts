import { supabase } from '@/lib/supabase';
import { processImage, uploadImage } from '@/utils/imageUtils';
import { Database } from '@/utils/supabase/database.types';

export type Store = Database['public']['Tables']['stores']['Row'];
export type CreateStoreData = Omit<Database['public']['Tables']['stores']['Insert'], 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'slug'>;
export type UpdateStoreData = Partial<Database['public']['Tables']['stores']['Update']>;

export interface StoreWithDetails extends Store {
  social_links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface StoreImageData {
  banner_image?: string;
  profile_image?: string;
}

export interface StoreResponse {
  success: boolean;
  data?: Store | Store[];
  message?: string;
  error?: string;
}


/**
 * Validates store data before operations
 */
function validateStoreData(data: Partial<CreateStoreData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name && (!data.name.trim() || data.name.length < 2)) {
    errors.push('Store name must be at least 2 characters long');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Store name must be less than 100 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Store description must be less than 1000 characters');
  }

  if (data.category && data.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }

  if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
    errors.push('Invalid email format');
  }

  if ('slug' in data && data.slug && typeof data.slug === 'string' && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates a unique slug from store name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .trim();
}

/**
 * Uploads store images securely
 */
async function uploadStoreImages(
  bannerImageUri?: string,
  profileImageUri?: string
): Promise<{ banner_url?: string; profile_url?: string; error?: string }> {
  try {
    const result: { banner_url?: string; profile_url?: string } = {};

    if (bannerImageUri) {
      const processedBanner = await processImage(bannerImageUri, {
        format: 'webp',
        maxWidth: 800,
        maxHeight: 300,
        quality: 0.8,
      });

      if (processedBanner) {
        const bannerUpload = await uploadImage(
          processedBanner.uri,
          'stores',
          `banners/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        );

        if (bannerUpload.success) {
          result.banner_url = bannerUpload.data?.url;
        }
      }
    }

    if (profileImageUri) {
      const processedProfile = await processImage(profileImageUri, {
        format: 'webp',
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
      });

      if (processedProfile) {
        const profileUpload = await uploadImage(
          processedProfile.uri,
          'stores',
          `profiles/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`
        );

        if (profileUpload.success) {
          result.profile_url = profileUpload.data?.url;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error uploading store images:', error);
    return { error: 'Failed to upload images' };
  }
}

/**
 * Fetches all stores for the authenticated user
 */
export async function getUserStores(): Promise<Store[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user stores:', error);
      throw new Error('Failed to fetch stores');
    }

    return data || [];
  } catch (error) {
    console.error('getUserStores error:', error);
    throw error;
  }
}

/**
 * Fetches a single store by ID
 */
export async function getStoreById(storeId: string): Promise<Store | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .eq('owner_id', user.id) 
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; 
      }
      console.error('Error fetching store:', error);
      throw new Error('Failed to fetch store');
    }

    return data;
  } catch (error) {
    console.error('getStoreById error:', error);
    throw error;
  }
}

/**
 * Creates a new store
 */
export async function createStore(
  storeData: CreateStoreData,
  images?: StoreImageData
): Promise<StoreResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const validation = validateStoreData(storeData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    let imageUrls: { banner_url?: string; profile_url?: string } = {};
    if (images?.banner_image || images?.profile_image) {
      const uploadResult = await uploadStoreImages(
        images.banner_image,
        images.profile_image
      );
      
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error
        };
      }
      
      imageUrls = uploadResult;
    }

    const slug = generateSlug(storeData.name);

    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStore) {
      return {
        success: false,
        error: 'A store with this name already exists'
      };
    }

    const storeInsertData: Database['public']['Tables']['stores']['Insert'] = {
      ...storeData,
      ...imageUrls,
      slug,
      owner_id: user.id,
      is_active: storeData.is_active ?? true,
      follower_count: 0,
      total_products: 0,
      total_sales: 0,
      total_ratings: 0,
      average_rating: null,
      like_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('stores')
      .insert(storeInsertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating store:', error);
      return {
        success: false,
        error: 'Failed to create store'
      };
    }

    return {
      success: true,
      data: data as Store,
      message: 'Store created successfully'
    };
  } catch (error) {
    console.error('createStore error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Updates an existing store
 */
export async function updateStore(
  storeId: string,
  storeData: UpdateStoreData,
  images?: StoreImageData
): Promise<StoreResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Validate input data
    const validation = validateStoreData(storeData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Check if store exists and user owns it
    const existingStore = await getStoreById(storeId);
    if (!existingStore) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    // Upload images if provided
    let imageUrls: { banner_url?: string; profile_url?: string } = {};
    if (images?.banner_image || images?.profile_image) {
      const uploadResult = await uploadStoreImages(
        images.banner_image,
        images.profile_image
      );
      
      if (uploadResult.error) {
        return {
          success: false,
          error: uploadResult.error
        };
      }
      
      imageUrls = uploadResult;
    }

    // Generate slug if name changed
    let slug = storeData.slug;
    if (storeData.name && storeData.name !== existingStore.name) {
      slug = generateSlug(storeData.name);
      
      
      const { data: slugExists } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .neq('id', storeId)
        .single();

      if (slugExists) {
        slug = `${slug}-${Date.now()}`; 
      }
    }

    // Prepare update data
    const updateData: Database['public']['Tables']['stores']['Update'] = {
      ...storeData,
      ...imageUrls,
      slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', storeId)
      .eq('owner_id', user.id) 
      .select()
      .single();

    if (error) {
      console.error('Error updating store:', error);
      return {
        success: false,
        error: 'Failed to update store'
      };
    }

    return {
      success: true,
      data: data as Store,
      message: 'Store updated successfully'
    };
  } catch (error) {
    console.error('updateStore error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Deletes a store
 */
export async function deleteStore(storeId: string): Promise<StoreResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Check if store exists and user owns it
    const existingStore = await getStoreById(storeId);
    if (!existingStore) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId)
      .eq('owner_id', user.id); // Security: Only allow deleting own stores

    if (error) {
      console.error('Error deleting store:', error);
      return {
        success: false,
        error: 'Failed to delete store'
      };
    }

    return {
      success: true,
      message: 'Store deleted successfully'
    };
  } catch (error) {
    console.error('deleteStore error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Toggles store active status
 */
export async function toggleStoreStatus(storeId: string): Promise<StoreResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Get current store status
    const store = await getStoreById(storeId);
    if (!store) {
      return {
        success: false,
        error: 'Store not found'
      };
    }

    const { data, error } = await supabase
      .from('stores')
      .update({
        is_active: !store.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling store status:', error);
      return {
        success: false,
        error: 'Failed to update store status'
      };
    }

    return {
      success: true,
      data: data as Store,
      message: `Store ${!store.is_active ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('toggleStoreStatus error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Gets store statistics
 */
export async function getStoreStats(storeId: string): Promise<{
  total_products: number;
  total_views: number;
  total_sales: number;
  average_rating: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify store ownership
    const store = await getStoreById(storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Get listing statistics for this store
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, views, price')
      .eq('store_id', storeId)
      .eq('status', 'active');

    if (listingsError) {
      console.error('Error fetching store listings:', listingsError);
      throw new Error('Failed to fetch store statistics');
    }

    const total_products = listings?.length || 0;
    const total_views = listings?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;
    const total_sales = listings?.reduce((sum, listing) => sum + (listing.price || 0), 0) || 0;

    // Calculate average rating (placeholder - implement when reviews are available)
    const average_rating = store.average_rating || 0;

    return {
      total_products,
      total_views,
      total_sales,
      average_rating,
    };
  } catch (error) {
    console.error('getStoreStats error:', error);
    throw error;
  }
}

// Export all functions as a service object
export const storesService = {
  getUserStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
  getStoreStats,
};