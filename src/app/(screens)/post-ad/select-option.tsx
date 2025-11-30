import {
    useCategories,
    useSubcategoriesByCategory,
} from "@/hooks/useCategories";
import { Colors } from "@/src/constants/constant";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Appbar,
    Divider,
    List,
    Searchbar,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type SelectionType = "category" | "subcategory" | "attribute";

interface OptionItem {
    id: number | string;
    name: string;
}

export default function SelectOption() {
    const router = useRouter();
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
                        pathname: "/(screens)/post-ad/select-option" as any,
                        params: {
                            type: "subcategory",
                            title: "Select Subcategory",
                            categoryId: item.id.toString(),
                        },
                    });
                    break;

                case "subcategory":
                    router.navigate({
                        pathname: "/(screens)/post-ad/step1",
                        params: {
                            categoryId: categoryId,
                            subcategoryId: item.id.toString(),
                        },
                    });
                    break;

                case "attribute":
                    router.navigate({
                        pathname: "/(screens)/post-ad/step1",
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
            <React.Fragment>
                <List.Item
                    title={item.name}
                    onPress={() => handleSelect(item)}
                    right={(props) => (
                        <List.Icon
                            {...props}
                            icon={type === "subcategory"
                                ? "check"
                                : "chevron-right"}
                            color={Colors.grey}
                        />
                    )}
                    style={styles.item}
                    titleStyle={styles.itemText}
                />
                <Divider />
            </React.Fragment>
        ),
        [handleSelect, type],
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.header} edges={["top"]}>
                <Appbar.Header style={styles.appbar} statusBarHeight={0}>
                    <Appbar.BackAction onPress={() => router.back()} />
                    <Appbar.Content
                        title={title}
                        titleStyle={styles.headerTitle}
                    />
                </Appbar.Header>
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder={`Search ${title.toLowerCase()}...`}
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        inputStyle={styles.searchInput}
                        elevation={0}
                    />
                </View>
            </SafeAreaView>

            {isLoading
                ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={Colors.primary}
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
                                    <Text style={styles.emptyText}>
                                        No options found
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightgrey,
    },
    appbar: {
        backgroundColor: Colors.white,
        elevation: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: Colors.white,
    },
    searchBar: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        height: 44,
    },
    searchInput: {
        minHeight: 0, // Fix for searchbar height issue
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
        paddingBottom: 20,
    },
    item: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
    },
    itemText: {
        fontSize: 16,
        color: Colors.black,
    },
    emptyContainer: {
        padding: 24,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: Colors.grey,
    },
});
