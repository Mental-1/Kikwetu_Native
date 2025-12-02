import React, { memo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface ModalPickerProps {
    visible: boolean;
    title: string;
    options: string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
}

function ModalPickerComponent({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: ModalPickerProps) {
    const { theme } = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ThemedView style={styles.container}>
                    <View style={styles.header}>
                        <ThemedText type="h4" style={styles.title}>
                            {title}
                        </ThemedText>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [
                                styles.closeButton,
                                { opacity: pressed ? 0.6 : 1 },
                            ]}
                            hitSlop={8}
                        >
                            <Feather name="x" size={24} color={theme.text} />
                        </Pressable>
                    </View>
                    <ScrollView
                        style={styles.optionsList}
                        contentContainerStyle={styles.optionsContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option, index) => {
                            const isSelected = option === selectedValue;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => onSelect(option)}
                                    style={({ pressed }) => [
                                        styles.optionItem,
                                        {
                                            backgroundColor: pressed
                                                ? theme.backgroundDefault
                                                : theme.backgroundRoot,
                                            borderBottomColor: theme.border,
                                            borderBottomWidth:
                                                index < options.length - 1
                                                    ? 0.5
                                                    : 0,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.optionText,
                                            isSelected &&
                                            {
                                                color: theme.primary,
                                                fontWeight: "600",
                                            },
                                        ]}
                                    >
                                        {option}
                                    </ThemedText>
                                    {isSelected
                                        ? (
                                            <Feather
                                                name="check"
                                                size={20}
                                                color={theme.primary}
                                            />
                                        )
                                        : null}
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    container: {
        maxHeight: "60%",
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        paddingBottom: Spacing["2xl"],
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(128, 128, 128, 0.2)",
    },
    title: {
        flex: 1,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    optionsList: {
        flexGrow: 0,
    },
    optionsContent: {
        paddingHorizontal: Spacing.xl,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.lg,
        minHeight: 56,
    },
    optionText: {
        fontSize: 16,
    },
});

export const ModalPicker = memo(ModalPickerComponent);
