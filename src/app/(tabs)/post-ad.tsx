import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts/authContext";
import ForgotPasswordScreen, {
  ForgotPasswordRef,
} from "@/src/app/(screens)/(auth)/forgot-password";
import SignIn, { SignInRef } from "@/src/app/(screens)/(auth)/signin";
import SignUp, { SignUpRef } from "@/src/app/(screens)/(auth)/signup";
import { Colors } from "@/src/constants/constant";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Step1 from "../(screens)/post-ad/step1";

export default function PostAdTab() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const signInRef = useRef<SignInRef>(null);
  const signUpRef = useRef<SignUpRef>(null);
  const forgotPasswordRef = useRef<ForgotPasswordRef>(null);

  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const [isSignUpVisible, setIsSignUpVisible] = useState(false);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setIsSignInVisible(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (isSignInVisible) {
      signInRef.current?.present();
    } else {
      signInRef.current?.dismiss();
    }
  }, [isSignInVisible]);

  useEffect(() => {
    if (isSignUpVisible) {
      signUpRef.current?.present();
    } else {
      signUpRef.current?.dismiss();
    }
  }, [isSignUpVisible]);

  useEffect(() => {
    if (isForgotPasswordVisible) {
      forgotPasswordRef.current?.present();
    } else {
      forgotPasswordRef.current?.dismiss();
    }
  }, [isForgotPasswordVisible]);

  const handleClose = () => {
    setIsSignInVisible(false);
    setIsSignUpVisible(false);
    setIsForgotPasswordVisible(false);
    router.push("/(tabs)/listings");
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

  if (user) {
    return <Step1 />;
  }

  return (
    <View style={styles.container}>
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
}

const styles = StyleSheet.create({
  container: {
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
