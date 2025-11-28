import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PriceNegotiableSection = React.memo(() => {
    const { control, formState: { errors }, setValue, getValues } =
        useFormContext<Step1FormData>();
    const setPrice = useAppStore((state) => state.postAd.setPrice);
    const setIsNegotiable = useAppStore((state) =>
        state.postAd.setIsNegotiable
    );

    const isNegotiable = useWatch<Step1FormData, "negotiable">({
        name: "negotiable",
    });

    const [priceInput, setPriceInput] = useState("");

    const formatPrice = useCallback((value: string) => {
        const numericValue = value.replace(/\\D/g, "");
        if (numericValue === "") return "";
        return parseInt(numericValue).toLocaleString();
    }, []);

    const handleNegotiableToggle = useCallback(() => {
        const newValue = !isNegotiable;
        setValue("negotiable", newValue);
        setIsNegotiable(newValue);
    }, [isNegotiable, setValue, setIsNegotiable]);

    return (
        <View style={styles.section}>
            <Text style={styles.label}>Price (Kes) *</Text>
            <Controller
                control={control}
                name="price"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[
                            styles.input,
                            errors.price && styles.inputError,
                        ]}
                        placeholder="Enter price"
                        placeholderTextColor={Colors.grey}
                        value={priceInput ||
                            (value ? value.toLocaleString() : "")}
                        onChangeText={(text) => {
                            const formatted = formatPrice(text);
                            setPriceInput(formatted);
                            const numericValue = formatted.replace(/\\D/g, "");
                            onChange(
                                numericValue ? parseFloat(numericValue) : 0,
                            );
                        }}
                        onBlur={() => {
                            onBlur();
                            setPrice(value);
                        }}
                        keyboardType="numeric"
                    />
                )}
            />
            {errors.price && (
                <Text style={styles.errorText}>{errors.price.message}</Text>
            )}

            {/* Negotiable Checkbox */}
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={handleNegotiableToggle}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.checkbox,
                        isNegotiable && styles.checkboxChecked,
                    ]}
                >
                    {isNegotiable && (
                        <Ionicons
                            name="checkmark"
                            size={16}
                            color={Colors.white}
                        />
                    )}
                </View>
                <Text style={styles.checkboxLabel}>Price is negotiable</Text>
            </TouchableOpacity>
        </View>
    );
});

PriceNegotiableSection.displayName = "PriceNegotiableSection";

export default PriceNegotiableSection;

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
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.grey,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxLabel: {
        fontSize: 14,
        color: Colors.black,
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
