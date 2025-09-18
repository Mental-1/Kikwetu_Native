import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/authContext';

export default function ScreensLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/signin" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="discover" />
      <Stack.Screen name="home" />
      <Stack.Screen name="listings" />
      <Stack.Screen name="map" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="post-ad" />
    </Stack>
  );
}
