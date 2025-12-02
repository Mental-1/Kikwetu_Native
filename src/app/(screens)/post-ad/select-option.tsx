import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BorderRadius, Spacing } from "@/constants/theme";
import {
    useCategories,
    useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import { useTheme } from "@/hooks/useTheme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SelectionType = "category" | "subcategory" | "attribute";

interface OptionItem {
    id: number | string;
    name: string;
    icon?: string;
}

export default function SelectOption() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        type,
        title,
        categoryId,
        attributeKey,
        options: optionsParam,
    } = useLocalSearchParams<{
        type: SelectionType;
        title: string;
        categoryId?: string;
        attributeKey?: string;
        options?: string;
    }>();

    const [searchQuery, setSearchQuery] = useState("");

    const parsedCategoryId = categoryId ? parseInt(categoryId) : null;
    const categoriesQuery = useCategories();
    const subcategoriesQuery = useSubcategoriesByCategory(
        type === "subcategory" ? parsedCategoryId : null,
    );

    const { data: rawData, isLoading } = useMemo(() => {
        switch (type) {
            case "category":
                return categoriesQuery;
            case "subcategory":
                return subcategoriesQuery;
            case "attribute":
                try {
                    const parsedOptions = JSON.parse(
                        optionsParam || "[]",
                    ) as string[];
                    const optionItems: OptionItem[] = parsedOptions.map((
                        opt,
                        i,
                    ) => ({
                        id: i,
                        name: opt,
                    }));
                    return { data: optionItems, isLoading: false };
                } catch {
                    return { data: [], isLoading: false };
                }
            default:
                return { data: [], isLoading: false };
        }
    }, [type, categoriesQuery, subcategoriesQuery, optionsParam]);

    const filteredData = useMemo(() => {
        if (!rawData) return [];
        if (!searchQuery.trim()) return rawData;
        return rawData.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rawData, searchQuery]);

    const handleSelect = useCallback(
        (item: OptionItem) => {
            switch (type) {
                case "category":
                    router.push({
                        pathname: "./select-option",
                        params: {
                            type: "subcategory",
                            title: "Select Subcategory",
                            categoryId: item.id.toString(),
                        },
                    });
                    break;

                case "subcategory":
                    router.replace({
                        pathname: "./step1",
                        params: {
                            categoryId: categoryId,
                            subcategoryId: item.id.toString(),
                        },
                    });
                    break;

                case "attribute":
                    router.replace({
                        pathname: "./step1",
                        params: {
                            attributeKey: attributeKey,
                            attributeValue: item.name,
                        },
                    });
                    break;
            }
        },
        [type, categoryId, attributeKey, router],
    );

    const renderItem = useCallback(
        ({ item }: { item: OptionItem }) => (
            <Pressable
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [
                    styles.item,
                    {
                        backgroundColor: pressed
                            ? theme.backgroundDefault
                            : theme.backgroundRoot,
                        borderBottomColor: theme.border,
                    },
                ]}
            >
                {item.icon && (
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: theme.backgroundDefault },
                        ]}
                    >
                        <Feather
                            name={item.icon as keyof typeof Feather.glyphMap}
                            size={20}
                            color={theme.primary}
                        />
                    </View>
                )}
                <ThemedText style={styles.itemText}>{item.name}</ThemedText>
                <Feather
                    name={type === "subcategory" || type === "attribute"
                        ? "check"
                        : "chevron-right"}
                    size={20}
                    color={theme.textSecondary}
                />
            </Pressable>
        ),
        [handleSelect, type, theme],
    );

    return (
        <ThemedView style={styles.container}>
            <StatusBar style="auto" />
            <SafeAreaView
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.backgroundRoot,
                        borderBottomColor: theme.border,
                    },
                ]}
                edges={["top"]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={8}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={theme.text}
                        />
                    </TouchableOpacity>
                    <ThemedText type="h4" style={styles.headerTitle}>
                        {title}
                    </ThemedText>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.searchContainer}>
                    <View
                        style={[
                            styles.searchInputContainer,
                            { backgroundColor: theme.backgroundDefault },
                        ]}
                    >
                        <Feather
                            name="search"
                            size={18}
                            color={theme.textSecondary}
                        />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            placeholderTextColor={theme.textSecondary}
                            style={[styles.searchInput, { color: theme.text }]}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable
                                onPress={() => setSearchQuery("")}
                                hitSlop={8}
                            >
                                <Feather
                                    name="x"
                                    size={18}
                                    color={theme.textSecondary}
                                />
                            </Pressable>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            {isLoading
                ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.primary}
                        />
                    </View>
                )
                : (
                    <View style={styles.listContainer}>
                        <FlashList
                            data={filteredData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <ThemedText
                                        type="body"
                                        style={{ color: theme.textSecondary }}
                                    >
                                        No options found
                                    </ThemedText>
                                </View>
                            }
                        />
                    </View>
                )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 0.5,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 40,
    },
    searchContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        height: 44,
        borderRadius: BorderRadius.xs,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: Spacing.xl,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        borderBottomWidth: 0.5,
        minHeight: 56,
        gap: Spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.xs,
        justifyContent: "center",
        alignItems: "center",
    },
    itemText: {
        flex: 1,
        fontSize: 16,
    },
    emptyContainer: {
        padding: Spacing["3xl"],
        alignItems: "center",
    },
});
