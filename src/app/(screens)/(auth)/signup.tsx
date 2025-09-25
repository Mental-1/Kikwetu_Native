import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';

// Form validation schema
const signUpSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
    visible: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void;
}

const SignUp = ({ visible, onClose, onSwitchToSignIn }: SignUpProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
        },
    });
    
    const onSubmitSignUp = (data: SignUpFormData) => {
        console.log('Sign up data:', data);
        // TODO: Implement actual sign up logic
        onClose();
        reset();
    };
    
    const handleClose = () => {
        onClose();
        reset();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Sign Up</Text>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <ScrollView 
                            style={styles.authForm} 
                            contentContainerStyle={styles.authFormContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.welcomeText}>Join Kikwetu!</Text>
                            <Text style={styles.subtitle}>Create your account</Text>
                            
                            <View style={styles.formContainer}>
                                {/* Full Name */}
                                <Controller
                                    control={control}
                                    name="fullName"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Full Name"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            error={!!errors.fullName}
                                            mode="outlined"
                                            style={styles.textInput}
                                            textColor={Colors.black}
                                            outlineColor={Colors.primary}
                                            activeOutlineColor={Colors.primary}
                                            theme={{
                                                colors: {
                                                    primary: Colors.primary,
                                                    placeholder: Colors.black,
                                                    text: Colors.black,
                                                    outline: Colors.primary,
                                                }
                                            }}
                                        />
                                    )}
                                />
                                {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                                
                                {/* Email */}
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Email"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            error={!!errors.email}
                                            mode="outlined"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            style={styles.textInput}
                                            textColor={Colors.black}
                                            outlineColor={Colors.primary}
                                            activeOutlineColor={Colors.primary}
                                            theme={{
                                                colors: {
                                                    primary: Colors.primary,
                                                    placeholder: Colors.black,
                                                    text: Colors.black,
                                                    outline: Colors.primary,
                                                }
                                            }}
                                        />
                                    )}
                                />
                                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                                
                                {/* Phone Number */}
                                <Controller
                                    control={control}
                                    name="phoneNumber"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Phone Number"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            error={!!errors.phoneNumber}
                                            mode="outlined"
                                            keyboardType="phone-pad"
                                            style={styles.textInput}
                                            textColor={Colors.black}
                                            outlineColor={Colors.primary}
                                            activeOutlineColor={Colors.primary}
                                            theme={{
                                                colors: {
                                                    primary: Colors.primary,
                                                    placeholder: Colors.black,
                                                    text: Colors.black,
                                                    outline: Colors.primary,
                                                }
                                            }}
                                        />
                                    )}
                                />
                                {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}
                                
                                {/* Password */}
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Password"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            error={!!errors.password}
                                            mode="outlined"
                                            secureTextEntry={!showPassword}
                                            style={styles.textInput}
                                            textColor={Colors.black}
                                            outlineColor={Colors.primary}
                                            activeOutlineColor={Colors.primary}
                                            theme={{
                                                colors: {
                                                    primary: Colors.primary,
                                                    placeholder: Colors.black,
                                                    text: Colors.black,
                                                    outline: Colors.primary,
                                                }
                                            }}
                                            right={
                                                <TextInput.Icon
                                                    icon={showPassword ? "eye-off" : "eye"}
                                                    onPress={() => setShowPassword(!showPassword)}
                                                />
                                            }
                                        />
                                    )}
                                />
                                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                                
                                {/* Confirm Password */}
                                <Controller
                                    control={control}
                                    name="confirmPassword"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            label="Confirm Password"
                                            value={value}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            error={!!errors.confirmPassword}
                                            mode="outlined"
                                            secureTextEntry={!showConfirmPassword}
                                            style={styles.textInput}
                                            textColor={Colors.black}
                                            outlineColor={Colors.primary}
                                            activeOutlineColor={Colors.primary}
                                            theme={{
                                                colors: {
                                                    primary: Colors.primary,
                                                    placeholder: Colors.black,
                                                    text: Colors.black,
                                                    outline: Colors.primary,
                                                }
                                            }}
                                            right={
                                                <TextInput.Icon
                                                    icon={showConfirmPassword ? "eye-off" : "eye"}
                                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                                />
                                            }
                                        />
                                    )}
                                />
                                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                            </View>
                            
                            <Button
                                mode="contained"
                                onPress={handleSubmit(onSubmitSignUp)}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonText}
                            >
                                Create Account
                            </Button>
                            
                            <TouchableOpacity style={styles.switchAuthButton} onPress={onSwitchToSignIn}>
                                <Text style={styles.switchAuthText}>
                                    Already have an account? <Text style={styles.switchAuthLink}>Sign In</Text>
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '65%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightgrey,
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    authForm: {
        flex: 1,
    },
    authFormContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingBottom: 20,
    },
    welcomeText: {
        fontSize: 26,
        color: Colors.primary,
        letterSpacing: 1.5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.grey,
        textAlign: 'center',
        marginBottom: 20,
    },
    formContainer: {
        marginVertical: 10,
    },
    textInput: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 16,
    },
    submitButton: {
        marginTop: 10,
        marginBottom: 8,
        borderRadius: 12,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 8,
    },
    switchAuthButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchAuthText: {
        fontSize: 14,
        color: Colors.grey,
    },
    switchAuthLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
});

export default SignUp;
