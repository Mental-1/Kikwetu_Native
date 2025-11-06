import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

function Kickoff() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(screens)/post-ad/step1');
  }, [router]);
  return <View />;
}

export default function PostAdTab() {
  // Only run navigation when authenticated
  return (
    <AuthGuard>
      <Kickoff />
    </AuthGuard>
  );
}