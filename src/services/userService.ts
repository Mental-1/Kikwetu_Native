import { apiClient, ApiResponse } from './api';

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  rating: number;
  reviewsCount: number;
  listingCount: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    newMessages: boolean;
    listingUpdates: boolean;
    priceAlerts: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLastSeen: boolean;
    profileVisibility: 'public' | 'private' | 'friends';
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
}

export interface UpdatePreferencesData {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  currency?: string;
  notifications?: Partial<UserPreferences['notifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
}

class UserService {
  private readonly baseEndpoint = '/user';

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`${this.baseEndpoint}/profile`);
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>(`${this.baseEndpoint}/profile`, data);
  }

  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return apiClient.get<UserPreferences>(`${this.baseEndpoint}/preferences`);
  }

  async updatePreferences(data: UpdatePreferencesData): Promise<ApiResponse<UserPreferences>> {
    return apiClient.put<UserPreferences>(`${this.baseEndpoint}/preferences`, data);
  }

  async uploadAvatar(imageData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
    return apiClient.post<{ avatarUrl: string }>(`${this.baseEndpoint}/avatar`, imageData);
  }

  async deleteAccount(reason?: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/account`, { reason });
  }

  async getUserStats(): Promise<ApiResponse<{
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalSaved: number;
    rating: number;
    reviewsCount: number;
  }>> {
    return apiClient.get<{
      totalListings: number;
      activeListings: number;
      totalViews: number;
      totalSaved: number;
      rating: number;
      reviewsCount: number;
    }>(`${this.baseEndpoint}/stats`);
  }

  async verifyPhone(phoneNumber: string): Promise<ApiResponse<{ verificationId: string }>> {
    return apiClient.post<{ verificationId: string }>(`${this.baseEndpoint}/verify-phone`, { phoneNumber });
  }

  async confirmPhoneVerification(verificationId: string, code: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.baseEndpoint}/confirm-phone`, { verificationId, code });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.baseEndpoint}/change-password`, { currentPassword, newPassword });
  }
}

export const userService = new UserService();
