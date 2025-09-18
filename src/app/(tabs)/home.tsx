import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Props = {};

const Home = (props: Props) => {
  const router = useRouter();

  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-1 items-center justify-center'>
        <Text className='text-2xl font-bold text-blue-500 px-4 mx-auto'>
          Home
        </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text>Go to Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/signin')}>
          <Text>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;
