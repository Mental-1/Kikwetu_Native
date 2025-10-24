import { AuthProvider } from '@/contexts/authContext';
import '@/global.css';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';

Sentry.init({
  dsn: 'https://c670fa4991891b62dc670c9e71806185@o4509619077382144.ingest.us.sentry.io/4510064800169984',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

// Create a client with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to improve data freshness
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Reduce garbage collection time
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      // Reduce retry attempts for faster failures
      retry: 1,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect
      refetchOnReconnect: false,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
    },
  },
});

function Navigator() {
    // Removed auth protection for development
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(screens)" />
            <Stack.Screen name="forgot-password" options={{ presentation: "modal" }} />
        </Stack>
    );
}

function RootLayout() {
    const [loaded] = useFonts({
        'Inter-Variable': require('@/assets/fonts/Inter-VariableFont.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            // Don't hide splash here—let Navigator handle auth loading
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
                <PaperProvider>
                    <AuthProvider>
                        <Navigator />
                    </AuthProvider>
                </PaperProvider>
            </QueryClientProvider>
        </SafeAreaProvider>
    );
}

export default Sentry.wrap(RootLayout);