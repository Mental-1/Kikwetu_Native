import BottomSheet from "@/components/BottomSheet";
import CustomDialog from "@/components/ui/CustomDialog";
import CustomLoader from "@/components/ui/CustomLoader";
import {
  useCategories,
  useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import { Colors } from "@/src/constants/constant";
import { useStores } from "@/src/hooks/useStores";
import { useAppStore } from "@/stores/useAppStore";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { getLocationWithAddress } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    setLatitude,
    setLongitude,
    setCondition,
    setCategoryId,
    setSubcategoryId,
    setStoreId,
    setTags,
  } = useAppStore((state) => state.postAd);

  const [tagInput, setTagInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const [isStoreSheetVisible, setIsStoreSheetVisible] = useState(false);

  useEffect(() => {
    if (price === null || price === undefined) {
      setPriceInput("");
    } else {
      setPriceInput(price.toLocaleString());
    }
  }, []);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { showAlert, AlertComponent } = useCustomAlert();
  const alertHelpers = useMemo(
    () => createAlertHelpers(showAlert),
    [showAlert],
  );
  const { locationSuccess: showLocationSuccessAlert, error: showErrorAlert } =
    alertHelpers;

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories } = useSubcategoriesByCategory(categoryId);
  const {
    data: stores,
    isLoading: storesLoading,
    error: storesError,
  } = useStores();

  const safeStores = storesError ? [] : stores || [];

  const handleBack = () => {
    router.push("/(tabs)/listings");
  };

  const handleNext = () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a title for your listing");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Required Field", "Please enter a description");
      return;
    }
    if (!price) {
      Alert.alert("Required Field", "Please enter a price");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Required Field", "Please enter a location");
      return;
    }
    if (!condition) {
      Alert.alert("Required Field", "Please select a condition");
      return;
    }
    if (!categoryId) {
      Alert.alert("Required Field", "Please select a category");
      return;
    }
    router.push("/(screens)/post-ad/step2");
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") return "";
    return parseInt(numericValue).toLocaleString();
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setPriceInput(formatted);
  };

  const handlePriceBlur = () => {
    const numericValue = priceInput.replace(/\D/g, "");
    setPrice(numericValue ? parseFloat(numericValue) : null);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const cleanTag = trimmedTag.startsWith("#")
        ? trimmedTag.slice(1)
        : trimmedTag;
      setTags([...tags, cleanTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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
        const locationText = locationData.address ||
          `${
            locationData.latitude.toFixed(
              6,
            )
          }, ${locationData.longitude.toFixed(6)}`;
        setLocation(locationText);
        setLatitude(locationData.latitude);
        setLongitude(locationData.longitude);
        showLocationSuccessAlert(
          "Your location has been automatically detected and filled in.",
        );
      } else {
        showErrorAlert(
          "Location Error",
          "Unable to detect your location. Please enter it manually.",
        );
      }
    } catch (error) {
      console.error("Location error:", error);
      showErrorAlert(
        "Location Error",
        "Failed to get your location. Please check your location permissions and try again, or enter your location manually.",
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationDialog(false);
  };

  const renderStoreItem = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        style={[
          styles.sheetItem,
          storeId === item.id && styles.sheetItemSelected,
        ]}
        onPress={() => {
          setStoreId(item.id);
          setIsStoreSheetVisible(false);
        }}
      >
        <Text
          style={[
            styles.sheetItemText,
            storeId === item.id && styles.sheetItemTextSelected,
          ]}
        >
          {item.name}
        </Text>
        {storeId === item.id && (
          <Ionicons name="checkmark" size={20} color={Colors.primary} />
        )}
      </TouchableOpacity>
    ),
    [storeId],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          {/* Header */}
          <SafeAreaView style={styles.header} edges={["top"]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Ad - Details</Text>
            <View style={styles.placeholder} />
          </SafeAreaView>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          >
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
              <Text style={styles.characterCount}>
                {description.length}/500
              </Text>
            </View>

            {/* Category and Subcategory */}
            <View style={styles.section}>
              <View style={styles.rowContainer}>
                {/* Category Trigger */}
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Category *</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() =>
                      router.push({
                        pathname: "./select-option",
                        params: {
                          type: "category",
                          title: "Select Category",
                          categoryId: categoryId?.toString(),
                        },
                      })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !categoryId && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {categoryId
                        ? categories?.find((c) => c.id === categoryId)?.name
                        : "Select Category"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                </View>

                {/* Subcategory Trigger */}
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Subcategory</Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      !categoryId && styles.disabledDropdown,
                    ]}
                    onPress={() => {
                      if (categoryId) {
                        router.push({
                          pathname: "./select-option",
                          params: {
                            type: "subcategory",
                            title: "Select Subcategory",
                            categoryId: categoryId.toString(),
                          },
                        });
                      }
                    }}
                    disabled={!categoryId}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        (!subcategoryId || !categoryId) &&
                        styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {!categoryId
                        ? "Select category first"
                        : subcategoryId
                        ? subcategories?.find((s) => s.id === subcategoryId)
                          ?.name
                        : "Subcategory"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Store Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Store (Optional)</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsStoreSheetVisible(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !storeId && styles.placeholderText,
                  ]}
                >
                  {storeId
                    ? safeStores.find((s) => s.id === storeId)?.name
                    : "Select Store (Optional)"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.grey} />
              </TouchableOpacity>
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
                onBlur={handlePriceBlur}
                keyboardType="numeric"
              />

              {/* Negotiable Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  requestAnimationFrame(() => {
                    setIsNegotiable(!isNegotiable);
                  });
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    isNegotiable && styles.checkboxChecked,
                  ]}
                >
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
                  onChangeText={(text) => {
                    console.log("Location input changed to:", text);
                    setLocation(text);
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.locationButton,
                    isLoadingLocation && styles.locationButtonLoading,
                  ]}
                  onPress={requestLocation}
                  disabled={isLoadingLocation}
                  activeOpacity={0.7}
                >
                  {isLoadingLocation ? <CustomLoader /> : (
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Condition */}
            <View style={styles.section}>
              <Text style={styles.label}>Condition *</Text>
              <View style={styles.conditionContainer}>
                {["New", "Like New", "Good", "Used"].map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={[
                      styles.conditionButton,
                      condition === cond && styles.conditionButtonSelected,
                    ]}
                    onPress={() => {
                      requestAnimationFrame(() => {
                        setCondition(cond);
                      });
                    }}
                    activeOpacity={condition === cond ? 1 : 0.7}
                  >
                    <Text
                      style={[
                        styles.conditionText,
                        condition === cond && styles.conditionTextSelected,
                      ]}
                    >
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Tags (for search and classification)
              </Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.input, styles.tagInput]}
                  placeholder="Add a tag (e.g., electronics, furniture)"
                  placeholderTextColor={Colors.grey}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={addTag}
                  activeOpacity={0.7}
                >
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
                      activeOpacity={0.7}
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
          <SafeAreaView edges={["bottom"]}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.7}
              >
                <Text style={styles.nextButtonText}>Next: Add Media</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Bottom Sheets */}

          {/* Store Sheet */}
          <BottomSheet
            visible={isStoreSheetVisible}
            onClose={() => setIsStoreSheetVisible(false)}
            snapPoints={["60%"]}
            enableDynamicSizing={false}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Store</Text>
              <TouchableOpacity onPress={() => setIsStoreSheetVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.createStoreItem}
                onPress={() => {
                  setIsStoreSheetVisible(false);
                  router.push("/(screens)/(dashboard)/stores/store-create");
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.createStoreText}>Create New Store</Text>
              </TouchableOpacity>
              <FlashList
                data={safeStores}
                renderItem={renderStoreItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>No stores available</Text>
                }
              />
            </View>
          </BottomSheet>

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "bold",
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
    fontWeight: "600",
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
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: "right",
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabledDropdown: {
    backgroundColor: Colors.background,
    opacity: 0.7,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.black,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: Colors.grey,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.grey,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.black,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonLoading: {
    opacity: 0.7,
  },
  conditionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontWeight: "500",
  },
  conditionTextSelected: {
    color: Colors.white,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Sheet Styles
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  sheetItemSelected: {
    backgroundColor: "#f5f5f5",
  },
  sheetItemText: {
    fontSize: 16,
    color: Colors.black,
  },
  sheetItemTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  createStoreItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
    gap: 12,
  },
  createStoreText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  emptyListText: {
    textAlign: "center",
    padding: 20,
    color: Colors.grey,
  },
});
