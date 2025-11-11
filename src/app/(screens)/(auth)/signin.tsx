import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';
import GoogleIcon from '@/components/ui/GoogleIcon';

interface SignInProps {
    visible: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>({
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
        console.error('signIn failed:', error);
        showErrorToast('Failed to sign in. Please try again.', 'Sign In Error');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                  >
                    <Text style={styles.subtitle}>Sign in to your account</Text>

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

                      <TouchableOpacity
                        onPress={() => console.log('Navigate to Forgot Password')}
                        style={styles.forgotPasswordButton}
                      >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    </View>

                    <Button
                      mode="contained"
                      onPress={handleSubmit(onSubmitSignIn)}
                      style={styles.submitButton}
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

                    <TouchableOpacity style={styles.authButton} onPress={() => {}}>
                      <View style={styles.authButtonIconContainer}>
                        <GoogleIcon size={24} />
                      </View>
                      <Text style={styles.authButtonText}>Sign In with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.switchAuthButton} onPress={onSwitchToSignUp}>
                      <Text style={styles.switchAuthText}>
                        Don&apos;t have an account? <Text style={styles.switchAuthLink}>Sign Up</Text>
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.legalLinksContainer}>
                      <TouchableOpacity onPress={() => console.log('Navigate to Terms of Service')}>
                        <Text style={styles.legalLink}>Terms</Text>
                      </TouchableOpacity>
                      <Text style={styles.legalDivider}>|</Text>
                      <TouchableOpacity onPress={() => console.log('Navigate to Privacy Policy')}>
                        <Text style={styles.legalLink}>Privacy Policy</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
        marginBottom: 8,
        borderRadius: 12,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 8,
        color: Colors.white,
    },
    submitButtonContent: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        paddingLeft: 16,
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
    },
    authButtonIconContainer: {
        position: 'absolute',
        left: 16,
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
        marginTop: 20,
        paddingBottom: 10,
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
        marginVertical: 20,
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
