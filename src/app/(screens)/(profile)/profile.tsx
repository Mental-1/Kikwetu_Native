import ListingCard from '@/components/ListingCard';
import StoreCard from '@/components/StoreCard';
import { Colors } from '@/src/constants/constant';
import { useMyListings } from '@/src/hooks/useMyListings';
import { useProfileById } from '@/src/hooks/useProfile';
import { useStores } from '@/src/hooks/useStores';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: profile, isLoading, error } = useProfileById(id || '');
  const { data: userListings, isLoading: listingsLoading } = useMyListings({ userId: id || '' });
  const { data: userStores, isLoading: storesLoading } = useStores(id || '');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  const handleBack = () => {
    router.back();
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    router.push('/(screens)/(dashboard)/conversations');
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <ListingCard
      id={item.id}
      title={item.title || 'Untitled'}
      price={item.price ? `KES ${item.price.toLocaleString()}` : 'Price not set'}
      condition={item.condition || 'Used'}
      location={item.location || 'Location not specified'}
      image={item.images?.[0] || 'https://via.placeholder.com/200'}
      description={item.description}
      views={item.views}
      viewMode="grid"
      onPress={(listingId) => router.push(`/listings/${listingId}`)}
    />
  );

  const renderStoreItem = ({ item }: { item: any }) => (
    <StoreCard
      id={item.id}
      name={item.name}
      description={item.description}
      image={item.profile_url || 'https://via.placeholder.com/200'}
      category={item.category}
      products={item.total_products}
      rating={item.average_rating}
      followers={item.follower_count}
      established={item.created_at ? new Date(item.created_at).getFullYear().toString() : 'N/A'}
      onPress={(storeId: string) => router.push(`/stores/${storeId}`)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || 'Profile not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.username}>{profile.username || profile.full_name || 'Profile'}</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {/* User Information Card */}
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
            <Text style={styles.brandName}>{profile.full_name || profile.username || 'User'}</Text>
            <Text style={styles.bio}>
              {profile.bio || 'No bio available.'}
            </Text>
            {profile.website && (
              <TouchableOpacity style={styles.websiteLink}>
                <Ionicons name="globe-outline" size={16} color={Colors.primary} />
                <Text style={styles.websiteText}>{profile.website}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.followButton,
                isFollowing ? styles.followingButton : styles.followButtonStyle
              ]}
              onPress={handleFollow}
            >
              <Ionicons 
                name={isFollowing ? "checkmark" : "person-add"} 
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
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={16} color={Colors.white} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabbed View */}
        <View style={styles.tabContainer}>
          <View style={styles.tabHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'listings' && styles.activeTab]}
              onPress={() => setActiveTab('listings')}
            >
              <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
                Listings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'stores' && styles.activeTab]}
              onPress={() => setActiveTab('stores')}
            >
              <Text style={[styles.tabText, activeTab === 'stores' && styles.activeTabText]}>
                Stores
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'listings' ? (
              listingsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <FlatList
                  key="listings-grid"
                  data={userListings?.pages.flatMap(page => page.data) || []}
                  renderItem={renderListingItem}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.gridRow}
                  contentContainerStyle={styles.gridContainer}
                  showsVerticalScrollIndicator={false}
                />
              )
            ) : (
              storesLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <FlatList
                  key="stores-list"
                  data={userStores || []}
                  renderItem={renderStoreItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.storesContainer}
                  showsVerticalScrollIndicator={false}
                />
              )
            )}
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
    marginRight: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  userCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
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
    marginBottom: 20,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 12,
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
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    marginHorizontal: 0,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grey,
  },
  activeTabText: {
    color: Colors.primary,
  },
  tabContent: {
    flex: 1,
    minHeight: 400,
  },
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  storesContainer: {
    padding: 16,
  },
  storeItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  storeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
    marginRight: 8,
  },
  storeCategory: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  storeDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 12,
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeStatText: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeEstablished: {
    fontSize: 12,
    color: Colors.grey,
    fontStyle: 'italic',
  },
  storeFollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  storeFollowText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.grey,
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
});

export default Profile;
