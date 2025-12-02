import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import BottomSheetTextInput from "@/components/BottomSheetTextInput";
import { useAuth } from "@/contexts/authContext";
import { Colors } from "@/src/constants/constant";
import { useChangeEmail } from "@/src/hooks/useProfile";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { z } from "zod";

// Form validation schema
const changeEmailSchema = z.object({
  newEmail: z.email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export interface ChangeEmailModalRef {
  present: () => void;
  dismiss: () => void;
}

const ChangeEmailModal = forwardRef<ChangeEmailModalRef, {}>((props, ref) => {
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);
  const changeEmailMutation = useChangeEmail();
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModalRef>(null);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const { control, handleSubmit, formState: { errors }, reset } = useForm<
    ChangeEmailFormData
  >({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  const onSubmitChangeEmail = async (data: ChangeEmailFormData) => {
    if (data.newEmail === user?.email) {
      error("Error", "New email must be different from your current email.");
      return;
    }

    try {
      setIsLoading(true);
      await changeEmailMutation.mutateAsync({
        newEmail: data.newEmail,
        currentPassword: data.currentPassword,
      });

      success(
        "Email Change Requested",
        "A verification email has been sent to your new email address. Please check your inbox and follow the instructions to complete the email change.",
      );
      bottomSheetRef.current?.dismiss();
      reset();
    } catch (err: any) {
      console.error("Error changing email:", err);
      error(
        "Error",
        err.message || "Failed to change email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing>
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Change Email</Text>
          <Text style={styles.description}>
            Enter your new email address and current password to change your
            email.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="newEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  label="New Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.newEmail?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <BottomSheetTextInput
                  label="Current Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.currentPassword?.message}
                  style={styles.input}
                />
              )}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmitChangeEmail)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              buttonColor={Colors.primary}
              textColor={Colors.white}
            >
              Change Email
            </Button>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
      <AlertComponent />
    </>
  );
});

ChangeEmailModal.displayName = "ChangeEmailModal";

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 24,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default ChangeEmailModal;
