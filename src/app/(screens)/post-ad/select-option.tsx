import CustomLoader from '@/components/ui/CustomLoader';
import { useCategories, useSubcategoriesByCategory } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useAppStore } from '@/stores/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SelectionType = 'category' | 'subcategory' | 'attribute';

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
        options: optionsParam
    } = useLocalSearchParams<{
        type: SelectionType;
        title: string;
        categoryId?: string;
        attributeKey?: string;
        options?: string;
    }>();

    const { setCategoryId, setSubcategoryId } = useAppStore((state) => state.postAd);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data based on type
    const parsedCategoryId = categoryId ? parseInt(categoryId) : null;
    const categoriesQuery = useCategories();
    const subcategoriesQuery = useSubcategoriesByCategory(
        type === 'subcategory' ? parsedCategoryId : null
    );

    const { data: rawData, isLoading } = useMemo(() => {
        switch (type) {
            case 'category':
                return categoriesQuery;
            case 'subcategory':
                return subcategoriesQuery;
            case 'attribute':
                try {
                    const parsedOptions = JSON.parse(optionsParam || '[]') as string[];
                    const optionItems: OptionItem[] = parsedOptions.map((opt, i) => ({
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

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!rawData) return [];
        if (!searchQuery.trim()) return rawData;
        return rawData.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rawData, searchQuery]);

    // Handle selection based on type
    const handleSelect = useCallback(
        (item: OptionItem) => {
            switch (type) {
                case 'category':
                    setCategoryId(Number(item.id));
                    setSubcategoryId(null);
                    router.push({
                        pathname: './select-option',
                        params: {
                            type: 'subcategory',
                            title: 'Select Subcategory',
                            categoryId: item.id.toString(),
                        },
                    });
                    break;

                case 'subcategory':
                    setSubcategoryId(Number(item.id));
                    router.dismissAll();
                    router.push('./step1');
                    break;

                case 'attribute':
                    router.back();
                    router.setParams({ [`${attributeKey}_value`]: item.name });
                    break;
            }
        },
        [type, setCategoryId, setSubcategoryId, router, attributeKey]
    );

    const renderItem = useCallback(
        ({ item }: { item: OptionItem }) => (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.itemText}>{item.name}</Text>
                <Ionicons
                    name={type === 'subcategory' ? 'checkmark-circle-outline' : 'chevron-forward'}
                    size={20}
                    color={Colors.grey}
                />
            </TouchableOpacity>
        ),
        [handleSelect, type]
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={Colors.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${title.toLowerCase()}...`}
                        placeholderTextColor={Colors.grey}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.grey} />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <CustomLoader />
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlashList
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No options found</Text>
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
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
    },
    placeholder: {
        width: 32,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightgrey,
    },
    itemText: {
        fontSize: 16,
        color: Colors.black,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: Colors.grey,
    },
});
