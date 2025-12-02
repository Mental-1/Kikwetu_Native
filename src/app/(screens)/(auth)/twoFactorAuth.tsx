import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import BottomSheetTextInput from "@/components/BottomSheetTextInput";
import CustomLoader from "@/components/ui/CustomLoader";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/src/constants/constant";
import { useProfile, useToggleMFA } from "@/src/hooks/useProfile";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { copyToClipboard } from "@/utils/clipboardUtils";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";

export interface TwoFactorAuthModalRef {
  present: () => void;
  dismiss: () => void;
}

const TwoFactorAuthModal = forwardRef<TwoFactorAuthModalRef, {}>(
  (props, ref) => {
    const { data: profile } = useProfile();
    const { showAlert, AlertComponent } = useCustomAlert();
    const { success, error } = createAlertHelpers(showAlert);
    const toggleMFAMutation = useToggleMFA();
    const [verificationCode, setVerificationCode] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"setup" | "verify">("setup");
    const bottomSheetRef = useRef<BottomSheetModalRef>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const generateSecretKey = async () => {
      try {
        setIsLoading(true);

        // Use Supabase TOTP enrollment
        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: "totp",
        });

        if (enrollError) {
          throw enrollError;
        }

        if (!data) {
          throw new Error("Failed to enroll MFA");
        }

        // Set the secret and QR code from Supabase
        setSecretKey(data.totp.secret);
        setQrCodeUrl(data.totp.qr_code);
      } catch (err: any) {
        console.error("Error generating secret key:", err);
        showAlert({
          title: "Error",
          message: err.message ||
            "Failed to generate 2FA setup. Please try again.",
          buttons: [{ text: "OK" }],
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleSheetChanges = (index: number) => {
      if (index >= 0 && !profile?.mfa_enabled && !secretKey) {
        generateSecretKey();
      }
    };

    const handleSetup2FA = () => {
      if (!secretKey) {
        showAlert({
          title: "Error",
          message: "Please wait for the setup to complete.",
          buttons: [{ text: "OK" }],
        });
        return;
      }
      setStep("verify");
    };

    const handleVerifyAndEnable = async () => {
      if (!verificationCode.trim()) {
        showAlert({
          title: "Error",
          message:
            "Please enter the verification code from your authenticator app.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      if (verificationCode.length !== 6) {
        showAlert({
          title: "Error",
          message: "Verification code must be 6 digits.",
          buttons: [{ text: "OK" }],
        });
        return;
      }

      try {
        setIsLoading(true);

        // Get the list of factors to find the one we just enrolled
        const { data: factors, error: factorsError } = await supabase.auth.mfa
          .listFactors();

        if (factorsError) {
          throw factorsError;
        }

        // Find the most recent TOTP factor that's not verified
        const totpFactor = factors?.totp?.find((f) =>
          f.status === "unverified"
        );

        if (!totpFactor) {
          throw new Error("No unverified TOTP factor found. Please try again.");
        }

        // Verify the TOTP code with Supabase
        const { data: challengeData, error: challengeError } = await supabase
          .auth
          .mfa.challenge({
            factorId: totpFactor.id,
          });

        if (challengeError) {
          throw challengeError;
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challengeData.id,
          code: verificationCode,
        });

        if (verifyError) {
          throw verifyError;
        }

        // Enable 2FA in the profile
        await toggleMFAMutation.mutateAsync(true);

        showAlert({
          title: "2FA Enabled",
          message:
            "Two-factor authentication has been successfully enabled for your account.",
          buttons: [{
            text: "OK",
            onPress: () => {
              setVerificationCode("");
              setSecretKey("");
              setQrCodeUrl("");
              setStep("setup");
              bottomSheetRef.current?.dismiss();
            },
          }],
        });
      } catch (err: any) {
        console.error("Error enabling 2FA:", err);
        showAlert({
          title: "Error",
          message: err.message ||
            "Failed to enable 2FA. Please check your code and try again.",
          buttons: [{ text: "OK" }],
        });
      } finally {
        setIsLoading(false);
      }
    };

    const handleDisable2FA = async () => {
      showAlert({
        title: "Disable 2FA",
        message: "This will make your account less secure.",
        buttons: [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);
                const { data: factors } = await supabase.auth.mfa.listFactors();
                const totpFactors = factors?.totp ?? [];
                for (const factor of totpFactors) {
                  if (factor.status === "verified") {
                    await supabase.auth.mfa.unenroll({ factorId: factor.id });
                  }
                }
                await toggleMFAMutation.mutateAsync(false);
                showAlert({
                  title: "2FA Disabled",
                  buttons: [{
                    text: "OK",
                    onPress: () => bottomSheetRef.current?.dismiss(),
                  }],
                });
              } catch (err: any) {
                console.error("Error disabling 2FA:", err);
                showAlert({
                  title: "Error",
                  message: "Failed to disable 2FA. Please try again.",
                  buttons: [{ text: "OK" }],
                });
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      });
    };

    const handleClose = () => {
      setVerificationCode("");
      setSecretKey("");
      setQrCodeUrl("");
      setStep("setup");
    };

    return (
      <>
        <BottomSheetModal
          ref={bottomSheetRef}
          enableDynamicSizing
          onChange={handleSheetChanges}
          onClose={handleClose}
        >
          <View style={styles.modalContainer}>
            <BottomSheetScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {profile?.mfa_enabled
                ? (
                  <View>
                    <View style={styles.statusContainer}>
                      <Ionicons
                        name="shield-checkmark"
                        size={48}
                        color={Colors.primary}
                      />
                      <Text style={styles.statusTitle}>2FA Enabled</Text>
                      <Text style={styles.statusDescription}>
                        Two-factor authentication is protecting your account.
                      </Text>
                    </View>

                    <Button
                      mode="contained"
                      onPress={handleDisable2FA}
                      loading={isLoading}
                      disabled={isLoading}
                      style={[styles.button, styles.disableButton]}
                      buttonColor="#FF3B30"
                      textColor={Colors.white}
                    >
                      Disable 2FA
                    </Button>
                  </View>
                )
                : step === "setup"
                ? (
                  <View>
                    <Text style={styles.description}>
                      Use Google Authenticator or your preferred 2FA app
                    </Text>

                    {isLoading
                      ? (
                        <View style={styles.loadingContainer}>
                          <CustomLoader />
                          <Text style={styles.loadingText}>
                            Setting up 2FA...
                          </Text>
                        </View>
                      )
                      : (
                        <View>
                          {/* QR Code Section */}
                          <View style={styles.qrContainer}>
                            <View style={styles.qrCodeWrapper}>
                              {qrCodeUrl
                                ? (
                                  <QRCode
                                    value={qrCodeUrl}
                                    size={200}
                                    color={Colors.black}
                                    backgroundColor={Colors.white}
                                  />
                                )
                                : (
                                  <View style={styles.qrPlaceholder}>
                                    <Text style={styles.qrPlaceholderText}>
                                      Generating QR Code...
                                    </Text>
                                  </View>
                                )}
                            </View>
                            <Text style={styles.qrHelpText}>
                              Scan with your auth app
                            </Text>
                          </View>

                          {/* Secret Key Section */}
                          <View style={styles.secretContainer}>
                            <Text style={styles.secretLabel}>
                              Or enter manually:
                            </Text>
                            <View style={styles.secretBox}>
                              <Text style={styles.secretText}>{secretKey}</Text>
                              <TouchableOpacity
                                onPress={async () => {
                                  const isCopied = await copyToClipboard(
                                    secretKey,
                                  );
                                  if (isCopied) {
                                    success(
                                      "Secret Key Copied",
                                      "Your 2FA secret key has been copied to the clipboard.",
                                    );
                                  } else {
                                    error(
                                      "Copy Failed",
                                      "Unable to copy secret key to clipboard.",
                                    );
                                  }
                                }}
                                style={styles.shareButton}
                              >
                                <Ionicons
                                  name="copy-outline"
                                  size={20}
                                  color={Colors.primary}
                                />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.helpText}>
                              Copy this key and enter it manually in your
                              authenticator app
                            </Text>
                          </View>

                          <Button
                            mode="contained"
                            onPress={handleSetup2FA}
                            style={styles.button}
                            buttonColor={Colors.primary}
                            textColor={Colors.white}
                          >
                            I&apos;ve Added the Key
                          </Button>
                        </View>
                      )}
                  </View>
                )
                : (
                  // Verify setup
                  <View>
                    <View style={styles.verifyContainer}>
                      <Text style={styles.verifyTitle}>
                        Enter Verification Code
                      </Text>

                      {/* 6 Digit Boxes */}
                      <View style={styles.codeBoxesContainer}>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <View
                            key={index}
                            style={[
                              styles.codeBox,
                              verificationCode[index] && styles.codeBoxFilled,
                            ]}
                          >
                            <Text style={styles.codeBoxText}>
                              {verificationCode[index] || ""}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Hidden Input for Keyboard */}
                      <BottomSheetTextInput
                        style={styles.hiddenInput}
                        value={verificationCode}
                        onChangeText={(t) =>
                          setVerificationCode(t.replace(/\D/g, ""))}
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                      />

                      {verificationCode.length > 0 &&
                        verificationCode.length !== 6 && (
                        <Text style={styles.errorText}>
                          Code must be 6 digits
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        isLoading && styles.buttonDisabled,
                      ]}
                      onPress={handleVerifyAndEnable}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? <CustomLoader />
                        : <Text style={styles.buttonText}>Enable 2FA</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setStep("setup")}
                    >
                      <Text style={styles.backButtonText}>Back to Setup</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </BottomSheetScrollView>
          </View>
        </BottomSheetModal>
        <AlertComponent />
      </>
    );
  },
);

TwoFactorAuthModal.displayName = "TwoFactorAuthModal";

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.white,
  },
  modalContent: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.grey,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 12,
  },
  qrHelpText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 16,
  },
  secretContainer: {
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 8,
  },
  secretBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  secretText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "monospace",
    color: Colors.black,
    fontWeight: "600",
    letterSpacing: 1,
  },
  shareButton: {
    padding: 4,
  },
  helpText: {
    fontSize: 13,
    color: Colors.grey,
    lineHeight: 18,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  disableButton: {
    backgroundColor: "#FF3B30",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  verifyContainer: {
    paddingVertical: 20,
  },
  verifyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  codeBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  codeBox: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
  },
  codeBoxText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.black,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: "center",
  },
});

export default TwoFactorAuthModal;
