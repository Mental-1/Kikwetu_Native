import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Signup = () => {
  return (
    <SafeAreaView className='flex-1'>
      <View className='flex-1 items-center justify-center'>
        <Text className='text-2xl font-bold'>Signup</Text>
        <View>
          <Link href='/home' asChild>
            <TouchableOpacity>
              <Text>Go to Home</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;
