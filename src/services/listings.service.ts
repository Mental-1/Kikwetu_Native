/**
 * Listings Service
 * Handles listing-related API calls
 */

import { ApiListing } from '../types/api.types';
import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

interface CreateListingData {
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
}

interface ListingFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  subcategory?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  status?: string;
}

class ListingsService {
  /**
   * Get all listings with filters
   */
  async getListings(filters?: ListingFilters): Promise<PaginatedResponse<ApiListing>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.pageSize) params.pageSize = filters.pageSize.toString();
      if (filters.category) params.category = filters.category;
      if (filters.subcategory) params.subcategory = filters.subcategory;
      if (filters.condition) params.condition = filters.condition;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
    }

    return await apiClient.get('/listings', params) as any;
  }

  /**
   * Get user's listings
   */
  async getUserListings(userId: string, filters?: ListingFilters): Promise<PaginatedResponse<ApiListing>> {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.page) params.page = filters.page.toString();
      if (filters.pageSize) params.pageSize = filters.pageSize.toString();
      if (filters.status) params.status = filters.status;
    }

    return await apiClient.get(`/listings/user/${userId}`, params) as any;
  }

  /**
   * Get single listing
   */
  async getListing(id: string): Promise<ApiResponse<ApiListing>> {
    return await apiClient.get<ApiListing>(`/listings/${id}`);
  }

  /**
   * Create listing
   */
  async createListing(data: CreateListingData): Promise<ApiResponse<ApiListing>> {
    return await apiClient.post<ApiListing>('/listings', data);
  }

  /**
   * Update listing
   */
  async updateListing(id: string, data: Partial<CreateListingData>): Promise<ApiResponse<ApiListing>> {
    return await apiClient.put<ApiListing>(`/listings/${id}`, data);
  }

  /**
   * Delete listing
   */
  async deleteListing(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/listings/${id}`);
  }

  /**
   * Update listing status
   */
  async updateListingStatus(id: string, status: string): Promise<ApiResponse<ApiListing>> {
    return await apiClient.patch<ApiListing>(`/listings/${id}/status`, { status });
  }

  /**
   * Search listings
   */
  async searchListings(query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<ApiListing>> {
    return await apiClient.get('/listings/search', {
      query,
      page: page.toString(),
      pageSize: pageSize.toString(),
    }) as any;
  }

  /**
   * Get nearby listings
   */
  async getNearbyListings(lat: number, lng: number, radius?: number, page = 1): Promise<PaginatedResponse<ApiListing>> {
    const params: Record<string, string> = {
      lat: lat.toString(),
      lng: lng.toString(),
      page: page.toString(),
    };

    if (radius) params.radius = radius.toString();

    return await apiClient.get('/listings/nearby', params) as any;
  }

  /**
   * Get similar listings
   */
  async getSimilarListings(id: string, limit = 10): Promise<ApiResponse<ApiListing[]>> {
    return await apiClient.get<ApiListing[]>(`/listings/${id}/similar`, {
      limit: limit.toString(),
    });
  }

  /**
   * Report listing
   */
  async reportListing(id: string, reason: string, details?: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/listings/${id}/report`, { reason, details });
  }
}

export const listingsService = new ListingsService();

