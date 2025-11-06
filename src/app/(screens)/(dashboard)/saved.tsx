import { useCategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useClearAllSavedListings, useSavedListings, useUnsaveListing } from '@/src/hooks/useApiSavedListings';
import { useUser } from '@/src/hooks/useUser';
import { useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedListing {
  id: string;
  listing_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  categoryName: string;
  images: string[];
  sellerName: string;
  sellerRating: number;
  savedDate: string;
  isAvailable: boolean;
  views: number;
  condition: string;
  sellerId: string;
  sellerAvatar?: string;
}

const Saved = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  const { data: savedData, isLoading, error: fetchError, refetch } = useSavedListings();
  const { data: categoriesData } = useCategories();
  const { getUserById } = useUser();
  const unsave = useUnsaveListing();
  const clearAll = useClearAllSavedListings();

  // State for user data cache
  const [userCache, setUserCache] = useState<Record<string, { name: string; rating: number; avatar?: string }>>({});

  // Fetch user data for all unique seller IDs
  useEffect(() => {
    const fetchUserData = async () => {
      if (!savedData) return;

      const uniqueUserIds = Array.from(
        new Set(
          savedData
            .map(item => item.listing?.user_id)
            .filter(Boolean) as string[]
        )
      );

      const newUserCache: Record<string, { name: string; rating: number; avatar?: string }> = {};

      // Fetch user data for each unique user ID
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          if (!userCache[userId]) {
            try {
              const userData = await getUserById(userId);
              if (userData) {
                newUserCache[userId] = {
                  name: userData.fullName || userData.username || 'Seller',
                  rating: userData.rating || 0,
                  avatar: userData.avatarUrl,
                };
              }
            } catch {
              // Fallback for failed user fetch
              newUserCache[userId] = {
                name: 'Seller',
                rating: 0,
              };
            }
          }
        })
      );

      // Update cache with new data
      setUserCache(prev => ({ ...prev, ...newUserCache }));
    };

    fetchUserData();
  }, [savedData, getUserById, userCache]);

  // Transform API data to match UI interface
  const savedListings: SavedListing[] = useMemo(() => {
    return (savedData || []).map(item => {
      const category = categoriesData?.find(cat => cat.id === item.listing?.category_id);
      const userId = item.listing?.user_id || '';
      const userInfo = userCache[userId];
      
      return {
        id: item.id,
        listing_id: item.listing_id,
        title: item.listing?.title || '',
        description: item.listing?.description || '',
        price: item.listing?.price || 0,
        location: item.listing?.location || '',
        category: item.listing?.category_id?.toString() || '',
        categoryName: category?.name || 'Unknown',
        images: item.listing?.images || [],
        sellerName: userInfo?.name || 'Seller',
        sellerRating: userInfo?.rating || 0,
        savedDate: new Date(item.created_at).toLocaleDateString(),
        isAvailable: item.listing?.status === 'active',
        views: item.listing?.views || 0,
        condition: item.listing?.condition || 'good',
        sellerId: userId,
        sellerAvatar: userInfo?.avatar,
      };
    });
  }, [savedData, categoriesData, userCache]);

  

  const filterOptions = useMemo(() => {
    const baseFilters = [
      { id: 'all', label: 'All', count: savedListings.length },
      { id: 'available', label: 'Available', count: savedListings.filter(l => l.isAvailable).length },
      { id: 'sold', label: 'Sold', count: savedListings.filter(l => !l.isAvailable).length },
    ];


    const categoryFilters = (categoriesData || [])
      .filter(category => savedListings.some(listing => listing.category === category.id.toString()))
      .map(category => ({
        id: category.id.toString(),
        label: category.name,
        count: savedListings.filter(l => l.category === category.id.toString()).length,
      }));

    return [...baseFilters, ...categoryFilters];
  }, [savedListings, categoriesData]);

  const handleBack = () => {
    router.back();
  };

  const handleViewListing = useCallback((listingId: string) => {
    router.push(`/listings/${listingId}`);
  }, [router]);

  const handleRemoveFromSaved = useCallback((listingId: string) => {
    showAlert({
      title: 'Remove from Saved',
      message: 'Are you sure you want to remove this listing from your saved items?',
      buttonText: 'Remove',
      icon: 'heart-dislike-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: async () => {
        try {
          await unsave.mutateAsync(listingId);
        } catch {
          // Error toast shown by mutation
        }
      }
    });
  }, [showAlert, unsave]);

  const handleClearAll = useCallback(() => {
    showAlert({
      title: 'Clear All Saved Items',
      message: 'Are you sure you want to remove all saved listings? This action cannot be undone.',
      buttonText: 'Clear All',
      icon: 'trash-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: async () => {
        try {
          await clearAll.mutateAsync();
        } catch {
          // Error toast shown by mutation
        }
      }
    });
  }, [showAlert, clearAll]);

  const handleShareListing = useCallback(async (listingId: string) => {
    try {
      const listing = savedListings.find(l => l.id === listingId);
      if (!listing) return;

      const shareUrl = `https://kikwetu.app/listings/${listing.listing_id}`;
      const shareMessage = `Check out this ${listing.title} for KES ${listing.price.toLocaleString()} on Kikwetu! ${shareUrl}`;

      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: listing.title,
      });
    } catch {
      showAlert({
        title: 'Share Failed',
        message: 'Unable to share this listing. Please try again.',
        buttonText: 'OK',
        icon: 'alert-circle-outline',
        iconColor: '#F44336',
        buttonColor: '#F44336',
      });
    }
  }, [savedListings, showAlert]);

  const handleContactSeller = useCallback((listingId: string) => {
    const listing = savedListings.find(l => l.id === listingId);
    if (!listing) return;

    router.push({
      pathname: '/messages',
      params: {
        recipientId: listing.sellerId,
        listingId: listing.listing_id,
        recipientName: listing.sellerName,
      }
    });
  }, [savedListings, router]);

  const filteredListings = useMemo(() => {
    return savedListings.filter(listing => {
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'available' && listing.isAvailable) ||
                           (selectedFilter === 'sold' && !listing.isAvailable) ||
                           listing.category === selectedFilter;
      
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [savedListings, selectedFilter, searchQuery]);

  const renderFilterButton = useCallback((filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.selectedFilter
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter.id && styles.selectedFilterText
      ]}>
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  ), [selectedFilter]);

  const renderContextMenu = useCallback((listingId: string) => {
    return (
      <View style={styles.contextMenu}>
        <TouchableOpacity
          style={styles.contextMenuItem}
          onPress={() => {
            handleViewListing(listingId);
            setShowContextMenu(null);
          }}
        >
          <Ionicons name="eye-outline" size={20} color={Colors.primary} />
          <Text style={styles.contextMenuText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contextMenuItem}
          onPress={() => {
            handleContactSeller(listingId);
            setShowContextMenu(null);
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
          <Text style={[styles.contextMenuText, { color: '#4CAF50' }]}>Contact Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contextMenuItem}
          onPress={() => {
            handleShareListing(listingId);
            setShowContextMenu(null);
          }}
        >
          <Ionicons name="share-social-outline" size={20} color="#2196F3" />
          <Text style={[styles.contextMenuText, { color: '#2196F3' }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contextMenuItem}
          onPress={() => {
            const listing = savedListings.find(l => l.id === listingId);
            if (listing) {
              handleRemoveFromSaved(listing.listing_id);
            }
            setShowContextMenu(null);
          }}
        >
          <Ionicons name="heart-dislike-outline" size={20} color="#F44336" />
          <Text style={[styles.contextMenuText, { color: '#F44336' }]}>Remove from Saved</Text>
        </TouchableOpacity>
      </View>
    );
  }, [handleViewListing, handleContactSeller, handleShareListing, handleRemoveFromSaved, savedListings]);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  const renderListing = useCallback(({ item: listing }: { item: SavedListing }) => (
    <TouchableOpacity 
      style={[styles.listingCard, { width: cardWidth }]}
      onPress={() => handleViewListing(listing.id)}
      activeOpacity={0.8}
    >
      <View style={styles.listingImageContainer}>
        <Image 
          source={{ uri: listing.images[0] || 'https://via.placeholder.com/150' }} 
          style={styles.listingImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.statusBadge}>
            <Ionicons 
              name={listing.isAvailable ? "checkmark-circle" : "close-circle"} 
              size={10} 
              color={listing.isAvailable ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[
              styles.statusText, 
              { color: listing.isAvailable ? "#4CAF50" : "#F44336", fontSize: 9 }
            ]}>
              {listing.isAvailable ? "Available" : "Sold"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={(e) => {
              e.stopPropagation();
              setShowContextMenu(showContextMenu === listing.id ? null : listing.id);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {listing.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.listingPrice}>KES {listing.price.toLocaleString()}</Text>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{listing.condition}</Text>
          </View>
        </View>
        <Text style={styles.listingLocation} numberOfLines={1}>
          {listing.location}
        </Text>
        
        <View style={styles.sellerInfo}>
          <View style={styles.sellerRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{listing.sellerRating.toFixed(1)}</Text>
          </View>
          <Text style={styles.sellerName} numberOfLines={1}>
            {listing.sellerName}
          </Text>
        </View>

        <View style={styles.listingStats}>
          <Ionicons name="eye-outline" size={12} color={Colors.grey} />
          <Text style={styles.statsText}>{listing.views}</Text>
          <Text style={styles.statsSeparator}>•</Text>
          <Text style={styles.statsText}>Saved {listing.savedDate}</Text>
        </View>
      </View>

      {showContextMenu === listing.id && renderContextMenu(listing.id)}
    </TouchableOpacity>
  ), [cardWidth, handleViewListing, showContextMenu, renderContextMenu]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search saved items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.grey}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.grey} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map(renderFilterButton)}
          </ScrollView>
        </View>

        {/* Saved Listings Grid */}
        <TouchableOpacity 
          style={styles.listingsSection}
          activeOpacity={1}
          onPress={() => setShowContextMenu(null)}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading saved items...</Text>
            </View>
          ) : fetchError ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
              <Text style={styles.emptyTitle}>Failed to Load Saved Items</Text>
              <Text style={styles.emptySubtitle}>Please check your connection and try again</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => refetch()}>
                <Text style={styles.emptyButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color={Colors.grey} />
              <Text style={styles.emptyTitle}>No Saved Items</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'No saved items match your current filter'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/listings')}>
                <Text style={styles.emptyButtonText}>Browse Listings</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredListings}
              renderItem={renderListing}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={6}
              getItemLayout={(data, index) => ({
                length: 200,
                offset: 200 * Math.floor(index / 2),
                index,
              })}
            />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Custom Alert Component */}
      <AlertComponent />
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
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.black,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  selectedFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: Colors.white,
    fontWeight: '600',
  },
  listingsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listingsContainer: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  listingImageContainer: {
    position: 'relative',
    height: 120,
  },
  listingImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightgrey,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },
  moreButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  listingContent: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  conditionBadge: {
    backgroundColor: 'rgba(3, 65, 252, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 8,
    color: Colors.primary,
    fontWeight: '600',
  },
  listingLocation: {
    fontSize: 11,
    color: Colors.grey,
    marginBottom: 6,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    color: Colors.black,
    marginLeft: 2,
    fontWeight: '600',
  },
  sellerName: {
    fontSize: 10,
    color: Colors.grey,
    flex: 1,
    textAlign: 'right',
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 10,
    color: Colors.grey,
    marginLeft: 2,
  },
  statsSeparator: {
    fontSize: 10,
    color: Colors.grey,
    marginHorizontal: 4,
  },
  contextMenu: {
    position: 'absolute',
    top: 60,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
    minWidth: 160,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  contextMenuText: {
    fontSize: 12,
    color: Colors.black,
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 12,
  },
});

export default Saved;