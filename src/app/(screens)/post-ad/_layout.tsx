import AuthGuard from '@/components/AuthGuard';
import { Stack } from 'expo-router';
import React from 'react';

export default function PostAdLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}
