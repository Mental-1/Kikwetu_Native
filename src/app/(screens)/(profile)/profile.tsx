import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Colors } from '@/src/constants/constant';
import { Spacing } from '@/constants/theme';
import { useProfileById } from '@/src/hooks/useProfile';
import CustomLoader from '@/components/ui/CustomLoader';

interface ListingItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  location: string;
  images: string[];
  description?: string;
  views?: number;
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  profile_url: string;
  category: string;
  total_products: number;
  average_rating: number;
  follower_count: number;
  created_at: string;
}

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onNavigateToConversations: () => void;
  onNavigateToListing: (listingId: string) => void;
  onNavigateToStore: (storeId: string) => void;
  userListings?: { pages: Array<{ data: ListingItem[] }> };
  userStores?: StoreItem[];
  listingsLoading?: boolean;
  storesLoading?: boolean;
  listingsError?: Error | null;
  storesError?: Error | null;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onNavigateToConversations,
  onNavigateToListing,
  onNavigateToStore,
  userListings,
  userStores,
  listingsLoading = false,
  storesLoading = false,
  listingsError = null,
  storesError = null,
}) => {
  const { data: profile, isLoading, error } = useProfileById(userId);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'stores'>('listings');

  const handleFollow = useCallback(() => {
    setIsFollowing(prev => !prev);
  }, []);

  const flattenedListings = useMemo(() => {
    if (!userListings?.pages) return [];
    return userListings.pages.flatMap(page => page.data);
  }, [userListings]);

  const renderListingItem: ListRenderItem<ListingItem> = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={() => onNavigateToListing(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }}
        style={styles.listingImage}
        contentFit="cover"
      />
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <Text style={styles.listingPrice}>
          KES {item.price?.toLocaleString() || '0'}
        </Text>
        <Text style={styles.listingLocation} numberOfLines={1}>
          {item.location || 'Location not specified'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [onNavigateToListing]);

  const renderStoreItem: ListRenderItem<StoreItem> = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.storeCard}
      onPress={() => onNavigateToStore(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.profile_url || 'https://via.placeholder.com/200' }}
        style={styles.storeImage}
        contentFit="cover"
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.storeCategory}>{item.category}</Text>
        <View style={styles.storeStats}>
          <Text style={styles.storeStat}>{item.total_products} products</Text>
          <Text style={styles.storeStat}>{item.follower_count} followers</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [onNavigateToStore]);

  const listingKeyExtractor = useCallback((item: ListingItem) => item.id, []);
  const storeKeyExtractor = useCallback((item: StoreItem) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.grey} />
        <Text style={styles.errorText}>
          {error?.message || 'Profile not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderListingsContent = () => {
    if (listingsLoading) {
      return <CustomLoader />;
    }

    if (listingsError) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="alert-circle" size={48} color={Colors.grey} />
          <Text style={styles.emptyStateText}>Error loading listings.</Text>
        </View>
      );
    }

    if (flattenedListings.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="package" size={48} color={Colors.grey} />
          <Text style={styles.emptyStateText}>No listings found.</Text>
        </View>
      );
    }

    return (
      <FlashList
        data={flattenedListings}
        renderItem={renderListingItem}
        keyExtractor={listingKeyExtractor}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderStoresContent = () => {
    if (storesLoading) {
      return <CustomLoader />;
    }

    if (storesError) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="alert-circle" size={48} color={Colors.grey} />
          <Text style={styles.emptyStateText}>Error loading stores.</Text>
        </View>
      );
    }

    if (!userStores || userStores.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="shopping-bag" size={48} color={Colors.grey} />
          <Text style={styles.emptyStateText}>No stores found.</Text>
        </View>
      );
    }

    return (
      <FlashList
        data={userStores}
        renderItem={renderStoreItem}
        keyExtractor={storeKeyExtractor}
        contentContainerStyle={styles.storesContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.username}>
          {profile.username || profile.full_name || 'Profile'}
        </Text>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <Image 
              source={{ uri: profile.avatar_url || 'https://via.placeholder.com/80x80' }} 
              style={styles.avatar}
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.listing_count || 0}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.brandName}>
              {profile.full_name || profile.username || 'User'}
            </Text>
            <Text style={styles.bio}>
              {profile.bio || 'No bio available.'}
            </Text>
            {profile.website ? (
              <TouchableOpacity style={styles.websiteLink}>
                <Feather name="globe" size={16} color={Colors.primary} />
                <Text style={styles.websiteText}>{profile.website}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.followButton,
                isFollowing ? styles.followingButton : styles.followButtonStyle
              ]}
              onPress={handleFollow}
            >
              <Feather 
                name={isFollowing ? "check" : "user-plus"} 
                size={16} 
                color={isFollowing ? Colors.white : Colors.primary} 
              />
              <Text style={[
                styles.followButtonText,
                isFollowing ? styles.followingButtonText : styles.followButtonTextStyle
              ]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.messageButton} 
              onPress={onNavigateToConversations}
            >
              <Feather name="message-circle" size={16} color={Colors.white} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'listings' && styles.activeTab]}
              onPress={() => setActiveTab('listings')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'listings' && styles.activeTabText
              ]}>
                Listings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'stores' && styles.activeTab]}
              onPress={() => setActiveTab('stores')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'stores' && styles.activeTabText
              ]}>
                Stores
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'listings' ? renderListingsContent() : renderStoresContent()}
          </View>
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  backButton: {
    padding: 4,
    marginRight: Spacing.md,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.grey,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: 12,
    padding: Spacing.xl,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.lg,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 2,
  },
  userInfo: {
    marginBottom: Spacing.xl,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  bio: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  websiteText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    gap: 6,
  },
  followButtonStyle: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followingButton: {
    backgroundColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followButtonTextStyle: {
    color: Colors.primary,
  },
  followingButtonText: {
    color: Colors.white,
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    gap: 6,
  },
  messageButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 12,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    minHeight: 200,
  },
  gridContainer: {
    padding: Spacing.sm,
  },
  storesContainer: {
    padding: Spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.grey,
  },
  listingCard: {
    flex: 1,
    margin: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 120,
  },
  listingInfo: {
    padding: Spacing.sm,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.black,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  listingLocation: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 2,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  storeImage: {
    width: 80,
    height: 80,
  },
  storeInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  storeCategory: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 2,
  },
  storeStats: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  storeStat: {
    fontSize: 12,
    color: Colors.grey,
  },
});

export default UserProfileScreen;
