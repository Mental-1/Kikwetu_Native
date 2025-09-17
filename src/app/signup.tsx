import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Signup = () => {
  return (
    <SafeAreaView>
      <View className='flex-1 items-center justify-center text-2xl p-4 mx-2'>
        <Text>Signup</Text>
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
