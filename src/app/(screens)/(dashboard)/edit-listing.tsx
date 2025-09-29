import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  category: string;
  condition: string;
  features: string[];
}

const EditListing = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);

  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<ListingImage[]>([
    { id: '1', uri: 'https://via.placeholder.com/300x200' },
    { id: '2', uri: 'https://via.placeholder.com/300x200' },
  ]);

  const [formData, setFormData] = useState<EditListingData>({
    title: params.title as string || 'iPhone 14 Pro Max 256GB',
    description: params.description as string || 'Brand new iPhone 14 Pro Max in Space Black. Still in box with all accessories.',
    price: params.price as string || 'KES 120,000',
    location: params.location as string || 'Nairobi, Kenya',
    category: params.category as string || 'Electronics',
    condition: 'Excellent',
    features: ['Original Box', 'Charger Included', 'Warranty Available'],
  });

  const categories = [
    'Electronics', 'Vehicles', 'Fashion', 'Furniture', 'Home & Garden',
    'Sports & Recreation', 'Books & Media', 'Health & Beauty', 'Baby & Kids',
    'Business Equipment', 'Real Estate', 'Other'
  ];

  const conditions = ['Brand New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'];

  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth - 32;

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

    // Simulate image picker
    Alert.alert(
      'Add Image',
      'Choose an image source',
      [
        { text: 'Camera', onPress: () => simulateImagePicker('camera') },
        { text: 'Gallery', onPress: () => simulateImagePicker('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const simulateImagePicker = (source: string) => {
    const newImage: ListingImage = {
      id: Date.now().toString(),
      uri: `https://via.placeholder.com/300x200?text=${source}`,
      isNew: true
    };
    setImages(prev => [...prev, newImage]);
    success('Success', `Image added from ${source}`);
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

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Success', 'Listing updated successfully!');
      router.back();
    } catch (err) {
      error('Error', 'Failed to update listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderImageItem = ({ item, index }: { item: ListingImage; index: number }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} resizeMode="cover" />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => handleRemoveImage(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#F44336" />
      </TouchableOpacity>
      {index === 0 && (
        <View style={styles.mainImageBadge}>
          <Text style={styles.mainImageText}>Main</Text>
        </View>
      )}
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
      <SafeAreaView style={styles.header}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images ({images.length}/10)</Text>
          
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
              <Text style={styles.pickerButtonText}>{formData.category}</Text>
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
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.lightgrey,
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
});

export default EditListing;
