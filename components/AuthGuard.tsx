import { useAuth } from '@/contexts/authContext';
import ForgotPasswordScreen from '@/src/app/(screens)/(auth)/forgot-password';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { Colors } from '@/src/constants/constant';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const [isSignUpVisible, setIsSignUpVisible] = useState(false);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
        setIsSignInVisible(true);
    } else {
        handleClose();
    }
  }, [loading, user]);

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

  const handleClose = () => {
    setIsSignInVisible(false);
    setIsSignUpVisible(false);
    setIsForgotPasswordVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <View style={styles.loadingContainer}>
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
};

const styles = StyleSheet.create({
  loadingContainer: {
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

export default AuthGuard;
