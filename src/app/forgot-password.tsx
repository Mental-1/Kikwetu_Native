import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';


const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const { error } = await resetPassword(data.email);

      if (error) {
        showErrorToast(error.message || 'Failed to send reset email', 'Error');
      } else {
        showSuccessToast(
          'If an account exists with this email, you will receive a password reset link shortly.',
          'Email Sent'
        );
        reset();
        // Go back after successful request
        setTimeout(() => router.back(), 2000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showErrorToast('An unexpected error occurred', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />

          {/* Header */}
          <SafeAreaView style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={styles.headerRight} />
          </SafeAreaView>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={64} color={Colors.primary} />
              </View>

              <Text style={styles.title}>Reset Your Password</Text>
              <Text style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>

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
                      outlineColor={Colors.lightgrey}
                      activeOutlineColor={Colors.lightgrey}
                      theme={{
                        colors: {
                          primary: Colors.primary,
                          placeholder: Colors.black,
                          text: Colors.black,
                          outline: Colors.lightgrey,
                        },
                      }}
                      left={<TextInput.Icon icon="email" />}
                    />
                  )}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.submitButton}
                  labelStyle={styles.buttonLabel}
                >
                  Send Reset Link
                </Button>

                {/* Back to Sign In */}
                <TouchableOpacity style={styles.backToSignIn} onPress={() => router.back()}>
                  <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                  <Text style={styles.backToSignInText}>Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.lightgrey,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
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
