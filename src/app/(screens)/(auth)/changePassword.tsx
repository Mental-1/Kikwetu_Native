import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import BottomSheetTextInput from "@/components/BottomSheetTextInput";
import CustomLoader from "@/components/ui/CustomLoader";
import { Colors } from "@/src/constants/constant";
import { useChangePassword } from "@/src/hooks/useProfile";
import { useCustomAlert } from "@/utils/alertUtils";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ChangePasswordModalRef {
  present: () => void;
  dismiss: () => void;
}

const ChangePasswordModal = forwardRef<ChangePasswordModalRef, {}>(
  (props, ref) => {
    const changePasswordMutation = useChangePassword();
    const { showAlert, AlertComponent } = useCustomAlert();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomSheetRef = useRef<BottomSheetModalRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const validatePassword = (
      password: string,
    ): { isValid: boolean; message?: string } => {
      if (password.length < 8) {
        return {
          isValid: false,
          message: "Password must be at least 8 characters long.",
        };
      }

      if (!/(?=.*[a-zA-Z])/.test(password)) {
        return {
          isValid: false,
          message: "Password must contain at least one letter.",
        };
      }

      if (!/(?=.*\d)/.test(password)) {
        return {
          isValid: false,
          message: "Password must contain at least one number.",
        };
      }

      return { isValid: true };
    };

    const handleChangePassword = async () => {
      // Validation
      if (!currentPassword.trim()) {
        showAlert({
          title: "Error",
          message: "Please enter your current password.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      if (!newPassword.trim()) {
        showAlert({
          title: "Error",
          message: "Please enter a new password.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        showAlert({
          title: "Weak Password",
          message: passwordValidation.message,
          buttons: [{ text: "OK" }],
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        showAlert({
          title: "Error",
          message: "New password and confirmation do not match.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      if (currentPassword === newPassword) {
        showAlert({
          title: "Error",
          message: "New password must be different from your current password.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      try {
        setIsLoading(true);
        await changePasswordMutation.mutateAsync({
          currentPassword,
          newPassword,
        });

        showAlert({
          title: "Password Changed",
          message: "Your password has been successfully changed.",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                bottomSheetRef.current?.dismiss();
              },
            },
          ],
        });
      } catch (error: any) {
        console.error("Error changing password:", error);
        showAlert({
          title: "Error",
          message: error.message ||
            "Failed to change password. Please check your current password and try again.",
          buttons: [{ text: "OK" }],
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <>
        <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing>
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.modalContainer}>
              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>Change Password</Text>
                <Text style={styles.description}>
                  Enter your current password and choose a new secure password.
                </Text>

                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    style={styles.textInput}
                    label="Current Password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    autoComplete="password"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    style={styles.textInput}
                    label="New Password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />
                  <Text style={styles.helpText}>
                    Must be at least 8 characters with letters and numbers
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    style={styles.textInput}
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="new-password"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading
                    ? <CustomLoader />
                    : <Text style={styles.buttonText}>Change Password</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
        <AlertComponent />
      </>
    );
  },
);

ChangePasswordModal.displayName = "ChangePasswordModal";

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 4,
  },
  helpText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordModal;
