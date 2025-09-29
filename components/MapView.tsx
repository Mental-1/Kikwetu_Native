import { Colors } from '@/src/constants/constant';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';


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

  const getCurrentLocation = useCallback(async () => {
    if (!showUserLocation) {
      return;
    }
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show your location on the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      
      // Center map on user location if no initial region provided
      if (!initialRegion) {
        setRegion({
          ...userCoords,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, [showUserLocation, initialRegion]);

  useEffect(() => {
    if (!showUserLocation) {
      return;
    }
    getCurrentLocation();
  }, [showUserLocation, getCurrentLocation]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        mapType="standard"
        loadingEnabled={false}
        moveOnMarkerPress={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        maxZoomLevel={18}
        minZoomLevel={3}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        cacheEnabled={true}
        followsUserLocation={false}
        userLocationAnnotationTitle=""
        userLocationCalloutEnabled={false}
      >
        {/* User Location Marker */}
        {userLocation && showUserLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor={Colors.primary}
          />
        )}

        {/* Custom Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress?.(marker)}
          />
        ))}
      </MapView>
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
