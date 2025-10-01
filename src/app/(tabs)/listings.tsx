import FiltersModal from '@/components/FiltersModal';
import ListingCard from '@/components/ListingCard';
import ListingsSkeleton from '@/components/ListingsSkeleton';
import SortModal from '@/components/SortModal';
import { useCategories, useCategoryMutations, useSubcategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useFilteredListings } from '@/src/hooks/useListings';
import type { ListingItem } from '@/types/types';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Loading component for lazy loading
const ListingsLoading = () => (
  <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <ListingsSkeleton viewMode="grid" count={6} />
  </View>
);

function ListingsContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [, setAppliedFilters] = useState<any>(null);
  
  // Back to top functionality
  const [showBackToTop, setShowBackToTop] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Data hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories();
  const { prefetchSubcategories } = useCategoryMutations();
  
  // React Query hook for listings
  const { 
    listings, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch
  } = useFilteredListings(searchQuery);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      showErrorToast(error.message || 'Failed to load listings', 'Network Error');
    }
  }, [error]);

  // Prefetch subcategories when filters modal opens
  useEffect(() => {
    if (showFilters && categories && categories.length > 0) {
      // Prefetch all subcategories for better performance
      prefetchSubcategories();
    }
  }, [showFilters, categories, prefetchSubcategories]);

  // Handle scroll for back-to-top button
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Show/hide back-to-top button based on scroll position
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const screenHeight = Dimensions.get('window').height;
      setShowBackToTop(value > screenHeight * 2);
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  // Scroll to top function
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleBackPress = () => {
    router.push('/(tabs)/home');
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/(screens)/listings/${listingId}`);
  };

  const handleListingFavoritePress = (listingId: string) => {
    console.log('Toggle favorite for listing:', listingId);
    // TODO: Implement actual favorite toggle with API call
    showErrorToast('Favorite functionality coming soon!');
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleSort = () => {
    setShowSort(true);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // TODO: Apply filters to the listings query
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    console.log('Sort changed to:', newSortBy);
    // TODO: Apply sorting to the listings query
  };

  const getSearchDisplayText = () => {
    if (!searchQuery) return 'All Items';
    const words = searchQuery.trim().split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return searchQuery;
  };

  // The filtering is now handled in the useFilteredListings hook
  const filteredListings = listings;

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
        isFavorite={false} // TODO: Implement favorites functionality
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
              Found Results: {getSearchDisplayText()} ({filteredListings.length})
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
        ) : filteredListings.length === 0 ? (
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
            data={filteredListings}
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
            data={filteredListings}
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
        subcategories={subcategories || []}
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
        <Animated.View style={[styles.backToTopButton, { opacity: scrollY.interpolate({
          inputRange: [Dimensions.get('window').height * 2, Dimensions.get('window').height * 3],
          outputRange: [0.7, 1],
          extrapolate: 'clamp',
        })}]}>
          <TouchableOpacity style={styles.backToTopTouchable} onPress={scrollToTop}>
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
    bottom: 100,
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
