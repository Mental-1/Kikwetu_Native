import { ThemedView } from "@/components/ThemedView";
import CustomLoader from "@/components/ui/CustomLoader";
import { Spacing } from "@/constants/theme";
import {
  useCategories,
  useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import { ConditionChips } from "@/src/components/post-ad/ConditionChips";
import { DescriptionProgressBar } from "@/src/components/post-ad/DescriptionProgressBar";
import { DynamicAttributes } from "@/src/components/post-ad/DynamicAttributes";
import { FormInput } from "@/src/components/post-ad/FormInput";
import { FormToggle } from "@/src/components/post-ad/FormToggle";
import { LocationInput } from "@/src/components/post-ad/LocationInput";
import { PrimaryButton } from "@/src/components/post-ad/PrimaryButton";
import { ScreenKeyboardAwareScrollView } from "@/src/components/post-ad/ScreenKeyboardAwareScrollView";
import { SelectField } from "@/src/components/post-ad/SelectField";
import { TagsInput } from "@/src/components/post-ad/TagsInput";
import { Colors } from "@/src/constants/constant";
import { useAppStore } from "@/stores/useAppStore";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Step1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const { postAd } = useAppStore();
  const { setField, setFormData } = postAd;

  const [realtimeDescription, setRealtimeDescription] = useState(
    postAd.description,
  );

  const params = useLocalSearchParams<{
    categoryId?: string;
    subcategoryId?: string;
  }>();

  useEffect(() => {
    let hasChanges = false;

    if (params?.categoryId) {
      const catId = parseInt(params.categoryId, 10);
      if (!isNaN(catId)) {
        setField("categoryId", catId);
        hasChanges = true;
        if (params.subcategoryId) {
          const subId = parseInt(params.subcategoryId, 10);
          if (!isNaN(subId)) {
            setField("subcategoryId", subId);
          }
        }
      }
    }

    if (hasChanges) {
      router.setParams({});
    }
  }, [params?.categoryId, params?.subcategoryId, setField]);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } =
    useSubcategoriesByCategory(postAd.categoryId || null);

  const selectedCategory = useMemo(() => {
    return categories?.find((c) => c.id === postAd.categoryId);
  }, [categories, postAd.categoryId]);

  const selectedSubcategory = useMemo(() => {
    return subcategories?.find((s) => s.id === postAd.subcategoryId);
  }, [subcategories, postAd.subcategoryId]);

  const attributeSchema = useMemo(() => {
    return selectedCategory?.attribute_schema || null;
  }, [selectedCategory]);

  const categoryDisplayValue = useMemo(() => {
    if (!selectedCategory) return undefined;
    if (selectedSubcategory) {
      return `${selectedCategory.name} > ${selectedSubcategory.name}`;
    }
    return selectedCategory.name;
  }, [selectedCategory, selectedSubcategory]);

  const handleCategoryPress = useCallback(() => {
    router.push({
      pathname: "./select-option",
      params: {
        type: "category",
        title: "Select Category",
      },
    });
  }, []);

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!postAd.tags.includes(tag)) {
        setField("tags", [...postAd.tags, tag]);
      }
    },
    [postAd.tags, setField],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      setField(
        "tags",
        postAd.tags.filter((t) => t !== tag),
      );
    },
    [postAd.tags, setField],
  );

  const handleNext = useCallback(() => {
    router.push("./step2");
  }, []);

  const isFormValid = useMemo(() => {
    return (
      postAd.title.trim().length > 0 &&
      postAd.description.trim().length > 0 &&
      postAd.price !== null &&
      postAd.categoryId !== null &&
      postAd.condition.length > 0
    );
  }, [postAd]);

  const footerHeight = 48 + Spacing.lg * 2 + tabBarHeight;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScreenKeyboardAwareScrollView
        style={{ backgroundColor: Colors.background }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: footerHeight + Spacing.xl * 2 },
        ]}
      >
        <SelectField
          label="Category *"
          value={categoryDisplayValue}
          placeholder="Select a category"
          onPress={handleCategoryPress}
        />

        <FormInput
          label="Title *"
          value={postAd.title}
          onChangeText={(text) => setField("title", text)}
          placeholder="What are you selling?"
        />

        <FormInput
          label="Description *"
          value={postAd.description}
          onChangeText={(text) => setField("description", text)}
          onRealtimeChange={setRealtimeDescription}
          placeholder="Describe your item in detail..."
          multiline
          numberOfLines={5}
        />
        <DescriptionProgressBar
          charCount={realtimeDescription.length}
          minChars={90}
          maxChars={1000}
        />

        <FormInput
          label="Price *"
          value={postAd.price?.toString() || ""}
          onChangeText={(text) => {
            const numValue = text ? parseFloat(text.replace(/,/g, "")) : null;
            setField("price", numValue);
          }}
          placeholder="0"
          keyboardType="numeric"
          prefix="KES"
          formatPrice
        />

        {categoriesLoading || (postAd.categoryId && subcategoriesLoading)
          ? <CustomLoader size="medium" />
          : (
            <>
              <ConditionChips
                value={postAd.condition}
                onSelect={(condition) => setField("condition", condition)}
              />

              <LocationInput
                label="Location"
                location={postAd.location}
                latitude={postAd.latitude}
                longitude={postAd.longitude}
                onLocationChange={(text) => setField("location", text)}
                onCoordinatesChange={(lat, lon) => {
                  setFormData({
                    latitude: lat,
                    longitude: lon,
                  });
                }}
              />

              <FormToggle
                label="Price is negotiable"
                value={postAd.isNegotiable}
                onValueChange={(value) => setField("isNegotiable", value)}
              />

              <FormToggle
                label="Do you offer delivery?"
                value={postAd.offerDelivery}
                onValueChange={(value) => setField("offerDelivery", value)}
              />

              {attributeSchema && (
                <DynamicAttributes
                  schema={attributeSchema}
                  values={postAd.attributes}
                  onValueChange={(key, value) => {
                    setFormData({
                      attributes: {
                        ...postAd.attributes,
                        [key]: value,
                      },
                    });
                  }}
                  onNavigateToSelect={(field) => {
                    router.push({
                      pathname: "./select-option",
                      params: {
                        type: "attribute",
                        title: `Select ${field.label}`,
                        attributeKey: field.key,
                        options: JSON.stringify(field.options || []),
                      },
                    });
                  }}
                />
              )}

              <TagsInput
                tags={postAd.tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </>
          )}
      </ScreenKeyboardAwareScrollView>

      <ThemedView
        style={[
          styles.footer,
          {
            bottom: tabBarHeight,
            paddingBottom: insets.bottom > 0 ? Spacing.md : Spacing.lg,
            borderTopColor: Colors.lightgrey,
          },
        ]}
      >
        <PrimaryButton
          title="Next: Add Photos"
          onPress={handleNext}
          disabled={!isFormValid}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 0.5,
    backgroundColor: Colors.white,
  },
});
