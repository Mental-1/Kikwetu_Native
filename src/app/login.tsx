import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const Login = () => {
  return (
    <View>
      <View className='justify-center items-center font-bold text-2xl'>
        <Text> Login Screen</Text>
      </View>
      <Link href='/home' asChild>
        <TouchableOpacity>
          <Text>Back to Home</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Login;
