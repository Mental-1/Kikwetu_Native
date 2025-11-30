import {
  deleteAvatar,
  getCurrentProfile,
  getProfileById,
  updateAvatar,
  updateProfile,
  type UpdateProfileData
} from '@/src/services/profileService';
import { authService } from '@/src/services/auth.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
  currentPassword: string;
}

/**
 * Hook to fetch current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook to fetch a profile by ID
 */
export function useProfileById(profileId: string) {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfileById(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateProfileData) => updateProfile(profileData),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook to update avatar
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => updateAvatar(imageUri),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordData) => 
      authService.changePassword(passwordData.currentPassword, passwordData.newPassword),
  });
}

/**
 * Hook to change email
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailData: ChangeEmailData) => 
      authService.changeEmail(emailData.newEmail, emailData.currentPassword),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook to toggle MFA
 */
export function useToggleMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => authService.toggleMFA(enabled),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
