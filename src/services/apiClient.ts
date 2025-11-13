/**
 * API Client for Kikwetu Backend
 * Base URL: https://app.ki-kwetu.com/api/v1
 */

import { getAccessToken, getRefreshToken, setTokens } from '../utils/tokenManager';

const API_BASE_URL = 'https://api.ki-kwetu.com/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      // Handle HTTP errors like 4xx, 5xx
      const errorText = await response.text();
      let errorData: ApiResponse<T>;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // If parsing fails, it's likely a plain text or HTML response from a server error.
        // Log the actual error for debugging, but don't expose it to the user.
        console.error("API Error - Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 1000)
        });

        errorData = {
          success: false,
          error: 'server_error',
          message: 'An unexpected error occurred. Please try again later.',
        };
      }

      // Special handling for token expiry
      if (response.status === 401 && (errorData.error?.includes('expired') || errorData.message?.includes('expired'))) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // This part is tricky. A full-fledged solution would re-try the original request.
          // For now, i'll return a specific error to let the caller know to retry.
          return { success: false, error: 'Token refreshed. Please retry the request.' };
        }
      }

      return errorData;
    }

    try {
      // Handle successful responses
      const text = await response.text();
      // Handle cases where the response body is empty but the request was successful
      if (text.length === 0) {
        return { success: true };
      }
      return JSON.parse(text) as ApiResponse<T>;
    } catch (error) {
      console.error('Failed to parse successful response:', error);
      return {
        success: false,
        error: 'Failed to parse server response.',
      };
    }
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        const refresh = await getRefreshToken();
        await setTokens(data.data.accessToken, refresh || '');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      // Filter out undefined or null params before creating the query string
      const filteredParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)) : {};
      const queryString = new URLSearchParams(filteredParams as Record<string, string>).toString();
      const url = `${this.baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;


      const response = await fetch(url, { headers });
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET request failed:', error);
      return {
        success: false,
        error: 'network_error',
        message: 'Could not connect to the server. Please check your internet connection.',
      };
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST request failed:', error);
      return {
        success: false,
        error: 'network_error',
        message: 'Could not connect to the server. Please check your internet connection.',
      };
    }
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      return {
        success: false,
        error: 'network_error',
        message: 'Could not connect to the server. Please check your internet connection.',
      };
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('PATCH request failed:', error);
      return {
        success: false,
        error: 'network_error',
        message: 'Could not connect to the server. Please check your internet connection.',
      };
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      return {
        success: false,
        error: 'network_error',
        message: 'Could not connect to the server. Please check your internet connection.',
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse, PaginatedResponse };
