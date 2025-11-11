import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from '@/utils/storage';

interface PreferencesState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  priceAlerts: boolean;
  messageNotifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
  locationServices: boolean;
  analytics: boolean;
  language: string;
  currency: string;
  region: string;
  setPushNotifications: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setMarketingEmails: (value: boolean) => void;
  setPriceAlerts: (value: boolean) => void;
  setMessageNotifications: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setAutoSave: (value: boolean) => void;
  setLocationServices: (value: boolean) => void;
  setAnalytics: (value: boolean) => void;
  setLanguage: (value: string) => void;
  setCurrency: (value: string) => void;
  setRegion: (value: string) => void;
  resetPreferences: () => void;
}

const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      emailNotifications: false,
      marketingEmails: false,
      priceAlerts: true,
      messageNotifications: true,
      darkMode: false,
      autoSave: true,
      locationServices: true,
      analytics: true,
      language: 'English',
      currency: 'KES',
      region: 'Kenya',
      setPushNotifications: (value) => set({ pushNotifications: value }),
      setEmailNotifications: (value) => set({ emailNotifications: value }),
      setMarketingEmails: (value) => set({ marketingEmails: value }),
      setPriceAlerts: (value) => set({ priceAlerts: value }),
      setMessageNotifications: (value) => set({ messageNotifications: value }),
      setDarkMode: (value) => set({ darkMode: value }),
      setAutoSave: (value) => set({ autoSave: value }),
      setLocationServices: (value) => set({ locationServices: value }),
      setAnalytics: (value) => set({ analytics: value }),
      setLanguage: (value) => set({ language: value }),
      setCurrency: (value) => set({ currency: value }),
      setRegion: (value) => set({ region: value }),
      resetPreferences: () =>
        set({
          pushNotifications: true,
          emailNotifications: false,
          marketingEmails: false,
          priceAlerts: true,
          messageNotifications: true,
          darkMode: false,
          autoSave: true,
          locationServices: true,
          analytics: true,
          language: 'English',
          currency: 'KES',
          region: 'Kenya',
        }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => storage.set(name, value),
        getItem: (name) => storage.getString(name) ?? null,
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);

export default usePreferencesStore;
