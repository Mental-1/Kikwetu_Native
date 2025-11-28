import { Colors } from "@/src/constants/constant";
import { Step1FormData } from "@/src/utils/listingValidation";
import { useAppStore } from "@/stores/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TagsSection = React.memo(() => {
    const { setValue, getValues } = useFormContext<Step1FormData>();
    const setTags = useAppStore((state) => state.postAd.setTags);

    const tags = useWatch<Step1FormData, "tags">({ name: "tags" });
    const [tagInput, setTagInput] = useState("");

    const addTag = useCallback(() => {
        const trimmedTag = tagInput.trim();
        const currentTags = getValues("tags");
        if (trimmedTag && !currentTags.includes(trimmedTag)) {
            const cleanTag = trimmedTag.startsWith("#")
                ? trimmedTag.slice(1)
                : trimmedTag;
            const newTags = [...currentTags, cleanTag];
            setValue("tags", newTags);
            setTags(newTags);
            setTagInput("");
        }
    }, [tagInput, getValues, setValue, setTags]);

    const removeTag = useCallback((tagToRemove: string) => {
        const currentTags = getValues("tags");
        const newTags = currentTags.filter((tag) => tag !== tagToRemove);
        setValue("tags", newTags);
        setTags(newTags);
    }, [getValues, setValue, setTags]);

    return (
        <View style={styles.section}>
            <Text style={styles.label}>
                Tags (for search and classification)
            </Text>
            <View style={styles.tagInputContainer}>
                <TextInput
                    style={[styles.input, styles.tagInput]}
                    placeholder="Add a tag (e.g., electronics, furniture)"
                    placeholderTextColor={Colors.grey}
                    value={tagInput}
                    onChangeText={setTagInput}
                    onSubmitEditing={addTag}
                    returnKeyType="done"
                />
                <TouchableOpacity
                    style={styles.addTagButton}
                    onPress={addTag}
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {/* Display Tags */}
            {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                    {tags.map((tag, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.tag}
                            onPress={() => removeTag(tag)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.tagText}>#{tag}</Text>
                            <Ionicons
                                name="close"
                                size={16}
                                color={Colors.white}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
});

TagsSection.displayName = "TagsSection";

export default TagsSection;

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.black,
        marginBottom: 8,
    },
    tagInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    tagInput: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.black,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
    },
    addTagButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        padding: 12,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
        gap: 8,
    },
    tag: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    tagText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: "500",
    },
});
