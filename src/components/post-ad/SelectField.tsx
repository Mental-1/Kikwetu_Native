import React, { memo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface SelectFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SelectFieldComponent({
  label,
  value,
  placeholder = "Select...",
  onPress,
  error,
}: SelectFieldProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const borderColor = error ? theme.error : theme.border;

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: error ? theme.error : theme.textSecondary }]}
      >
        {label}
      </ThemedText>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.selectContainer,
          {
            borderColor,
            backgroundColor: theme.backgroundRoot,
          },
          animatedStyle,
        ]}
      >
        <ThemedText
          style={[
            styles.value,
            !value && { color: theme.textSecondary },
          ]}
        >
          {value || placeholder}
        </ThemedText>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </AnimatedPressable>
      {error ? (
        <ThemedText type="small" style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}
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
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    minHeight: Spacing.inputHeight,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    marginTop: Spacing.xs,
  },
});

export const SelectField = memo(SelectFieldComponent);
