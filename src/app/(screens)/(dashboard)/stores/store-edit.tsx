import CustomAlert from '@/components/ui/CustomAlert';
import { useCategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useStore, useUpdateStore } from '@/src/hooks/useStores';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StoreFormData {
  name: string;
  description: string;
  categoryId: number | null;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  is_active: boolean;
}

interface StoreFormData {
  name: string;
  description: string;
  categoryId: number | null;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  is_active: boolean;
}

const StoreEdit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saving, setSaving] = useState(false);

  const {
    data: storeResponse,
    isLoading: storeLoading,
    error: storeError,
  } = useStore(id || '');
  const updateStoreMutation = useUpdateStore();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const currentStore = storeResponse;

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'destructive' | 'cancel';
    }[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  const [formData, setFormData] = useState<StoreFormData>({
    name: currentStore?.name || '',
    description: currentStore?.description || '',
    categoryId: null,
    website: (currentStore as any)?.website || '',
    instagram: (currentStore as any)?.instagram || '',
    facebook: (currentStore as any)?.facebook || '',
    twitter: (currentStore as any)?.twitter || '',
    tiktok: (currentStore as any)?.tiktok || '',
    is_active: currentStore?.is_active || true,
  });

  const [bannerImage, setBannerImage] = useState<string | null>(
    currentStore?.banner_url || null
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    currentStore?.profile_url || null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Helper function to show alerts
  const showCustomAlert = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'destructive' | 'cancel';
    }[]
  ) => {
    setAlertConfig({ title, message, buttons });
    setShowAlert(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showCustomAlert('Error', 'Store name is required', [{ text: 'OK' }]);
      return;
    }

    if (!formData.description.trim()) {
      showCustomAlert('Error', 'Store description is required', [
        { text: 'OK' },
      ]);
      return;
    }

    setSaving(true);
    try {
      const storeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category:
          categories?.find((c) => c.id === formData.categoryId)?.name || null,
        website: formData.website.trim() || null,
        instagram: formData.instagram.trim() || null,
        facebook: formData.facebook.trim() || null,
        twitter: formData.twitter.trim() || null,
        tiktok: formData.tiktok.trim() || null,
        is_active: formData.is_active,
      };

      const images = {
        banner_image: bannerImage || undefined,
        profile_image: profileImage || undefined,
      };

      const result = await updateStoreMutation.mutateAsync({
        storeId: id || '',
        storeData,
        images,
      });

      if (result.success) {
        showCustomAlert('Success', 'Store updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowAlert(false);
              router.back();
            },
          },
        ]);
      } else {
        showCustomAlert('Error', result.error || 'Failed to update store', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.error('Update store error:', error);
      showCustomAlert('Error', 'Failed to update store. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (type: 'banner' | 'profile') => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showCustomAlert(
          'Permission Required',
          'Permission to access camera roll is required!',
          [{ text: 'OK' }]
        );
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
    } catch {
      showCustomAlert('Error', 'Failed to pick image. Please try again.', [
        { text: 'OK' },
      ]);
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
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        showCustomAlert(
          'Permission Required',
          'Permission to access camera is required!',
          [{ text: 'OK' }]
        );
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
    } catch {
      showCustomAlert('Error', 'Failed to take photo. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const updateFormData = (
    field: keyof StoreFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderImageSection = () => (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>Store Images</Text>

      {/* Banner Image */}
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>Banner Image</Text>
        <TouchableOpacity
          style={styles.imageUpload}
          onPress={handleBannerImagePress}
        >
          {bannerImage ? (
            <Image
              source={{ uri: bannerImage }}
              style={styles.bannerImage}
              resizeMode='cover'
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name='camera-outline' size={32} color={Colors.grey} />
              <Text style={styles.placeholderText}>Tap to add banner</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>Profile Image</Text>
        <TouchableOpacity
          style={styles.profileImageUpload}
          onPress={handleProfileImagePress}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name='camera-outline' size={24} color={Colors.white} />
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
          placeholder='Enter store name'
          placeholderTextColor={Colors.grey}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder='Describe your store and what you sell'
          placeholderTextColor={Colors.grey}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Category</Text>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
        >
          <Text
            style={[
              styles.categoryText,
              !formData.categoryId && styles.placeholderText,
            ]}
          >
            {formData.categoryId
              ? categories?.find((c) => c.id === formData.categoryId)?.name
              : 'Select Category'}
          </Text>
          <Ionicons
            name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.grey}
          />
        </TouchableOpacity>

        {showCategoryPicker && (
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.dropdownScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {categoriesLoading ? (
                <Text style={styles.loadingText}>Loading categories...</Text>
              ) : (
                categories?.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      updateFormData('categoryId', category.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{category.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => updateFormData('is_active', !formData.is_active)}
      >
        <View style={styles.toggleInfo}>
          <Text style={styles.toggleLabel}>Store Status</Text>
          <Text style={styles.toggleSubtext}>
            {formData.is_active
              ? 'Store is visible to customers'
              : 'Store is hidden from customers'}
          </Text>
        </View>
        <View
          style={[styles.toggle, formData.is_active && styles.toggleActive]}
        >
          <View
            style={[
              styles.toggleThumb,
              formData.is_active && styles.toggleThumbActive,
            ]}
          />
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
          placeholder='https://your-website.com'
          placeholderTextColor={Colors.grey}
          keyboardType='url'
          autoCapitalize='none'
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Instagram</Text>
        <TextInput
          style={styles.textInput}
          value={formData.instagram}
          onChangeText={(value) => updateFormData('instagram', value)}
          placeholder='@your-instagram'
          placeholderTextColor={Colors.grey}
          autoCapitalize='none'
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Facebook</Text>
        <TextInput
          style={styles.textInput}
          value={formData.facebook}
          onChangeText={(value) => updateFormData('facebook', value)}
          placeholder='Your Facebook page name'
          placeholderTextColor={Colors.grey}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Twitter</Text>
        <TextInput
          style={styles.textInput}
          value={formData.twitter}
          onChangeText={(value) => updateFormData('twitter', value)}
          placeholder='@your-twitter'
          placeholderTextColor={Colors.grey}
          autoCapitalize='none'
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>TikTok</Text>
        <TextInput
          style={styles.textInput}
          value={formData.tiktok}
          onChangeText={(value) => updateFormData('tiktok', value)}
          placeholder='@your-tiktok'
          placeholderTextColor={Colors.grey}
          autoCapitalize='none'
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style='dark' />

          {/* Header */}
          <SafeAreaView style={styles.header} edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name='chevron-back' size={24} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Store</Text>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size='small' color={Colors.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {storeLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={Colors.primary} />
                <Text style={styles.loadingText}>Loading store details...</Text>
              </View>
            ) : storeError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name='alert-circle-outline'
                  size={64}
                  color={Colors.grey}
                />
                <Text style={styles.errorTitle}>Failed to Load Store</Text>
                <Text style={styles.errorText}>
                  {storeError?.message ||
                    'Something went wrong while loading the store'}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {renderImageSection()}
                {renderBasicInfoSection()}
                {renderSocialLinksSection()}

                {/* Bottom padding for scroll */}
                <View style={styles.bottomPadding} />
              </>
            )}
          </ScrollView>

          {/* Custom Alert */}
          <CustomAlert
            visible={showAlert}
            title={alertConfig.title}
            message={alertConfig.message}
            buttons={alertConfig.buttons}
            icon='information-circle-outline'
            iconColor={Colors.primary}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.grey,
  },
  errorContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 140,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.black,
  },
});

export default StoreEdit;
