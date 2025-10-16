import { Colors } from '@/src/constants/constant';
import { useCreateStore } from '@/src/hooks/useStores';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
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
}

const StoreCreate = () => {
  const router = useRouter();
  const createStoreMutation = useCreateStore();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    category: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
  });

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const hasUnsavedChanges = () => {
    return formData.name.trim() || 
           formData.description.trim() || 
           formData.category.trim() ||
           bannerImage || 
           profileImage;
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Store description is required');
      return;
    }

    if (!formData.category.trim()) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSaving(true);
    try {
      const storeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        contact_email: formData.website.trim() || null,
        is_active: true,
      };

      const images = {
        banner_image: bannerImage || undefined,
        profile_image: profileImage || undefined,
      };

      const result = await createStoreMutation.mutateAsync({ storeData, images });
      
      if (result.success) {
        Alert.alert('Success', 'Store created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create store');
      }
    } catch (error) {
      console.error('Create store error:', error);
      Alert.alert('Error', 'Failed to create store. Please try again.');
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

  const updateFormData = (field: keyof StoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectCategory = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryPicker(false);
  };

  const renderImageSection = () => (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>Store Images</Text>
      <Text style={styles.sectionSubtitle}>Add images to make your store stand out</Text>
      
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
              <Text style={styles.placeholderSubtext}>Recommended: 800x300px</Text>
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
        <Text style={styles.profileImageHelpText}>Square image recommended</Text>
      </View>
    </View>
  );

  const renderBasicInfoSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <Text style={styles.sectionSubtitle}>Tell customers about your store</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Store Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          placeholder="Enter your store name"
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
        <Text style={styles.inputLabel}>Category *</Text>
        <TouchableOpacity 
          style={styles.categorySelector} 
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={[styles.categoryText, !formData.category && styles.placeholderText]}>
            {formData.category || 'Select a category'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.grey} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSocialLinksSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      <Text style={styles.sectionSubtitle}>Connect your social media accounts (optional)</Text>
      
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

  const renderCategoryPicker = () => (
    <View style={styles.categoryPickerOverlay}>
      <View style={styles.categoryPicker}>
        <View style={styles.categoryPickerHeader}>
          <Text style={styles.categoryPickerTitle}>Select Category</Text>
          <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
            <Ionicons name="close" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.categoryList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryItem,
                formData.category === category && styles.selectedCategoryItem
              ]}
              onPress={() => selectCategory(category)}
            >
              <Text style={[
                styles.categoryItemText,
                formData.category === category && styles.selectedCategoryItemText
              ]}>
                {category}
              </Text>
              {formData.category === category && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          <Text style={styles.headerTitle}>Create Store</Text>
          <TouchableOpacity 
            style={[styles.createButton, saving && styles.disabledButton]} 
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
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

      {showCategoryPicker && renderCategoryPicker()}
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.grey,
  },
  createButtonText: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.grey,
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
  placeholderSubtext: {
    fontSize: 10,
    color: Colors.grey,
    marginTop: 2,
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
  profileImageHelpText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 4,
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
  categoryPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  categoryPicker: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  categoryPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  selectedCategoryItem: {
    backgroundColor: Colors.background,
  },
  categoryItemText: {
    fontSize: 16,
    color: Colors.black,
  },
  selectedCategoryItemText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default StoreCreate;