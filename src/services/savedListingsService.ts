import { apiClient, ApiResponse, PaginatedResponse, PaginationParams } from './api';

export interface SavedListing {
  id: string;
  listingId: string;
  userId: string;
  savedAt: string;
  notes?: string;
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    category: string;
    condition: string;
    status: string;
    images: string[];
    views: number;
    sellerName: string;
    sellerRating: number;
    isAvailable: boolean;
    createdAt: string;
  };
}

export interface SavedListingFilters {
  category?: string;
  isAvailable?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateSavedListingData {
  listingId: string;
  notes?: string;
}

export interface UpdateSavedListingData {
  notes?: string;
}

class SavedListingsService {
  private readonly baseEndpoint = '/saved-listings';

  async getSavedListings(
    filters?: SavedListingFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<SavedListing>> {
    const params = {
      ...filters,
      ...pagination,
    };
    return apiClient.get<SavedListing[]>(this.baseEndpoint, params) as Promise<PaginatedResponse<SavedListing>>;
  }

  async getSavedListing(id: string): Promise<ApiResponse<SavedListing>> {
    return apiClient.get<SavedListing>(`${this.baseEndpoint}/${id}`);
  }

  async saveListing(data: CreateSavedListingData): Promise<ApiResponse<SavedListing>> {
    return apiClient.post<SavedListing>(this.baseEndpoint, data);
  }

  async unsaveListing(listingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/listing/${listingId}`);
  }

  async updateSavedListing(id: string, data: UpdateSavedListingData): Promise<ApiResponse<SavedListing>> {
    return apiClient.put<SavedListing>(`${this.baseEndpoint}/${id}`, data);
  }

  async deleteSavedListing(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async clearAllSavedListings(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/clear-all`);
  }

  async checkIfSaved(listingId: string): Promise<ApiResponse<{ isSaved: boolean; savedListingId?: string }>> {
    return apiClient.get<{ isSaved: boolean; savedListingId?: string }>(`${this.baseEndpoint}/check/${listingId}`);
  }

  async getSavedListingsStats(): Promise<ApiResponse<{
    totalSaved: number;
    availableCount: number;
    soldCount: number;
    categoryCounts: Record<string, number>;
  }>> {
    return apiClient.get<{
      totalSaved: number;
      availableCount: number;
      soldCount: number;
      categoryCounts: Record<string, number>;
    }>(`${this.baseEndpoint}/stats`);
  }

  async exportSavedListings(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get<{ downloadUrl: string }>(`${this.baseEndpoint}/export`, { format });
  }
}

export const savedListingsService = new SavedListingsService();
