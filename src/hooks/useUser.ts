import { UpdatePreferencesData, UpdateProfileData, UserPreferences, UserProfile, userService } from '@/src/services/userService';
import { useCallback, useEffect, useState } from 'react';

interface UseUserReturn {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<UserProfile | null>;
  updatePreferences: (data: UpdatePreferencesData) => Promise<UserPreferences | null>;
  uploadAvatar: (imageData: FormData) => Promise<string | null>;
  deleteAccount: (reason?: string) => Promise<boolean>;
  verifyPhone: (phoneNumber: string) => Promise<string | null>;
  confirmPhoneVerification: (verificationId: string, code: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  getUserStats: () => Promise<{
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalSaved: number;
    rating: number;
    reviewsCount: number;
  } | null>;
  getUserById: (userId: string) => Promise<UserProfile | null>;
}

export const useUser = (): UseUserReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profile and preferences in parallel
      const [profileResponse, preferencesResponse] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences()
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.data);
      } else {
        setError(profileResponse.message || 'Failed to fetch profile');
      }

      if (preferencesResponse.success) {
        setPreferences(preferencesResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<UserProfile | null> => {
    try {
      const response = await userService.updateProfile(data);
      if (response.success) {
        setProfile(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to update profile');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    }
  }, []);

  const updatePreferences = useCallback(async (data: UpdatePreferencesData): Promise<UserPreferences | null> => {
    try {
      const response = await userService.updatePreferences(data);
      if (response.success) {
        setPreferences(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to update preferences');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return null;
    }
  }, []);

  const uploadAvatar = useCallback(async (imageData: FormData): Promise<string | null> => {
    try {
      const response = await userService.uploadAvatar(imageData);
      if (response.success) {
        // Update profile with new avatar URL
        if (profile) {
          setProfile({ ...profile, avatarUrl: response.data.avatarUrl });
        }
        return response.data.avatarUrl;
      } else {
        setError(response.message || 'Failed to upload avatar');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return null;
    }
  }, [profile]);

  const deleteAccount = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      const response = await userService.deleteAccount(reason);
      if (response.success) {
        // Clear user data
        setProfile(null);
        setPreferences(null);
        return true;
      } else {
        setError(response.message || 'Failed to delete account');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      return false;
    }
  }, []);

  const verifyPhone = useCallback(async (phoneNumber: string): Promise<string | null> => {
    try {
      const response = await userService.verifyPhone(phoneNumber);
      if (response.success) {
        return response.data.verificationId;
      } else {
        setError(response.message || 'Failed to send verification code');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
      return null;
    }
  }, []);

  const confirmPhoneVerification = useCallback(async (verificationId: string, code: string): Promise<boolean> => {
    try {
      const response = await userService.confirmPhoneVerification(verificationId, code);
      if (response.success) {
        // Refresh profile to get updated phone verification status
        await fetchUserData();
        return true;
      } else {
        setError(response.message || 'Failed to verify phone number');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify phone number');
      return false;
    }
  }, [fetchUserData]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await userService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to change password');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      return false;
    }
  }, []);

  const getUserStats = useCallback(async () => {
    try {
      const response = await userService.getUserStats();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch user stats');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
      return null;
    }
  }, []);

  const getUserById = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const response = await userService.getUserById(userId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch user');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    profile,
    preferences,
    loading,
    error,
    refetch: fetchUserData,
    updateProfile,
    updatePreferences,
    uploadAvatar,
    deleteAccount,
    verifyPhone,
    confirmPhoneVerification,
    changePassword,
    getUserStats,
    getUserById,
  };
};
