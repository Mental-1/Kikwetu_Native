import AuthProvider from '@/contexts/authContext';
import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

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