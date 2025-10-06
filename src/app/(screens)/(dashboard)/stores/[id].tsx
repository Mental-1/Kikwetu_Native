import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Store {
  id: string;
  name: string;
  description: string;
  banner_url: string | null;
  profile_url: string | null;
  category: string | null;
  is_active: boolean;
  total_products: number;
  follower_count: number;
  total_sales: number;
  is_verified: boolean;
  social_links: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

interface Listing {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  condition: string;
  location: string;
  created_at: string;
}

const StoreDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading] = useState(false);

  // Mock store data
  const store: Store = {
    id: id || '1',
    name: 'Tech Haven',
    description: 'Your one-stop shop for latest tech gadgets and accessories. We specialize in premium electronics, gaming equipment, and smart home devices. With over 5 years of experience, we ensure quality and customer satisfaction.',
    banner_url: 'https://via.placeholder.com/800x300',
    profile_url: 'https://via.placeholder.com/100',
    category: 'Electronics',
    is_active: true,
    total_products: 24,
    follower_count: 156,
    total_sales: 89,
    is_verified: true,
    social_links: {
      website: 'https://techhaven.com',
      instagram: '@techhaven',
      facebook: 'TechHaven',
      twitter: '@techhaven',
    },
  };

  // Mock listings data
  const listings: Listing[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro Max 256GB',
      price: 120000,
      image_url: 'https://via.placeholder.com/300x200',
      condition: 'New',
      location: 'Nairobi',
      created_at: '2024-01-15',
    },
    {
      id: '2',
      title: 'MacBook Air M2 512GB',
      price: 180000,
      image_url: 'https://via.placeholder.com/300x200',
      condition: 'New',
      location: 'Nairobi',
      created_at: '2024-01-14',
    },
    {
      id: '3',
      title: 'Samsung Galaxy S23 Ultra',
      price: 95000,
      image_url: 'https://via.placeholder.com/300x200',
      condition: 'Like New',
      location: 'Nairobi',
      created_at: '2024-01-13',
    },
    {
      id: '4',
      title: 'iPad Pro 12.9" M2',
      price: 150000,
      image_url: 'https://via.placeholder.com/300x200',
      condition: 'New',
      location: 'Nairobi',
      created_at: '2024-01-12',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleEditStore = () => {
    router.push(`/(screens)/(dashboard)/stores/store-edit?id=${id}`);
  };

  const handleListingPress = (listingId: string) => {
    // Navigate to listing details
    console.log('Navigate to listing:', listingId);
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => handleListingPress(item.id)}
    >
      <Image source={{ uri: item.image_url || '' }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingPrice}>
          KES {item.price.toLocaleString()}
        </Text>
        <Text style={styles.listingCondition}>{item.condition}</Text>
        <Text style={styles.listingLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSocialLink = (platform: string, value: string | undefined, icon: string) => {
    if (!value) return null;
    
    return (
      <TouchableOpacity style={styles.socialLink}>
        <Ionicons name={icon as any} size={16} color={Colors.primary} />
        <Text style={styles.socialText}>{value}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Store Details</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditStore}>
            <Ionicons name="create-outline" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          {store.banner_url ? (
            <Image source={{ uri: store.banner_url }} style={styles.banner} resizeMode="cover" />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <Ionicons name="storefront-outline" size={64} color={Colors.grey} />
            </View>
          )}
          
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {store.profile_url ? (
              <Image source={{ uri: store.profile_url }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="storefront" size={24} color={Colors.white} />
              </View>
            )}
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfoContainer}>
          <View style={styles.storeHeader}>
            <View style={styles.storeTitleContainer}>
              <Text style={styles.storeName}>{store.name}</Text>
              {store.is_verified && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </View>
            <View style={[styles.statusBadge, store.is_active ? styles.activeStatus : styles.inactiveStatus]}>
              <View style={[styles.statusDot, store.is_active ? styles.activeDot : styles.inactiveDot]} />
              <Text style={[styles.statusText, store.is_active ? styles.activeText : styles.inactiveText]}>
                {store.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          <Text style={styles.storeDescription}>{store.description}</Text>

          {/* Social Links */}
          <View style={styles.socialLinksContainer}>
            {renderSocialLink('website', store.social_links.website, 'globe-outline')}
            {renderSocialLink('instagram', store.social_links.instagram, 'logo-instagram')}
            {renderSocialLink('facebook', store.social_links.facebook, 'logo-facebook')}
            {renderSocialLink('twitter', store.social_links.twitter, 'logo-twitter')}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color={Colors.primary} />
              <Text style={styles.statNumber}>{store.follower_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cube" size={20} color={Colors.primary} />
              <Text style={styles.statNumber}>{store.total_products}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cart" size={20} color={Colors.primary} />
              <Text style={styles.statNumber}>{store.total_sales}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
          </View>

          {/* Category Card */}
          {store.category && (
            <View style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Ionicons name="pricetag" size={16} color={Colors.primary} />
                <Text style={styles.categoryLabel}>Category</Text>
              </View>
              <Text style={styles.categoryValue}>{store.category}</Text>
            </View>
          )}
        </View>

        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>Store Listings</Text>
            <Text style={styles.listingsCount}>({store.total_products} items)</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading listings...</Text>
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.emptyListingsContainer}>
              <Ionicons name="cube-outline" size={48} color={Colors.grey} />
              <Text style={styles.emptyListingsText}>No listings yet</Text>
              <Text style={styles.emptyListingsSubtext}>Start by adding your first product</Text>
            </View>
          ) : (
            <FlatList
              data={listings}
              renderItem={renderListingCard}
              numColumns={2}
              columnWrapperStyle={styles.listingRow}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listingsGrid}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 0.3,
    borderBottomColor: Colors.lightgrey,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: 200,
  },
  bannerPlaceholder: {
    backgroundColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    zIndex: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.white,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfoContainer: {
    padding: 16,
    paddingTop: 50,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#2E7D32',
  },
  inactiveText: {
    color: '#C62828',
  },
  storeDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 16,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  socialText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
  },
  categoryValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  listingsSection: {
    padding: 16,
  },
  listingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  listingsCount: {
    fontSize: 14,
    color: Colors.grey,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.grey,
  },
  emptyListingsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyListingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 12,
  },
  emptyListingsSubtext: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
  },
  listingsGrid: {
    paddingBottom: 20,
  },
  listingRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '48%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listingImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  listingInfo: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  listingCondition: {
    fontSize: 12,
    color: Colors.grey,
    marginBottom: 2,
  },
  listingLocation: {
    fontSize: 12,
    color: Colors.grey,
  },
});

export default StoreDetails;