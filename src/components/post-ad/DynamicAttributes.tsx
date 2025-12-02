import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { ModalPicker } from "@/src/components/ModalPicker";
import { FormInput } from "@/src/components/post-ad/FormInput";
import { FormToggle } from "@/src/components/post-ad/FormToggle";
import { SelectField } from "@/src/components/post-ad/SelectField";
import {
  AttributeField,
  AttributeSchema,
} from "@/src/types/categoryAttributes";
import React, { memo, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

interface DynamicAttributesProps {
  schema: AttributeSchema | null;
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  onNavigateToSelect: (field: AttributeField) => void;
}

function DynamicAttributesComponent({
  schema,
  values,
  onValueChange,
  onNavigateToSelect,
}: DynamicAttributesProps) {
  const { theme } = useTheme();
  const [modalField, setModalField] = useState<AttributeField | null>(null);

  const handleModalSelect = useCallback(
    (value: string) => {
      if (modalField) {
        onValueChange(modalField.key, value);
        setModalField(null);
      }
    },
    [modalField, onValueChange],
  );

  const handleSelectPress = useCallback(
    (field: AttributeField) => {
      const optionsCount = field.options?.length || 0;
      if (optionsCount > 0 && optionsCount <= 6) {
        setModalField(field);
      } else {
        onNavigateToSelect(field);
      }
    },
    [onNavigateToSelect],
  );

  if (!schema || schema.fields.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText
        type="body"
        style={[styles.sectionTitle, { color: theme.text }]}
      >
        Additional Details
      </ThemedText>
      {schema.fields.map((field) => {
        const value = values[field.key] || "";

        if (field.type === "boolean") {
          return (
            <FormToggle
              key={field.key}
              label={field.label}
              value={value === "true"}
              onValueChange={(newValue) =>
                onValueChange(field.key, String(newValue))}
            />
          );
        }

        if (field.type === "select") {
          return (
            <SelectField
              key={field.key}
              label={field.label + (field.required ? " *" : "")}
              value={value}
              placeholder={field.placeholder}
              onPress={() => handleSelectPress(field)}
            />
          );
        }

        return (
          <FormInput
            key={field.key}
            label={field.label + (field.required ? " *" : "")}
            value={value}
            onChangeText={(text) => onValueChange(field.key, text)}
            placeholder={field.placeholder}
            keyboardType={field.type === "number" ? "numeric" : "default"}
          />
        );
      })}

      {modalField
        ? (
          <ModalPicker
            visible={!!modalField}
            title={`Select ${modalField.label}`}
            options={modalField.options || []}
            selectedValue={values[modalField.key]}
            onSelect={handleModalSelect}
            onClose={() => setModalField(null)}
          />
        )
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
});

export const DynamicAttributes = memo(DynamicAttributesComponent);
