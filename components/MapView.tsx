import { Colors } from "@/src/constants/constant";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";

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

const MapViewComponent: React.FC<MapViewComponentProps> = React.memo(({
  markers = [],
  initialRegion,
  onMarkerPress,
  onRegionChange,
  showUserLocation = true,
  style,
}) => {
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
  );

  const [, setUserLocation] = useState<
    {
      latitude: number;
      longitude: number;
    } | null
  >(null);

  const [, setLocationPermissionGranted] = useState(false);
  const hasRequestedLocation = useRef(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!showUserLocation || hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (isCancelled) return;

        if (status !== "granted") {
          console.log("Location permission denied");
          if (!isCancelled) setLocationPermissionGranted(false);
          return;
        }

        if (!isCancelled) setLocationPermissionGranted(true);

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isCancelled) return;

        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(userCoords);

        if (!initialRegion) {
          setRegion({
            ...userCoords,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error getting location:", error);
          setLocationPermissionGranted(false);
        }
      }
    };

    getCurrentLocation();

    return () => {
      isCancelled = true;
    };
  }, [showUserLocation, initialRegion]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
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
      >
        {markers.length > 0 && markers.map((marker) => (
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
});

MapViewComponent.displayName = "MapViewComponent";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapViewComponent;
