import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import BottomSheetTextInput from "@/components/BottomSheetTextInput";
import { useAuth } from "@/contexts/authContext";
import { Colors } from "@/src/constants/constant";
import { showErrorToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
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

interface ForgotPasswordProps {
  onSwitchToSignIn: () => void;
}

export interface ForgotPasswordRef {
  present: () => void;
  dismiss: () => void;
}

const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen = forwardRef<ForgotPasswordRef, ForgotPasswordProps>(
  ({
    onSwitchToSignIn,
  }, ref) => {
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
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
    } = useForm<ForgotPasswordFormData>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
      setIsLoading(true);
      setIsSuccess(false);
      try {
        const { error } = await resetPassword(data.email);
        if (error) {
          throw new Error(error.message || "Failed to send reset email");
        }
        setIsSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          handleSwitchToSignIn();
          resetForm();
        }, 2000);
      } catch (err: any) {
        showErrorToast(err.message || "An unexpected error occurred", "Error");
      } finally {
        setIsLoading(false);
      }
    };

    const resetForm = () => {
      reset();
      setIsSuccess(false);
    };

    const handleSwitchToSignIn = () => {
      bottomSheetRef.current?.dismiss();
      onSwitchToSignIn();
    };

    return (
      <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing>
        <BottomSheetScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.description}>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </Text>

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

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={[styles.submitButton, { backgroundColor: Colors.primary }]}
              labelStyle={styles.buttonLabel}
              loading={isLoading}
              disabled={isLoading || isSuccess}
              icon={isSuccess
                ? () => (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.white}
                  />
                )
                : undefined}
            >
              {isSuccess ? "Sent" : "Send Reset Link"}
            </Button>

            <Pressable
              style={({ pressed }) => [
                styles.backToSignIn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleSwitchToSignIn}
            >
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={styles.backToSignInText}>Back to Sign In</Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ForgotPasswordScreen.displayName = "ForgotPasswordScreen";

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    gap: 16,
    width: "100%",
  },
  textInput: {
    backgroundColor: Colors.white,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    paddingVertical: 8,
  },
  backToSignIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    width: "100%",
  },
  backToSignInText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
});

export default ForgotPasswordScreen;
