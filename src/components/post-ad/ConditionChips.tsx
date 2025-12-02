import React, { memo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ConditionChipsProps {
  value: string;
  onSelect: (condition: string) => void;
  error?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CONDITIONS: string[] = [
  "New",
  "Like New",
  "Good",
];
function ChipItem({
  item,
  isSelected,
  onPress,
}: {
  item: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? theme.primary : theme.backgroundRoot,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="small"
        style={[
          styles.chipText,
          { color: isSelected ? theme.buttonText : theme.text },
        ]}
      >
        {item}
      </ThemedText>
    </AnimatedPressable>
  );
}

function ConditionChipsComponent({ value, onSelect, error }: ConditionChipsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: error ? theme.error : theme.textSecondary }]}
      >
        Condition
      </ThemedText>
      <View style={styles.chipsContainer}>
        {CONDITIONS.map((item) => (
          <ChipItem
            key={item}
            item={item}
            isSelected={value === item}
            onPress={() => onSelect(item)}
          />
        ))}
      </View>
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
    marginBottom: Spacing.md,
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontWeight: "500",
  },
  error: {
    marginTop: Spacing.sm,
  },
});

export const ConditionChips = memo(ConditionChipsComponent);
