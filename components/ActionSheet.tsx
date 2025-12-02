import React, { forwardRef, useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import BottomSheetModal, { BottomSheetModalRef } from "./BottomSheetModal";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  isDestructive?: boolean;
  onPress?: () => void;
}

interface ActionSheetProps {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  showCancelButton?: boolean;
  cancelLabel?: string;
  onCancel?: () => void;
  onClose?: () => void;
}

const ActionSheet = forwardRef<BottomSheetModalRef, ActionSheetProps>(
  (
    {
      title,
      message,
      options,
      showCancelButton = true,
      cancelLabel = "Cancel",
      onCancel,
      onClose,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handleOptionPress = useCallback(
      (option: ActionSheetOption) => {
        option.onPress?.();
      },
      []
    );

    const handleCancel = useCallback(() => {
      onCancel?.();
    }, [onCancel]);

    const snapPoint = Math.min(
      90,
      Math.max(
        25,
        ((options.length * 56) + (title ? 60 : 0) + (message ? 40 : 0) + (showCancelButton ? 80 : 0) + 48) /
          (typeof window !== "undefined" ? window.innerHeight : 800) *
          100
      )
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={[`${snapPoint}%`]}
        onClose={onClose}
        enablePanDownToClose
        enableBackdropDismiss
      >
        <View style={styles.container}>
          {title || message ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              ) : null}
              {message ? (
                <Text style={[styles.message, { color: theme.textSecondary }]}>
                  {message}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: pressed
                      ? theme.backgroundSecondary
                      : theme.backgroundDefault,
                  },
                  index === 0 && styles.optionFirst,
                  index === options.length - 1 && styles.optionLast,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                {option.icon ? (
                  <Feather
                    name={option.icon}
                    size={20}
                    color={option.isDestructive ? theme.error : theme.text}
                    style={styles.optionIcon}
                  />
                ) : null}
                <Text
                  style={[
                    styles.optionLabel,
                    { color: option.isDestructive ? theme.error : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {showCancelButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  backgroundColor: pressed
                    ? theme.backgroundTertiary
                    : theme.backgroundSecondary,
                },
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelLabel, { color: theme.primary }]}>
                {cancelLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </BottomSheetModal>
    );
  }
);

ActionSheet.displayName = "ActionSheet";

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  message: {
    ...Typography.body,
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  optionFirst: {
    borderTopLeftRadius: BorderRadius.xs,
    borderTopRightRadius: BorderRadius.xs,
  },
  optionLast: {
    borderBottomLeftRadius: BorderRadius.xs,
    borderBottomRightRadius: BorderRadius.xs,
  },
  optionIcon: {
    marginRight: Spacing.md,
  },
  optionLabel: {
    ...Typography.body,
    fontWeight: "500",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xs,
  },
  cancelLabel: {
    ...Typography.body,
    fontWeight: "600",
  },
});

export default ActionSheet;
