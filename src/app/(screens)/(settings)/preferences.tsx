import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const Preferences = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);
  
  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  
  // App preferences
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  
  // Language and region
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedRegion, setSelectedRegion] = useState('United States');

  const handleBack = () => {
    router.back();
  };

  const handleLanguageSelect = () => {
    showAlert({
      title: 'Language Selection',
      message: 'Language selection will be implemented',
      buttonText: 'OK',
      icon: 'language-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Language selection functionality will be added');
      }
    });
  };

  const handleCurrencySelect = () => {
    showAlert({
      title: 'Currency Selection',
      message: 'Currency selection will be implemented',
      buttonText: 'OK',
      icon: 'cash-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Currency selection functionality will be added');
      }
    });
  };

  const handleRegionSelect = () => {
    showAlert({
      title: 'Region Selection',
      message: 'Region selection will be implemented',
      buttonText: 'OK',
      icon: 'globe-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Region selection functionality will be added');
      }
    });
  };


  const handleResetPreferences = () => {
    showAlert({
      title: 'Reset Preferences',
      message: 'Are you sure you want to reset all preferences to default values?',
      buttonText: 'Reset',
      icon: 'refresh-outline',
      iconColor: '#FF9800',
      buttonColor: '#FF9800',
      onPress: () => {
        // Reset all preferences to defaults
        setPushNotifications(true);
        setEmailNotifications(false);
        setMarketingEmails(false);
        setPriceAlerts(true);
        setMessageNotifications(true);
        setDarkMode(false);
        setAutoSave(true);
        setLocationServices(true);
        setAnalytics(true);
        setSelectedLanguage('English');
        setSelectedCurrency('USD');
        setSelectedRegion('United States');
        
        success('Success', 'All preferences have been reset to defaults');
      }
    });
  };

  const preferenceSections = [
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          value: pushNotifications,
          onToggle: setPushNotifications,
          type: 'switch',
        },
        {
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          value: emailNotifications,
          onToggle: setEmailNotifications,
          type: 'switch',
        },
        {
          title: 'Marketing Emails',
          subtitle: 'Receive promotional offers and updates',
          value: marketingEmails,
          onToggle: setMarketingEmails,
          type: 'switch',
        },
        {
          title: 'Price Alerts',
          subtitle: 'Get notified when prices change',
          value: priceAlerts,
          onToggle: setPriceAlerts,
          type: 'switch',
        },
        {
          title: 'Message Notifications',
          subtitle: 'Get notified about new messages',
          value: messageNotifications,
          onToggle: setMessageNotifications,
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
          onToggle: setDarkMode,
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
          subtitle: selectedLanguage,
          value: null,
          onPress: handleLanguageSelect,
          type: 'navigation',
          icon: 'chevron-forward',
        },
        {
          title: 'Currency',
          subtitle: selectedCurrency,
          value: null,
          onPress: handleCurrencySelect,
          type: 'navigation',
          icon: 'chevron-forward',
        },
        {
          title: 'Region',
          subtitle: selectedRegion,
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
        
        {item.type === 'navigation' && (
          <Ionicons name={item.icon} size={20} color={Colors.grey} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
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
        });

export default Preferences;
