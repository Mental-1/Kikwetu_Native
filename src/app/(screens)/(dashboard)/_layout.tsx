import { Stack } from 'expo-router';
import React from 'react';

const DashboardLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name='conversations'
        options={{
          headerShown: false,
          title: 'Messages',
        }}
      />
      <Stack.Screen
        name='chat/[id]'
        options={{
          headerShown: false,
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name='plans-billing'
        options={{
          headerShown: false,
          title: 'Plans & Billing',
        }}
      />
      <Stack.Screen
        name='transactions'
        options={{
          headerShown: false,
          title: 'Transactions',
        }}
      />
      <Stack.Screen
        name='payment'
        options={{
          headerShown: false,
          title: 'Payment',
        }}
      />
      <Stack.Screen
        name='edit-listing'
        options={{
          headerShown: false,
          title: 'Edit Listing',
        }}
      />
       <Stack.Screen
         name='mylistings'
         options={{
            headerShown: false,
            title: 'My Listings',
         }}
       />
       <Stack.Screen
         name='saved'
         options={{
            headerShown: false,
            title: 'Saved Items',
         }}
       />
       <Stack.Screen
         name='analytics'
         options={{
            headerShown: false,
            title: 'Analytics',
         }}
       />
    </Stack>
  );
};

export default DashboardLayout;
