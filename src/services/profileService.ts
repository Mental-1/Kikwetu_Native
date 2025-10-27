import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/src/utils/imageUpload';
import { IMAGE_PRESETS, processImage } from '@/utils/imageUtils';

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
  role: 'user' | 'admin' | 'moderator';
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
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    throw error;
  }
}

/**
 * Update user's profile
 */
export async function updateProfile(profileData: UpdateProfileData): Promise<Profile> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
}

/**
 * Upload and update user's avatar
 */
export async function updateAvatar(imageUri: string): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Process image with WebP conversion and profile-specific settings
    const processedImage = await processImage(imageUri, IMAGE_PRESETS.PROFILE);

    // Upload processed image to profiles bucket
    const uploadResult = await uploadImage(processedImage.uri, {
      bucket: 'profiles',
      folder: 'avatars',
    });

    if (!uploadResult) {
      throw new Error('Failed to upload avatar');
    }

    // Update profile with new avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: uploadResult.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating avatar URL:', error);
      throw error;
    }

    return uploadResult.url;
  } catch (error) {
    console.error('Error in updateAvatar:', error);
    throw error;
  }
}

/**
 * Change user's password
 */
export async function changePassword(passwordData: ChangePasswordData): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in changePassword:', error);
    throw error;
  }
}

/**
 * Change user's email
 */
export async function changeEmail(emailData: ChangeEmailData): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      email: emailData.newEmail,
    });

    if (error) {
      console.error('Error changing email:', error);
      throw error;
    }

    // Update profile email as well
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({
          email: emailData.newEmail,
          email_verified: false, // Reset verification status
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Error in changeEmail:', error);
    throw error;
  }
}

/**
 * Enable/disable two-factor authentication
 */
export async function toggleMFA(enabled: boolean): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        mfa_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error toggling MFA:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in toggleMFA:', error);
    throw error;
  }
}

/**
 * Delete user's avatar
 */
export async function deleteAvatar(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current profile to get avatar URL
    const profile = await getCurrentProfile();
    if (profile?.avatar_url) {
      // Delete from storage
      const fileName = profile.avatar_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('profiles')
          .remove([`avatars/${fileName}`]);
      }
    }

    // Update profile to remove avatar URL
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAvatar:', error);
    throw error;
  }
}

/**
 * Get profile by ID (for viewing other users' profiles)
 */
export async function getProfileById(profileId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile by ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfileById:', error);
    throw error;
  }
}
