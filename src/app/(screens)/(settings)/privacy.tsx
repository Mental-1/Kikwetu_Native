import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { useProfile } from '@/src/hooks/useProfile';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChangeEmailModal from '../(auth)/changeEmail';
import ChangePasswordModal from '../(auth)/changePassword';
import TwoFactorAuthModal from '../(auth)/twoFactorAuth';

const Privacy = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { error } = createAlertHelpers(showAlert);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleChangeEmail = () => {
    setShowChangeEmailModal(true);
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const handleToggle2FA = () => {
    setShow2FAModal(true);
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
          subtitle: profile?.mfa_enabled ? 'Enabled - Tap to manage' : 'Disabled - Tap to enable',
          icon: profile?.mfa_enabled ? 'shield-checkmark' : 'shield-outline',
          onPress: handleToggle2FA,
          showStatus: profile?.mfa_enabled,
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
          <Text style={styles.infoText}>2FA: {profile?.mfa_enabled ? 'Enabled' : 'Disabled'}</Text>
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
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.showStatus && (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>ON</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}


        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Custom Alert Component */}
      <AlertComponent />

      {/* Change Email Modal */}
      <ChangeEmailModal
        visible={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuthModal
        visible={show2FAModal}
        onClose={() => setShow2FAModal(false)}
      />
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
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.grey,
  },
  bottomPadding: {
    height: 24,
  },
});

export default Privacy;
