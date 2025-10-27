/**
 * Token Manager - Secure JWT token storage
 * Uses Expo SecureStore for encrypted storage
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'kikwetu_access_token';
const REFRESH_TOKEN_KEY = 'kikwetu_refresh_token';
const USER_DATA_KEY = 'kikwetu_user_data';

/**
 * Store authentication tokens
 */
export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Clear all tokens and user data
 */
export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_DATA_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

/**
 * Store user data
 */
export async function setUserData(userData: any): Promise<void> {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
}

/**
 * Get user data
 */
export async function getUserData(): Promise<any | null> {
  try {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken();
  return !!accessToken;
}

/**
 * Decode JWT token (without verification - for client use only)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

