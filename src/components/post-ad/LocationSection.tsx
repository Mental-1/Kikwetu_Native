import CustomDialog from "@/components/ui/CustomDialog";
import CustomLoader from "@/components/ui/CustomLoader";
import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { getLocationWithAddress } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const LocationSection = React.memo(() => {
    const { control, formState: { errors }, setValue, getValues } =
        useFormContext<Step1FormData>();
    const { setLocation, setLatitude, setLongitude } = useAppStore((state) =>
        state.postAd
    );

    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showLocationDialog, setShowLocationDialog] = useState(false);

    const { showAlert, AlertComponent } = useCustomAlert();
    const alertHelpers = useMemo(
        () => createAlertHelpers(showAlert),
        [showAlert],
    );
    const { locationSuccess: showLocationSuccessAlert, error: showErrorAlert } =
        alertHelpers;

    const requestLocation = useCallback(() => {
        setShowLocationDialog(true);
    }, []);

    const handleLocationConfirm = useCallback(async () => {
        setShowLocationDialog(false);
        setIsLoadingLocation(true);
        try {
            const locationData = await getLocationWithAddress();
            if (locationData) {
                const locationText = locationData.address ||
                    `${locationData.latitude.toFixed(6)}, ${
                        locationData.longitude.toFixed(6)
                    }`;
                setLocation(locationText);
                setLatitude(locationData.latitude);
                setLongitude(locationData.longitude);
                setValue("location", locationText);
                setValue("latitude", locationData.latitude);
                setValue("longitude", locationData.longitude);
                showLocationSuccessAlert(
                    "Your location has been automatically detected and filled in.",
                );
            } else {
                showErrorAlert(
                    "Location Error",
                    "Unable to detect your location. Please enter it manually.",
                );
            }
        } catch (error) {
            console.error("Location error:", error);
            showErrorAlert(
                "Location Error",
                "Failed to get your location. Please check your location permissions and try again, or enter your location manually.",
            );
        } finally {
            setIsLoadingLocation(false);
        }
    }, [
        setLocation,
        setLatitude,
        setLongitude,
        setValue,
        showLocationSuccessAlert,
        showErrorAlert,
    ]);

    const handleLocationDeny = useCallback(() => {
        setShowLocationDialog(false);
    }, []);

    const handleLocationBlur = useCallback(() => {
        const value = getValues("location");
        setLocation(value);
    }, [setLocation, getValues]);

    return (
        <>
            <View style={styles.section}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.locationContainer}>
                    <Controller
                        control={control}
                        name="location"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.locationInput,
                                    errors.location && styles.inputError,
                                ]}
                                placeholder="Enter location"
                                placeholderTextColor={Colors.grey}
                                value={value}
                                onChangeText={onChange}
                                onBlur={() => {
                                    onBlur();
                                    handleLocationBlur();
                                }}
                            />
                        )}
                    />
                    <TouchableOpacity
                        style={[
                            styles.locationButton,
                            isLoadingLocation && styles.locationButtonLoading,
                        ]}
                        onPress={requestLocation}
                        disabled={isLoadingLocation}
                        activeOpacity={0.7}
                    >
                        {isLoadingLocation ? <CustomLoader /> : (
                            <Ionicons
                                name="location-outline"
                                size={20}
                                color={Colors.primary}
                            />
                        )}
                    </TouchableOpacity>
                </View>
                {errors.location && (
                    <Text style={styles.errorText}>
                        {errors.location.message}
                    </Text>
                )}
            </View>

            {/* Custom Location Permission Dialog */}
            <CustomDialog
                visible={showLocationDialog}
                title="Location Permission"
                message="Allow Kikwetu to access your location for automatic detection?"
                confirmText="Allow"
                denyText="Deny"
                onConfirm={handleLocationConfirm}
                onDeny={handleLocationDeny}
                icon="location-outline"
                iconColor={Colors.primary}
            />

            {/* Custom Alert */}
            <AlertComponent />
        </>
    );
});

LocationSection.displayName = "LocationSection";

export default LocationSection;

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationInput: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.black,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
    },
    locationButton: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderColor: Colors.lightgrey,
        borderWidth: 0.6,
        padding: 12,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    locationButtonLoading: {
        opacity: 0.7,
    },
    errorText: {
        color: Colors.red,
        fontSize: 12,
        marginTop: 4,
    },
    inputError: {
        borderColor: Colors.red,
    },
});
