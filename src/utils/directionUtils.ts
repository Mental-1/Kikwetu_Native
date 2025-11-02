import * as Linking from 'expo-linking';
import * as Location from 'expo-location';

/**
 * Opens native map app with directions from user location to destination
 * @param destinationCoords - Destination coordinates {latitude, longitude}
 * @param destinationName - Optional destination name for better UX
 */
export async function openDirections(
  destinationCoords: { latitude: number; longitude: number },
  destinationName?: string
): Promise<void> {
  try {
    // Get user's current location
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const userLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    const startLat = userLocation.coords.latitude;
    const startLng = userLocation.coords.longitude;
    const endLat = destinationCoords.latitude;
    const endLng = destinationCoords.longitude;

    // Try different map apps in order of preference
    // Google Maps (works on both iOS and Android)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}${destinationName ? `&destination_place_id=${encodeURIComponent(destinationName)}` : ''}`;
    
    // Apple Maps (iOS)
    const appleMapsUrl = `http://maps.apple.com/?daddr=${endLat},${endLng}&saddr=${startLat},${startLng}`;

    // Try to open Google Maps first (cross-platform)
    try {
      const canOpen = await Linking.canOpenURL(googleMapsUrl);
      if (canOpen) {
        await Linking.openURL(googleMapsUrl);
        return;
      }
    } catch {
    }

    // Fallback to Apple Maps (iOS) or default map
    try {
      const canOpen = await Linking.canOpenURL(appleMapsUrl);
      if (canOpen) {
        await Linking.openURL(appleMapsUrl);
        return;
      }
    } catch {
      const genericMapsUrl = `geo:${endLat},${endLng}?q=${endLat},${endLng}${destinationName ? `(${encodeURIComponent(destinationName)})` : ''}`;
      await Linking.openURL(genericMapsUrl);
    }
  } catch (error) {
    console.error('Error opening directions:', error);
    throw new Error('Unable to open directions. Please check your location permissions and try again.');
  }
}

/**
 * Opens native map app without getting user location (just shows destination)
 * @param destinationCoords - Destination coordinates {latitude, longitude}
 * @param destinationName - Optional destination name
 */
export async function openMap(
  destinationCoords: { latitude: number; longitude: number },
  destinationName?: string
): Promise<void> {
  try {
    const { latitude, longitude } = destinationCoords;

    // Google Maps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}${destinationName ? `&query_place_id=${encodeURIComponent(destinationName)}` : ''}`;
    
    // Apple Maps
    const appleMapsUrl = `http://maps.apple.com/?q=${latitude},${longitude}${destinationName ? `&name=${encodeURIComponent(destinationName)}` : ''}`;

    // Try Google Maps first
    try {
      const canOpen = await Linking.canOpenURL(googleMapsUrl);
      if (canOpen) {
        await Linking.openURL(googleMapsUrl);
        return;
      }
    } catch {
      // Fall through
    }

    // Try Apple Maps
    try {
      const canOpen = await Linking.canOpenURL(appleMapsUrl);
      if (canOpen) {
        await Linking.openURL(appleMapsUrl);
        return;
      }
    } catch {
      // Generic geo URL
      const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}${destinationName ? `(${encodeURIComponent(destinationName)})` : ''}`;
      await Linking.openURL(geoUrl);
    }
  } catch (error) {
    console.error('Error opening map:', error);
    throw new Error('Unable to open map application.');
  }
}

