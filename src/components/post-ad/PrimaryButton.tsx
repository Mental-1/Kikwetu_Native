import React, { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: "primary" | "secondary";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PrimaryButtonComponent({
    title,
    onPress,
    disabled = false,
    loading = false,
    variant = "primary",
}: PrimaryButtonProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    };

    const isPrimary = variant === "primary";
    const backgroundColor = isPrimary
        ? disabled ? `${theme.primary}80` : theme.primary
        : theme.backgroundRoot;
    const textColor = isPrimary ? theme.buttonText : theme.primary;
    const borderColor = isPrimary ? "transparent" : theme.primary;

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor,
                    borderColor,
                    borderWidth: isPrimary ? 0 : 1.5,
                    opacity: disabled ? 0.6 : 1,
                },
                animatedStyle,
            ]}
        >
            {loading
                ? <ActivityIndicator color={textColor} size="small" />
                : (
                    <ThemedText
                        type="body"
                        style={[styles.buttonText, { color: textColor }]}
                    >
                        {title}
                    </ThemedText>
                )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: Spacing.buttonHeight,
        borderRadius: BorderRadius.sm,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing["2xl"],
    },
    buttonText: {
        fontWeight: "600",
    },
});

export const PrimaryButton = memo(PrimaryButtonComponent);
