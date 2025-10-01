import { supabase } from '@/lib/supabase';

export interface Store {
  id: number;
  name: string;
  description?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreData {
  name: string;
  description?: string;
}

/**
 * Get all stores for the current user
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
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Stores service error:', error);
    throw error;
  }
}

/**
 * Get a single store by ID
 */
export async function getStoreById(storeId: number): Promise<Store | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching store:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Store service error:', error);
    return null;
  }
}

/**
 * Create a new store
 */
export async function createStore(storeData: CreateStoreData): Promise<Store | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: storeData.name,
        description: storeData.description,
        owner_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating store:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Create store service error:', error);
    throw error;
  }
}

/**
 * Update a store
 */
export async function updateStore(storeId: number, storeData: Partial<CreateStoreData>): Promise<Store | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .update({
        ...storeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating store:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Update store service error:', error);
    throw error;
  }
}

/**
 * Delete a store (soft delete)
 */
export async function deleteStore(storeId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('stores')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storeId);

    if (error) {
      console.error('Error deleting store:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete store service error:', error);
    return false;
  }
}
