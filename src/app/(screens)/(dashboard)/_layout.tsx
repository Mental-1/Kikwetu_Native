import { Stack } from 'expo-router';
import React from 'react';

const DashboardLayout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Dashboard'
        }} 
      />
      <Stack.Screen 
        name="conversations" 
        options={{ 
          headerShown: false,
          title: 'Messages'
        }} 
      />
      <Stack.Screen 
        name="chat/[id]" 
        options={{ 
          headerShown: false,
          title: 'Chat'
        }} 
      />
    </Stack>
  );
};

export default DashboardLayout;
