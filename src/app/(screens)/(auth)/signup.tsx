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
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { z } from "zod";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid phone number in international format, e.g. +254712345678",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
  onSwitchToSignIn: () => void;
}

export interface SignUpRef {
  present: () => void;
  dismiss: () => void;
}

const SignUp = forwardRef<SignUpRef, SignUpProps>(({
  onSwitchToSignIn,
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
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
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const onSubmitSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(
        data.email,
        data.password,
        data.fullName,
        data.phoneNumber,
      );
      if (error) {
        throw new Error(error.message || "Failed to create account");
      }
      showSuccessToast(
        "Account created successfully! Please check your email to verify your account.",
        "Welcome",
      );
      bottomSheetRef.current?.dismiss();
      reset();
    } catch (err: any) {
      showErrorToast(err.message, "Sign Up Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignIn = () => {
    bottomSheetRef.current?.dismiss();
    onSwitchToSignIn();
  };

  return (
    <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing>
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
      >
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                label="Full Name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.fullName?.message}
                style={styles.textInput}
              />
            )}
          />

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
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                label="Phone Number (e.g., +254712345678)"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.phoneNumber?.message}
                keyboardType="phone-pad"
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <BottomSheetTextInput
                label="Confirm Password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirmPassword}
                style={styles.textInput}
              />
            )}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmitSignUp)}
          style={[styles.submitButton, { backgroundColor: Colors.primary }]}
          labelStyle={styles.submitButtonText}
          loading={isLoading}
          disabled={isLoading}
          icon="email-outline"
          contentStyle={styles.submitButtonContent}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.authButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => {}}
        >
          <GoogleIcon size={24} />
          <Text style={styles.authButtonText}>Continue with Google</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.switchAuthButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={handleSwitchToSignIn}
        >
          <Text style={styles.switchAuthText}>
            Already have an account?{" "}
            <Text style={styles.switchAuthLink}>Sign In</Text>
          </Text>
        </Pressable>

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

SignUp.displayName = "SignUp";

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
    marginTop: 10,
    marginBottom: 8,
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
  switchAuthButton: {
    marginTop: 8,
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
  legalLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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

export default SignUp;
