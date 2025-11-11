import SelectionModal from '@/components/ui/SelectionModal';
import { Colors } from '@/src/constants/constant';
import { useUpdateProfile } from '@/src/hooks/useProfile';
import { useUser } from '@/src/hooks/useUser';
import usePreferencesStore from '@/stores/usePreferencesStore';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Preferences = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { error, success } = createAlertHelpers(showAlert);

  const updateProfileMutation = useUpdateProfile();
  const { updatePreferences } = useUser();

  const {
    pushNotifications,
    emailNotifications,
    marketingEmails,
    priceAlerts,
    messageNotifications,
    darkMode,
    autoSave,
    locationServices,
    analytics,
    language,
    currency,
    region,
    setPushNotifications,
    setEmailNotifications,
    setMarketingEmails,
    setPriceAlerts,
    setMessageNotifications,
    setDarkMode,
    setAutoSave,
    setLocationServices,
    setAnalytics,
    setLanguage,
    setCurrency,
    setRegion,
    resetPreferences,
  } = usePreferencesStore();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const regions = [
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  ];

  const handleBack = () => {
    router.back();
  };

  const updatePreference = useCallback(
    async (field: string, value: any) => {
      try {
        if (
          ['push_notifications', 'email_notifications', 'marketing_emails', 'price_alerts', 'new_messages'].includes(
            field
          )
        ) {
          await updateProfileMutation.mutateAsync({
            [field]: value,
          });
        } else {
          await updatePreferences({
            [field]: value,
          });
        }
      } catch (err) {
        console.error('Error updating preference:', err);
        error('Error', 'Failed to update preference. Please try again.');
      }
    },
    [updateProfileMutation, updatePreferences, error]
  );

  const handleNotificationToggle = useCallback(
    async (field: string, value: boolean) => {
      await updatePreference(field, value);
    },
    [updatePreference]
  );

  const handleThemeToggle = useCallback(
    async (value: boolean) => {
      setDarkMode(value);
      await updatePreference('theme', value ? 'dark' : 'light');
    },
    [updatePreference, setDarkMode]
  );

  const handleLanguageChange = useCallback(
    async (language: string) => {
      setLanguage(language);
      await updatePreference('language', language);
    },
    [updatePreference, setLanguage]
  );

  const handleCurrencyChange = useCallback(
    async (currency: string) => {
      setCurrency(currency);
      await updatePreference('currency', currency);
    },
    [updatePreference, setCurrency]
  );

  const handleLanguageSelect = useCallback(() => {
    setShowLanguageModal(true);
  }, []);

  const handleCurrencySelect = useCallback(() => {
    setShowCurrencyModal(true);
  }, []);

  const handleRegionSelect = useCallback(() => {
    setShowRegionModal(true);
  }, []);

  const handleLanguageConfirm = useCallback(
    async (language: string) => {
      setShowLanguageModal(false);
      await handleLanguageChange(language);
    },
    [handleLanguageChange]
  );

  const handleCurrencyConfirm = useCallback(
    async (currency: string) => {
      setShowCurrencyModal(false);
      await handleCurrencyChange(currency);
    },
    [handleCurrencyChange]
  );

  const handleRegionConfirm = useCallback(
    async (region: string) => {
      setShowRegionModal(false);
      setRegion(region);
      // TODO: Implement region preference update
      success('Success', 'Region updated successfully');
    },
    [success, setRegion]
  );

  const handleResetPreferences = useCallback(() => {
    showAlert({
      title: 'Reset Preferences',
      message: 'Are you sure you want to reset all preferences to default values?',
      buttons: [
        {
          text: 'Reset',
          style: 'destructive',
          color: '#FF9800',
          onPress: async () => {
            try {
              resetPreferences();
              await updatePreferences({
                theme: 'light',
                language: 'English',
                currency: 'KES',
              });
            } catch (err) {
              error('Error', 'Failed to reset preferences. Please try again.');
            }
          },
        },
      ],
      icon: 'refresh-outline',
      iconColor: '#FF9800',
    });
  }, [showAlert, resetPreferences, updatePreferences, error]);

  const preferenceSections = [
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          value: pushNotifications,
          onToggle: (value: boolean) => {
            setPushNotifications(value);
            handleNotificationToggle('push_notifications', value);
          },
          type: 'switch',
        },
        {
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          value: emailNotifications,
          onToggle: (value: boolean) => {
            setEmailNotifications(value);
            handleNotificationToggle('email_notifications', value);
          },
          type: 'switch',
        },
        {
          title: 'Marketing Emails',
          subtitle: 'Receive promotional offers and updates',
          value: marketingEmails,
          onToggle: (value: boolean) => {
            setMarketingEmails(value);
            handleNotificationToggle('marketing_emails', value);
          },
          type: 'switch',
        },
        {
          title: 'Price Alerts',
          subtitle: 'Get notified when prices change',
          value: priceAlerts,
          onToggle: (value: boolean) => {
            setPriceAlerts(value);
            handleNotificationToggle('price_alerts', value);
          },
          type: 'switch',
        },
        {
          title: 'Message Notifications',
          subtitle: 'Get notified about new messages',
          value: messageNotifications,
          onToggle: (value: boolean) => {
            setMessageNotifications(value);
            handleNotificationToggle('new_messages', value);
          },
          type: 'switch',
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          value: darkMode,
          onToggle: (value: boolean) => {
            setDarkMode(value);
            handleThemeToggle(value);
          },
          type: 'switch',
        },
        {
          title: 'Auto Save',
          subtitle: 'Automatically save form data',
          value: autoSave,
          onToggle: setAutoSave,
          type: 'switch',
        },
        {
          title: 'Location Services',
          subtitle: 'Allow access to your location',
          value: locationServices,
          onToggle: setLocationServices,
          type: 'switch',
        },
        {
          title: 'Analytics',
          subtitle: 'Help improve the app with usage data',
          value: analytics,
          onToggle: setAnalytics,
          type: 'switch',
        },
      ],
    },
    {
      title: 'Language & Region',
      items: [
        {
          title: 'Language',
          subtitle: language,
          value: null,
          onPress: handleLanguageSelect,
          type: 'navigation',
          icon: 'chevron-forward',
        },
        {
          title: 'Currency',
          subtitle: currency,
          value: null,
          onPress: handleCurrencySelect,
          type: 'navigation',
          icon: 'chevron-forward',
        },
        {
          title: 'Region',
          subtitle: region,
          value: null,
          onPress: handleRegionSelect,
          type: 'navigation',
          icon: 'chevron-forward',
        },
      ],
    },
  ];

  const renderPreferenceItem = (item: any, index: number, isLast: boolean) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.preferenceItem, isLast && styles.lastItem]}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>

        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: Colors.lightgrey, true: '#4CAF5040' }}
            thumbColor={item.value ? '#4CAF50' : Colors.grey}
            ios_backgroundColor={Colors.lightgrey}
          />
        )}

        {item.type === 'navigation' && <Ionicons name={item.icon} size={20} color={Colors.grey} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPreferences}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {preferenceSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionList}>
              {section.items.map((item, itemIndex) =>
                renderPreferenceItem(item, itemIndex, itemIndex === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* Reset Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>
          <View style={styles.sectionList}>
            <TouchableOpacity
              style={styles.preferenceItem}
              onPress={() => error('Not Implemented', 'Export preferences functionality will be implemented')}
            >
              <View style={styles.itemIcon}>
                <Ionicons name="download-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Export Preferences</Text>
                <Text style={styles.itemSubtitle}>Download your preference settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <SelectionModal
        visible={showLanguageModal}
        title="Select Language"
        options={languages}
        selectedValue={language}
        onSelect={handleLanguageConfirm}
        onClose={() => setShowLanguageModal(false)}
      />

      <SelectionModal
        visible={showCurrencyModal}
        title="Select Currency"
        options={currencies}
        selectedValue={currency}
        onSelect={handleCurrencyConfirm}
        onClose={() => setShowCurrencyModal(false)}
      />

      <SelectionModal
        visible={showRegionModal}
        title="Select Region"
        options={regions}
        selectedValue={region}
        onSelect={handleRegionConfirm}
        onClose={() => setShowRegionModal(false)}
      />

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
  resetButton: {
    padding: 4,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
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
  preferenceItem: {
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
          bottomPadding: {
            height: 24,
          },
          loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 64,
          },
          loadingText: {
            fontSize: 14,
            color: Colors.grey,
            marginTop: 12,
          },
          headerRight: {
            width: 60,
          },
          modalOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          },
          modalContent: {
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: 20,
            margin: 20,
            maxHeight: '80%',
            width: '90%',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          },
          modalTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors.black,
            marginBottom: 16,
            textAlign: 'center',
          },
          modalOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 8,
            backgroundColor: Colors.background,
          },
          modalOptionFlag: {
            fontSize: 20,
            marginRight: 12,
          },
          modalOptionSymbol: {
            fontSize: 16,
            fontWeight: 'bold',
            color: Colors.primary,
            marginRight: 12,
            minWidth: 30,
          },
          modalOptionText: {
            flex: 1,
            fontSize: 16,
            color: Colors.black,
          },
          modalCancel: {
            marginTop: 16,
            paddingVertical: 12,
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: Colors.lightgrey,
          },
          modalCancelText: {
            fontSize: 16,
            color: Colors.grey,
            fontWeight: '500',
          },
        });

export default Preferences;
