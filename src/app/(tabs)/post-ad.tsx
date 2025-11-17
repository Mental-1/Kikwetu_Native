import { useAuth } from '@/contexts/authContext';
import ForgotPasswordScreen from '@/src/app/(screens)/(auth)/forgot-password';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '@/src/constants/constant';
import CustomLoader from "@/components/ui/CustomLoader";

export default function PostAdTab() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const [isSignUpVisible, setIsSignUpVisible] = useState(false);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(screens)/post-ad/step1');
    }
    else if (!loading && !user) {
      setIsSignInVisible(true);
    }
  }, [user, loading, router]);

  const handleClose = () => {
    setIsSignInVisible(false);
    setIsSignUpVisible(false);
    setIsForgotPasswordVisible(false);
    router.back();
  };

  const handleSwitchToSignUp = () => {
    setIsSignInVisible(false);
    setIsSignUpVisible(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpVisible(false);
    setIsForgotPasswordVisible(false);
    setIsSignInVisible(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsSignInVisible(false);
    setIsForgotPasswordVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomLoader />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SignIn
        visible={isSignInVisible}
        onClose={handleClose}
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <SignUp
        visible={isSignUpVisible}
        onClose={handleClose}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      <ForgotPasswordScreen
        visible={isForgotPasswordVisible}
        onClose={handleClose}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey,
  },
});
