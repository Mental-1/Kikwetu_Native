import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ModalPickerProps {
    visible: boolean;
    title: string;
    options: string[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
}

export default function ModalPicker({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: ModalPickerProps) {
    const handleSelect = (value: string) => {
        onSelect(value);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity activeOpacity={1}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={Colors.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.optionsContainer}>
                            {options.map((option, index) => {
                                const isSelected = option === selectedValue;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.option,
                                            isSelected && styles.selectedOption,
                                        ]}
                                        onPress={() => handleSelect(option)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.radioContainer}>
                                            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                                {isSelected && <View style={styles.radioDot} />}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    isSelected && styles.selectedOptionText,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        maxHeight: 300,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    selectedOption: {
        backgroundColor: '#2a2a2a',
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.grey,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: Colors.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    optionText: {
        fontSize: 16,
        color: Colors.white,
        flex: 1,
    },
    selectedOptionText: {
        color: Colors.primary,
        fontWeight: '600',
    },
});
