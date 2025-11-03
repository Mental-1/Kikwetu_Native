import FiltersModal from '@/components/FiltersModal';
import ListingCard from '@/components/ListingCard';
import ListingsSkeleton from '@/components/ListingsSkeleton';
import SortModal from '@/components/SortModal';
import { useCategories, useCategoryMutations, useSubcategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useSaveListing, useUnsaveListing } from '@/src/hooks/useApiSavedListings';
import { useListings } from '@/src/hooks/useListings';
import { useAppStore } from '@/stores/useAppStore';
import type { ListingItem } from '@/types/types';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

const ListingsLoading = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <ListingsSkeleton viewMode="grid" count={6} />
  </View>
);


function ListingsContent() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useAppStore();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
  const saveListingMutation = useSaveListing();
  const unsaveListingMutation = useUnsaveListing();
  
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { isLoading: subcategoriesLoading } = useSubcategories();
  const { prefetchSubcategories } = useCategoryMutations();
  
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch
  } = useListings({ 
    search: debouncedSearchQuery, 
    ...appliedFilters, 
    sortBy 
  });

  const listings = data?.pages.flatMap(page => page.data) || [];

  useEffect(() => {
    if (error) {
      showErrorToast(error.message || 'Failed to load listings', 'Network Error');
    }
  }, [error]);

  useEffect(() => {
    if (showFilters && categories && categories.length > 0) {
      prefetchSubcategories();
    }
  }, [showFilters, categories, prefetchSubcategories]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const screenHeight = Dimensions.get('window').height;
      setShowBackToTop(value > screenHeight * 1.5);
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  const scrollToTop = useCallback(() => {
    console.log('scrollToTop called, flatListRef.current:', !!flatListRef.current);
    if (!flatListRef.current) {
      console.warn('flatListRef.current is null');
      return;
    }
    
    try {
      console.log('Attempting scrollToOffset');
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error('Failed to scroll to top:', error);
      try {
        if (listings.length > 0) {
          console.log('Attempting scrollToIndex as fallback');
          flatListRef.current.scrollToIndex({ 
            index: 0, 
            animated: true,
            viewPosition: 0
          });
        }
      } catch (indexError) {
        console.error('Failed to scroll using scrollToIndex:', indexError);
      }
    }
  }, [listings.length]);

  const handleBackPress = () => {
    router.push('/(tabs)/home');
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/(screens)/listings/${listingId}`);
  };

  const handleListingFavoritePress = useCallback(async (listingId: string) => {
    const isCurrentlyFavorite = favoriteStates[listingId];
    
    try {
      if (isCurrentlyFavorite) {
        await unsaveListingMutation.mutateAsync(listingId);
        setFavoriteStates(prev => ({ ...prev, [listingId]: false }));
        showSuccessToast('Removed from favorites');
      } else {
        await saveListingMutation.mutateAsync({ listingId });
        setFavoriteStates(prev => ({ ...prev, [listingId]: true }));
        showSuccessToast('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showErrorToast('Failed to update favorites');
    }
  }, [favoriteStates, saveListingMutation, unsaveListingMutation]);

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleSort = () => {
    setShowSort(true);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = useCallback((filters: any) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
  }, []);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
    console.log('Sort changed to:', newSortBy);
  }, []);

  const getSearchDisplayText = () => {
    if (!searchQuery) return 'All Items';
    const words = searchQuery.trim().split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return searchQuery;
  };

  

  const renderGridItem = ({ item }: { item: ListingItem }) => (
    <View style={styles.gridItem}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price ? `Kes ${item.price.toLocaleString()}` : 'Price not set'}
        condition={item.condition || 'Not specified'}
        location={item.location || 'Location not specified'}
        image={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/200x140'}
        description={item.description || undefined}
        views={item.views || 0}
        isFavorite={favoriteStates[item.id] || false}
        viewMode="grid"
        onPress={handleListingPress}
        onFavoritePress={handleListingFavoritePress}
      />
    </View>
  );

  const renderListItem = ({ item }: { item: ListingItem }) => (
    <ListingCard
      id={item.id}
      title={item.title}
      price={item.price ? `Kes ${item.price.toLocaleString()}` : 'Price not set'}
      condition={item.condition || 'Not specified'}
      location={item.location || 'Location not specified'}
      image={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/200x140'}
      description={item.description || undefined}
      views={item.views || 0}
      isFavorite={false} // TODO: Implement favorites functionality
      viewMode="list"
      onPress={handleListingPress}
      onFavoritePress={handleListingFavoritePress}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color={Colors.black} />
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.grey} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* View Toggle */}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
            <Ionicons 
              name={isGridView ? "grid-outline" : "list-outline"} 
              size={20} 
              color={Colors.primary} 
            />
          </TouchableOpacity>

          {/* Sort Button */}
          <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
            <Ionicons name="funnel-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter and Results Info */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          {/* Filter Pill */}
          <TouchableOpacity style={styles.filterPill} onPress={handleFilterToggle}>
            <Text style={styles.filterPillText}>Filters</Text>
            <Ionicons name="options-outline" size={16} color={Colors.white} />
          </TouchableOpacity>

          {/* Results and Sort Info */}
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              Found Results: {getSearchDisplayText()} ({listings.length})
            </Text>
            <Text style={styles.sortText}>
              Sort By: {sortBy}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <ListingsSkeleton viewMode={isGridView ? 'grid' : 'list'} count={6} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.message || 'Something went wrong'}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                refetch();
                showErrorToast('Retrying to load listings...', 'Retry');
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listings found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new listings'}
            </Text>
          </View>
        ) : isGridView ? (
          <FlatList
            ref={flatListRef}
            key="grid"
            data={listings}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => 
              isFetchingNextPage ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingFooterText}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            ref={flatListRef}
            key="list"
            data={listings}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => 
              isFetchingNextPage ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingFooterText}>Loading more...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Filters Modal */}
      <FiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        categories={categories || []}
        isLoading={categoriesLoading || subcategoriesLoading}
      />

      {/* Sort Modal */}
      <SortModal
        visible={showSort}
        onClose={() => setShowSort(false)}
        currentSortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <Animated.View 
          style={[styles.backToTopButton, { opacity: scrollY.interpolate({
            inputRange: [Dimensions.get('window').height * 1.5, Dimensions.get('window').height * 2],
            outputRange: [0.7, 1],
            extrapolate: 'clamp',
          })}]}
          pointerEvents="box-none"
        >
          <TouchableOpacity 
            style={styles.backToTopTouchable} 
            onPress={scrollToTop}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-up" size={24} color={Colors.white} />
          </TouchableOpacity>
        </Animated.View>
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
    borderBottomWidth: 0.4,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
  toggleButton: {
    padding: 8,
  },
  sortButton: {
    padding: 8,
  },
  filterSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterPill: {
    backgroundColor: Colors.black,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPillText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  sortText: {
    fontSize: 12,
    color: Colors.grey,
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 16,
    paddingBottom: 100,
  },
  gridItem: {
    width: (width - 40) / 2,
    marginBottom: 10,
    marginRight: 10,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingFooterText: {
    fontSize: 14,
    color: Colors.grey,
  },
  backToTopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  backToTopTouchable: {
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

const Listings = () => (
  <Suspense fallback={<ListingsLoading />}>
    <ListingsContent />
  </Suspense>
);

export default Listings;
