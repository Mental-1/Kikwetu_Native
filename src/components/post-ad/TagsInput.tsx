import React, { memo, useState, useCallback } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TagsInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

function TagsInputComponent({ tags, onAddTag, onRemoveTag }: TagsInputProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleAddTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setInputValue("");
    }
  }, [inputValue, tags, onAddTag]);

  const handleSubmit = useCallback(() => {
    handleAddTag();
  }, [handleAddTag]);

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
        Tags (optional)
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: isFocused ? theme.primary : theme.border,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          placeholder="Add a tag..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAddTag}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          hitSlop={8}
        >
          <Feather name="plus" size={18} color={theme.buttonText} />
        </Pressable>
      </View>
      {tags.length > 0 ? (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: theme.backgroundDefault }]}
            >
              <ThemedText type="small" style={styles.tagText}>
                {tag}
              </ThemedText>
              <Pressable
                onPress={() => onRemoveTag(tag)}
                hitSlop={4}
                style={styles.removeButton}
              >
                <Feather name="x" size={14} color={theme.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: BorderRadius.xs,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    minHeight: Spacing.inputHeight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  tagText: {
    fontWeight: "500",
  },
  removeButton: {
    padding: Spacing.xs,
  },
});

export const TagsInput = memo(TagsInputComponent);
