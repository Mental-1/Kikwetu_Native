import {
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  setTokens,
} from "../utils/tokenManager";

const API_BASE_URL = "https://api.ki-kwetu.com/v1";

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

interface RequestConfig {
  skipAuth?: boolean;
  retryCount?: number;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      if (isTokenExpired(token)) {
        const refreshed = await this.ensureValidToken();
        if (refreshed) {
          const newToken = await getAccessToken();
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
          }
        }
      } else {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async ensureValidToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async handleResponse<T>(
    response: Response,
    originalRequest: () => Promise<Response>,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const retryCount = config.retryCount || 0;

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: ApiResponse<T>;

      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error("API Error - Non-JSON response received:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 1000),
        });

        errorData = {
          success: false,
          error: "server_error",
          message: "An unexpected error occurred. Please try again later.",
        };
      }

      if (response.status === 401 && retryCount < 1) {
        const refreshed = await this.ensureValidToken();
        if (refreshed) {
          try {
            const retryResponse = await originalRequest();
            return await this.handleResponse<T>(
              retryResponse,
              originalRequest,
              {
                ...config,
                retryCount: retryCount + 1,
              },
            );
          } catch (retryError) {
            console.error("Retry request failed:", retryError);
          }
        }
      }

      return errorData;
    }

    try {
      const text = await response.text();
      if (text.length === 0) {
        return { success: true };
      }
      return JSON.parse(text) as ApiResponse<T>;
    } catch (error) {
      console.error("Failed to parse successful response:", error);
      return {
        success: false,
        error: "Failed to parse server response.",
      };
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        await setTokens(
          data.data.access_token,
          data.data.refresh_token || refreshToken,
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = config?.skipAuth
        ? { "Content-Type": "application/json" }
        : await this.getAuthHeaders();
      const filteredParams = params
        ? Object.fromEntries(
          Object.entries(params).filter(([_, v]) =>
            v !== undefined && v !== null
          ),
        )
        : {};
      const queryString = new URLSearchParams(
        filteredParams as Record<string, string>,
      ).toString();
      const url = `${this.baseUrl}${endpoint}${
        queryString ? "?" + queryString : ""
      }`;

      const makeRequest = () => fetch(url, { headers });
      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest, config);
    } catch (error) {
      console.error("GET request failed:", error);
      return {
        success: false,
        error: "network_error",
        message:
          "Could not connect to the server. Please check your internet connection.",
      };
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = config?.skipAuth
        ? { "Content-Type": "application/json" }
        : await this.getAuthHeaders();

      const makeRequest = () =>
        fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        });

      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest, config);
    } catch (error) {
      console.error("POST request failed:", error);
      return {
        success: false,
        error: "network_error",
        message:
          "Could not connect to the server. Please check your internet connection.",
      };
    }
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = config?.skipAuth
        ? { "Content-Type": "application/json" }
        : await this.getAuthHeaders();

      const makeRequest = () =>
        fetch(`${this.baseUrl}${endpoint}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
        });

      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest, config);
    } catch (error) {
      console.error("PUT request failed:", error);
      return {
        success: false,
        error: "network_error",
        message:
          "Could not connect to the server. Please check your internet connection.",
      };
    }
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = config?.skipAuth
        ? { "Content-Type": "application/json" }
        : await this.getAuthHeaders();

      const makeRequest = () =>
        fetch(`${this.baseUrl}${endpoint}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(data),
        });

      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest, config);
    } catch (error) {
      console.error("PATCH request failed:", error);
      return {
        success: false,
        error: "network_error",
        message:
          "Could not connect to the server. Please check your internet connection.",
      };
    }
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const headers = config?.skipAuth
        ? { "Content-Type": "application/json" }
        : await this.getAuthHeaders();

      const makeRequest = () =>
        fetch(`${this.baseUrl}${endpoint}`, {
          method: "DELETE",
          headers,
        });

      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest, config);
    } catch (error) {
      console.error("DELETE request failed:", error);
      return {
        success: false,
        error: "network_error",
        message:
          "Could not connect to the server. Please check your internet connection.",
      };
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse, PaginatedResponse };
