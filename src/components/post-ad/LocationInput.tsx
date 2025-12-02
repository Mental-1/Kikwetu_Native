import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface LocationInputProps {
  label: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (location: string) => void;
  onCoordinatesChange: (lat: number, lon: number) => void;
}

export function LocationInput({
  label,
  location,
  latitude,
  longitude,
  onLocationChange,
  onCoordinatesChange,
}: LocationInputProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetectLocation = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (Platform.OS !== "web") {
          Alert.alert(
            "Permission Denied",
            "Please enable location permission in settings",
            [{ text: "OK" }]
          );
        }
        setError("Location permission not granted");
        setIsLoading(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lon } = currentLocation.coords;

      try {
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });

        if (geocoded.length > 0) {
          const address = geocoded[0];
          const addressParts: string[] = [];

          if (address.street) addressParts.push(address.street);
          if (address.city) addressParts.push(address.city);
          if (address.region) addressParts.push(address.region);
          if (address.country) addressParts.push(address.country);

          const addressString = addressParts.length > 0 
            ? addressParts.join(", ") 
            : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

          onLocationChange(addressString);
          onCoordinatesChange(lat, lon);
        } else {
          onLocationChange(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          onCoordinatesChange(lat, lon);
        }
      } catch (geocodeError) {
        onLocationChange(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        onCoordinatesChange(lat, lon);
      }
    } catch (err) {
      console.error("Location error:", err);
      setError("Failed to detect location");
    } finally {
      setIsLoading(false);
    }
  }, [onLocationChange, onCoordinatesChange]);

  const coordinatesDisplay =
    latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Not detected";

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: error ? theme.error : theme.textSecondary }]}
      >
        {label}
      </ThemedText>

      {/* Location Input */}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.error : theme.border,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <Feather
          name="map-pin"
          size={20}
          color={theme.textSecondary}
          style={styles.leftIcon}
        />
        <TextInput
          value={location}
          onChangeText={onLocationChange}
          style={[
            styles.input,
            {
              color: theme.text,
            },
          ]}
          placeholder="Enter or detect location"
          placeholderTextColor={theme.textSecondary}
        />
        <Pressable
          onPress={handleDetectLocation}
          disabled={isLoading}
          style={styles.detectButton}
          hitSlop={8}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color={theme.primary} />
          ) : (
            <Feather name="navigation" size={20} color={theme.primary} />
          )}
        </Pressable>
      </View>

      {error && (
        <ThemedText type="small" style={[styles.helperText, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}

      {/* Coordinates Display (Read-only) */}
      <View style={styles.spacer} />
      <ThemedText
        type="small"
        style={[styles.label, { color: theme.textSecondary }]}
      >
        Coordinates
      </ThemedText>
      <View
        style={[
          styles.coordinatesContainer,
          {
            backgroundColor: theme.backgroundRoot,
            borderColor: theme.border,
          },
        ]}
      >
        <Feather
          name="target"
          size={20}
          color={theme.textSecondary}
          style={styles.leftIcon}
        />
        <TextInput
          value={coordinatesDisplay}
          editable={false}
          style={[
            styles.input,
            {
              color: latitude && longitude ? theme.text : theme.textSecondary,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
  },
  coordinatesContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  detectButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  spacer: {
    height: Spacing.md,
  },
  helperText: {
    marginTop: Spacing.xs,
  },
});
