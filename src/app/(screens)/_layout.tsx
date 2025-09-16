import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
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
