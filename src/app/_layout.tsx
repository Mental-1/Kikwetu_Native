import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const [loaded] = useFonts({
  'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
});

useEffect(() => {
  if (loaded) {
    SplashScreen.hideAsync();
  }
}, [loaded]);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode='light'>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='(screens)' />
          <Stack.Screen name='signup' options={{ presentation: 'modal' }} />
          <Stack.Screen name='login' options={{ presentation: 'modal' }} />
        </Stack>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
