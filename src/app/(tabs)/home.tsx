import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

type Props = {};

const Home = (props: Props) => {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <View>
        <Text>Home</Text>
        <Link href='/signup' asChild>
          <TouchableOpacity>
            <Text>Sign Up</Text>
          </TouchableOpacity>
        </Link>
        <Link href='/login' asChild>
          <TouchableOpacity>
            <Text>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default Home;
