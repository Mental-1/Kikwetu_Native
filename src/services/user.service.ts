/**
 * User Service
 * Handles user profile and stats API calls
 */

import { UserProfile, UserStats } from '../types/api.types';
import { apiClient, ApiResponse } from './apiClient';

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return await apiClient.get<UserProfile>('/user/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return await apiClient.put<UserProfile>('/user/profile', data);
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    return await apiClient.get<UserStats>('/user/stats');
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(avatarUrl: string): Promise<ApiResponse<{ avatar_url: string }>> {
    return await apiClient.post<{ avatar_url: string }>('/user/avatar', { avatarUrl });
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>('/user/avatar');
  }

  /**
   * Get preferences
   */
  async getPreferences(): Promise<ApiResponse<any>> {
    return await apiClient.get<any>('/user/preferences');
  }

  /**
   * Update preferences
   */
  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return await apiClient.put<any>('/user/preferences', preferences);
  }

  /**
   * Delete account
   */
  async deleteAccount(reason?: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>('/user/account');
  }

  /**
   * Get public profile
   */
  async getPublicProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    return await apiClient.get<UserProfile>(`/user/${userId}`);
  }
}

export const userService = new UserService();

