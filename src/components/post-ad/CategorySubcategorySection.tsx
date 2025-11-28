import {
    useCategories,
    useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CategorySubcategorySection = React.memo(() => {
    const router = useRouter();
    const { formState: { errors } } = useFormContext<Step1FormData>();

    // Use useWatch to subscribe only to these specific fields
    const categoryId = useWatch<Step1FormData, "category_id">({
        name: "category_id",
    });
    const subcategoryId = useWatch<Step1FormData, "subcategory_id">({
        name: "subcategory_id",
    });

    const { data: categories } = useCategories();
    const { data: subcategories } = useSubcategoriesByCategory(categoryId);

    const handleCategoryPress = useCallback(() => {
        router.push({
            pathname: "/(screens)/post-ad/select-option" as any,
            params: {
                type: "category",
                title: "Select Category",
                categoryId: categoryId?.toString(),
            },
        });
    }, [router, categoryId]);

    const handleSubcategoryPress = useCallback(() => {
        if (categoryId) {
            router.push({
                pathname: "/(screens)/post-ad/select-option" as any,
                params: {
                    type: "subcategory",
                    title: "Select Subcategory",
                    categoryId: categoryId.toString(),
                },
            });
        }
    }, [router, categoryId]);

    return (
        <View style={styles.section}>
            <View style={styles.rowContainer}>
                {/* Category Trigger */}
                <View style={styles.halfWidth}>
                    <Text style={styles.label}>Category *</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={handleCategoryPress}
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
                                ? categories?.find((c) => c.id === categoryId)
                                    ?.name
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
                        onPress={handleSubcategoryPress}
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
                                ? subcategories?.find((s) =>
                                    s.id === subcategoryId
                                )
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
            {errors.category_id && (
                <Text style={styles.errorText}>
                    {errors.category_id.message}
                </Text>
            )}
            {errors.subcategory_id && (
                <Text style={styles.errorText}>
                    {errors.subcategory_id.message}
                </Text>
            )}
        </View>
    );
});

CategorySubcategorySection.displayName = "CategorySubcategorySection";

export default CategorySubcategorySection;

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 8,
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
    errorText: {
        color: Colors.red,
        fontSize: 12,
        marginTop: 4,
    },
});
