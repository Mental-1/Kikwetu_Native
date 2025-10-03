import { Colors } from '@/src/constants/constant';
import { useProfile, useToggleMFA } from '@/src/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TwoFactorAuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({ visible, onClose }) => {
  const { data: profile } = useProfile();
  const toggleMFAMutation = useToggleMFA();
  const [verificationCode, setVerificationCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  useEffect(() => {
    if (visible && !profile?.mfa_enabled) {
      generateSecretKey();
    }
  }, [visible, profile?.mfa_enabled]);

  const generateSecretKey = async () => {
    try {
      setIsLoading(true);
      
      // Generate a random secret key (in a real app, this would come from your backend)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let secret = '';
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setSecretKey(secret);
      
      // Generate QR code URL (simplified - in real app, use proper TOTP library)
      const appName = 'Kikwetu';
      const email = profile?.email || 'user@example.com';
      const qrUrl = `otpauth://totp/${appName}:${email}?secret=${secret}&issuer=${appName}`;
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('Error generating secret key:', error);
      Alert.alert('Error', 'Failed to generate 2FA setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup2FA = () => {
    if (!secretKey) {
      Alert.alert('Error', 'Please wait for the setup to complete.');
      return;
    }
    setStep('verify');
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code from your authenticator app.');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits.');
      return;
    }

    try {
      setIsLoading(true);
      
      // In a real app, you would verify the TOTP code with your backend
      // For now, we'll simulate the verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enable 2FA in the profile
      await toggleMFAMutation.mutateAsync(true);
      
      Alert.alert(
        '2FA Enabled',
        'Two-factor authentication has been successfully enabled for your account.',
        [
          {
            text: 'OK',
            onPress: () => {
              setVerificationCode('');
              setStep('setup');
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error enabling 2FA:', error);
      Alert.alert('Error', 'Failed to enable 2FA. Please check your code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    Alert.alert(
      'Disable 2FA',
      'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await toggleMFAMutation.mutateAsync(false);
              Alert.alert('2FA Disabled', 'Two-factor authentication has been disabled.');
              onClose();
            } catch (error: any) {
              console.error('Error disabling 2FA:', error);
              Alert.alert('Error', 'Failed to disable 2FA. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.title}>Two-Factor Authentication</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
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

                  <TouchableOpacity
                    style={[styles.button, styles.disableButton]}
                    onPress={handleDisable2FA}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Disable 2FA</Text>
                    )}
                  </TouchableOpacity>
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
                      <View style={styles.secretContainer}>
                        <Text style={styles.secretLabel}>Secret Key:</Text>
                        <View style={styles.secretBox}>
                          <Text style={styles.secretText}>{secretKey}</Text>
                          <TouchableOpacity onPress={handleShareSecret} style={styles.shareButton}>
                            <Ionicons name="share-outline" size={20} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.helpText}>
                          Copy this key and enter it in your authenticator app
                        </Text>
                      </View>

                      <TouchableOpacity style={styles.button} onPress={handleSetup2FA}>
                        <Text style={styles.buttonText}>I&apos;ve Added the Key</Text>
                      </TouchableOpacity>
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
                      style={styles.textInput}
                      placeholder="000000"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
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

              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
    flex: 1,
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
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  secretText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.black,
  },
  shareButton: {
    padding: 4,
  },
  helpText: {
    fontSize: 12,
    color: Colors.grey,
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  cancelButtonText: {
    color: Colors.grey,
    fontSize: 16,
  },
});

export default TwoFactorAuthModal;
