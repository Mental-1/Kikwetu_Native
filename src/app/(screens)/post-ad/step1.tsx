import CustomLoader from "@/components/ui/CustomLoader";
import {
  useCategories,
  useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import AttributeRenderer from "@/src/components/post-ad/AttributeRenderer";
import ControlledInput from "@/src/components/post-ad/ControlledInput";
import { Colors } from "@/src/constants/constant";
import { Step1FormData, step1Schema } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step1() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    categoryId?: string;
    subcategoryId?: string;
  }>();

  const defaultValues = useAppStore.getState().postAd;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<Step1FormData>({
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

  const categoryId = watch("category_id");
  const subcategoryId = watch("subcategory_id");

  useEffect(() => {
    if (params.categoryId) {
      setValue("category_id", Number(params.categoryId), {
        shouldValidate: true,
      });
    }
    if (params.subcategoryId) {
      setValue("subcategory_id", Number(params.subcategoryId), {
        shouldValidate: true,
      });
    }
  }, [params.categoryId, params.subcategoryId, setValue]);

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

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } =
    useSubcategoriesByCategory(categoryId || null);

  const selectedCategory = useMemo(() => {
    return categories?.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const selectedSubcategory = useMemo(() => {
    return subcategories?.find((s) => s.id === subcategoryId);
  }, [subcategories, subcategoryId]);

  const attributeSchema = useMemo(() => {
    return selectedCategory?.attribute_schema || null;
  }, [selectedCategory]);

  const handleBack = () => {
    router.push("/(tabs)/listings");
  };

  const onSubmit = (data: Step1FormData) => {
    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.price);
    setLocation(data.location, data.latitude ?? null, data.longitude ?? null);
    setCondition(data.condition);
    setCategoryId(data.category_id);
    setSubcategoryId(data.subcategory_id ?? null);
    setStoreId(data.store_id);
    setTags(data.tags);
    setIsNegotiable(data.negotiable);
    setAttributes(data.attributes);

    router.push("/(screens)/post-ad/step2");
  };

  const handleCategoryPress = () => {
    router.push({
      pathname: "/(screens)/post-ad/select-option" as any,
      params: {
        type: "category",
        title: "Select Category",
      },
    });
  };

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
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post Ad - Details</Text>
            <View style={styles.placeholder} />
          </SafeAreaView>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Category Selection */}
            <TouchableOpacity
              onPress={handleCategoryPress}
              style={styles.categorySelector}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.label}>Category</Text>
                <Text
                  style={[
                    styles.value,
                    !selectedCategory && styles.placeholderText,
                  ]}
                >
                  {selectedCategory
                    ? `${selectedCategory.name}${
                      selectedSubcategory
                        ? ` > ${selectedSubcategory.name}`
                        : ""
                    }`
                    : "Select Category"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>

            {/* Basic Info */}
            <ControlledInput
              control={control}
              name="title"
              label="Title"
              placeholder="What are you selling?"
            />

            <ControlledInput
              control={control}
              name="description"
              label="Description"
              placeholder="Describe your item in detail"
              multiline
              numberOfLines={4}
              style={{ height: 100 }}
            />

            <ControlledInput
              control={control}
              name="price"
              label="Price"
              placeholder="0.00"
              keyboardType="numeric"
              left={<TextInput.Affix text="KES " />}
            />

            {/* Attributes (Condition, Location, Negotiable, Tags, Dynamic) */}
            {categoriesLoading || (categoryId && subcategoriesLoading)
              ? <CustomLoader size="medium" />
              : (
                <AttributeRenderer
                  control={control}
                  setValue={setValue}
                  attributeSchema={attributeSchema}
                />
              )}
          </ScrollView>

          {/* Footer */}
          <SafeAreaView edges={["bottom"]} style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.nextButton}
              contentStyle={styles.nextButtonContent}
              labelStyle={styles.nextButtonLabel}
              buttonColor={Colors.primary}
            >
              Next: Add Media
            </Button>
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
    padding: 16,
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  placeholderText: {
    color: Colors.grey,
    fontWeight: "normal",
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
  },
  nextButton: {
    borderRadius: 8,
  },
  nextButtonContent: {
    height: 50,
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
