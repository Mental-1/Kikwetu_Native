import { Stack} from 'expo-router';
import {PaperProvider} from "react-native-paper";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/contexts/authContext';
import {ActivityIndicator} from "react-native"; // useAuth imports for authentication context

SplashScreen.preventAutoHideAsync();

function Navigator() {
    const { session, loading } = useAuth();

    // Wait for auth loading to complete before rendering
    if (loading) {
        return <ActivityIndicator color={'blue'}/>;
    }

        if (!session) {
            return (
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="screens" />
                    <Stack.Screen name="signup" options={{ presentation: "modal" }} />
                    <Stack.Screen name="signin" options={{ presentation: "modal" }} />
                    <Stack.Screen name="forgot-password" options={{ presentation: "modal" }} />
                </Stack>
            );
        }
}

export default function RootLayout() {
    const [loaded] = useFonts({
        'Inter-Variable': require('@/assets/fonts/Inter-VariableFont.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            // Don't hide splash here—let Navigator handle auth loading
            // SplashScreen.hideAsync(); // Remove this
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <PaperProvider>
                <AuthProvider>
                    <Navigator />
                </AuthProvider>
            </PaperProvider>

        </SafeAreaProvider>
    );
}