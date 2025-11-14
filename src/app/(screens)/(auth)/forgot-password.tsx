import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { forwardRef, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { TextInput } from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ForgotPasswordProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen = forwardRef<BottomSheetModal, ForgotPasswordProps>((
    { onClose, onSwitchToSignIn }, 
    ref
) => {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { bottom } = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['60%', '85%'], []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        throw new Error(error.message || 'Failed to send reset email');
      }
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        onSwitchToSignIn();
        resetForm();
      }, 2000);
    } catch (err: any) {
      showErrorToast(err.message || 'An unexpected error occurred', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setIsSuccess(false);
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
            contentContainerStyle={{ paddingBottom: bottom > 0 ? bottom + 12 : 24, flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

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
                    left={<TextInput.Icon icon="email" />}
                    />
                )}
                />
                {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
                )}

                <Pressable
                style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: isSuccess ? Colors.green : Colors.primary },
                    { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading || isSuccess}
                >
                {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : isSuccess ? (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                ) : (
                    <Text style={styles.buttonLabel}>Send Reset Link</Text>
                )}
                </Pressable>

                <Pressable
                style={({ pressed }) => [styles.backToSignIn, { opacity: pressed ? 0.7 : 1 }]}
                onPress={onSwitchToSignIn}
                >
                <Ionicons
                    name="arrow-back"
                    size={16}
                    color={Colors.primary}
                />
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
                </Pressable>
            </View>
        </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

ForgotPasswordScreen.displayName = 'ForgotPasswordScreen';

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.black,
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: Colors.grey,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    formContainer: {
        gap: 16,
    },
    textInput: {
        backgroundColor: Colors.white,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: -8,
        marginLeft: 12,
    },
    submitButton: {
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 50,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    backToSignIn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    backToSignInText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;
