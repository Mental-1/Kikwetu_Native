import AttributeInputField from '@/src/components/AttributeInputField';
import ModalPicker from '@/src/components/ModalPicker';
import { AttributeField, AttributeSchema } from '@/src/types/categoryAttributes';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

interface DynamicAttributeFieldsProps {
    schema: AttributeSchema;
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
}

export default function DynamicAttributeFields({
    schema,
    values,
    onChange,
}: DynamicAttributeFieldsProps) {
    const router = useRouter();
    const [modalField, setModalField] = useState<AttributeField | null>(null);

    const handleSelectField = useCallback(
        (field: AttributeField) => {
            const optionsCount = field.options?.length || 0;
            if (optionsCount >= 2 && optionsCount <= 4) {
                setModalField(field);
            } else {
                router.push({
                    pathname: './select-option',
                    params: {
                        type: 'attribute',
                        title: `Select ${field.label}`,
                        attributeKey: field.key,
                        options: JSON.stringify(field.options || []),
                    },
                });
            }
        },
        [router]
    );

    const handleModalSelect = useCallback(
        (value: string) => {
            if (modalField) {
                onChange(modalField.key, value);
                setModalField(null);
            }
        },
        [modalField, onChange]
    );

    const handleTextChange = useCallback(
        (key: string, value: string) => {
            onChange(key, value);
        },
        [onChange]
    );

    const handleNumberChange = useCallback(
        (key: string, value: string) => {
            const numValue = value ? parseFloat(value) : null;
            onChange(key, numValue);
        },
        [onChange]
    );

    return (
        <View>
            {schema.fields.map((field) => {
                const value = values[field.key];

                switch (field.type) {
                    case 'select':
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

                    case 'number':
                        return (
                            <AttributeInputField
                                key={field.key}
                                label={field.label}
                                value={value}
                                placeholder={field.placeholder}
                                required={field.required}
                                type="number"
                                keyboardType="numeric"
                                onChangeText={(text) => handleNumberChange(field.key, text)}
                            />
                        );

                    case 'text':
                        return (
                            <AttributeInputField
                                key={field.key}
                                label={field.label}
                                value={value}
                                placeholder={field.placeholder}
                                required={field.required}
                                type="text"
                                onChangeText={(text) => handleTextChange(field.key, text)}
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
                    selectedValue={values[modalField.key]}
                    onSelect={handleModalSelect}
                    onClose={() => setModalField(null)}
                />
            )}
        </View>
    );
}
