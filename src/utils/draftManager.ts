import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DraftListing {
  id: string;
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
  videos: string[];
  tags: string[];
  store_id?: number;
  status: 'draft';
  created_at: string;
  updated_at: string;
}

const DRAFT_KEY_PREFIX = 'listing_draft_';
const DRAFTS_LIST_KEY = 'drafts_list';

/**
 * Save a listing as draft
 */
export async function saveDraft(draftData: Omit<DraftListing, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const draftId = `${DRAFT_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const now = new Date().toISOString();
    
    const draft: DraftListing = {
      ...draftData,
      id: draftId,
      status: 'draft',
      created_at: now,
      updated_at: now,
    };

    // Save the draft
    await AsyncStorage.setItem(draftId, JSON.stringify(draft));

    // Update the drafts list
    const draftsList = await getDraftsList();
    draftsList.unshift(draftId); // Add to beginning
    await AsyncStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(draftsList));

    return draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

/**
 * Update an existing draft
 */
export async function updateDraft(draftId: string, updates: Partial<DraftListing>): Promise<boolean> {
  try {
    const existingDraft = await getDraft(draftId);
    if (!existingDraft) {
      return false;
    }

    const updatedDraft: DraftListing = {
      ...existingDraft,
      ...updates,
      id: draftId,
      status: 'draft',
      created_at: existingDraft.created_at,
      updated_at: new Date().toISOString(),
    };

    await AsyncStorage.setItem(draftId, JSON.stringify(updatedDraft));
    return true;
  } catch (error) {
    console.error('Error updating draft:', error);
    return false;
  }
}

/**
 * Get a specific draft by ID
 */
export async function getDraft(draftId: string): Promise<DraftListing | null> {
  try {
    const draftData = await AsyncStorage.getItem(draftId);
    if (!draftData) {
      return null;
    }

    return JSON.parse(draftData);
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
}

/**
 * Get all saved drafts
 */
export async function getAllDrafts(): Promise<DraftListing[]> {
  try {
    const draftsList = await getDraftsList();
    const drafts: DraftListing[] = [];

    for (const draftId of draftsList) {
      const draft = await getDraft(draftId);
      if (draft) {
        drafts.push(draft);
      }
    }

    // Sort by updated_at descending
    return drafts.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch (error) {
    console.error('Error getting all drafts:', error);
    return [];
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<boolean> {
  try {
    // Remove the draft
    await AsyncStorage.removeItem(draftId);

    // Remove from drafts list
    const draftsList = await getDraftsList();
    const updatedList = draftsList.filter(id => id !== draftId);
    await AsyncStorage.setItem(DRAFTS_LIST_KEY, JSON.stringify(updatedList));

    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
}

/**
 * Clear all drafts
 */
export async function clearAllDrafts(): Promise<boolean> {
  try {
    const draftsList = await getDraftsList();
    
    // Remove all draft items
    for (const draftId of draftsList) {
      await AsyncStorage.removeItem(draftId);
    }

    // Clear the drafts list
    await AsyncStorage.removeItem(DRAFTS_LIST_KEY);

    return true;
  } catch (error) {
    console.error('Error clearing all drafts:', error);
    return false;
  }
}

/**
 * Get the list of draft IDs (internal helper)
 */
async function getDraftsList(): Promise<string[]> {
  try {
    const draftsListData = await AsyncStorage.getItem(DRAFTS_LIST_KEY);
    return draftsListData ? JSON.parse(draftsListData) : [];
  } catch (error) {
    console.error('Error getting drafts list:', error);
    return [];
  }
}

/**
 * Convert draft to listing data format
 */
export function draftToListingData(draft: DraftListing): any {
  return {
    title: draft.title,
    description: draft.description,
    price: draft.price,
    category_id: draft.category_id,
    subcategory_id: draft.subcategory_id,
    condition: draft.condition,
    location: draft.location,
    latitude: draft.latitude,
    longitude: draft.longitude,
    negotiable: draft.negotiable,
    images: draft.images,
    tags: draft.tags,
    store_id: draft.store_id,
    status: 'draft' as const,
  };
}

/**
 * Get draft count
 */
export async function getDraftCount(): Promise<number> {
  try {
    const draftsList = await getDraftsList();
    return draftsList.length;
  } catch (error) {
    console.error('Error getting draft count:', error);
    return 0;
  }
}
