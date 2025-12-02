import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface DescriptionProgressBarProps {
  charCount: number;
  minChars?: number;
  maxChars?: number;
}

export function DescriptionProgressBar({
  charCount,
  minChars = 90,
  maxChars = 1000,
}: DescriptionProgressBarProps) {
  const { theme } = useTheme();

  // Calculate progress percentage
  const progress = Math.min((charCount / maxChars) * 100, 100);

  // Determine color based on character count
  let barColor = "#EF4444"; // red
  let statusMessage = "Keep writing";

  if (charCount >= minChars && charCount < 150) {
    barColor = "#FBBF24"; // yellow
    statusMessage = "Good start";
  } else if (charCount >= 150) {
    barColor = "#4CAF50"; // green
    statusMessage = "Perfect description";
  }

  return (
    <View style={styles.container}>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${progress}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <View style={styles.footer}>
        <ThemedText type="small" style={[styles.message, { color: barColor }]}>
          {statusMessage}
        </ThemedText>
        <ThemedText type="small" style={[styles.count, { color: theme.textSecondary }]}>
          {charCount}/{maxChars}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    fontWeight: "500",
  },
  count: {
    fontSize: 12,
  },
});
