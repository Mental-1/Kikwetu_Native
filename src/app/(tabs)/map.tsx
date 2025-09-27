import MapViewComponent from '@/components/MapView';
import { Colors } from '@/src/constants/constant';
import { getLocationWithAddress, LocationData } from '@/utils/locationUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapScreen = () => {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock listings with coordinates for demonstration
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

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      setLoading(true);
      const location = await getLocationWithAddress();
      setUserLocation(location);
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert('Error', 'Could not load your location');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (marker: any) => {
    Alert.alert(
      marker.title,
      `${marker.description}\n${marker.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => router.push(`/(screens)/listings/${marker.id}`) },
      ]
    );
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          markers={mockListings.map(listing => ({
            id: listing.id,
            coordinate: listing.coordinate,
            title: listing.title,
            description: `${listing.description} • ${listing.price}`,
          }))}
          onMarkerPress={handleMarkerPress}
          showUserLocation={true}
          style={styles.map}
        />
      </View>

      {/* Floating Header */}
      <SafeAreaView style={styles.floatingHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Map View</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUserLocation}>
            <Ionicons name="refresh" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>


      {/* Listings Count Button */}
      <TouchableOpacity style={styles.listingsButton}>
        <Ionicons name="list" size={14} color={Colors.white} />
        <Text style={styles.listingsButtonText}>
          {mockListings.length}
        </Text>
      </TouchableOpacity>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={loadUserLocation}>
          <Ionicons name="locate" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
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
    backdropFilter: 'blur(10px)',
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
  locationInfo: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  locationText: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
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
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MapScreen;