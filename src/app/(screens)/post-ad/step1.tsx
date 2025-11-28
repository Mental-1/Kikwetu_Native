import { useCategories } from "@/hooks/useCategories";
import DynamicAttributeFields from "@/src/components/DynamicAttributeFields";
import CategorySubcategorySection from "@/src/components/post-ad/CategorySubcategorySection";
import ConditionSection from "@/src/components/post-ad/ConditionSection";
import LocationSection from "@/src/components/post-ad/LocationSection";
import PriceNegotiableSection from "@/src/components/post-ad/PriceNegotiableSection";
import StoreSelectionSection from "@/src/components/post-ad/StoreSelectionSection";
import TagsSection from "@/src/components/post-ad/TagsSection";
import TitleDescriptionSection from "@/src/components/post-ad/TitleDescriptionSection";
import { Colors } from "@/src/constants/constant";
import { Step1FormData, step1Schema } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step1() {
  const router = useRouter();

  const defaultValues = useAppStore.getState().postAd;

  const methods = useForm<Step1FormData>({
    defaultValues: {
      title: defaultValues.title,
      description: defaultValues.description,
      price: defaultValues.price ?? 0,
      category_id: defaultValues.categoryId ?? 0,
      subcategory_id: defaultValues.subcategoryId === null
        ? undefined
        : defaultValues.subcategoryId,
      condition: defaultValues.condition,
      location: defaultValues.location,
      latitude: defaultValues.latitude === null
        ? undefined
        : defaultValues.latitude,
      longitude: defaultValues.longitude === null
        ? undefined
        : defaultValues.longitude,
      tags: defaultValues.tags ?? [],
      negotiable: defaultValues.isNegotiable ?? false,
      store_id: defaultValues.storeId === undefined
        ? undefined
        : defaultValues.storeId,
      attributes: defaultValues.attributes ?? {},
    },
    resolver: zodResolver(step1Schema),
    mode: "onBlur",
  });

  const { handleSubmit, setValue } = methods;

  const categoryId = useWatch({
    control: methods.control,
    name: "category_id",
  });

  const {
    setTitle,
    setDescription,
    setPrice,
    setIsNegotiable,
    setLocation,
    setCondition,
    setTags,
    setAttributes,
    setCategoryId,
    setSubcategoryId,
    setStoreId,
  } = useAppStore((state) => state.postAd);

  const globalCategoryId = useAppStore((state) => state.postAd.categoryId);
  const globalSubcategoryId = useAppStore((state) =>
    state.postAd.subcategoryId
  );
  const globalStoreId = useAppStore((state) => state.postAd.storeId);

  useEffect(() => {
    if (globalCategoryId !== categoryId) {
      setValue("category_id", globalCategoryId ?? 0);
    }
  }, [globalCategoryId, categoryId, setValue]);

  useEffect(() => {
    if (globalSubcategoryId !== null) {
      setValue(
        "subcategory_id",
        globalSubcategoryId === null ? undefined : globalSubcategoryId,
      );
    }
  }, [globalSubcategoryId, setValue]);

  useEffect(() => {
    if (globalStoreId !== undefined) {
      setValue("store_id", globalStoreId);
    }
  }, [globalStoreId, setValue]);

  const { data: categories } = useCategories();

  const attributeSchema = useMemo(() => {
    if (!categoryId || !categories) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category?.attribute_schema || null;
  }, [categoryId, categories]);

  useEffect(() => {
    setAttributes({});
  }, [categoryId, setAttributes]);

  const handleBack = () => {
    router.push("/(tabs)/listings");
  };

  const onSubmit = (data: Step1FormData) => {
    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.price);
    setLocation(
      data.location,
      data.latitude ?? null,
      data.longitude ?? null,
    );
    setCondition(data.condition);
    setCategoryId(data.category_id);
    setSubcategoryId(data.subcategory_id ?? null);
    setStoreId(data.store_id);
    setTags(data.tags);
    setIsNegotiable(data.negotiable);
    setAttributes(data.attributes);

    router.push("/(screens)/post-ad/step2");
  };

  const handleNext = handleSubmit(onSubmit);

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

          <FormProvider {...methods}>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
            >
              <TitleDescriptionSection />
              <CategorySubcategorySection />

              {/* Dynamic Attributes */}
              {categoryId && attributeSchema && (
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Additional Details</Text>
                  <DynamicAttributeFields
                    schema={attributeSchema}
                    control={methods.control}
                    setValue={setValue}
                    watch={methods.watch}
                  />
                </View>
              )}

              <StoreSelectionSection />
              <PriceNegotiableSection />
              <LocationSection />
              <ConditionSection />
              <TagsSection />
            </ScrollView>
          </FormProvider>

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
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 12,
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
  errorText: {
    color: Colors.red,
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: Colors.red,
  },
});
