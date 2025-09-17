import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const Signup = () => {
  return (
    <View className='flex-1 items-center justify-center text-2xl'>
      <Text>Signup</Text>
      <View>
        <Link href='/(tabs)/home'>
          <TouchableOpacity>
            <Text>Go to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default Signup;
