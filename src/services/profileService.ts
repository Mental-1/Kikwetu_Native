import { apiClient } from "./apiClient";

export interface Profile {
  id: string;
  authenticated?: boolean | null;
  avatar_url?: string | null;
  banned_until?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  created_at?: string | null;
  currency?: string | null;
  current_plan_id?: string | null;
  deleted_at?: string | null;
  deletion_reason?: string | null;
  email?: string | null;
  email_notifications: boolean;
  email_verified: boolean;
  full_name?: string | null;
  is_flagged?: boolean | null;
  language: string;
  listing_count: number;
  listing_updates: boolean;
  location?: string | null;
  marketing_emails: boolean;
  mfa_enabled?: boolean | null;
  nationality?: string | null;
  new_messages: boolean;
  phone?: string | null;
  phone_number?: string | null;
  phone_verified: boolean;
  price_alerts: boolean;
  profile_visibility: string;
  push_notifications: boolean;
  rating: number;
  referral_code?: string | null;
  reviews_count: number;
  role: "user" | "admin" | "moderator";
  show_email: boolean;
  show_last_seen: boolean;
  show_phone: boolean;
  sms_notifications: boolean;
  theme: string;
  timezone: string;
  updated_at?: string | null;
  username: string;
  verified?: boolean | null;
  website?: string | null;
}

export interface UpdateProfileData {
  full_name?: string;
  username?: string;
  bio?: string;
  location?: string;
  phone_number?: string;
  website?: string;
  nationality?: string;
  birth_date?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  theme?: string;
  profile_visibility?: string;
}

export interface UpdatePreferencesData {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
  listing_updates?: boolean;
  new_messages?: boolean;
  price_alerts?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
  show_last_seen?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
  currentPassword: string;
}

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<Profile> {
  try {
    const response = await apiClient.get<Profile>("/user/profile");

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch profile");
    }

    return response.data;
  } catch (error) {
    console.error("Error in getCurrentProfile:", error);
    throw error;
  }
}

/**
 * Update user's profile
 */
export async function updateProfile(
  profileData: UpdateProfileData,
): Promise<Profile> {
  try {
    const response = await apiClient.put<Profile>("/user/profile", profileData);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update profile");
    }

    return response.data;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    throw error;
  }
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UpdatePreferencesData> {
  try {
    const response = await apiClient.get<UpdatePreferencesData>(
      "/user/preferences",
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch preferences");
    }

    return response.data;
  } catch (error) {
    console.error("Error in getPreferences:", error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  preferencesData: UpdatePreferencesData,
): Promise<UpdatePreferencesData> {
  try {
    const response = await apiClient.put<UpdatePreferencesData>(
      "/user/preferences",
      preferencesData,
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to update preferences");
    }

    return response.data;
  } catch (error) {
    console.error("Error in updatePreferences:", error);
    throw error;
  }
}

/**
 * Upload user avatar
 */
export async function updateAvatar(imageUri: string): Promise<string> {
  try {
    // TODO: Process image before upload (WebP conversion, resizing)
    const response = await apiClient.post<{ avatar_url: string }>(
      "/user/avatar",
      {
        imageUri,
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to upload avatar");
    }

    return response.data.avatar_url;
  } catch (error) {
    console.error("Error in updateAvatar:", error);
    throw error;
  }
}

/**
 * Delete user's avatar
 */
export async function deleteAvatar(): Promise<void> {
  try {
    const response = await apiClient.delete<void>("/user/avatar");

    if (!response.success) {
      throw new Error(response.error || "Failed to delete avatar");
    }
  } catch (error) {
    console.error("Error in deleteAvatar:", error);
    throw error;
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
  try {
    const response = await apiClient.delete<void>("/user/account");

    if (!response.success) {
      throw new Error(response.error || "Failed to delete account");
    }
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    throw error;
  }
}

/**
 * Initiate phone verification
 */
export async function verifyPhone(phoneNumber: string): Promise<void> {
  try {
    const response = await apiClient.post<void>("/user/verify-phone", {
      phone_number: phoneNumber,
    });

    if (!response.success) {
      throw new Error(
        response.error || "Failed to initiate phone verification",
      );
    }
  } catch (error) {
    console.error("Error in verifyPhone:", error);
    throw error;
  }
}

/**
 * Confirm phone verification
 */
export async function confirmPhoneVerification(
  verificationCode: string,
): Promise<void> {
  try {
    const response = await apiClient.post<void>("/user/confirm-phone", {
      code: verificationCode,
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to confirm phone verification");
    }
  } catch (error) {
    console.error("Error in confirmPhoneVerification:", error);
    throw error;
  }
}

/**
 * Get profile by ID (for viewing other users' profiles)
 */
export async function getProfileById(
  profileId: string,
): Promise<Profile | null> {
  try {
    const response = await apiClient.get<Profile>(`/user/${profileId}`);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch profile");
    }

    return response.data;
  } catch (error) {
    console.error("Error in getProfileById:", error);
    throw error;
  }
}

/**
 * Toggle follow/unfollow a user
 */
export async function toggleFollowUser(
  userId: string,
): Promise<{ following: boolean }> {
  try {
    const response = await apiClient.post<{ following: boolean }>(
      `/user/${userId}/toggle-follow`,
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to toggle follow");
    }

    return response.data;
  } catch (error) {
    console.error("Error in toggleFollowUser:", error);
    throw error;
  }
}

/**
 * Check if current user is following another user
 */
export async function checkIfFollowing(userId: string): Promise<boolean> {
  try {
    const response = await apiClient.get<{ following: boolean }>(
      `/user/${userId}/follow-status`,
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to check follow status");
    }

    return response.data.following;
  } catch (error) {
    console.error("Error in checkIfFollowing:", error);
    throw error;
  }
}
