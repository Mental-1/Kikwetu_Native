import ContextMenu, { ContextMenuItem } from '@/components/ui/ContextMenu';
import { Colors } from '@/src/constants/constant';
import { useDeleteStore, useStores, useToggleStoreStatus } from '@/src/hooks/useStores';
import { Store } from '@/src/services/storesService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const StoresScreen = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRefs = useRef<{ [key: string]: any }>({});

  // API hooks
  const { data: storesResponse, isLoading: loading, error } = useStores();
  const deleteStoreMutation = useDeleteStore();
  const toggleStatusMutation = useToggleStoreStatus();

  const stores = storesResponse || [];

  const handleBack = () => {
    router.back();
  };

  const handleCreateStore = () => {
    router.push('/(screens)/(dashboard)/stores/store-create');
  };

  const showMenu = (storeId: string) => {
    const ref = menuButtonRefs.current[storeId];
    if (ref) {
      ref.measure((_x: any, _y: any, width: any, height: any, pageX: any, pageY: any) => {
        setMenuPosition({ 
          x: pageX - 200 + width,
          y: pageY + height 
        });
        setMenuVisible(storeId);
      });
    }
  };

  const hideMenu = () => {
    setMenuVisible(null);
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/(screens)/(dashboard)/stores/[id]?id=${storeId}`);
  };

  const handleMenuItemPress = async (storeId: string, item: ContextMenuItem) => {
    hideMenu();
    
    switch (item.id) {
      case 'view':
        router.push(`/(screens)/(dashboard)/stores/[id]?id=${storeId}`);
        break;
      case 'edit':
        router.push(`/(screens)/(dashboard)/stores/store-edit?id=${storeId}`);
        break;
      case 'deactivate':
        try {
          await toggleStatusMutation.mutateAsync(storeId);
          Alert.alert('Success', 'Store status updated successfully');
        } catch {
          Alert.alert('Error', 'Failed to update store status');
        }
        break;
      case 'delete':
        Alert.alert(
          'Delete Store',
          'Are you sure you want to delete this store? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteStoreMutation.mutateAsync(storeId);
                  Alert.alert('Success', 'Store deleted successfully');
                } catch {
                  Alert.alert('Error', 'Failed to delete store');
                }
              },
            },
          ]
        );
        break;
    }
  };

  const getMenuItems = (store: Store): ContextMenuItem[] => [
    {
      id: 'view',
      title: 'View Store',
      icon: 'eye-outline',
    },
    {
      id: 'edit',
      title: 'Edit Store',
      icon: 'create-outline',
    },
    {
      id: 'deactivate',
      title: store.is_active ? 'Deactivate' : 'Activate',
      icon: 'pause-circle-outline',
      color: '#FF9800',
    },
    {
      id: 'delete',
      title: 'Delete Store',
      icon: 'trash-outline',
      destructive: true,
    },
  ];

  const renderStoreCard = (store: Store) => (
    <TouchableOpacity key={store.id} style={styles.storeCard} onPress={() => handleStorePress(store.id)}>
      {store.banner_url ? (
        <Image source={{ uri: store.banner_url }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, styles.bannerPlaceholder]}>
          <Ionicons name="storefront-outline" size={48} color={Colors.grey} />
        </View>
      )}

      <View style={styles.profileImageContainer}>
        {store.profile_url ? (
          <Image source={{ uri: store.profile_url }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="storefront" size={24} color={Colors.white} />
          </View>
        )}
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <View style={styles.storeTitleContainer}>
            <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
            {store.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            )}
          </View>
          
          <TouchableOpacity 
            ref={(ref) => { menuButtonRefs.current[store.id] = ref; }}
            onPress={() => showMenu(store.id)} 
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <Text style={styles.storeDescription} numberOfLines={2}>
          {store.description}
        </Text>

        {store.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{store.category}</Text>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={16} color={Colors.grey} />
            <Text style={styles.statText}>{store.total_products} Products</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={16} color={Colors.grey} />
            <Text style={styles.statText}>{store.follower_count} Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={16} color={Colors.grey} />
            <Text style={styles.statText}>{store.total_sales} Sales</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, store.is_active ? styles.activeStatus : styles.inactiveStatus]}>
          <View style={[styles.statusDot, store.is_active ? styles.activeDot : styles.inactiveDot]} />
          <Text style={[styles.statusText, store.is_active ? styles.activeText : styles.inactiveText]}>
            {store.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Stores</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateStore}>
            <Ionicons name="add" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your stores...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.grey} />
            <Text style={styles.errorTitle}>Failed to Load Stores</Text>
            <Text style={styles.errorText}>
              {error?.message || 'Something went wrong while loading your stores'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/(screens)/(dashboard)/stores')}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="storefront-outline" size={64} color={Colors.grey} />
            </View>
            <Text style={styles.emptyTitle}>No Stores Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first store to start selling and reach more customers
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateStore}>
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.createButtonText}>Create Your First Store</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.storesContainer}>
            {stores.map(renderStoreCard)}
          </View>
        )}
      </ScrollView>

      {menuVisible && (
        <ContextMenu
          visible={true}
          items={getMenuItems(stores.find((s: Store) => s.id === menuVisible)!)}
          onItemPress={(item) => handleMenuItemPress(menuVisible, item)}
          onClose={hideMenu}
          position={menuPosition}
        />
      )}
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.grey,
  },
  errorContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  storesContainer: {
    padding: 16,
    gap: 16,
  },
  storeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  banner: {
    width: '100%',
    height: 140,
  },
  bannerPlaceholder: {
    backgroundColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'absolute',
    top: 90,
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
  storeInfo: {
    padding: 16,
    paddingTop: 50,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.grey,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
});

export default StoresScreen;

