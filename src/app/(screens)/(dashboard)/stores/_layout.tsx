import { Stack } from 'expo-router';

export default function StoresLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="store-create" />
      <Stack.Screen name="store-edit" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

