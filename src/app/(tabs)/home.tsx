import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

type Props = {};

const Home = (props: Props) => {
  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-1 items-center justify-center'>
        <Text className='text-2xl font-bold text-blue-500 px-4 mx-auto'>
          Home
        </Text>
        <Link href='/signup' asChild>
          <TouchableOpacity>
            <Text>Go to Sign Up</Text>
          </TouchableOpacity>
        </Link>
        <Link href='/login' asChild>
          <TouchableOpacity>
            <Text>Go to Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Home;
