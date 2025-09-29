import { apiClient, ApiResponse, PaginatedResponse, PaginationParams } from './api';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  subcategory?: string;
  condition: string;
  status: 'active' | 'pending' | 'rejected' | 'under-review' | 'sold' | 'draft' | 'expired';
  images: string[];
  views: number;
  userId: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  expiryDate?: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: number;
  subcategoryId?: number;
  condition: string;
  images?: string[];
  tags?: string[];
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  categoryId?: number;
  subcategoryId?: number;
  condition?: string;
  images?: string[];
  tags?: string[];
}

export interface ListingFilters {
  status?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  displayOrder: number;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

class ListingsService {
  private readonly baseEndpoint = '/listings';

  async getMyListings(
    filters?: ListingFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Listing>> {
    const params = {
      ...filters,
      ...pagination,
    };
    return apiClient.get<Listing[]>(`${this.baseEndpoint}/my-listings`, params) as Promise<PaginatedResponse<Listing>>;
  }

  async getListing(id: string): Promise<ApiResponse<Listing>> {
    return apiClient.get<Listing>(`${this.baseEndpoint}/${id}`);
  }

  async createListing(data: CreateListingData): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(this.baseEndpoint, data);
  }

  async updateListing(id: string, data: UpdateListingData): Promise<ApiResponse<Listing>> {
    return apiClient.put<Listing>(`${this.baseEndpoint}/${id}`, data);
  }

  async deleteListing(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  async renewListing(id: string, planId: string): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(`${this.baseEndpoint}/${id}/renew`, { planId });
  }

  async markAsSold(id: string): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(`${this.baseEndpoint}/${id}/mark-sold`);
  }

  async requestReview(id: string, notes?: string): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(`${this.baseEndpoint}/${id}/request-review`, { notes });
  }

  async uploadListingImages(listingId: string, images: FormData): Promise<ApiResponse<ListingImage[]>> {
    return apiClient.post<ListingImage[]>(`${this.baseEndpoint}/${listingId}/images`, images);
  }

  async deleteListingImage(listingId: string, imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${listingId}/images/${imageId}`);
  }

  async updateListingImagesOrder(listingId: string, imageIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${this.baseEndpoint}/${listingId}/images/order`, { imageIds });
  }

  async getListingStats(): Promise<ApiResponse<{
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    rejectedListings: number;
    expiredListings: number;
    totalViews: number;
  }>> {
    return apiClient.get<{
      totalListings: number;
      activeListings: number;
      pendingListings: number;
      rejectedListings: number;
      expiredListings: number;
      totalViews: number;
    }>(`${this.baseEndpoint}/stats`);
  }
}

export const listingsService = new ListingsService();
