import ListingCard from '@/components/ListingCard';
import SortModal from '@/components/SortModal';
import { useCategories, useCategoryMutations, useSubcategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Lazy load the modals for better performance
const LazyFiltersModal = lazy(() => import('@/components/FiltersModal'));

const { width } = Dimensions.get('window');

// Mock listings data
const mockListings = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max',
    price: 'Kes 400,000',
    condition: 'New',
    rating: '10/10',
    location: 'Westlands, Nairobi',
    description: 'Brand new iPhone 14 Pro Max in Space Black. Still in original packaging with all accessories included.',
    views: 156,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'MacBook Pro M2',
    price: 'Kes 250,000',
    condition: 'Used',
    rating: '9/10',
    location: 'Kilimani, Nairobi',
    description: 'Excellent condition MacBook Pro M2. Perfect for developers and creative professionals.',
    views: 89,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Samsung Galaxy S23',
    price: 'Kes 180,000',
    condition: 'New',
    rating: '10/10',
    location: 'Karen, Nairobi',
    description: 'Latest Samsung Galaxy S23 with amazing camera quality and fast performance.',
    views: 234,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: false,
  },
  {
    id: '4',
    title: 'iPad Air 5th Gen',
    price: 'Kes 120,000',
    condition: 'Like New',
    rating: '9/10',
    location: 'Runda, Nairobi',
    description: 'iPad Air 5th generation in mint condition. Great for work and entertainment.',
    views: 67,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: true,
  },
  {
    id: '5',
    title: 'Dell XPS 13',
    price: 'Kes 180,000',
    condition: 'Used',
    rating: '8/10',
    location: 'Kileleshwa, Nairobi',
    description: 'High-performance Dell XPS 13 laptop with excellent build quality and display.',
    views: 123,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: false,
  },
  {
    id: '6',
    title: 'AirPods Pro 2nd Gen',
    price: 'Kes 35,000',
    condition: 'New',
    rating: '10/10',
    location: 'Lavington, Nairobi',
    description: 'Latest AirPods Pro with active noise cancellation and spatial audio.',
    views: 89,
    image: 'https://via.placeholder.com/200x140',
    isFavorite: false,
  },
];

// Loading component for lazy loading
const ListingsLoading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
    <ActivityIndicator size="large" color={Colors.primary} />
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
  
  // Data hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories();
  const { prefetchSubcategories } = useCategoryMutations();

  // Prefetch subcategories when filters modal opens
  useEffect(() => {
    if (showFilters && categories && categories.length > 0) {
      // Prefetch all subcategories for better performance
      categories.forEach(() => {
        prefetchSubcategories();
      });
    }
  }, [showFilters, categories, prefetchSubcategories]);

  const handleBackPress = () => {
    router.push('/(tabs)/home');
  };

  const handleListingPress = (listingId: string) => {
    router.push(`/(screens)/listings/${listingId}`);
  };

  const handleListingFavoritePress = (listingId: string) => {
    console.log('Toggle favorite for listing:', listingId);
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
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    console.log('Sort changed to:', newSortBy);
  };

  const getSearchDisplayText = () => {
    if (!searchQuery) return 'All Items';
    const words = searchQuery.trim().split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return searchQuery;
  };

  const filteredListings = mockListings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGridItem = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <ListingCard
        id={item.id}
        title={item.title}
        price={item.price}
        condition={item.condition}
        location={item.location}
        image={item.image}
        description={item.description}
        views={item.views}
        isFavorite={item.isFavorite}
        viewMode="grid"
        onPress={handleListingPress}
        onFavoritePress={handleListingFavoritePress}
      />
    </View>
  );

  const renderListItem = ({ item }: { item: any }) => (
    <ListingCard
      id={item.id}
      title={item.title}
      price={item.price}
      condition={item.condition}
      location={item.location}
      image={item.image}
      description={item.description}
      views={item.views}
      isFavorite={item.isFavorite}
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
        {isGridView ? (
          <FlatList
            key="grid"
            data={filteredListings}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            key="list"
            data={filteredListings}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Filters Modal - Lazy Loaded */}
      {showFilters && (
        <Suspense fallback={<View />}>
          <LazyFiltersModal
            visible={showFilters}
            onClose={() => setShowFilters(false)}
            onApplyFilters={handleApplyFilters}
            categories={categories || []}
            subcategories={subcategories || []}
            isLoading={categoriesLoading || subcategoriesLoading}
          />
        </Suspense>
      )}

      {/* Sort Modal */}
      <SortModal
        visible={showSort}
        onClose={() => setShowSort(false)}
        currentSortBy={sortBy}
        onSortChange={handleSortChange}
      />
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
});

const Listings = () => (
  <Suspense fallback={<ListingsLoading />}>
    <ListingsContent />
  </Suspense>
);

export default Listings;
