import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import React, { useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

const TitleDescriptionSection = React.memo(() => {
    const { control, formState: { errors }, getValues } = useFormContext<
        Step1FormData
    >();
    const setTitle = useAppStore((state) => state.postAd.setTitle);
    const setDescription = useAppStore((state) => state.postAd.setDescription);

    const handleTitleBlur = useCallback(() => {
        setTitle(getValues("title"));
    }, [setTitle, getValues]);

    const handleDescriptionBlur = useCallback(() => {
        setDescription(getValues("description"));
    }, [setDescription, getValues]);

    return (
        <>
            {/* Title */}
            <View style={styles.section}>
                <Text style={styles.label}>Title *</Text>
                <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                errors.title && styles.inputError,
                            ]}
                            placeholder="Enter listing title"
                            placeholderTextColor={Colors.grey}
                            value={value}
                            onChangeText={onChange}
                            onBlur={() => {
                                onBlur();
                                handleTitleBlur();
                            }}
                            maxLength={100}
                        />
                    )}
                />
                {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                )}
                <Text style={styles.characterCount}>
                    {getValues("title")?.length || 0}/100
                </Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.label}>Description *</Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                errors.description && styles.inputError,
                            ]}
                            placeholder="Describe your item in detail"
                            placeholderTextColor={Colors.grey}
                            value={value}
                            onChangeText={onChange}
                            onBlur={() => {
                                onBlur();
                                handleDescriptionBlur();
                            }}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                        />
                    )}
                />
                {errors.description && (
                    <Text style={styles.errorText}>
                        {errors.description.message}
                    </Text>
                )}
                <Text style={styles.characterCount}>
                    {getValues("description")?.length || 0}/500
                </Text>
            </View>
        </>
    );
});

TitleDescriptionSection.displayName = "TitleDescriptionSection";

export default TitleDescriptionSection;

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
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    characterCount: {
        fontSize: 12,
        color: Colors.grey,
        textAlign: "right",
        marginTop: 4,
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
