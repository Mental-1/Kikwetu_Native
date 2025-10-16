/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { clearTokens, setTokens, setUserData } from '../utils/tokenManager';
import { apiClient, ApiResponse } from './apiClient';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    role: string;
    verified?: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface SessionResponse {
  user: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    role: string;
    verified?: boolean;
  };
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      if (response.success && response.data) {
        // Store tokens securely
        await setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        // Store user data
        await setUserData(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);

      if (response.success && response.data) {
        // Store tokens securely
        await setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );

        // Store user data
        await setUserData(response.data.user);
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<void>('/auth/logout');

      // Clear tokens regardless of API response
      await clearTokens();

      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if API call fails
      await clearTokens();
      return {
        success: true,
      };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'Failed to send password reset email.',
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Failed to reset password.',
      };
    }
  }

  /**
   * Change email
   */
  async changeEmail(newEmail: string, currentPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/change-email', { newEmail, currentPassword });
    } catch (error) {
      console.error('Change email error:', error);
      return {
        success: false,
        error: 'Failed to change email.',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Failed to change password.',
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<ApiResponse<SessionResponse>> {
    try {
      return await apiClient.get<SessionResponse>('/auth/session');
    } catch (error) {
      console.error('Get session error:', error);
      return {
        success: false,
        error: 'Failed to get session.',
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/verify-email', { token });
    } catch (error) {
      console.error('Verify email error:', error);
      return {
        success: false,
        error: 'Failed to verify email.',
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>('/auth/resend-verification', { email });
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        error: 'Failed to resend verification email.',
      };
    }
  }
}

export const authService = new AuthService();

