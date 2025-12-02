import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import BottomSheetTextInput from "@/components/BottomSheetTextInput";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { useAuth } from "@/contexts/authContext";
import { Colors } from "@/src/constants/constant";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { z } from "zod";

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export interface SignInRef {
  present: () => void;
  dismiss: () => void;
}

const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = forwardRef<SignInRef, SignInProps>(({
  onSwitchToSignUp,
  onSwitchToForgotPassword,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModalRef>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmitSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        throw new Error(
          error.message || "Failed to sign in. Please try again.",
        );
      }
      showSuccessToast("Successfully signed in!", "Welcome Back");
      bottomSheetRef.current?.dismiss();
      reset();
    } catch (err: any) {
      showErrorToast(err.message, "Sign In Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignUp = () => {
    bottomSheetRef.current?.dismiss();
    onSwitchToSignUp();
  };

  const handleSwitchToForgotPassword = () => {
    bottomSheetRef.current?.dismiss();
    onSwitchToForgotPassword();
  };

  return (
    <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing>
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
      >
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                label="Email"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                label="Password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
            )}
          />
          {
            /* Note: BottomSheetTextInput doesn't support right icon directly yet,
              might need to enhance it or wrap it for password toggle if critical.
              For now, keeping it simple as per request to use helper components. */
          }

          <TouchableOpacity
            onPress={handleSwitchToForgotPassword}
            style={styles.forgotPasswordButton}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmitSignIn)}
          style={[styles.submitButton, { backgroundColor: Colors.primary }]}
          labelStyle={styles.submitButtonText}
          loading={isLoading}
          disabled={isLoading}
          icon="email-outline"
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? "Signing In..." : "Sign In with Email"}
        </Button>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.authButton}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <GoogleIcon size={24} />
          <Text style={styles.authButtonText}>Sign In with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuthButton}
          onPress={handleSwitchToSignUp}
          activeOpacity={0.7}
        >
          <Text style={styles.switchAuthText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.switchAuthLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.legalLinksContainer}>
          <Pressable
            onPress={() => console.log("Navigate to Terms of Service")}
          >
            <Text style={styles.legalLink}>Terms</Text>
          </Pressable>
          <Text style={styles.legalDivider}>|</Text>
          <Pressable onPress={() => console.log("Navigate to Privacy Policy")}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

SignIn.displayName = "SignIn";

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 18,
    color: Colors.grey,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  formContainer: {
    marginVertical: 10,
  },
  textInput: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 12,
    width: "100%",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
    color: Colors.white,
  },
  submitButtonContent: {
    flexDirection: "row",
    justifyContent: "center",
    paddingRight: 16,
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.black,
    gap: 12,
    width: "100%",
  },
  authButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "600",
  },
  switchAuthButton: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  switchAuthText: {
    fontSize: 14,
    color: Colors.grey,
  },
  switchAuthLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -5,
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  legalLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 20,
  },
  legalLink: {
    fontSize: 12,
    color: Colors.grey,
    textDecorationLine: "underline",
  },
  legalDivider: {
    fontSize: 12,
    color: Colors.grey,
    marginHorizontal: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightgrey,
  },
  dividerText: {
    width: 130,
    textAlign: "center",
    fontSize: 12,
    color: Colors.grey,
  },
});

export default SignIn;
