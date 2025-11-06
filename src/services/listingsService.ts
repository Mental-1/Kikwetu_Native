import { apiClient, ApiResponse, PaginatedResponse } from './api';

export interface Listing {
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
  store_id?: string;
  tags?: string[];
  status: 'draft' | 'active' | 'pending' | 'rejected' | 'under_review' | 'sold';
  payment_status?: 'pending' | 'completed' | 'failed';
  plan?: string;
  views?: number;
  expiry_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateListingData extends Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

export interface UpdateListingData extends Partial<CreateListingData> {}

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
  userId?: string;
}

export async function createListing(listingData: CreateListingData): Promise<ApiResponse<Listing>> {
  return apiClient.post<Listing>('/listings', listingData);
}

export async function updateListing(listingId: string, listingData: UpdateListingData): Promise<ApiResponse<Listing>> {
  return apiClient.put<Listing>(`/listings/${listingId}`, listingData);
}

export async function deleteListing(listingId: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/listings/${listingId}`);
}

export async function getUserListings(filters?: ListingFilters, page: number = 1): Promise<PaginatedResponse<Listing>> {
  return apiClient.get<Listing[]>('/listings/my-listings', { ...filters, page }) as unknown as PaginatedResponse<Listing>;
}

export async function getListingById(listingId: string): Promise<ApiResponse<Listing>> {
  return apiClient.get<Listing>(`/listings/${listingId}`);
}

export async function getListings(filters: ListingFilters = {}, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Listing>> {
  return apiClient.get<Listing[]>('/listings', { ...filters, page, limit }) as unknown as PaginatedResponse<Listing>;
}

export async function updateListingStatus(listingId: string, status: string): Promise<ApiResponse<Listing>> {
  return apiClient.patch<Listing>(`/listings/${listingId}/status`, { status });
}

export async function getListingStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/listings/stats');
}

export async function renewListing(id: string, planId: string): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(`/listings/${id}/renew`, { planId });
}

export async function markAsSold(id: string): Promise<ApiResponse<Listing>> {
    return apiClient.patch<Listing>(`/listings/${id}/sold`);
}

export async function requestReview(id: string, notes?: string): Promise<ApiResponse<Listing>> {
    return apiClient.post<Listing>(`/listings/${id}/request-review`, { notes });
}

export async function uploadListingImages(listingId: string, imageUris: string[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    imageUris.forEach(uri => {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('images', {
            uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        } as any);
    });
    return apiClient.post<string[]>(`/listings/${listingId}/images`, formData);
}

export async function deleteListingImage(listingId: string, imageUrl: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/listings/${listingId}/images?imageUrl=${imageUrl}`);
}

export const listingsService = {
    createListing,
    updateListing,
    deleteListing,
    getUserListings,
    getListingById,
    getListings,
    updateListingStatus,
    getListingStats,
    renewListing,
    markAsSold,
    requestReview,
    uploadListingImages,
    deleteListingImage,
};