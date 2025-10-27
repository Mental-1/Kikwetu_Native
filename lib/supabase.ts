import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra;

if (!expoExtra || !expoExtra.EXPO_PUBLIC_SUPABASE_URL || !expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key are not defined in app.json expo.extra. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

const supabaseUrl = expoExtra.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = expoExtra.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
declare global {
  // Track singleton subscription across Fast Refresh
  var __supabaseAppStateSub__: { remove: () => void } | undefined;
}
if (Platform.OS !== 'web') {
  const handle = (state: string) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  };
  // Set initial behavior and register once
  const current = AppState.currentState;
  handle(typeof current === 'string' ? current : 'active');
  if (!globalThis.__supabaseAppStateSub__) {
    globalThis.__supabaseAppStateSub__ = AppState.addEventListener('change', handle);
  }
}
