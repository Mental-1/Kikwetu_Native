import { AuthProvider } from '@/contexts/authContext';
import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

export default function RootLayout() {
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