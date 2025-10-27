import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Profile = () => {
  const router = useRouter();
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

  // Mock data for listings and stores
  const mockListings = [
    { id: '1', title: 'iPhone 14 Pro', price: 'Kes 120,000', image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop' },
    { id: '2', title: 'MacBook Air M2', price: 'Kes 150,000', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop' },
    { id: '3', title: 'Samsung Galaxy S23', price: 'Kes 95,000', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop' },
    { id: '4', title: 'iPad Pro 12.9"', price: 'Kes 85,000', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop' },
    { id: '5', title: 'AirPods Pro 2', price: 'Kes 25,000', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop' },
    { id: '6', title: 'Apple Watch Series 8', price: 'Kes 45,000', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300&h=300&fit=crop' },
  ];

  const mockStores = [
    { 
      id: '1', 
      name: 'Tech Gadgets Hub', 
      description: 'Latest tech accessories and gadgets for tech enthusiasts', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      category: 'Electronics',
      products: 45,
      rating: 4.8,
      followers: 1200,
      established: '2022'
    },
    { 
      id: '2', 
      name: 'Electronics Plus', 
      description: 'Premium electronics store with quality guaranteed products', 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'Electronics',
      products: 32,
      rating: 4.9,
      followers: 850,
      established: '2021'
    },
    { 
      id: '3', 
      name: 'Mobile Solutions', 
      description: 'Mobile phones, accessories and repair services', 
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      category: 'Mobile',
      products: 28,
      rating: 4.7,
      followers: 650,
      established: '2023'
    },
    { 
      id: '4', 
      name: 'Home & Office', 
      description: 'Furniture and office equipment for modern workspaces', 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
      category: 'Furniture',
      products: 18,
      rating: 4.6,
      followers: 420,
      established: '2023'
    },
    { 
      id: '5', 
      name: 'Gaming Zone', 
      description: 'Gaming consoles, accessories and gaming equipment', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
      category: 'Gaming',
      products: 22,
      rating: 4.9,
      followers: 980,
      established: '2022'
    },
  ];

  const renderListingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStoreItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.storeItem}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      <View style={styles.storeContent}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={styles.storeCategory}>
            <Text style={styles.storeCategoryText}>{item.category}</Text>
          </View>
        </View>
        <Text style={styles.storeDescription}>{item.description}</Text>
        <View style={styles.storeStats}>
          <View style={styles.storeStatItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.storeStatText}>{item.rating}</Text>
          </View>
          <View style={styles.storeStatItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.grey} />
            <Text style={styles.storeStatText}>{item.products} products</Text>
          </View>
          <View style={styles.storeStatItem}>
            <Ionicons name="people-outline" size={14} color={Colors.grey} />
            <Text style={styles.storeStatText}>{item.followers}</Text>
          </View>
        </View>
        <View style={styles.storeFooter}>
          <Text style={styles.storeEstablished}>Est. {item.established}</Text>
          <TouchableOpacity style={styles.storeFollowButton}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={styles.storeFollowText}>Follow Store</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.username}>John Doe</Text>
      </SafeAreaView>

      <View style={styles.content}>
        {/* User Information Card */}
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/80x80' }} 
              style={styles.avatar}
            />
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>20</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1.2K</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>856</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.brandName}>John&apos;s Electronics</Text>
            <Text style={styles.bio}>
              Passionate about technology and electronics. Selling quality gadgets and accessories. 
              Always looking for the latest tech trends and sharing them with the community.
            </Text>
            <TouchableOpacity style={styles.websiteLink}>
              <Ionicons name="globe-outline" size={16} color={Colors.primary} />
              <Text style={styles.websiteText}>www.johnselectronics.com</Text>
            </TouchableOpacity>
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
              <FlatList
                key="listings-grid"
                data={mockListings}
                renderItem={renderListingItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                key="stores-list"
                data={mockStores}
                renderItem={renderStoreItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.storesContainer}
                showsVerticalScrollIndicator={false}
              />
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
});

export default Profile;
