import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

type Props = {}

const SignUpScreen = (props: Props) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>SignUp Screen</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default SignUpScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})