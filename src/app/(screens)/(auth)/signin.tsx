import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { forwardRef, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';
import GoogleIcon from '@/components/ui/GoogleIcon';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SignInProps {
    onClose: () => void;
    onSwitchToSignUp: () => void;
    onSwitchToForgotPassword: () => void;
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = forwardRef<BottomSheetModal, SignInProps>((
    { onClose, onSwitchToSignUp, onSwitchToForgotPassword }, 
    ref
) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { bottom } = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['60%', '85%'], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmitSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        throw new Error(error.message || 'Failed to sign in. Please try again.');
      }
      showSuccessToast('Successfully signed in!', 'Welcome Back');
      onClose();
      reset();
    } catch (err: any) {
      showErrorToast(err.message, 'Sign In Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetModal
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onDismiss={onClose}
        backgroundStyle={styles.modalContainer}
        handleIndicatorStyle={{ backgroundColor: Colors.lightgrey }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetScrollView 
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: bottom > 0 ? bottom + 12 : 24 }}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <View style={styles.formContainer}>
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
                    theme={{
                        roundness: 12,
                        colors: { primary: Colors.primary, background: Colors.white },
                    }}
                    />
                )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

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
                    theme={{
                        roundness: 12,
                        colors: { primary: Colors.primary, background: Colors.white },
                    }}
                    right={
                        <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                        />
                    }
                    />
                )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                <Pressable
                onPress={onSwitchToForgotPassword}
                style={styles.forgotPasswordButton}
                >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
            </View>

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmitSignIn)}
                style={[styles.submitButton, { backgroundColor: Colors.primary }]}
                labelStyle={styles.submitButtonText}
                loading={isLoading}
                disabled={isLoading}
                icon="email-outline"
                contentStyle={styles.submitButtonContent}
            >
                {isLoading ? 'Signing In...' : 'Sign In with Email'}
            </Button>

            <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
            </View>

            <Pressable style={({ pressed }) => [styles.authButton, { opacity: pressed ? 0.7 : 1 }]} onPress={() => {}}>
                <View style={styles.authButtonIconContainer}>
                <GoogleIcon size={24} />
                </View>
                <Text style={styles.authButtonText}>Sign In with Google</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.switchAuthButton, { opacity: pressed ? 0.7 : 1 }]} onPress={onSwitchToSignUp}>
                <Text style={styles.switchAuthText}>
                Don&apos;t have an account? <Text style={styles.switchAuthLink}>Sign Up</Text>
                </Text>
            </Pressable>

            <View style={styles.legalLinksContainer}>
                <Pressable onPress={() => console.log('Navigate to Terms of Service')}>
                <Text style={styles.legalLink}>Terms</Text>
                </Pressable>
                <Text style={styles.legalDivider}>|</Text>
                <Pressable onPress={() => console.log('Navigate to Privacy Policy')}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
                </Pressable>
            </View>
        </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

SignIn.displayName = 'SignIn';

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContent: {
        padding: 20,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.grey,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        marginVertical: 10,
    },
    textInput: {
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 12,
        marginBottom: 8,
        marginLeft: 16,
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 16,
        borderRadius: 12,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 8,
        color: Colors.white,
    },
    submitButtonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingRight: 16,
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginBottom: 16,
        position: 'relative',
        borderWidth: 1,
        borderColor: Colors.black,
    },
    authButtonIconContainer: {
        position: 'absolute',
        left: 16,
    },
    authButtonText: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: '600',
    },
    switchAuthButton: {
        marginTop: 16,
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
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: -5,
        marginBottom: 10,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    legalLinksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        paddingBottom: 20,
    },
    legalLink: {
        fontSize: 12,
        color: Colors.grey,
        textDecorationLine: 'underline',
    },
    legalDivider: {
        fontSize: 12,
        color: Colors.grey,
        marginHorizontal: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.lightgrey,
    },
    dividerText: {
        width: 130,
        textAlign: 'center',
        fontSize: 12,
        color: Colors.grey,
    },
});

export default SignIn;