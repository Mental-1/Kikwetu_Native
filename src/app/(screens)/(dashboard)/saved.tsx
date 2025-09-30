import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedListing {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  images: string[];
  sellerName: string;
  sellerRating: number;
  savedDate: string;
  isAvailable: boolean;
  views: number;
  condition: string;
}

const Saved = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  const savedListings: SavedListing[] = [
    {
      id: '1',
      title: 'MacBook Pro M3 2024',
      description: 'Brand new MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for professionals.',
      price: 'KES 280,000',
      location: 'Nairobi, Kenya',
      category: 'Electronics',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'TechStore Kenya',
      sellerRating: 4.8,
      savedDate: '2024-01-15',
      isAvailable: true,
      views: 234,
      condition: 'Brand New'
    },
    {
      id: '2',
      title: 'Honda CR-V 2022',
      description: 'Well maintained Honda CR-V, automatic transmission, low mileage, full service history.',
      price: 'KES 3,200,000',
      location: 'Mombasa, Kenya',
      category: 'Vehicles',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'Auto Deals',
      sellerRating: 4.6,
      savedDate: '2024-01-14',
      isAvailable: true,
      views: 189,
      condition: 'Excellent'
    },
    {
      id: '3',
      title: 'Nike Air Jordan 1 Retro',
      description: 'Classic Nike Air Jordan 1 Retro in Chicago colorway, size 42, excellent condition.',
      price: 'KES 25,000',
      location: 'Kisumu, Kenya',
      category: 'Fashion',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'SneakerHead KE',
      sellerRating: 4.9,
      savedDate: '2024-01-13',
      isAvailable: false,
      views: 156,
      condition: 'Like New'
    },
    {
      id: '4',
      title: 'Samsung 55" 4K Smart TV',
      description: 'Samsung 55-inch 4K UHD Smart TV with HDR, perfect for home entertainment.',
      price: 'KES 85,000',
      location: 'Nakuru, Kenya',
      category: 'Electronics',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'Electronics Hub',
      sellerRating: 4.7,
      savedDate: '2024-01-12',
      isAvailable: true,
      views: 312,
      condition: 'Good'
    },
    {
      id: '5',
      title: 'Modern Dining Table Set',
      description: '6-seater modern dining table with chairs, perfect for family dining.',
      price: 'KES 65,000',
      location: 'Eldoret, Kenya',
      category: 'Furniture',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'Furniture World',
      sellerRating: 4.5,
      savedDate: '2024-01-11',
      isAvailable: true,
      views: 98,
      condition: 'Excellent'
    },
    {
      id: '6',
      title: 'Canon EOS R6 Camera',
      description: 'Professional mirrorless camera with 20MP sensor, 4K video, perfect for photography.',
      price: 'KES 180,000',
      location: 'Nairobi, Kenya',
      category: 'Electronics',
      images: ['https://via.placeholder.com/300x200'],
      sellerName: 'Camera Pro',
      sellerRating: 4.9,
      savedDate: '2024-01-10',
      isAvailable: false,
      views: 267,
      condition: 'Excellent'
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All', count: savedListings.length },
    { id: 'available', label: 'Available', count: savedListings.filter(l => l.isAvailable).length },
    { id: 'sold', label: 'Sold', count: savedListings.filter(l => !l.isAvailable).length },
    { id: 'electronics', label: 'Electronics', count: savedListings.filter(l => l.category === 'Electronics').length },
    { id: 'vehicles', label: 'Vehicles', count: savedListings.filter(l => l.category === 'Vehicles').length },
    { id: 'fashion', label: 'Fashion', count: savedListings.filter(l => l.category === 'Fashion').length },
    { id: 'furniture', label: 'Furniture', count: savedListings.filter(l => l.category === 'Furniture').length },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleViewListing = (listingId: string) => {
    showAlert({
      title: 'View Listing',
      message: 'Redirecting to listing details...',
      buttonText: 'OK',
      icon: 'eye-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'View functionality will be implemented');
      }
    });
  };

  const handleRemoveFromSaved = (listingId: string) => {
    showAlert({
      title: 'Remove from Saved',
      message: 'Are you sure you want to remove this listing from your saved items?',
      buttonText: 'Remove',
      icon: 'heart-dislike-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: () => {
        success('Success', 'Listing removed from saved items');
      }
    });
  };

  const handleShareListing = (listingId: string) => {
    showAlert({
      title: 'Share Listing',
      message: 'Share this listing with friends and family',
      buttonText: 'Share',
      icon: 'share-social-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Listing shared successfully');
      }
    });
  };

  const handleContactSeller = (listingId: string) => {
    showAlert({
      title: 'Contact Seller',
      message: 'You can contact the seller through our messaging system',
      buttonText: 'Message',
      icon: 'chatbubble-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Opening chat with seller');
      }
    });
  };

  const filteredListings = savedListings.filter(listing => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'available' && listing.isAvailable) ||
                         (selectedFilter === 'sold' && !listing.isAvailable) ||
                         listing.category.toLowerCase() === selectedFilter;
    
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const renderFilterButton = (filter: any) => (
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
  );

  const renderContextMenu = (listingId: string) => {
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
            handleRemoveFromSaved(listingId);
            setShowContextMenu(null);
          }}
        >
          <Ionicons name="heart-dislike-outline" size={20} color="#F44336" />
          <Text style={[styles.contextMenuText, { color: '#F44336' }]}>Remove from Saved</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2;

  const renderListing = ({ item: listing }: { item: SavedListing }) => (
    <TouchableOpacity 
      style={[styles.listingCard, { width: cardWidth }]}
      onPress={() => handleViewListing(listing.id)}
      activeOpacity={0.8}
    >
      <View style={styles.listingImageContainer}>
        <Image 
          source={{ uri: listing.images[0] }} 
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
          <Text style={styles.listingPrice}>{listing.price}</Text>
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
            <Text style={styles.ratingText}>{listing.sellerRating}</Text>
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
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <TouchableOpacity style={styles.clearButton} onPress={() => success('Info', 'Clear all functionality will be implemented')}>
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
          {filteredListings.length === 0 ? (
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
});

export default Saved;