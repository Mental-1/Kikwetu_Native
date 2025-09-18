import { Stack } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Inter-Variable': require('@/assets/fonts/Inter-VariableFont.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode='light'>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='(screens)' />
          <Stack.Screen name='signup' options={{ presentation: 'modal' }} />
          <Stack.Screen name='signin' options={{ presentation: 'modal' }} />
        </Stack>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
