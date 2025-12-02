import { useAuth } from "@/contexts/authContext";
import ForgotPasswordScreen, {
  ForgotPasswordRef,
} from "@/src/app/(screens)/(auth)/forgot-password";
import SignIn, { SignInRef } from "@/src/app/(screens)/(auth)/signin";
import SignUp, { SignUpRef } from "@/src/app/(screens)/(auth)/signup";
import { Colors } from "@/src/constants/constant";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomLoader from "./ui/CustomLoader";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const signInRef = useRef<SignInRef>(null);
  const signUpRef = useRef<SignUpRef>(null);
  const forgotPasswordRef = useRef<ForgotPasswordRef>(null);

  useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => {
        signInRef.current?.present();
      }, 100);
    } else {
      handleClose();
    }
  }, [loading, user]);

  const handleSwitchToSignUp = () => {
    setTimeout(() => signUpRef.current?.present(), 100);
  };

  const handleSwitchToSignIn = () => {
    setTimeout(() => signInRef.current?.present(), 100);
  };

  const handleSwitchToForgotPassword = () => {
    setTimeout(() => forgotPasswordRef.current?.present(), 100);
  };

  const handleClose = () => {
    signInRef.current?.dismiss();
    signUpRef.current?.dismiss();
    forgotPasswordRef.current?.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader />
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
        onSwitchToSignUp={handleSwitchToSignUp}
        onSwitchToForgotPassword={handleSwitchToForgotPassword}
      />
      <SignUp
        ref={signUpRef}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      <ForgotPasswordScreen
        ref={forgotPasswordRef}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.grey,
  },
});

export default AuthGuard;
