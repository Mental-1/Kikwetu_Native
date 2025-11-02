import { Colors } from '@/src/constants/constant';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';

interface MapViewComponentProps {
  markers?: {
    id: string;
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
  }[];
  initialRegion?: Region;
  onMarkerPress?: (marker: any) => void;
  onRegionChange?: (region: Region) => void;
  showUserLocation?: boolean;
  style?: any;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  markers = [],
  initialRegion,
  onMarkerPress,
  onRegionChange,
  showUserLocation = true,
  style
}) => {
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const hasRequestedLocation = useRef(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Prevent multiple simultaneous location requests
    if (!showUserLocation || hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    const getCurrentLocation = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log('Location permission denied');
          setLocationPermissionGranted(false);
          return;
        }

        setLocationPermissionGranted(true);

        // Get current position with a reasonable timeout
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setUserLocation(userCoords);
        
        // Center map on user location only if no initial region was provided
        if (!initialRegion) {
          setRegion({
            ...userCoords,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationPermissionGranted(false);
      }
    };

    getCurrentLocation();
  }, [showUserLocation, initialRegion]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
  };

  const handleMarkerPress = (marker: any) => {
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="hybrid"
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={Colors.primary}
        loadingBackgroundColor={Colors.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapViewComponent;