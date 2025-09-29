import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'under-review' | 'sold' | 'draft' | 'expired';
  images: string[];
  createdAt: string;
  views: number;
  rejectionReason?: string;
}

const MyListings = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  const listings: Listing[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro Max 256GB',
      description: 'Brand new iPhone 14 Pro Max in Space Black. Still in box with all accessories.',
      price: 'KES 120,000',
      location: 'Nairobi, Kenya',
      category: 'Electronics',
      status: 'active',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-15',
      views: 45
    },
    {
      id: '2',
      title: 'MacBook Air M2 2022',
      description: 'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Excellent condition.',
      price: 'KES 95,000',
      location: 'Mombasa, Kenya',
      category: 'Electronics',
      status: 'pending',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-14',
      views: 23
    },
    {
      id: '3',
      title: 'Toyota Corolla 2020',
      description: 'Well maintained Toyota Corolla, automatic transmission, low mileage.',
      price: 'KES 2,200,000',
      location: 'Kisumu, Kenya',
      category: 'Vehicles',
      status: 'under-review',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-13',
      views: 89
    },
    {
      id: '4',
      title: 'Samsung Galaxy S23 Ultra',
      description: 'Samsung Galaxy S23 Ultra 512GB, Phantom Black. Includes original accessories.',
      price: 'KES 85,000',
      location: 'Nairobi, Kenya',
      category: 'Electronics',
      status: 'rejected',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-12',
      views: 12,
      rejectionReason: 'Image quality is poor. Please upload clearer photos of the device.'
    },
    {
      id: '5',
      title: 'Nike Air Max 270',
      description: 'Nike Air Max 270 size 42, worn only a few times. Excellent condition.',
      price: 'KES 8,500',
      location: 'Nakuru, Kenya',
      category: 'Fashion',
      status: 'sold',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-10',
      views: 67
    },
    {
      id: '6',
      title: 'Sofa Set 3+2+1',
      description: 'Modern sofa set in excellent condition. Perfect for living room.',
      price: 'KES 45,000',
      location: 'Eldoret, Kenya',
      category: 'Furniture',
      status: 'draft',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-09',
      views: 0
    },
    {
      id: '7',
      title: 'Canon EOS R5 Camera',
      description: 'Professional mirrorless camera with 45MP sensor, 4K video recording.',
      price: 'KES 180,000',
      location: 'Nairobi, Kenya',
      category: 'Electronics',
      status: 'expired',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-05',
      views: 156
    },
    {
      id: '8',
      title: 'BMW X5 2019',
      description: 'Luxury SUV with premium interior, low mileage, full service history.',
      price: 'KES 4,500,000',
      location: 'Mombasa, Kenya',
      category: 'Vehicles',
      status: 'expired',
      images: ['https://via.placeholder.com/300x200'],
      createdAt: '2024-01-03',
      views: 203
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All', count: listings.length },
    { id: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
    { id: 'pending', label: 'Pending', count: listings.filter(l => l.status === 'pending').length },
    { id: 'under-review', label: 'Under Review', count: listings.filter(l => l.status === 'under-review').length },
    { id: 'rejected', label: 'Rejected', count: listings.filter(l => l.status === 'rejected').length },
    { id: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length },
    { id: 'draft', label: 'Draft', count: listings.filter(l => l.status === 'draft').length },
    { id: 'expired', label: 'Expired', count: listings.filter(l => l.status === 'expired').length },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleCreateListing = () => {
    router.push('/(screens)/post-ad/step1');
  };

  const handleEditListing = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    router.push({
      pathname: '/(screens)/(dashboard)/edit-listing',
      params: {
        listingId: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        category: listing.category,
        status: listing.status
      }
    });
  };

  const handleDeleteListing = (listingId: string) => {
    showAlert({
      title: 'Delete Listing',
      message: 'Are you sure you want to delete this listing? This action cannot be undone.',
      buttonText: 'Delete',
      icon: 'trash-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: () => {
        success('Success', 'Listing deleted successfully');
      }
    });
  };

  const handleMarkAsSold = (listingId: string) => {
    showAlert({
      title: 'Mark as Sold',
      message: 'This listing will be marked as sold and moved to your sold listings.',
      buttonText: 'Mark as Sold',
      icon: 'checkmark-circle-outline',
      iconColor: '#4CAF50',
      buttonColor: '#4CAF50',
      onPress: () => {
        success('Success', 'Listing marked as sold');
      }
    });
  };

  const handleRequestReReview = (listingId: string) => {
    showAlert({
      title: 'Request Re-review',
      message: 'Your listing will be submitted for re-review. Please ensure all issues have been addressed.',
      buttonText: 'Submit',
      icon: 'refresh-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Re-review request submitted');
      }
    });
  };

  const handleRenewListing = (listingId: string) => {
    showAlert({
      title: 'Renew Listing',
      message: 'Your listing will be renewed and made active again. This will extend the listing duration.',
      buttonText: 'Renew Now',
      icon: 'refresh-circle-outline',
      iconColor: '#4CAF50',
      buttonColor: '#4CAF50',
      onPress: () => {
        success('Success', 'Listing renewed successfully');
      }
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'under-review': return '#2196F3';
      case 'rejected': return '#F44336';
      case 'sold': return '#9C27B0';
      case 'draft': return '#6B7280';
      case 'expired': return '#FF5722';
      default: return Colors.grey;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'under-review': return 'search-outline';
      case 'rejected': return 'close-circle';
      case 'sold': return 'trophy-outline';
      case 'draft': return 'document-text-outline';
      case 'expired': return 'time-outline';
      default: return 'help-circle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'under-review': return 'Under Review';
      case 'rejected': return 'Rejected';
      case 'sold': return 'Sold';
      case 'draft': return 'Draft';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesFilter = selectedFilter === 'all' || listing.status === selectedFilter;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
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
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return null;

    return (
      <View style={styles.contextMenu}>
        {listing.status !== 'sold' && (
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              handleEditListing(listingId);
              setShowContextMenu(null);
            }}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={styles.contextMenuText}>Edit</Text>
          </TouchableOpacity>
        )}

        {listing.status === 'active' && (
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              handleMarkAsSold(listingId);
              setShowContextMenu(null);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={[styles.contextMenuText, { color: '#4CAF50' }]}>Mark as Sold</Text>
          </TouchableOpacity>
        )}

        {listing.status === 'rejected' && (
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              handleRequestReReview(listingId);
              setShowContextMenu(null);
            }}
          >
            <Ionicons name="refresh-outline" size={20} color="#FF9800" />
            <Text style={[styles.contextMenuText, { color: '#FF9800' }]}>Request Re-review</Text>
          </TouchableOpacity>
        )}

        {listing.status === 'expired' && (
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              handleRenewListing(listingId);
              setShowContextMenu(null);
            }}
          >
            <Ionicons name="refresh-circle-outline" size={20} color="#4CAF50" />
            <Text style={[styles.contextMenuText, { color: '#4CAF50' }]}>Renew Listing</Text>
          </TouchableOpacity>
        )}

        {listing.status !== 'sold' && (
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              handleDeleteListing(listingId);
              setShowContextMenu(null);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
            <Text style={[styles.contextMenuText, { color: '#F44336' }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - 48) / 2; // Account for padding and gap

  const renderListing = ({ item: listing }: { item: Listing }) => (
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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(listing.status)} 
              size={10} 
              color={getStatusColor(listing.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(listing.status), fontSize: 9 }]}>
              {getStatusLabel(listing.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.listingLocation} numberOfLines={1}>
          {listing.location}
        </Text>
        <View style={styles.listingStats}>
          <Ionicons name="eye-outline" size={12} color={Colors.grey} />
          <Text style={styles.statsText}>{listing.views}</Text>
          <Text style={styles.statsSeparator}>•</Text>
          <Text style={styles.statsText}>{listing.category}</Text>
        </View>
      </View>

      {listing.rejectionReason && (
        <View style={styles.rejectionReason}>
          <Ionicons name="warning-outline" size={12} color="#F44336" />
          <Text style={styles.rejectionText} numberOfLines={2}>
            {listing.rejectionReason}
          </Text>
        </View>
      )}

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
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateListing}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your listings..."
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

        {/* Listings Grid */}
        <TouchableOpacity 
          style={styles.listingsSection}
          activeOpacity={1}
          onPress={() => setShowContextMenu(null)}
        >
          {filteredListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color={Colors.grey} />
              <Text style={styles.emptyTitle}>No Listings Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'No listings match your current filter'}
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleCreateListing}>
                <Text style={styles.emptyButtonText}>Create Your First Listing</Text>
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
  createButton: {
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
  listingLocation: {
    fontSize: 11,
    color: Colors.grey,
    marginBottom: 8,
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
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: 8,
    margin: 12,
    borderRadius: 6,
  },
  rejectionText: {
    fontSize: 10,
    color: '#F44336',
    marginLeft: 6,
    flex: 1,
    lineHeight: 14,
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
    minWidth: 140,
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

export default MyListings;
