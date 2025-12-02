import React, { forwardRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";

interface BottomSheetTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    rightIcon?: string;
    onRightIconPress?: () => void;
    isPasswordField?: boolean;
}

const BottomSheetTextInput = forwardRef<TextInput, BottomSheetTextInputProps>(
    (
        {
            label,
            error,
            containerStyle,
            style,
            rightIcon,
            onRightIconPress,
            isPasswordField = false,
            secureTextEntry,
            ...props
        },
        ref,
    ) => {
        const { theme } = useTheme();
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);

        const handleIconPress = () => {
            if (isPasswordField) {
                setIsPasswordVisible(!isPasswordVisible);
            }
            onRightIconPress?.();
        };

        const effectiveSecureTextEntry = isPasswordField && !isPasswordVisible
            ? secureTextEntry ?? true
            : false;

        const iconName = isPasswordField
            ? isPasswordVisible ? "eye-off" : "eye"
            : rightIcon;

        return (
            <View style={[styles.container, containerStyle]}>
                {label
                    ? (
                        <Text style={[styles.label, { color: theme.text }]}>
                            {label}
                        </Text>
                    )
                    : null}
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={ref}
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: error ? theme.error : theme.border,
                            },
                            iconName ? { paddingRight: Spacing.xl } : {},
                            style,
                        ]}
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={effectiveSecureTextEntry}
                        {...props}
                    />
                    {iconName
                        ? (
                            <Pressable
                                style={[styles.rightIconButton, {
                                    top: Spacing.xs,
                                }]}
                                onPress={handleIconPress}
                                hitSlop={8}
                            >
                                <Feather
                                    name={iconName as any}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </Pressable>
                        )
                        : null}
                </View>
                {error
                    ? (
                        <Text style={[styles.error, { color: theme.error }]}>
                            {error}
                        </Text>
                    )
                    : null}
            </View>
        );
    },
);

BottomSheetTextInput.displayName = "BottomSheetTextInput";

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        ...Typography.small,
        fontWeight: "500",
        marginBottom: Spacing.xs,
    },
    inputWrapper: {
        position: "relative",
    },
    input: {
        height: Spacing.inputHeight,
        borderRadius: BorderRadius.xs,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        ...Typography.body,
    },
    rightIconButton: {
        position: "absolute",
        right: Spacing.md,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    error: {
        ...Typography.small,
        marginTop: Spacing.xs,
    },
});

export default BottomSheetTextInput;
