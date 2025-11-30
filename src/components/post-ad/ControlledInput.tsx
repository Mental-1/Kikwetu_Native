import { Colors } from "@/src/constants/constant";
import React, { memo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { HelperText, TextInput, TextInputProps } from "react-native-paper";

interface ControlledInputProps<T extends FieldValues>
    extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    rules?: object;
    description?: string;
}

const ControlledInput = <T extends FieldValues>({
    control,
    name,
    label,
    rules,
    description,
    style,
    ...props
}: ControlledInputProps<T>) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
            }) => (
                <View style={styles.container}>
                    <TextInput
                        label={label}
                        value={value !== undefined && value !== null
                            ? String(value)
                            : ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        mode="outlined"
                        error={!!error}
                        style={[styles.input, style]}
                        outlineColor={Colors.lightgrey}
                        activeOutlineColor={Colors.primary}
                        textColor={Colors.black}
                        theme={{
                            colors: {
                                background: Colors.white,
                            },
                        }}
                        {...props}
                    />
                    {description && !error && (
                        <HelperText
                            type="info"
                            visible={true}
                            style={styles.helper}
                        >
                            {description}
                        </HelperText>
                    )}
                    <HelperText type="error" visible={!!error}>
                        {error?.message}
                    </HelperText>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.white,
    },
    helper: {
        color: Colors.grey,
    },
});

export default memo(ControlledInput) as typeof ControlledInput;
