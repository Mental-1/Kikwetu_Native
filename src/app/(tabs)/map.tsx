import MapViewComponent from '@/components/MapView';
import ListingCard from '@/components/ListingCard';
import { Colors } from '@/src/constants/constant';
import { getLocationWithAddress, LocationData } from '@/utils/locationUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  PermissionsAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetFlashList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

const { height: INITIAL_SCREEN_HEIGHT } = Dimensions.get('window');

interface MockListing {
  id: string;
  title: string;
  price: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  description: string;
  category: string;
}

// Stable mockListings outside component to prevent recreation
const mockListings: MockListing[] = [
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

// Simple Error Boundary for the component
class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MapScreen error:', error, errorInfo);
    // Optional: Send to Sentry/Crashlytics
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color={Colors.primary} />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>Please try reloading the app.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Loading fallback component
const MapLoading = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>Loading map...</Text>
  </View>
);

const MapScreenContent = () => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedInitialLocation = useRef(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [dimensions, setDimensions] = useState({ width: INITIAL_SCREEN_HEIGHT, height: INITIAL_SCREEN_HEIGHT });
  const [itemHeight, setItemHeight] = useState(150);

  const snapPoints = useMemo(() => ['25%', dimensions.height - 80], [dimensions.height]);

  const [currentLocationText, setCurrentLocationText] = useState('Loading location...');

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (userLocation?.city && userLocation?.country) {
      setCurrentLocationText(`${userLocation.city}, ${userLocation.country}`);
    } else if (userLocation?.city) {
      setCurrentLocationText(userLocation.city);
    } else {
      setCurrentLocationText('Unknown location');
    }
  }, [userLocation]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to location to show nearby listings.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }, []);

  const loadUserLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }
      const location = await getLocationWithAddress();
      setUserLocation(location);
    } catch (err) {
      console.error('Error loading location:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not load your location';
      setError(errorMessage);
      setCurrentLocationText('Location unavailable');
      Alert.alert('Location Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  }, [requestLocationPermission]);

  useEffect(() => {
    if (!hasLoadedInitialLocation.current) {
      hasLoadedInitialLocation.current = true;
      loadUserLocation();
    }
  }, [loadUserLocation]);

  const handleMarkerPress = useCallback((marker: { id: string; title: string }) => {
    if (!marker?.id) return;
    console.log('Marker pressed:', marker.title);
    router.push(`/listings/${marker.id}`);
  }, [router]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleRefresh = useCallback(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      bottomSheetRef.current?.close();
    }
  }, []);

  const markers = useMemo(() => 
    mockListings.map(listing => ({
      id: listing.id,
      coordinate: listing.coordinate,
      title: listing.title,
      description: `${listing.description} • ${listing.price}`,
    })),
    []
  );

  const renderListingCard = useCallback(({ item }: { item: MockListing }) => (
    <ListingCard
      id={item.id}
      title={item.title}
      price={item.price}
      condition="Used"
      location="Nairobi"
      image="https://via.placeholder.com/150"
      description={item.description}
      views={100}
      viewMode="list"
      onPress={(listingId: string) => {
        bottomSheetRef.current?.close();
        router.push(`/listings/${listingId}`);
      }}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        if (Math.abs(height - itemHeight) > 10) {
          setItemHeight(height);
        }
      }}
    />
  ), [itemHeight, router]);

  return (
    <MapErrorBoundary>
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
              style={[styles.backButton, { backgroundColor: 'rgba(255, 255, 255, 0.7)' }]} 
              onPress={handleBackPress}
              activeOpacity={0.7}
              accessibilityLabel="Go back to previous screen"
              accessibilityRole="button"
              accessibilityHint="Navigates back"
            >
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: 'rgba(255, 255, 255, 0.7)' }, loading && styles.refreshButtonDisabled]} 
              onPress={handleRefresh}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityLabel={loading ? "Refreshing location" : "Refresh current location"}
              accessibilityRole="button"
              accessibilityState={{ busy: loading }}
            >
              <Ionicons 
                name="refresh" 
                size={24} 
                color={loading ? Colors.grey : Colors.black} 
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
          onPress={handleOpenBottomSheet}
          accessibilityLabel={`View listings in ${currentLocationText}`}
          accessibilityRole="button"
          accessibilityHint="Opens a bottom sheet with nearby listings"
        >
          <Ionicons name="list" size={14} color={Colors.white} />
          <Text style={styles.listingsButtonText}>
            Listings in: {currentLocationText}
          </Text>
        </TouchableOpacity>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleRefresh}
            disabled={loading}
            activeOpacity={0.7}
            accessibilityLabel="Center map on current location"
            accessibilityRole="button"
            accessibilityHint={loading ? "Locating..." : "Centers the map on your position"}
            accessibilityState={{ busy: loading }}
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
            accessibilityLabel="Toggle map layers"
            accessibilityRole="button"
            accessibilityHint="Switches between map views"
            onPress={() => { /* Implement layer toggle */ }}
          >
            <Ionicons name="layers" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet for Listings */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.bottomSheetHandle}
          onChange={handleSheetChange}
          enableDynamicSizing={false}
          overDragResistanceFactor={0.5}
          accessibilityViewIsModal={true}
          accessibilityLabel="Listings bottom sheet"
        >
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle} accessibilityLabel={`Listings in ${currentLocationText}`}>
              Listings in: {currentLocationText}
            </Text>
            <BottomSheetFlashList
              data={mockListings}
              keyExtractor={(item: MockListing) => item.id}
              renderItem={renderListingCard}
              estimatedItemSize={itemHeight}
              removeClippedSubviews={true}
              enableEmptySections={false}
              contentContainerStyle={styles.bottomSheetListContainer}
              accessibilityLabel="Scrollable list of nearby listings"
            />
          </View>
        </BottomSheet>
      </View>
    </MapErrorBoundary>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.black,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 12,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
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
    left: '50%',
    transform: [{ translateX: -100 }],
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
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  bottomSheetHandle: {
    backgroundColor: Colors.lightgrey,
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomSheetListContainer: {
    paddingBottom: 20,
  },
});

const MapScreen = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Suspense fallback={<MapLoading />}>
      <MapScreenContent />
    </Suspense>
  </GestureHandlerRootView>
);

export default MapScreen;