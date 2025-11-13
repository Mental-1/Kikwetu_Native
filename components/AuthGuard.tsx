import { useAuth } from '@/contexts/authContext';
import ForgotPasswordScreen from '@/src/app/(screens)/(auth)/forgot-password';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { Colors } from '@/src/constants/constant';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef } from 'react';
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
  const signInRef = useRef<BottomSheetModal>(null);
  const signUpRef = useRef<BottomSheetModal>(null);
  const forgotPasswordRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (!loading && !user) {
        signInRef.current?.present();
    } else {
        signInRef.current?.dismiss();
        signUpRef.current?.dismiss();
        forgotPasswordRef.current?.dismiss();
    }
  }, [loading, user]);

  const handleSwitchToSignUp = () => {
    signInRef.current?.dismiss();
    signUpRef.current?.present();
  };

  const handleSwitchToSignIn = () => {
    signUpRef.current?.dismiss();
    forgotPasswordRef.current?.dismiss();
    signInRef.current?.present();
  };

  const handleSwitchToForgotPassword = () => {
      signInRef.current?.dismiss();
      forgotPasswordRef.current?.present();
  };

  const handleClose = () => {
    signInRef.current?.dismiss();
    signUpRef.current?.dismiss();
    forgotPasswordRef.current?.dismiss();
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
            ref={signInRef}
            onClose={handleClose}
            onSwitchToSignUp={handleSwitchToSignUp}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
        <SignUp
            ref={signUpRef}
            onClose={handleClose}
            onSwitchToSignIn={handleSwitchToSignIn}
        />
        <ForgotPasswordScreen
            ref={forgotPasswordRef}
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
