import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { useChangeEmail } from '@/src/hooks/useProfile';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { z } from 'zod';

// Form validation schema
const changeEmailSchema = z.object({
    newEmail: z.string().email('Please enter a valid email address'),
    currentPassword: z.string().min(1, 'Current password is required'),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

interface ChangeEmailModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);
  const changeEmailMutation = useChangeEmail();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: '',
    },
  });

  const onSubmitChangeEmail = async (data: ChangeEmailFormData) => {
    if (data.newEmail === user?.email) {
      error('Error', 'New email must be different from your current email.');
      return;
    }

    try {
      setIsLoading(true);
      await changeEmailMutation.mutateAsync({
        newEmail: data.newEmail,
        currentPassword: data.currentPassword,
      });

      success(
        'Email Change Requested',
        'A verification email has been sent to your new email address. Please check your inbox and follow the instructions to complete the email change.'
      );
      onClose();
      reset();
    } catch (err: any) {
      console.error('Error changing email:', err);
      error('Error', err.message || 'Failed to change email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.title}>Change Email</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.description}>
              Enter your new email address and current password to change your email.
            </Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="newEmail"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="New Email Address"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={!!errors.newEmail}
                    style={styles.input}
                    outlineColor={Colors.lightgrey}
                    activeOutlineColor={Colors.primary}
                  />
                )}
              />
              {errors.newEmail && (
                <Text style={styles.errorText}>{errors.newEmail.message}</Text>
              )}

              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Current Password"
                    mode="outlined"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoCapitalize="none"
                    error={!!errors.currentPassword}
                    style={styles.input}
                    outlineColor={Colors.lightgrey}
                    activeOutlineColor={Colors.primary}
                  />
                )}
              />
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword.message}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmitChangeEmail)}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                buttonColor={Colors.primary}
                textColor={Colors.white}
              >
                Change Email
              </Button>
            </View>
          </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '65%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: Colors.white,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 16,
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
});

export default ChangeEmailModal;
