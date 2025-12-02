import { getItem, removeItem, setItem } from "@/utils/storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "kikwetu_access_token";
const REFRESH_TOKEN_KEY = "kikwetu_refresh_token";
const USER_DATA_KEY = "kikwetu_user_data";

const isWeb = Platform.OS === "web";

/**
 * Store access and refresh tokens securely
 * Uses SecureStore on native platforms for sensitive token data
 * Falls back to localStorage on web
 * @param accessToken - The JWT access token
 * @param refreshToken - The JWT refresh token
 */
export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    if (isWeb) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    }
  } catch (error) {
    console.error("Error storing tokens:", error);
    throw new Error("Failed to store authentication tokens");
  }
}

/**
 * Retrieve the access token from secure storage
 * @returns The access token or null if not found
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

/**
 * Retrieve the refresh token from secure storage
 * @returns The refresh token or null if not found
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
}

/**
 * Clear all authentication tokens and user data from storage
 * Used during logout or session expiration
 */
export async function clearTokens(): Promise<void> {
  try {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } else {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      ]);
    }
    // Also clear from MMKV storage
    removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
}

/**
 * Store user profile data in MMKV storage
 * Uses MMKV for non-sensitive user data (faster than SecureStore)
 * @param userData - The user profile object to store
 */
export function setUserData(userData: any): void {
  try {
    if (isWeb) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } else {
      setItem(USER_DATA_KEY, userData);
    }
  } catch (error) {
    console.error("Error storing user data:", error);
  }
}

/**
 * Retrieve user profile data from MMKV storage
 * @returns The user profile object or null if not found
 */
export function getUserData(): any | null {
  try {
    if (isWeb) {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    return getItem(USER_DATA_KEY);
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Check if user is authenticated with a valid, non-expired token
 * @returns True if user has a valid access token
 */
export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) return false;

  if (isTokenExpired(accessToken)) {
    return false;
  }

  return true;
}

/**
 * Decode a JWT token to extract its payload
 * @param token - The JWT token string
 * @returns The decoded payload object or null if decoding fails
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired or about to expire
 * Includes a 60-second buffer to proactively refresh
 * @param token - The JWT token string
 * @returns True if the token is expired or will expire within 60 seconds
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    const bufferTime = 60; // Refresh 60 seconds before expiry
    return decoded.exp < currentTime + bufferTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get a valid (non-expired) access token
 * Returns null if token is expired, allowing caller to trigger refresh
 * @returns Valid access token or null if expired/missing
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;

  if (isTokenExpired(token)) {
    return null;
  }

  return token;
}
