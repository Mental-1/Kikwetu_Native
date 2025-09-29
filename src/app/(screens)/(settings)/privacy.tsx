import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Privacy = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleChangeEmail = () => {
    // Close any other open forms first
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    setIsChangingEmail(true);
  };

  const handleSaveEmailChange = () => {
    // TODO: Implement email change functionality
    success('Success', 'Email change request sent! Please check your new email for verification.');
    setIsChangingEmail(false);
    setNewEmail('');
    // Also clear any password form data
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCancelEmailChange = () => {
    setIsChangingEmail(false);
    setNewEmail('');
    // Also clear any password form data
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = () => {
    // Close any other open forms first
    setIsChangingEmail(false);
    setNewEmail('');
    
    setIsChangingPassword(true);
  };

  const handleSavePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      error('Error', 'New passwords do not match');
      return;
    }
    // TODO: Implement password change functionality
    success('Success', 'Password updated successfully!');
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    // Also clear any email form data
    setIsChangingEmail(false);
    setNewEmail('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    // Also clear any email form data
    setIsChangingEmail(false);
    setNewEmail('');
  };

  const handleToggle2FA = () => {
    if (isTwoFAEnabled) {
      showAlert({
        title: 'Disable 2FA',
        message: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        buttonText: 'Disable',
        icon: 'warning',
        iconColor: '#FF9800',
        buttonColor: '#FF9800',
        onPress: () => {
          setIsTwoFAEnabled(false);
          success('Success', 'Two-factor authentication has been disabled');
        }
      });
    } else {
      // TODO: Implement 2FA setup flow
      success('Success', 'Two-factor authentication setup will be implemented');
      setIsTwoFAEnabled(true);
    }
  };

  const privacySections = [
    {
      title: 'Security Settings',
      items: [
        {
          title: 'Change Email',
          subtitle: 'Update your account email address',
          icon: 'mail-outline',
          onPress: handleChangeEmail,
        },
        {
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'lock-closed-outline',
          onPress: handleChangePassword,
        },
        {
          title: 'Two-Factor Authentication',
          subtitle: isTwoFAEnabled ? 'Enabled - Tap to disable' : 'Disabled - Tap to enable',
          icon: isTwoFAEnabled ? 'shield-checkmark' : 'shield-outline',
          onPress: handleToggle2FA,
          rightElement: (
            <View style={[
              styles.toggleSwitch,
              { backgroundColor: isTwoFAEnabled ? Colors.primary : Colors.lightgrey }
            ]}>
              <View style={[
                styles.toggleThumb,
                { transform: [{ translateX: isTwoFAEnabled ? 16 : 2 }] }
              ]} />
            </View>
          ),
        },
      ],
    },
    {
      title: 'Privacy Controls',
      items: [
        {
          title: 'Profile Visibility',
          subtitle: 'Control who can see your profile',
          icon: 'eye-outline',
          onPress: () => error('Not Implemented', 'Profile visibility settings will be implemented'),
        },
        {
          title: 'Data Export',
          subtitle: 'Download your account data',
          icon: 'download-outline',
          onPress: () => error('Not Implemented', 'Data export functionality will be implemented'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerRight} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Account Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Account</Text>
          <Text style={styles.infoText}>Email: {user?.email || 'Not available'}</Text>
          <Text style={styles.infoText}>2FA: {isTwoFAEnabled ? 'Enabled' : 'Disabled'}</Text>
        </View>

        {/* Security Settings */}
        {privacySections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingsItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.rightElement || <Ionicons name="chevron-forward" size={20} color={Colors.grey} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Email Change Form */}
        {isChangingEmail && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Email</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Email</Text>
                <Text style={styles.displayText}>{user?.email || 'Not available'}</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter your new email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEmailChange}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmailChange}>
                  <Text style={styles.saveButtonText}>Send Verification</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Password Change Form */}
        {isChangingPassword && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter your current password"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter your new password"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your new password"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPasswordChange}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSavePasswordChange}>
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Custom Alert Component */}
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.lightgrey,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grey,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.grey,
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputGroup: {
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
  },
  eyeIcon: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  displayText: {
    fontSize: 16,
    color: Colors.black,
    paddingVertical: 12,
    lineHeight: 22,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.grey,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});

export default Privacy;
