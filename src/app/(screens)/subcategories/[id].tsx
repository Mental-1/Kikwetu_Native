import { useCategory, useSubcategoriesByCategory } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubcategoriesScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = id ? parseInt(id, 10) : null;

  // Fetch category and subcategories data
  const { data: category, isLoading: categoryLoading } = useCategory(categoryId);
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategoriesByCategory(categoryId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubcategoryPress = useCallback((subcategoryId: number) => {
    // Navigate to listings screen with subcategory filter
    router.push(`/(tabs)/listings?subcategory=${subcategoryId}`);
  }, [router]);

  const renderSubcategoryItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.subcategoryItem}
      onPress={() => handleSubcategoryPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.subcategoryContent}>
        <View style={styles.subcategoryIcon}>
          <Ionicons name="folder-outline" size={24} color={Colors.primary} />
        </View>
        <View style={styles.subcategoryInfo}>
          <Text style={styles.subcategoryName}>{item.name}</Text>
          <Text style={styles.subcategoryDescription}>
            Browse {item.name.toLowerCase()} listings
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
      </View>
    </TouchableOpacity>
  ), [handleSubcategoryPress]);

  const isLoading = useMemo(() => categoryLoading || subcategoriesLoading, [categoryLoading, subcategoriesLoading]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category ? category.name : 'Subcategories'}
        </Text>
        <View style={styles.headerRight} />
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading subcategories...</Text>
          </View>
        ) : (
          <>
            {/* Category Info */}
            {category && (
              <View style={styles.categoryInfo}>
                <View style={styles.categoryIcon}>
                  <Ionicons name="grid-outline" size={32} color={Colors.primary} />
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {subcategories?.length || 0} subcategories available
                  </Text>
                </View>
              </View>
            )}

            {/* Subcategories List */}
            <View style={styles.subcategoriesContainer}>
              <Text style={styles.sectionTitle}>Subcategories</Text>
               <FlatList
                 data={subcategories}
                 renderItem={renderSubcategoryItem}
                 keyExtractor={(item) => item.id.toString()}
                 showsVerticalScrollIndicator={false}
                 contentContainerStyle={styles.subcategoriesList}
                 ItemSeparatorComponent={() => <View style={styles.separator} />}
                 removeClippedSubviews={true}
                 maxToRenderPerBatch={10}
                 windowSize={10}
                 initialNumToRender={10}
                 updateCellsBatchingPeriod={50}
                 getItemLayout={(data, index) => ({
                   length: 72, // Approximate item height
                   offset: 72 * index,
                   index,
                 })}
               />
            </View>

            {/* Empty State */}
            {subcategories && subcategories.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color={Colors.grey} />
                <Text style={styles.emptyStateTitle}>No Subcategories</Text>
                <Text style={styles.emptyStateText}>
                  This category doesn&apos;t have any subcategories yet.
                </Text>
              </View>
            )}
          </>
        )}
      </View>
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
  headerRight: {
    width: 32, // Maintains header balance
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.grey,
  },
  subcategoriesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  subcategoriesList: {
    paddingBottom: 20,
  },
  subcategoryItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subcategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  subcategoryDescription: {
    fontSize: 14,
    color: Colors.grey,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SubcategoriesScreen;
