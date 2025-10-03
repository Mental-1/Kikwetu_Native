import { supabase } from '@/lib/supabase';

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category_id: number;
  subcategory_id?: number;
  condition: string;
  location: string;
  latitude?: number;
  longitude?: number;
  negotiable: boolean;
  images: string[];
  store_id?: number;
  tags?: string[];
  status: 'draft' | 'active' | 'pending' | 'rejected' | 'under_review';
  payment_status?: 'pending' | 'completed' | 'failed';
  plan?: string;
  views?: number;
  expiry_date?: string;
}

export interface UpdateListingData extends Partial<CreateListingData> {
  id: string;
}

export interface ListingFilters {
  category_id?: number;
  subcategory_id?: number;
  condition?: string;
  location?: string;
  price_min?: number;
  price_max?: number;
  negotiable?: boolean;
  status?: string;
  search?: string;
}

/**
 * Create a new listing
 */
export async function createListing(listingData: CreateListingData): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        user_id: user.id,
        views: 0,
        expiry_date: expiryDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Create listing service error:', error);
    throw error;
  }
}

/**
 * Update an existing listing
 */
export async function updateListing(listingId: string, listingData: Partial<CreateListingData>): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('listings')
      .update({
        ...listingData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('user_id', user.id) // Ensure user can only update their own listings
      .select()
      .single();

    if (error) {
      console.error('Error updating listing:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Update listing service error:', error);
    throw error;
  }
}

/**
 * Delete a listing (soft delete by setting status to 'deleted')
 */
export async function deleteListing(listingId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('listings')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('user_id', user.id); // Ensure user can only delete their own listings

    if (error) {
      console.error('Error deleting listing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete listing service error:', error);
    return false;
  }
}

/**
 * Get user's listings with optional filters
 */
export async function getUserListings(filters?: ListingFilters): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('listings')
      .select(`
        *,
        category:categories(name),
        subcategory:subcategories(name)
      `)
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.subcategory_id) query = query.eq('subcategory_id', filters.subcategory_id);
      if (filters.condition) query = query.eq('condition', filters.condition);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.price_min) query = query.gte('price', filters.price_min);
      if (filters.price_max) query = query.lte('price', filters.price_max);
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user listings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Get user listings service error:', error);
    throw error;
  }
}

/**
 * Get a single listing by ID
 */
export async function getListingById(listingId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        category:categories(name),
        subcategory:subcategories(name),
        store:stores(name, description)
      `)
      .eq('id', listingId)
      .neq('status', 'deleted')
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get listing service error:', error);
    return null;
  }
}

/**
 * Update listing status (for admin or user actions)
 */
export async function updateListingStatus(listingId: string, status: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('listings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating listing status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Update listing status service error:', error);
    return false;
  }
}