import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Login = () => {
  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-1 justify-center items-center'>
        <Text className='font-bold text-2xl'> Login Screen</Text>
      </View>
      <Link href='/home' asChild>
        <TouchableOpacity>
          <Text>Back to Home</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

export default Login;
