import AttributeInputField from "@/src/components/AttributeInputField";
import ModalPicker from "@/src/components/ModalPicker";
import {
    AttributeField,
    AttributeSchema,
} from "@/src/types/categoryAttributes";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";

import { Step1FormData } from "@/src/utils/listingValidation";
import {
    Control,
    Controller,
    UseFormSetValue,
    UseFormWatch,
} from "react-hook-form";

interface DynamicAttributeFieldsProps {
    schema: AttributeSchema;
    control: Control<Step1FormData>;
    setValue: UseFormSetValue<Step1FormData>;
    watch: UseFormWatch<Step1FormData>;
}

const DynamicAttributeFields = React.memo(({
    schema,
    control,
    setValue,
    watch,
}: DynamicAttributeFieldsProps) => {
    const router = useRouter();
    const [modalField, setModalField] = useState<AttributeField | null>(null);

    if (!schema?.fields || !Array.isArray(schema.fields)) {
        return null;
    }

    const handleSelectField = useCallback(
        (field: AttributeField) => {
            const optionsCount = field.options?.length || 0;
            if (optionsCount >= 2 && optionsCount <= 4) {
                setModalField(field);
            } else {
                router.push({
                    pathname: "./select-option",
                    params: {
                        type: "attribute",
                        title: `Select ${field.label}`,
                        attributeKey: field.key,
                        options: JSON.stringify(field.options || []),
                    },
                });
            }
        },
        [router],
    );

    const handleModalSelect = useCallback(
        (value: string) => {
            if (modalField) {
                const currentAttributes = watch("attributes") || {};
                setValue("attributes", {
                    ...currentAttributes,
                    [modalField.key]: value,
                });
                setModalField(null);
            }
        },
        [modalField, setValue, watch],
    );

    const attributes = watch("attributes") || {};

    return (
        <View>
            {schema.fields.map((field) => {
                const value = attributes[field.key];

                switch (field.type) {
                    case "select":
                        return (
                            <AttributeInputField
                                key={field.key}
                                label={field.label}
                                value={value}
                                placeholder={field.placeholder}
                                required={field.required}
                                type="select"
                                onPress={() => handleSelectField(field)}
                            />
                        );

                    case "number":
                        return (
                            <Controller
                                key={field.key}
                                control={control}
                                name={`attributes.${field.key}`}
                                render={(
                                    { field: { onChange, onBlur, value } },
                                ) => (
                                    <AttributeInputField
                                        label={field.label}
                                        value={value}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        type="number"
                                        keyboardType="numeric"
                                        onChangeText={(text) => {
                                            const num = text
                                                ? parseFloat(text)
                                                : null;
                                            onChange(num);
                                        }}
                                    />
                                )}
                            />
                        );

                    case "text":
                        return (
                            <Controller
                                key={field.key}
                                control={control}
                                name={`attributes.${field.key}`}
                                render={(
                                    { field: { onChange, onBlur, value } },
                                ) => (
                                    <AttributeInputField
                                        label={field.label}
                                        value={value}
                                        placeholder={field.placeholder}
                                        required={field.required}
                                        type="text"
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        );

                    default:
                        return null;
                }
            })}

            {/* Modal Picker for small lists */}
            {modalField && (
                <ModalPicker
                    visible={!!modalField}
                    title={`Select ${modalField.label}`}
                    options={modalField.options || []}
                    selectedValue={attributes[modalField.key]}
                    onSelect={handleModalSelect}
                    onClose={() => setModalField(null)}
                />
            )}
        </View>
    );
});

DynamicAttributeFields.displayName = "DynamicAttributeFields";

export default DynamicAttributeFields;
