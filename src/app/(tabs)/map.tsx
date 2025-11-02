import MapViewComponent from '@/components/MapView';
import { Colors } from '@/src/constants/constant';
import { getLocationWithAddress, LocationData } from '@/utils/locationUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>Loading map...</Text>
  </View>
);

// Stable mockListings outside component to prevent recreation
const mockListings = [
  {
    id: '1',
    title: 'iPhone 14 Pro',
    price: 'Kes 120,000',
    coordinate: {
      latitude: -1.2921,
      longitude: 36.8219,
    },
    description: 'Like new iPhone 14 Pro',
    category: 'Electronics',
  },
  {
    id: '2',
    title: 'MacBook Air M2',
    price: 'Kes 150,000',
    coordinate: {
      latitude: -1.3000,
      longitude: 36.8300,
    },
    description: 'Brand new MacBook Air',
    category: 'Electronics',
  },
  {
    id: '3',
    title: 'Samsung Galaxy S23',
    price: 'Kes 95,000',
    coordinate: {
      latitude: -1.2800,
      longitude: 36.8100,
    },
    description: 'Latest Samsung Galaxy',
    category: 'Mobile',
  },
  {
    id: '4',
    title: 'Gaming Chair',
    price: 'Kes 25,000',
    coordinate: {
      latitude: -1.2850,
      longitude: 36.8150,
    },
    description: 'Ergonomic gaming chair',
    category: 'Furniture',
  },
  {
    id: '5',
    title: 'PlayStation 5',
    price: 'Kes 80,000',
    coordinate: {
      latitude: -1.2750,
      longitude: 36.8250,
    },
    description: 'PS5 Console with games',
    category: 'Gaming',
  },
];

const MapScreenContent = () => {
  const router = useRouter();
  const [, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedInitialLocation = useRef(false);

  const loadUserLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const location = await getLocationWithAddress();
      setUserLocation(location);
    } catch (error) {
      console.error('Error loading location:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not load your location';
      setError(errorMessage);
      console.log('Location load failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedInitialLocation.current) {
      hasLoadedInitialLocation.current = true;
      loadUserLocation();
    }
  }, [loadUserLocation]);

  const handleMarkerPress = useCallback((marker: any) => {
    Alert.alert(
      marker.title,
      `${marker.description}\n${marker.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Details', 
          onPress: () => {
            try {
              router.push(`/(screens)/listings/${marker.id}` as any);
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Could not navigate to listing details');
            }
          }
        },
      ]
    );
  }, [router]);

  const handleBackPress = useCallback(() => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [router]);

  const handleRefresh = useCallback(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  // Memoize markers array to prevent recreation on every render
  const markers = useMemo(() => 
    mockListings.map(listing => ({
      id: listing.id,
      coordinate: listing.coordinate,
      title: listing.title,
      description: `${listing.description} • ${listing.price}`,
    })),
    [] // mockListings is stable, so empty deps
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          markers={markers}
          onMarkerPress={handleMarkerPress}
          showUserLocation={true}
          style={styles.map}
        />
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']} pointerEvents="box-none">
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Map View</Text>
          <TouchableOpacity 
            style={[styles.refreshButton, loading && styles.refreshButtonDisabled]} 
            onPress={handleRefresh}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color={loading ? Colors.grey : Colors.white} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color={Colors.white} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Listings Count Button */}
      <TouchableOpacity 
        style={styles.listingsButton}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={14} color={Colors.white} />
        <Text style={styles.listingsButtonText}>
          {mockListings.length} {mockListings.length === 1 ? 'listing' : 'listings'}
        </Text>
      </TouchableOpacity>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleRefresh}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="locate" 
            size={20} 
            color={loading ? Colors.grey : Colors.primary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlButton}
          activeOpacity={0.7}
        >
          <Ionicons name="layers" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.white,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
  },
  errorText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  listingsButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  listingsButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mapControls: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

const MapScreen = () => (
  <Suspense fallback={<MapLoading />}>
    <MapScreenContent />
  </Suspense>
);

export default MapScreen;