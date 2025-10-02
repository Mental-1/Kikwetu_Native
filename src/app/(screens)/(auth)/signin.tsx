import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';

// Form validation schema
const signInSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInProps {
    visible: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

const SignIn = ({ visible, onClose, onSwitchToSignUp }: SignInProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    
    const onSubmitSignIn = async (data: SignInFormData) => {
        try {
            setIsLoading(true);
            const { error } = await signIn(data.email, data.password);
            
            if (error) {
                showErrorToast(error.message || 'Failed to sign in', 'Sign In Error');
            } else {
                showSuccessToast('Successfully signed in!', 'Welcome Back');
                onClose();
                reset();
            }
        } catch (error) {
            console.error('Sign in error:', error);
            showErrorToast('An unexpected error occurred', 'Sign In Error');
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
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Welcome Back!</Text>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <ScrollView 
                            style={styles.authForm} 
                            contentContainerStyle={styles.authFormContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.subtitle}>Sign in to continue</Text>
                            
                            <View style={styles.formContainer}>
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
                            </View>
                            
                            <Button
                                mode="contained"
                                onPress={handleSubmit(onSubmitSignIn)}
                                style={styles.submitButton}
                                labelStyle={styles.submitButtonText}
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In with Email'}
                            </Button>
                            
                            <TouchableOpacity style={styles.authButton} onPress={() => {}}>
                                <Ionicons name="logo-google" size={24} color={Colors.white} />
                                <Text style={styles.authButtonText}>Sign In with Google</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.switchAuthButton} onPress={onSwitchToSignUp}>
                                <Text style={styles.switchAuthText}>
                                    Don&apos;t have an account? <Text style={styles.switchAuthLink}>Sign Up</Text>
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
        height: '60%',
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
        letterSpacing: 1,
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
    subtitle: {
        fontSize: 16,
        color: Colors.grey,
        textAlign: 'center',
        marginBottom: 15,
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
        backgroundColor: Colors.primary,
        borderRadius: 12,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 8,
        color: Colors.white,
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green',
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

export default SignIn;
