import { Colors } from "@/src/constants/constant";
import { useStores } from "@/src/hooks/useStores";
import { Step1FormData } from "@/src/utils/listingValidation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useWatch } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const StoreSelectionSection = React.memo(() => {
    const router = useRouter();
    const storeId = useWatch<Step1FormData, "store_id">({ name: "store_id" });

    const { data: stores } = useStores();

    const handleStorePress = useCallback(() => {
        router.push({
            pathname: "/(screens)/post-ad/select-option" as any,
            params: {
                type: "store",
                title: "Select Store",
            },
        });
    }, [router]);

    return (
        <View style={styles.section}>
            <Text style={styles.label}>Store (Optional)</Text>
            <TouchableOpacity
                style={styles.dropdown}
                onPress={handleStorePress}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.dropdownText,
                        !storeId && styles.placeholderText,
                    ]}
                >
                    {storeId
                        ? stores?.find((s) => s.id === storeId)?.name
                        : "Select Store (Optional)"}
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.grey}
                />
            </TouchableOpacity>
        </View>
    );
});

StoreSelectionSection.displayName = "StoreSelectionSection";

export default StoreSelectionSection;

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
    dropdown: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dropdownText: {
        fontSize: 16,
        color: Colors.black,
        flex: 1,
        marginRight: 8,
    },
    placeholderText: {
        color: Colors.grey,
    },
});
