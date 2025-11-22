import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

const STORAGE_ID = "kikwetu-storage";
const ENCRYPTION_KEY_ALIAS = "mmkv-encryption-key";

export type RecoveryStatus = "none" | "recovered" | "failed";
export let recoveryStatus: RecoveryStatus = "none";

/**
 * Get or generate encryption key for MMKV
 * Uses Expo SecureStore to safely store the key
 */
function getEncryptionKey(): string {
  try {
    let key = SecureStore.getItem(ENCRYPTION_KEY_ALIAS);

    if (!key) {
      key = generateKey();
      SecureStore.setItem(ENCRYPTION_KEY_ALIAS, key);
    }

    return key;
  } catch (error) {
    console.error("Error getting encryption key:", error);
    Sentry.captureException(error, {
      tags: { context: "mmkv_encryption_key_init" },
    });

    try {
      console.log("Attempting to recover encryption key...");
      SecureStore.deleteItemAsync(ENCRYPTION_KEY_ALIAS);
      const newKey = generateKey();
      SecureStore.setItem(ENCRYPTION_KEY_ALIAS, newKey);
      recoveryStatus = "recovered";
      return newKey;
    } catch (retryError) {
      console.error("Critical: Failed to recover encryption key:", retryError);
      Sentry.captureException(retryError, {
        tags: { context: "mmkv_encryption_key_recovery_failed" },
      });

      recoveryStatus = "failed";
      return "emergency-fallback-key-data-may-be-lost";
    }
  }
}

function generateKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Initialize MMKV with encryption
export const storage = new MMKV({
  id: STORAGE_ID,
  encryptionKey: getEncryptionKey(),
});

/**
 * Zustand Storage Adapter
 * Adapts MMKV to the StateStorage interface expected by Zustand
 */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

// Helper methods for direct usage
export const setItem = (key: string, value: any) => {
  storage.set(key, JSON.stringify(value));
};

export const getItem = (key: string) => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) : null;
};

export const removeItem = (key: string) => {
  storage.delete(key);
};

export const clearAll = () => {
  storage.clearAll();
};
