import React, { memo, useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface CharLimitConfig {
  min?: number;
  max?: number;
  minMessage?: string;
  okMessage?: string;
}

interface FormInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onRealtimeChange?: (text: string) => void;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  prefix?: string;
  commitOnBlur?: boolean;
  formatPrice?: boolean;
  charLimit?: CharLimitConfig;
}

function FormInputComponent({
  label,
  value,
  onChangeText,
  onRealtimeChange,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  prefix,
  multiline,
  numberOfLines = 1,
  commitOnBlur = true,
  formatPrice = false,
  charLimit,
  ...props
}: FormInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const lastCommittedValue = useRef(value);

  useEffect(() => {
    if (!isFocused && value !== lastCommittedValue.current) {
      setLocalValue(value);
      lastCommittedValue.current = value;
    }
  }, [value, isFocused]);

  const handleFocus = useCallback(() => setIsFocused(true), []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (commitOnBlur && localValue !== lastCommittedValue.current) {
      onChangeText(localValue);
      lastCommittedValue.current = localValue;
    }
  }, [commitOnBlur, localValue, onChangeText]);

  const handleChangeText = useCallback(
    (text: string) => {
      let processedText = text;

      // Price formatting: strip non-digits and format with locale
      if (formatPrice) {
        processedText = text.replace(/\D/g, "");
      }

      setLocalValue(processedText);
      
      // Fire real-time callback (e.g., for progress bars)
      if (onRealtimeChange) {
        onRealtimeChange(processedText);
      }
      
      if (!commitOnBlur) {
        onChangeText(processedText);
      }
    },
    [commitOnBlur, formatPrice, onChangeText, onRealtimeChange]
  );

  // Calculate character feedback
  const charCount = localValue.length;
  let charFeedback = "";
  let charFeedbackColor = theme.textSecondary;

  if (charLimit) {
    if (charLimit.min && charCount > 0 && charCount < charLimit.min) {
      charFeedback = charLimit.minMessage || "";
      charFeedbackColor = theme.error;
    } else if (charLimit.max && charCount > 0 && charCount <= charLimit.max && charCount >= (charLimit.min || 0)) {
      charFeedback = charLimit.okMessage || "";
      charFeedbackColor = theme.success || "#4CAF50";
    }
  }

  const borderColor = error
    ? theme.error
    : isFocused
      ? theme.primary
      : theme.border;

  const inputHeight = multiline ? Math.max(120, numberOfLines * 24) : Spacing.inputHeight;
  const inputPadding = multiline ? Spacing.md : 0;

  // Format display value for price
  const displayValue = formatPrice ? localValue : localValue;

  return (
    <View style={styles.container}>
      <ThemedText
        type="small"
        style={[styles.label, { color: error ? theme.error : theme.textSecondary }]}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: theme.backgroundRoot,
            minHeight: inputHeight,
          },
        ]}
      >
        {leftIcon ? (
          <Feather
            name={leftIcon}
            size={20}
            color={theme.textSecondary}
            style={styles.leftIcon}
          />
        ) : null}
        {prefix ? (
          <ThemedText style={styles.prefix}>{prefix}</ThemedText>
        ) : null}
        <TextInput
          value={displayValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: theme.text,
              textAlignVertical: multiline ? "top" : "center",
              paddingVertical: multiline ? inputPadding : Spacing.md,
              paddingHorizontal: multiline ? Spacing.md : 0,
            },
          ]}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            hitSlop={8}
          >
            <Feather name={rightIcon} size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.feedbackRow}>
        <View style={styles.feedbackLeft}>
          {error ? (
            <ThemedText type="small" style={[styles.helperText, { color: theme.error }]}>
              {error}
            </ThemedText>
          ) : helperText ? (
            <ThemedText type="small" style={[styles.helperText, { color: theme.textSecondary }]}>
              {helperText}
            </ThemedText>
          ) : null}
        </View>
        {charFeedback && charCount > 0 && (
          <ThemedText type="small" style={[styles.charFeedback, { color: charFeedbackColor }]}>
            {charFeedback}
          </ThemedText>
        )}
      </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
  },
  leftIcon: {
    marginRight: Spacing.sm,
    marginTop: Spacing.md,
  },
  prefix: {
    marginRight: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  rightIconButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
    marginTop: Spacing.md,
  },
  feedbackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  feedbackLeft: {
    flex: 1,
  },
  helperText: {
    marginTop: 0,
  },
  charFeedback: {
    fontWeight: "500",
    marginLeft: Spacing.sm,
  },
});

export const FormInput = memo(FormInputComponent);
