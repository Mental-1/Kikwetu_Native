import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import React, { memo } from "react";
import { Platform, StyleSheet, Switch, View, ViewStyle } from "react-native";

interface FormToggleProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    containerStyle?: ViewStyle;
}

function FormToggleComponent({
    label,
    value,
    onValueChange,
    containerStyle,
}: FormToggleProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            <ThemedText type="body" style={styles.label}>
                {label}
            </ThemedText>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: theme.border,
                    true: Platform.OS === "ios"
                        ? theme.primary
                        : `${theme.primary}80`,
                }}
                thumbColor={Platform.OS === "android"
                    ? (value ? theme.primary : theme.backgroundSecondary)
                    : undefined}
                ios_backgroundColor={theme.border}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: Spacing["2xl"],
        paddingVertical: Spacing.sm,
    },
    label: {
        fontWeight: "500",
    },
});

export const FormToggle = memo(FormToggleComponent);
