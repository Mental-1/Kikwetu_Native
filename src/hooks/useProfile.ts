import {
  deleteAvatar,
  getCurrentProfile,
  getProfileById,
  updateAvatar,
  updateProfile,
  type UpdateProfileData,
} from "@/src/services/profileService";
import { authService } from "@/src/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
  currentPassword: string;
}

/**
 * Hook to get users profile
 * @returns
 */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error?.message?.includes("401") ||
        error?.message?.includes("unauthorized")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get users profile by id
 * @param profileId
 * @returns
 */
export function useProfileById(profileId: string) {
  return useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => getProfileById(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update users profile
 * @returns
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateProfileData) => updateProfile(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
}
/**
 * Hook to update users avatar
 * @returns
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageUri: string) => updateAvatar(imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Avatar update error:", error);
    },
  });
}

/**
 * Hook to change users password
 * @returns
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordData) =>
      authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      ),
    onError: (error) => {
      console.error("Password change error:", error);
    },
  });
}

/**
 * Hook to change users email
 * @returns
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailData: ChangeEmailData) =>
      authService.changeEmail(emailData.newEmail, emailData.currentPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Email change error:", error);
    },
  });
}

/**
 * Hook to toggle MFA for the user
 * @returns
 */
export function useToggleMFA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => authService.toggleMFA(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("MFA toggle error:", error);
    },
  });
}
/**
 * Hook to delete users avatar
 * @returns
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Avatar delete error:", error);
    },
  });
}
