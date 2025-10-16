/**
 * API Client for Kikwetu Backend
 * Base URL: https://app.ki-kwetu.com/api/v1
 */

import { getAccessToken, getRefreshToken, setTokens } from '../utils/tokenManager';

const API_BASE_URL = 'https://app.ki-kwetu.com/api/v1';

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
    try {
      const data = await response.json();

      // If token expired, try to refresh
      if (response.status === 401 && data.error?.includes('expired')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          return data; // For now, return original response
        }
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
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
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const url = `${this.baseUrl}${endpoint}${queryString}`;

      const response = await fetch(url, { headers });
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET request failed:', error);
      return {
        success: false,
        error: 'Network request failed',
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
        error: 'Network request failed',
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
        error: 'Network request failed',
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
        error: 'Network request failed',
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
        error: 'Network request failed',
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse, PaginatedResponse };

