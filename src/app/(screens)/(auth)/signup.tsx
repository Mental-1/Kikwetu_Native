import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';

// Form validation schema
const signUpSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number in international format, e.g. +254712345678'),
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
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
        },
    });
    
    const onSubmitSignUp = async (data: SignUpFormData) => {
        try {
            setIsLoading(true);
            const { error } = await signUp(data.email, data.password, data.username, data.fullName, data.phoneNumber);
            
            if (error) {
                showErrorToast(error.message || 'Failed to create account', 'Sign Up Error');
            } else {
                showSuccessToast('Account created successfully! Please check your email to verify your account.', 'Welcome');
                onClose();
                reset();
            }
        } catch (error) {
            console.error('Sign up error:', error);
            showErrorToast('An unexpected error occurred', 'Sign Up Error');
        } finally {
            setIsLoading(false);
        }
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
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
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
                                        
                                        {/* Username */}
                                        <Controller
                                            control={control}
                                            name="username"
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    label="Username"
                                                    value={value}
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    error={!!errors.username}
                                                    mode="outlined"
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
                                        {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
                                        
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
                                                    label="Phone Number (e.g., +254712345678)"
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
                                        loading={isLoading}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                    <TouchableOpacity style={styles.authButton} onPress={() => {}}>
                                        <Ionicons name="logo-google" size={24} color={Colors.white} />
                                        <Text style={styles.authButtonText}>Continue with Google</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.switchAuthButton} onPress={onSwitchToSignIn}>
                                        <Text style={styles.switchAuthText}>
                                            Already have an account? <Text style={styles.switchAuthLink}>Sign In</Text>
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
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
        height: '75%',
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
        fontSize: 28,
        color: Colors.black,
        letterSpacing: 1.5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: Colors.grey,
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    formContainer: {
        marginVertical: 10,
    },
    textInput: {
        marginBottom: 8,
        backgroundColor: 'white',
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
        backgroundColor: Colors.primary    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 8,
        color: Colors.white,
    },
    switchAuthButton: {
        marginTop: 8,
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
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.green,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 16, 
        gap: 10,
    },
    authButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        marginTop: 5,
        marginBottom: 10,
    },
});

export default SignUp;
