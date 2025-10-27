import CustomDialog from '@/components/ui/CustomDialog';
import { useCategories, useSubcategoriesByCategory } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useStores } from '@/src/hooks/useStores';
import { useAppStore } from '@/stores/useAppStore';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { getLocationWithAddress } from '@/utils/locationUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Step1() {
  const router = useRouter();
  const { 
    title, 
    description, 
    price, 
    isNegotiable,
    location, 
    condition, 
    categoryId,
    subcategoryId,
    storeId,
    tags,
    setTitle,
    setDescription,
    setPrice,
    setIsNegotiable,
    setLocation,
    setCondition,
    setCategoryId,
    setSubcategoryId,
    setStoreId,
    setTags
  } = useAppStore((state) => state.postAd);

  const [tagInput, setTagInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  useEffect(() => {
    if (price === null || price === undefined) {
      setPriceInput('');
    } else {
      setPriceInput(price.toLocaleString());
    }
  }, [price]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  
  const { showAlert, AlertComponent } = useCustomAlert();
  const { locationSuccess: showLocationSuccessAlert, error: showErrorAlert } = createAlertHelpers(showAlert);

  // Fetch categories, subcategories, and stores
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories } = useSubcategoriesByCategory(categoryId);
  const { data: stores, isLoading: storesLoading } = useStores();

  const handleBack = () => {
    router.push('/(tabs)/listings');
  };

  const handleNext = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your listing');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please enter a description');
      return;
    }
    if (!price) {
      Alert.alert('Required Field', 'Please enter a price');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Required Field', 'Please enter a location');
      return;
    }
    if (!condition) {
      Alert.alert('Required Field', 'Please select a condition');
      return;
    }
    if (!categoryId) {
      Alert.alert('Required Field', 'Please select a category');
      return;
    }
    // Store selection is now optional - no validation needed
    router.push('/(screens)/post-ad/step2');
  };

  const formatPrice = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    if (numericValue === '') return '';
    
    // Add thousand separators
    return parseInt(numericValue).toLocaleString();
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setPriceInput(formatted);
    
    // Update the store with numeric value
    const numericValue = text.replace(/\D/g, '');
    setPrice(numericValue ? parseFloat(numericValue) : null);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      // Remove # prefix if user added it
      const cleanTag = trimmedTag.startsWith('#') ? trimmedTag.slice(1) : trimmedTag;
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const requestLocation = () => {
    setShowLocationDialog(true);
  };

  const handleLocationConfirm = async () => {
    setShowLocationDialog(false);
    setIsLoadingLocation(true);
    try {
      const locationData = await getLocationWithAddress();
      if (locationData) {
        // Use the address if available, otherwise use coordinates
        const locationText = locationData.address || 
          `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
        setLocation(locationText);
        
        // Show success alert with auto-dismiss after 2 seconds
        showLocationSuccessAlert('Your location has been automatically detected and filled in.');
      } else {
        showErrorAlert('Location Error', 'Unable to detect your location. Please enter it manually.');
      }
    } catch (error) {
      console.error('Location error:', error);
      showErrorAlert(
        'Location Error', 
        'Failed to get your location. Please check your location permissions and try again, or enter your location manually.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationDialog(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Ad - Details</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter listing title"
            placeholderTextColor={Colors.grey}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your item in detail"
            placeholderTextColor={Colors.grey}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        {/* Category and Subcategory */}
        <View style={styles.section}>
          <View style={styles.rowContainer}>
            {/* Category Dropdown */}
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity 
                style={styles.dropdown} 
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={[
                  styles.dropdownText, 
                  !categoryId && styles.placeholderText
                ]}>
                  {categoryId ? categories?.find(c => c.id === categoryId)?.name : 'Select Category'}
                </Text>
                <Ionicons 
                  name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Colors.grey} 
                />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
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
                            setCategoryId(category.id);
                            setShowCategoryDropdown(false);
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

            {/* Subcategory Dropdown */}
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Subcategory</Text>
              <TouchableOpacity 
                style={[styles.dropdown, !categoryId && styles.disabledDropdown]} 
                onPress={() => categoryId && setShowSubcategoryDropdown(!showSubcategoryDropdown)}
                disabled={!categoryId}
              >
                <Text style={[
                  styles.dropdownText, 
                  (!subcategoryId || !categoryId) && styles.placeholderText
                ]}>
                  {!categoryId ? 'Select category first' : 
                   subcategoryId ? subcategories?.find(s => s.id === subcategoryId)?.name : 'Select Subcategory'}
                </Text>
                <Ionicons 
                  name={showSubcategoryDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Colors.grey} 
                />
              </TouchableOpacity>
              
              {showSubcategoryDropdown && categoryId && (
                <View style={styles.dropdownList}>
                  <ScrollView 
                    style={styles.dropdownScroll}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {subcategories?.length === 0 ? (
                      <Text style={styles.loadingText}>No subcategories available</Text>
                    ) : (
                      subcategories?.map((subcategory) => (
                        <TouchableOpacity
                          key={subcategory.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSubcategoryId(subcategory.id);
                            setShowSubcategoryDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{subcategory.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Store Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Store (Optional)</Text>
          <TouchableOpacity 
            style={styles.dropdown} 
            onPress={() => setShowStoreDropdown(!showStoreDropdown)}
          >
            <Text style={[
              styles.dropdownText, 
              !storeId && styles.placeholderText
            ]}>
              {storeId ? stores?.find(s => s.id === storeId.toString())?.name : 'Select Store (Optional)'}
            </Text>
            <Ionicons 
              name={showStoreDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={Colors.grey} 
            />
          </TouchableOpacity>
          
          {showStoreDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView 
                style={styles.dropdownScroll}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {storesLoading ? (
                  <Text style={styles.loadingText}>Loading stores...</Text>
                ) : (
                  <>
                    {/* Create Store Option */}
                    <TouchableOpacity
                      style={[styles.dropdownItem, styles.createStoreItem]}
                      onPress={() => {
                        setShowStoreDropdown(false);
                        router.push('/(screens)/(dashboard)/stores/store-create');
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                      <Text style={[styles.dropdownItemText, styles.createStoreText]}>Create New Store</Text>
                    </TouchableOpacity>
                    
                    {/* Existing Stores */}
                    {stores?.length === 0 ? (
                      <Text style={styles.loadingText}>No stores available</Text>
                    ) : (
                      stores?.map((store) => (
                        <TouchableOpacity
                          key={store.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setStoreId(parseInt(store.id));
                            setShowStoreDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{store.name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (Kes) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor={Colors.grey}
            value={priceInput}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
          />
          
          {/* Negotiable Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setIsNegotiable(!isNegotiable)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, isNegotiable && styles.checkboxChecked]}>
              {isNegotiable && (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Price is negotiable</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="Enter location"
              placeholderTextColor={Colors.grey}
              value={location}
              onChangeText={setLocation}
            />
            <TouchableOpacity 
              style={[styles.locationButton, isLoadingLocation && styles.locationButtonLoading]} 
              onPress={requestLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.label}>Condition *</Text>
          <View style={styles.conditionContainer}>
            {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
              <TouchableOpacity
                key={cond}
                style={[
                  styles.conditionButton,
                  condition === cond && styles.conditionButtonSelected
                ]}
                onPress={() => setCondition(cond)}
              >
                <Text style={[
                  styles.conditionText,
                  condition === cond && styles.conditionTextSelected
                ]}>
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>Tags (for search and classification)</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              placeholder="Add a tag (e.g., electronics, furniture)"
              placeholderTextColor={Colors.grey}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          {/* Display Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                  <Ionicons name="close" size={16} color={Colors.white} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next: Add Media</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Custom Location Permission Dialog */}
      <CustomDialog
        visible={showLocationDialog}
        title="Location Permission"
        message="Allow Kikwetu to access your location for automatic detection?"
        confirmText="Allow"
        denyText="Deny"
        onConfirm={handleLocationConfirm}
        onDeny={handleLocationDeny}
        icon="location-outline"
        iconColor={Colors.primary}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </View>
  );
}

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
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.lightgrey,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'right',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderColor: Colors.lightgrey,
    borderWidth: 0.6,
    padding: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonLoading: {
    opacity: 0.7,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  conditionButtonSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  conditionText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  conditionTextSelected: {
    color: Colors.white,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledDropdown: {
    backgroundColor: Colors.lightgrey,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.black,
    flex: 1,
  },
  placeholderText: {
    color: Colors.grey,
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
  createStoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(3, 65, 252, 0.05)',
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.black,
  },
  createStoreText: {
    marginLeft: 8,
    color: Colors.primary,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    paddingVertical: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.lightgrey,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
});
