import { useCategories } from '@/hooks/useCategories';
import { useListingImageUpload } from '@/hooks/useImageUpload';
import { Colors } from '@/src/constants/constant';
import { useListing, useUpdateListing } from '@/src/hooks/useApiListings';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ListingImage {
  id: string;
  uri: string;
  isNew?: boolean;
}

interface EditListingData {
  title: string;
  description: string;
  price: string;
  location: string;
  category_id: number | null;
  condition: string;
  features: string[];
}

const EditListing = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);

  // API hooks
  const { data: listing, isLoading: listingLoading, error: listingError } = useListing(params.listingId as string);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateListingMutation = useUpdateListing();

  const {
    isProcessing,
    isUploading,
    progress,
    error: uploadError,
    processAndUploadImages,
    initializeUser,
    resetState,
  } = useListingImageUpload(params.listingId as string);

  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<ListingImage[]>([
    { id: '1', uri: 'https://via.placeholder.com/300x200' },
    { id: '2', uri: 'https://via.placeholder.com/300x200' },
  ]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const [formData, setFormData] = useState<EditListingData>({
    title: '',
    description: '',
    price: '',
    location: '',
    category_id: null,
    condition: '',
    features: [],
  });

  // Update form data when listing data is loaded
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price?.toString() || '',
        location: listing.location || '',
        category_id: listing.category_id || null,
        condition: listing.condition || '',
        features: [], // TODO: Add features field to ApiListing if needed
      });
    }
  }, [listing]);

  // Removed unused variables

  const handleBack = () => {
    showAlert({
      title: 'Discard Changes?',
      message: 'You have unsaved changes. Are you sure you want to go back?',
      buttonText: 'Discard',
      icon: 'warning-outline',
      iconColor: '#FF9800',
      buttonColor: '#FF9800',
      onPress: () => {
        router.back();
      }
    });
  };

  const handleAddImage = () => {
    if (images.length >= 10) {
      error('Error', 'You can only add up to 10 images');
      return;
    }

    Alert.alert(
      'Add Image',
      'Choose an image source',
      [
        { text: 'Camera', onPress: () => pickImageFromCamera() },
        { text: 'Gallery', onPress: () => pickImageFromGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImageFromCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      error('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage: ListingImage = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        isNew: true
      };
      setImages(prev => [...prev, newImage]);
      
      // Process and upload the image
      await handleImageUpload([result.assets[0].uri]);
    }
  };

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      error('Permission Required', 'Permission to access photo library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages: ListingImage[] = result.assets.map(asset => ({
        id: Date.now().toString() + Math.random(),
        uri: asset.uri,
        isNew: true
      }));
      
      // Check if adding these images would exceed the limit
      if (images.length + newImages.length > 10) {
        error('Error', 'You can only add up to 10 images total');
        return;
      }
      
      setImages(prev => [...prev, ...newImages]);
      
      // Process and upload the images
      const imageUris = result.assets.map(asset => asset.uri);
      await handleImageUpload(imageUris);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    if (images.length <= 1) {
      error('Error', 'You must have at least one image');
      return;
    }

    showAlert({
      title: 'Remove Image',
      message: 'Are you sure you want to remove this image?',
      buttonText: 'Remove',
      icon: 'trash-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: () => {
        setImages(prev => prev.filter(img => img.id !== imageId));
        success('Success', 'Image removed successfully');
      }
    });
  };

  // Image reordering functionality (for future drag-and-drop implementation)
  // const handleReorderImages = (fromIndex: number, toIndex: number) => {
  //   const newImages = [...images];
  //   const [movedImage] = newImages.splice(fromIndex, 1);
  //   newImages.splice(toIndex, 0, movedImage);
  //   setImages(newImages);
  // };

  const handleSetMainImage = (imageId: string) => {
    const imageIndex = images.findIndex(img => img.id === imageId);
    if (imageIndex !== -1) {
      const newImages = [...images];
      const [mainImage] = newImages.splice(imageIndex, 1);
      newImages.unshift(mainImage);
      setImages(newImages);
      setCurrentImageIndex(0);
      success('Success', 'Main image updated');
    }
  };

  const handleImageUpload = async (imageUris: string[]) => {
    try {
      const results = await processAndUploadImages(imageUris);
      
      if (results && results.successCount > 0) {
        const uploadedUrls = results.results
          .filter(result => result.success)
          .map(result => result.url);
        
        setUploadedImageUrls(prev => [...prev, ...uploadedUrls]);
        success('Success', `${results.successCount} image(s) uploaded successfully`);
        
        if (results.errorCount > 0) {
          error('Warning', `${results.errorCount} image(s) failed to upload`);
        }
      } else {
        error('Upload Failed', uploadError || 'Failed to upload images');
      }
    } catch {
      error('Upload Error', 'Failed to process and upload images');
    }
  };

  const handleInputChange = (field: keyof EditListingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    showAlert({
      title: 'Add Feature',
      message: 'Enter a feature for your listing',
      buttonText: 'Add',
      icon: 'add-circle-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        const newFeature = 'New Feature'; // In real app, this would come from input
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, newFeature]
        }));
        success('Success', 'Feature added successfully');
      }
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSaveListing = async () => {
    // Validation
    if (!formData.title.trim()) {
      error('Error', 'Title is required');
      return;
    }
    if (!formData.description.trim()) {
      error('Error', 'Description is required');
      return;
    }
    if (!formData.price.trim()) {
      error('Error', 'Price is required');
      return;
    }
    if (!formData.location.trim()) {
      error('Error', 'Location is required');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare listing data
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.replace(/[^\d.]/g, '')), // Remove currency symbols and convert to number
        location: formData.location.trim(),
        category_id: formData.category_id || undefined,
        condition: formData.condition.trim(),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : images.map(img => img.uri),
      };

      // Update listing via API
      await updateListingMutation.mutateAsync({
        id: params.listingId as string,
        data: listingData,
      });
      
      success('Success', 'Listing updated successfully!');
      resetState(); // Reset upload state
      router.back();
    } catch (err) {
      console.error('Save listing error:', err);
      error('Error', 'Failed to update listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderImageItem = ({ item, index }: { item: ListingImage; index: number }) => (
    <View style={styles.imageItem}>
      <TouchableOpacity 
        onPress={() => handleSetMainImage(item.id)}
        style={styles.thumbnailContainer}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />
        {index === 0 && (
          <View style={styles.mainImageBadge}>
            <Text style={styles.mainImageText}>Main</Text>
          </View>
        )}
        {index !== 0 && (
          <View style={styles.setMainOverlay}>
            <Ionicons name="star" size={16} color={Colors.white} />
            <Text style={styles.setMainText}>Set as main</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => handleRemoveImage(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderFeatureItem = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Text style={styles.featureText}>{feature}</Text>
      <TouchableOpacity
        style={styles.removeFeatureButton}
        onPress={() => handleRemoveFeature(index)}
      >
        <Ionicons name="close" size={16} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Listing</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveListing}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Loading State */}
      {listingLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      )}

      {/* Error State */}
      {listingError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.red} />
          <Text style={styles.errorTitle}>Failed to Load Listing</Text>
          <Text style={styles.errorText}>
            {listingError instanceof Error ? listingError.message : 'Something went wrong'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      {!listingLoading && !listingError && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Images ({images.length}/10)</Text>
            {(isProcessing || isUploading) && (
              <View style={styles.uploadStatus}>
                <Text style={styles.uploadStatusText}>
                  {isProcessing ? 'Processing...' : isUploading ? 'Uploading...' : ''}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            )}
          </View>
          
          {/* Main Image */}
          <View style={styles.mainImageContainer}>
            <Image 
              source={{ uri: images[currentImageIndex]?.uri }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity style={styles.overlayButton} onPress={handleAddImage}>
                <Ionicons name="camera" size={24} color={Colors.white} />
                <Text style={styles.overlayButtonText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Thumbnails */}
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsList}
            contentContainerStyle={styles.thumbnailsContent}
          />
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter listing title"
              maxLength={100}
            />
            <Text style={styles.characterCount}>{formData.title.length}/100</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Describe your item in detail"
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
                placeholder="KES 0"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Condition</Text>
              <TouchableOpacity style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>{formData.condition}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.grey} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location & Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Category</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              placeholder="Enter location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>
                {categoriesLoading 
                  ? 'Loading categories...'
                  : formData.category_id 
                    ? categories?.find(c => c.id === formData.category_id)?.name || 'Select Category'
                    : 'Select Category'
                }
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.grey} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Features</Text>
            <TouchableOpacity style={styles.addFeatureButton} onPress={handleAddFeature}>
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addFeatureText}>Add Feature</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featuresContainer}>
            {formData.features.map((feature, index) => renderFeatureItem(feature, index))}
            {formData.features.length === 0 && (
              <Text style={styles.noFeaturesText}>No features added yet</Text>
            )}
          </View>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      )}
      
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
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: Colors.grey,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadStatus: {
    flex: 1,
    marginLeft: 16,
  },
  uploadStatusText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.lightgrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  mainImageContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightgrey,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayButton: {
    alignItems: 'center',
    padding: 12,
  },
  overlayButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  thumbnailsList: {
    marginBottom: 16,
  },
  thumbnailsContent: {
    paddingRight: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.lightgrey,
  },
  setMainOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setMainText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainImageText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  inputGroup: {
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
  },
  characterCount: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'right',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
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
  pickerButtonText: {
    fontSize: 16,
    color: Colors.black,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addFeatureText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  featureText: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
  },
  removeFeatureButton: {
    padding: 4,
  },
  noFeaturesText: {
    fontSize: 14,
    color: Colors.grey,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
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
});

export default EditListing;
