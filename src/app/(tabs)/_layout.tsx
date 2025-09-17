import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name='home-outline' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='discover'
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name='compass-outline' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='post-ad'
        options={{
          title: 'Post Ad',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name='add-circle-outline' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='listings'
        options={{
          title: 'Listings',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name='list-outline' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='map'
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <Ionicons size={22} name='map-outline' color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
