import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StoreFormData {
  name: string;
  description: string;
  category: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  is_active: boolean;
}

const StoreEdit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mock current store data
  const currentStore = {
    id: id || '1',
    name: 'Tech Haven',
    description: 'Your one-stop shop for latest tech gadgets and accessories',
    category: 'Electronics',
    banner_url: 'https://via.placeholder.com/800x300',
    profile_url: 'https://via.placeholder.com/100',
    website: 'https://techhaven.com',
    instagram: '@techhaven',
    facebook: 'TechHaven',
    twitter: '@techhaven',
    is_active: true,
  };

  const [formData, setFormData] = useState<StoreFormData>({
    name: currentStore.name,
    description: currentStore.description,
    category: currentStore.category,
    website: currentStore.website,
    instagram: currentStore.instagram,
    facebook: currentStore.facebook,
    twitter: currentStore.twitter,
    is_active: currentStore.is_active,
  });

  const [bannerImage, setBannerImage] = useState<string | null>(currentStore.banner_url);
  const [profileImage, setProfileImage] = useState<string | null>(currentStore.profile_url);

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Fitness',
    'Books & Media',
    'Health & Beauty',
    'Automotive',
    'Food & Beverages',
    'Toys & Games',
    'Other',
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Store description is required');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Store updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update store. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type: 'banner' | 'profile') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: type === 'profile',
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'banner') {
          setBannerImage(result.assets[0].uri);
        } else {
          setProfileImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleBannerImagePress = () => {
    Alert.alert(
      'Select Banner Image',
      'Choose an image for your store banner',
      [
        { text: 'Camera', onPress: () => pickImageFromCamera('banner') },
        { text: 'Gallery', onPress: () => pickImage('banner') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleProfileImagePress = () => {
    Alert.alert(
      'Select Profile Image',
      'Choose an image for your store profile',
      [
        { text: 'Camera', onPress: () => pickImageFromCamera('profile') },
        { text: 'Gallery', onPress: () => pickImage('profile') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImageFromCamera = async (type: 'banner' | 'profile') => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: type === 'profile',
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'banner') {
          setBannerImage(result.assets[0].uri);
        } else {
          setProfileImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const updateFormData = (field: keyof StoreFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderImageSection = () => (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>Store Images</Text>
      
      {/* Banner Image */}
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>Banner Image</Text>
        <TouchableOpacity style={styles.imageUpload} onPress={handleBannerImagePress}>
          {bannerImage ? (
            <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={32} color={Colors.grey} />
              <Text style={styles.placeholderText}>Tap to add banner</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>Profile Image</Text>
        <TouchableOpacity style={styles.profileImageUpload} onPress={handleProfileImagePress}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="camera-outline" size={24} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBasicInfoSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Store Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          placeholder="Enter store name"
          placeholderTextColor={Colors.grey}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Describe your store and what you sell"
          placeholderTextColor={Colors.grey}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Category</Text>
        <TouchableOpacity style={styles.categorySelector}>
          <Text style={styles.categoryText}>{formData.category}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.toggleContainer}
        onPress={() => updateFormData('is_active', !formData.is_active)}
      >
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Store Status</Text>
          <Text style={styles.toggleSubtext}>
            {formData.is_active ? 'Store is visible to customers' : 'Store is hidden from customers'}
          </Text>
        </View>
        <View style={[styles.toggle, formData.is_active && styles.toggleActive]}>
          <View style={[styles.toggleThumb, formData.is_active && styles.toggleThumbActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSocialLinksSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Website</Text>
        <TextInput
          style={styles.textInput}
          value={formData.website}
          onChangeText={(value) => updateFormData('website', value)}
          placeholder="https://your-website.com"
          placeholderTextColor={Colors.grey}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Instagram</Text>
        <TextInput
          style={styles.textInput}
          value={formData.instagram}
          onChangeText={(value) => updateFormData('instagram', value)}
          placeholder="@your-instagram"
          placeholderTextColor={Colors.grey}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Facebook</Text>
        <TextInput
          style={styles.textInput}
          value={formData.facebook}
          onChangeText={(value) => updateFormData('facebook', value)}
          placeholder="Your Facebook page name"
          placeholderTextColor={Colors.grey}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Twitter</Text>
        <TextInput
          style={styles.textInput}
          value={formData.twitter}
          onChangeText={(value) => updateFormData('twitter', value)}
          placeholder="@your-twitter"
          placeholderTextColor={Colors.grey}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Store</Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImageSection()}
        {renderBasicInfoSection()}
        {renderSocialLinksSection()}
        
        {/* Bottom padding for scroll */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 0.3,
    borderBottomColor: Colors.lightgrey,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 16,
    padding: 16,
  },
  imageSection: {
    backgroundColor: Colors.white,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  imageUpload: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.grey,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 8,
  },
  profileImageUpload: {
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  inputContainer: {
    marginBottom: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.black,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    color: Colors.grey,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightgrey,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  bottomPadding: {
    height: 40,
  },
});

export default StoreEdit;