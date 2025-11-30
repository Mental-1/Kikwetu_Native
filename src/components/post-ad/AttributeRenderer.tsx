import ModalPicker from "@/src/components/ModalPicker";
import { Colors } from "@/src/constants/constant";
import {
    AttributeField,
    AttributeSchema,
} from "@/src/types/categoryAttributes";
import { Step1FormData } from "@/src/utils/listingValidation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
    Control,
    Controller,
    UseFormSetValue,
    useWatch,
} from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Chip, HelperText, Switch, Text, TextInput } from "react-native-paper";
import ControlledInput from "./ControlledInput";

interface AttributeRendererProps {
    control: Control<Step1FormData>;
    setValue: UseFormSetValue<Step1FormData>;
    attributeSchema: AttributeSchema | null;
}

const AttributeRenderer = ({
    control,
    setValue,
    attributeSchema,
}: AttributeRendererProps) => {
    const router = useRouter();
    const [modalField, setModalField] = useState<AttributeField | null>(null);

    const attributes = useWatch({ control, name: "attributes" }) || {};
    const condition = useWatch({ control, name: "condition" });
    const tags = useWatch({ control, name: "tags" }) || [];
    const location = useWatch({ control, name: "location" });
    const [tagInput, setTagInput] = useState("");

    // --- Handlers ---

    const handleConditionSelect = useCallback(
        (value: string) => {
            setValue("condition", value, { shouldValidate: true });
        },
        [setValue],
    );

    const handleTagAdd = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (trimmed && !tags.includes(trimmed)) {
                setValue("tags", [...tags, trimmed], { shouldValidate: true });
            }
        },
        [setValue],
    );

    const handleTagRemove = useCallback(
        (tagToRemove: string) => {
            setValue(
                "tags",
                tags.filter((t) => t !== tagToRemove),
                { shouldValidate: true },
            );
        },
        [setValue],
    );

    const handleDynamicSelect = useCallback(
        (field: AttributeField) => {
            const optionsCount = field.options?.length || 0;
            if (optionsCount > 0 && optionsCount <= 5) {
                setModalField(field);
            } else {
                router.push({
                    pathname: "/(screens)/post-ad/select-option" as any,
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
                setValue(`attributes.${modalField.key}`, value, {
                    shouldValidate: true,
                });
                setModalField(null);
            }
        },
        [modalField, setValue],
    );

    // --- Renderers ---
    const dynamicFields = useMemo(() => {
        if (!attributeSchema?.fields || attributeSchema.fields.length === 0) {
            return null;
        }
        return attributeSchema.fields.map(renderDynamicField);
    }, [attributeSchema?.fields, attributes]);

    const renderCondition = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condition</Text>
            <View style={styles.chipContainer}>
                {["New", "Like New", "Good", "Fair", "Poor"].map((item) => (
                    <Chip
                        key={item}
                        selected={condition === item}
                        onPress={() => handleConditionSelect(item)}
                        style={styles.chip}
                        showSelectedOverlay
                        mode="outlined"
                    >
                        {item}
                    </Chip>
                ))}
            </View>
            <Controller
                control={control}
                name="condition"
                render={({ fieldState: { error } }) => (
                    <HelperText type="error" visible={!!error}>
                        {error?.message}
                    </HelperText>
                )}
            />
        </View>
    );

    const renderNegotiable = () => (
        <View style={styles.rowSection}>
            <Text style={styles.sectionTitle}>Negotiable</Text>
            <Controller
                control={control}
                name="negotiable"
                render={({ field: { value, onChange } }) => (
                    <Switch
                        value={value}
                        onValueChange={onChange}
                        color={Colors.primary}
                    />
                )}
            />
        </View>
    );

    const renderLocation = () => (
        <View style={styles.section}>
            <ControlledInput
                control={control}
                name="location"
                label="Location"
                placeholder="Enter location"
                right={<TextInput.Icon icon="map-marker" />}
            />
        </View>
    );

    const renderTags = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagInputContainer}>
                    <TextInput
                        value={tagInput}
                        onChangeText={setTagInput}
                        placeholder="Add a tag"
                        mode="outlined"
                        style={{ flex: 1, backgroundColor: Colors.white }}
                        onSubmitEditing={() => {
                            handleTagAdd(tagInput);
                            setTagInput("");
                        }}
                        right={
                            <TextInput.Icon
                                icon="plus"
                                onPress={() => {
                                    handleTagAdd(tagInput);
                                    setTagInput("");
                                }}
                            />
                        }
                    />
                </View>
                <View style={styles.chipContainer}>
                    {tags.map((tag) => (
                        <Chip
                            key={tag}
                            onClose={() => handleTagRemove(tag)}
                            style={styles.chip}
                            mode="flat"
                        >
                            {tag}
                        </Chip>
                    ))}
                </View>
                <Controller
                    control={control}
                    name="tags"
                    render={({ fieldState: { error } }) => (
                        <HelperText type="error" visible={!!error}>
                            {error?.message}
                        </HelperText>
                    )}
                />
            </View>
        );
    };

    const renderDynamicField = (field: AttributeField) => {
        const value = attributes[field.key];

        switch (field.type) {
            case "text":
            case "number":
                return (
                    <ControlledInput
                        key={field.key}
                        control={control}
                        name={`attributes.${field.key}`}
                        label={field.label}
                        placeholder={field.placeholder}
                        keyboardType={field.type === "number"
                            ? "numeric"
                            : "default"}
                        rules={{
                            required: field.required
                                ? `${field.label} is required`
                                : false,
                        }}
                    />
                );
            case "select":
                return (
                    <TouchableOpacity
                        key={field.key}
                        onPress={() => handleDynamicSelect(field)}
                        activeOpacity={0.7}
                        style={styles.selectButton}
                    >
                        <View>
                            <Text style={styles.selectLabel}>
                                {field.label}
                            </Text>
                            <Text
                                style={[
                                    styles.selectValue,
                                    !value && styles.placeholder,
                                ]}
                            >
                                {value || field.placeholder || "Select..."}
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={Colors.grey}
                        />
                    </TouchableOpacity>
                );
            default:
                return null;
        }
    };

    return (
        <View>
            {/* Standard Attributes */}
            {renderCondition()}
            {renderLocation()}
            {renderNegotiable()}

            {/* Dynamic Attributes */}
            {dynamicFields && (
                <View style={styles.section}>
                    <Text style={styles.headerTitle}>Additional Details</Text>
                    {dynamicFields}
                </View>
            )}

            {/* Tags */}
            {renderTags()}

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
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    rowSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
        marginBottom: 16,
        marginTop: 8,
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        backgroundColor: Colors.white,
    },
    tagInputContainer: {
        marginBottom: 12,
    },
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
        borderRadius: 8,
        marginBottom: 12,
    },
    selectLabel: {
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    selectValue: {
        fontSize: 16,
        color: Colors.black,
    },
    placeholder: {
        color: Colors.grey,
    },
});

export default memo(AttributeRenderer);
