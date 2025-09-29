import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);

  const handleBack = () => {
    router.back();
  };

  const handleAccountSettings = () => {
    router.push('/(screens)/(settings)/account');
  };

  const handlePreferences = () => {
    router.push('/(screens)/(settings)/preferences');
  };

  const handlePrivacy = () => {
    router.push('/(screens)/(settings)/privacy');
  };

  const handlePaymentMethods = () => {
    router.push('/(screens)/(settings)/payment_methods');
  };


  const handleTermsOfService = async () => {
    try {
      await Linking.openURL('https://kikwetu.app/terms');
    } catch {
      error('Error', 'Unable to open Terms of Service');
    }
  };

  const handlePrivacyPolicy = async () => {
    try {
      await Linking.openURL('https://kikwetu.app/privacy');
    } catch {
      error('Error', 'Unable to open Privacy Policy');
    }
  };

  const handleOpenSourceLicenses = () => {
    showAlert({
      title: 'Open Source Licenses',
      message: 'Open source licenses will be displayed here',
      buttonText: 'OK',
      icon: 'document-text-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Open source licenses functionality will be added');
      }
    });
  };

  const handleContactSupport = () => {
    showAlert({
      title: 'Contact Support',
      message: 'Support contact options will be available here',
      buttonText: 'OK',
      icon: 'help-circle-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Support contact functionality will be added');
      }
    });
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Account Settings',
          subtitle: 'Manage your profile and personal information',
          icon: 'person-outline',
          onPress: handleAccountSettings,
        },
        {
          title: 'Preferences',
          subtitle: 'Customize your app experience',
          icon: 'settings-outline',
          onPress: handlePreferences,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          title: 'Privacy & Security',
          subtitle: 'Manage your security and privacy settings',
          icon: 'shield-outline',
          onPress: handlePrivacy,
        },
      ],
    },
    {
      title: 'Payment & Billing',
      items: [
        {
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          icon: 'card-outline',
          onPress: handlePaymentMethods,
        },
      ],
    },
    {
      title: 'Legal & Support',
      items: [
        {
          title: 'Terms of Service',
          subtitle: 'View our terms and conditions',
          icon: 'document-text-outline',
          onPress: handleTermsOfService,
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Learn how we protect your data',
          icon: 'shield-outline',
          onPress: handlePrivacyPolicy,
        },
        {
          title: 'Open Source Licenses',
          subtitle: 'View third-party licenses',
          icon: 'code-outline',
          onPress: handleOpenSourceLicenses,
        },
        {
          title: 'Contact Support',
          subtitle: 'Get help and support',
          icon: 'help-circle-outline',
          onPress: handleContactSupport,
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
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
                  <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version Footer */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            Kikwetu v{Application.nativeApplicationVersion || '1.0.0'}
          </Text>
          <Text style={styles.buildText}>
            Build {Application.nativeBuildVersion || '1'}
          </Text>
          <Text style={styles.copyrightText}>
            © 2024 Kikwetu. All rights reserved.
          </Text>
        </View>

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
  versionSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  buildText: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    opacity: 0.7,
  },
  bottomPadding: {
    height: 24,
  },
});

export default Settings;
