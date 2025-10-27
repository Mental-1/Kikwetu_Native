/**
 * Saved Listings Service
 * Handles saved listings API calls
 */

import { ApiSavedListing } from '../types/api.types';
import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

class SavedListingsService {
  /**
   * Get saved listings
   */
  async getSavedListings(page = 1, pageSize = 20): Promise<PaginatedResponse<ApiSavedListing>> {
    return await apiClient.get('/saved-listings', {
      page: page.toString(),
      pageSize: pageSize.toString(),
    }) as any;
  }

  /**
   * Save a listing
   */
  async saveListing(listingId: string, notes?: string): Promise<ApiResponse<ApiSavedListing>> {
    return await apiClient.post<ApiSavedListing>('/saved-listings', { listingId, notes });
  }

  /**
   * Unsave a listing by listing ID
   */
  async unsaveListing(listingId: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/saved-listings/listing/${listingId}`);
  }

  /**
   * Delete saved listing by saved listing ID
   */
  async deleteSavedListing(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/saved-listings/${id}`);
  }

  /**
   * Update saved listing notes
   */
  async updateSavedListing(id: string, notes: string): Promise<ApiResponse<ApiSavedListing>> {
    return await apiClient.put<ApiSavedListing>(`/saved-listings/${id}`, { notes });
  }

  /**
   * Clear all saved listings
   */
  async clearAllSavedListings(): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>('/saved-listings/clear-all');
  }

  /**
   * Check if listing is saved
   */
  async checkIfSaved(listingId: string): Promise<ApiResponse<{ isSaved: boolean; savedListingId?: string }>> {
    return await apiClient.get<{ isSaved: boolean; savedListingId?: string }>(
      `/saved-listings/check/${listingId}`
    );
  }

  /**
   * Get saved listings stats
   */
  async getStats(): Promise<ApiResponse<{ totalSaved: number }>> {
    return await apiClient.get<{ totalSaved: number }>('/saved-listings/stats');
  }

  /**
   * Export saved listings
   */
  async exportSavedListings(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return await apiClient.get<{ downloadUrl: string }>('/saved-listings/export/data', { format });
  }
}

export const savedListingsService = new SavedListingsService();

