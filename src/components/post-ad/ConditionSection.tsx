import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import React, { useCallback } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ConditionSection = React.memo(() => {
    const { setValue, formState: { errors } } = useFormContext<Step1FormData>();
    const setCondition = useAppStore((state) => state.postAd.setCondition);

    const condition = useWatch<Step1FormData, "condition">({
        name: "condition",
    });

    const handleConditionChange = useCallback((cond: string) => {
        setValue("condition", cond);
        setCondition(cond);
    }, [setValue, setCondition]);

    return (
        <View style={styles.section}>
            <Text style={styles.label}>Condition *</Text>
            <View style={styles.conditionContainer}>
                {["New", "Like New", "Good", "Used"].map((cond) => (
                    <TouchableOpacity
                        key={cond}
                        style={[
                            styles.conditionButton,
                            condition === cond &&
                            styles.conditionButtonSelected,
                        ]}
                        onPress={() => handleConditionChange(cond)}
                        activeOpacity={condition === cond ? 1 : 0.7}
                    >
                        <Text
                            style={[
                                styles.conditionText,
                                condition === cond &&
                                styles.conditionTextSelected,
                            ]}
                        >
                            {cond}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errors.condition && (
                <Text style={styles.errorText}>{errors.condition.message}</Text>
            )}
        </View>
    );
});

ConditionSection.displayName = "ConditionSection";

export default ConditionSection;

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
    conditionContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    conditionButton: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.black,
    },
    conditionButtonSelected: {
        backgroundColor: Colors.black,
        borderColor: Colors.black,
    },
    conditionText: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: "500",
    },
    conditionTextSelected: {
        color: Colors.white,
    },
    errorText: {
        color: Colors.red,
        fontSize: 12,
        marginTop: 4,
    },
});
