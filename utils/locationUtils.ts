import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<LocationPermission> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status,
    };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied' as Location.PermissionStatus,
    };
  }
};

/**
 * Get current user location
 */
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    const permission = await requestLocationPermission();
    
    if (!permission.granted) {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Get address from coordinates (reverse geocoding)
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addresses.length > 0) {
      const address = addresses[0];
      return `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.country || ''}`.trim();
    }

    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

/**
 * Get coordinates from address (geocoding)
 */
export const getCoordinatesFromAddress = async (
  address: string
): Promise<LocationData | null> => {
  try {
    const locations = await Location.geocodeAsync(address);

    if (locations.length > 0) {
      const location = locations[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
};

/**
 * Get location with full address details
 */
export const getLocationWithAddress = async (): Promise<LocationData | null> => {
  try {
    const location = await getCurrentLocation();
    if (!location) return null;

    const address = await getAddressFromCoordinates(location.latitude, location.longitude);
    
    return {
      ...location,
      address: address || undefined,
    };
  } catch (error) {
    console.error('Error getting location with address:', error);
    return null;
  }
};
