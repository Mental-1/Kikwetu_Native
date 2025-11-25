import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AttributeInputFieldProps {
    label: string;
    value?: string | number;
    placeholder?: string;
    required?: boolean;
    type: 'select' | 'text' | 'number';
    onPress?: () => void;
    onChangeText?: (text: string) => void;
    keyboardType?: 'default' | 'numeric';
}

export default function AttributeInputField({
    label,
    value,
    placeholder,
    required = false,
    type,
    onPress,
    onChangeText,
    keyboardType = 'default',
}: AttributeInputFieldProps) {
    const displayValue = value?.toString() || '';
    const showPlaceholder = !displayValue;

    // For select type, render as touchable
    if (type === 'select') {
        return (
            <TouchableOpacity
                style={styles.container}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                    <Text style={styles.label}>
                        {label}
                        {required && <Text style={styles.required}>*</Text>}
                    </Text>
                    <Text
                        style={[
                            styles.value,
                            showPlaceholder && styles.placeholder,
                        ]}
                    >
                        {displayValue || placeholder || `Select ${label}`}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
        );
    }

    // For text/number type, render as input
    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}>*</Text>}
                </Text>
                <TextInput
                    style={styles.input}
                    value={displayValue}
                    onChangeText={onChangeText}
                    placeholder={placeholder || `Enter ${label}`}
                    placeholderTextColor={Colors.grey}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    content: {
        flex: 1,
    },
    inputContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 4,
    },
    required: {
        color: Colors.red,
    },
    value: {
        fontSize: 16,
        color: Colors.white,
        fontWeight: '500',
    },
    placeholder: {
        color: Colors.grey,
        fontWeight: '400',
    },
    input: {
        fontSize: 16,
        color: Colors.white,
        padding: 0,
        margin: 0,
    },
});
