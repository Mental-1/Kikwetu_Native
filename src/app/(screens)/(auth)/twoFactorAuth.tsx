import { supabase } from '@/lib/supabase';
import { Colors } from '@/src/constants/constant';
import { useProfile, useToggleMFA } from '@/src/hooks/useProfile';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

interface TwoFactorAuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ visible, onClose }) => {
  const { data: profile } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);
  const toggleMFAMutation = useToggleMFA();
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  const generateSecretKey = async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase TOTP enrollment
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (enrollError) {
        throw enrollError;
      }

      if (!data) {
        throw new Error('Failed to enroll MFA');
      }

      // Set the secret and QR code from Supabase
      setSecretKey(data.totp.secret);
      setQrCodeUrl(data.totp.qr_code);
      
    } catch (err: any) {
      console.error('Error generating secret key:', err);
      error('Error', err.message || 'Failed to generate 2FA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (visible && !profile?.mfa_enabled && !secretKey) {
      generateSecretKey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, profile?.mfa_enabled]);

  const handleSetup2FA = () => {
    if (!secretKey) {
      error('Error', 'Please wait for the setup to complete.');
      return;
    }
    setStep('verify');
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      error('Error', 'Please enter the verification code from your authenticator app.');
      return;
    }

    if (verificationCode.length !== 6) {
      error('Error', 'Verification code must be 6 digits.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the list of factors to find the one we just enrolled
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        throw factorsError;
      }

      // Find the most recent TOTP factor that's not verified
      const totpFactor = factors?.totp?.find(f => f.status === 'unverified');
      
      if (!totpFactor) {
        throw new Error('No unverified TOTP factor found. Please try again.');
      }

      // Verify the TOTP code with Supabase
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
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
      
      success(
        '2FA Enabled',
        'Two-factor authentication has been successfully enabled for your account.'
      );
      setVerificationCode('');
      setSecretKey('');
      setQrCodeUrl('');
      setStep('setup');
      onClose();
    } catch (err: any) {
      console.error('Error enabling 2FA:', err);
      error('Error', err.message || 'Failed to enable 2FA. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    showAlert({
      title: 'Disable 2FA',
      message: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      buttonText: 'Disable',
      icon: 'warning',
      iconColor: '#FF9800',
      buttonColor: '#FF9800',
      onPress: async () => {
        try {
          setIsLoading(true);
          await toggleMFAMutation.mutateAsync(false);
          success('2FA Disabled', 'Two-factor authentication has been disabled.');
          onClose();
        } catch (err: any) {
          console.error('Error disabling 2FA:', err);
          error('Error', 'Failed to disable 2FA. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleShareSecret = async () => {
    try {
      await Share.share({
        message: `2FA Secret Key: ${secretKey}\n\nUse this key to set up your authenticator app.`,
      });
    } catch (error) {
      console.error('Error sharing secret:', error);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setSecretKey('');
    setQrCodeUrl('');
    setStep('setup');
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {profile?.mfa_enabled ? (
                // 2FA is enabled - show disable option
                <View>
                  <View style={styles.statusContainer}>
                    <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
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
              ) : step === 'setup' ? (
                // Setup 2FA
                <View>
                  <Text style={styles.description}>
                    Set up two-factor authentication to secure your account. You&apos;ll need an authenticator app like Google Authenticator or Authy.
                  </Text>

                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.loadingText}>Setting up 2FA...</Text>
                    </View>
                   ) : (
                     <View>
                       {/* QR Code Section */}
                       <View style={styles.qrContainer}>
                         <Text style={styles.qrLabel}>Scan QR Code:</Text>
                         <View style={styles.qrCodeWrapper}>
                           {qrCodeUrl ? (
                             <QRCode
                               value={qrCodeUrl}
                               size={200}
                               color={Colors.black}
                               backgroundColor={Colors.white}
                             />
                           ) : (
                             <View style={styles.qrPlaceholder}>
                               <Text style={styles.qrPlaceholderText}>Generating QR Code...</Text>
                             </View>
                           )}
                         </View>
                         <Text style={styles.qrHelpText}>
                           Scan this QR code with your authenticator app
                         </Text>
                       </View>

                       {/* Secret Key Section */}
                       <View style={styles.secretContainer}>
                         <Text style={styles.secretLabel}>Or enter manually:</Text>
                         <View style={styles.secretBox}>
                           <Text style={styles.secretText}>{secretKey}</Text>
                           <TouchableOpacity onPress={handleShareSecret} style={styles.shareButton}>
                             <Ionicons name="share-outline" size={20} color={Colors.primary} />
                           </TouchableOpacity>
                         </View>
                         <Text style={styles.helpText}>
                           Copy this key and enter it manually in your authenticator app
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
              ) : (
                // Verify setup
                <View>
                  <Text style={styles.description}>
                    Enter the 6-digit code from your authenticator app to complete the setup.
                  </Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        verificationCode.length > 0 && verificationCode.length !== 6 && styles.textInputError
                      ]}
                      placeholder="000000"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                    {verificationCode.length > 0 && verificationCode.length !== 6 && (
                      <Text style={styles.errorText}>Code must be 6 digits</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleVerifyAndEnable}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Enable 2FA</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.backButton} onPress={() => setStep('setup')}>
                    <Text style={styles.backButtonText}>Back to Setup</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '65%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 24,
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.grey,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    marginBottom: 12,
  },
  qrHelpText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 16,
  },
  secretContainer: {
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  secretBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  secretText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    color: Colors.black,
    fontWeight: '600',
    letterSpacing: 1,
  },
  shareButton: {
    padding: 4,
  },
  helpText: {
    fontSize: 13,
    color: Colors.grey,
    lineHeight: 18,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.black,
    backgroundColor: Colors.white,
    textAlign: 'center',
    letterSpacing: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disableButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  textInputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
  },
});

export default TwoFactorAuthModal;
