import CustomDialog from '@/components/ui/CustomDialog';
import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import {
  formatCardNumber,
  formatCVV,
  formatExpiryDate,
  formatPhoneNumber,
  paymentMethodValidationSchema,
  validateCardNumber,
  validateCVV,
  validateExpiryDate
} from '@/utils/validationSchemas';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  icon: string;
  brand?: string;
}

const PaymentMethods = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success, error } = createAlertHelpers(showAlert);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'bank' | 'mobile',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: '',
    mobileProvider: '',
    phoneNumber: '',
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'John Doe',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
      isActive: true,
      icon: 'card',
      brand: 'visa',
    },
    {
      id: '2',
      type: 'card',
      name: 'John Doe',
      lastFour: '5555',
      expiryDate: '08/26',
      isDefault: false,
      isActive: true,
      icon: 'card',
      brand: 'mastercard',
    },
    {
      id: '3',
      type: 'bank',
      name: 'Chase Bank',
      lastFour: '7890',
      isDefault: false,
      isActive: true,
      icon: 'business',
    },
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleAddPaymentMethod = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewPaymentMethod({
      type: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      bankName: '',
      accountNumber: '',
      mobileProvider: '',
      phoneNumber: '',
    });
  };

  const handleSavePaymentMethod = () => {
    try {
      // Validate the payment method using zod schema
      const validatedData = paymentMethodValidationSchema.parse(newPaymentMethod);
      
      // Additional custom validations
      if (newPaymentMethod.type === 'card') {
        if (!validateCardNumber(newPaymentMethod.cardNumber)) {
          error('Error', 'Please enter a valid 16-digit card number');
          return;
        }
        if (!validateExpiryDate(newPaymentMethod.expiryDate)) {
          error('Error', 'Please enter a valid expiry date (MM/YY format)');
          return;
        }
        if (!validateCVV(newPaymentMethod.cvv, newPaymentMethod.cardNumber)) {
          error('Error', 'Please enter a valid CVV (3-4 digits)');
          return;
        }
      }

      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: validatedData.type,
        name: validatedData.type === 'card' ? validatedData.cardholderName : 
              validatedData.type === 'bank' ? validatedData.bankName : 
              validatedData.mobileProvider,
        lastFour: validatedData.type === 'card' ? validatedData.cardNumber.replace(/\s/g, '').slice(-4) :
                  validatedData.type === 'bank' ? validatedData.accountNumber.slice(-4) :
                  validatedData.phoneNumber.slice(-4),
        expiryDate: validatedData.type === 'card' ? validatedData.expiryDate : undefined,
        isDefault: paymentMethods.length === 0,
        isActive: true,
        icon: validatedData.type === 'card' ? 'card' : 
              validatedData.type === 'bank' ? 'business' : 'phone-portrait',
        brand: validatedData.type === 'card' ? (validatedData.cardNumber.startsWith('4') ? 'visa' : 'mastercard') : undefined,
      };

      setPaymentMethods(prev => [...prev, newMethod]);
      success('Success', 'Payment method added successfully');
      handleCloseModal();
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const firstError = validationError.issues[0];
        error('Validation Error', firstError.message);
      } else {
        error('Error', 'Please check your input and try again');
      }
    }
  };

  const handleSetDefault = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    setPaymentMethods(prev => prev.map(paymentMethod => ({
      ...paymentMethod,
      isDefault: paymentMethod.id === id
    })));
    success('Success', `${method?.name || 'Payment method'} set as default`);
  };

  const handleToggleActive = (id: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, isActive: !method.isActive } : method
    ));
    const method = paymentMethods.find(m => m.id === id);
    success('Success', `Payment method ${method?.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethodToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (paymentMethodToDelete) {
      setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethodToDelete));
      success('Success', 'Payment method deleted successfully');
    }
    setShowDeleteDialog(false);
    setPaymentMethodToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setPaymentMethodToDelete(null);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return method.brand === 'visa' ? 'card-outline' : 'card-outline';
    } else if (method.type === 'bank') {
      return 'business-outline';
    } else {
      return 'phone-portrait-outline';
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return method.brand === 'visa' ? '#1A1F71' : '#EB001B';
    } else if (method.type === 'bank') {
      return '#1976D2';
    } else {
      return '#4CAF50';
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodInfo}>
          <View style={[styles.paymentIcon, { backgroundColor: getPaymentMethodColor(method) + '20' }]}>
            <Ionicons 
              name={getPaymentMethodIcon(method)} 
              size={24} 
              color={getPaymentMethodColor(method)} 
            />
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentName}>{method.name}</Text>
            <Text style={styles.paymentNumber}>
              {method.type === 'card' ? `**** **** **** ${method.lastFour}` :
               method.type === 'bank' ? `**** **** **** ${method.lastFour}` :
               `+*** *** ${method.lastFour}`}
            </Text>
            {method.expiryDate && (
              <Text style={styles.paymentExpiry}>Expires {method.expiryDate}</Text>
            )}
          </View>
        </View>
        <View style={styles.paymentActions}>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          <TouchableOpacity 
            style={[styles.statusToggle, { backgroundColor: method.isActive ? '#4CAF50' : '#F44336' }]}
            onPress={() => handleToggleActive(method.id)}
          >
            <Text style={styles.statusText}>{method.isActive ? 'Active' : 'Inactive'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.paymentMethodActions}>
        {!method.isDefault && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Ionicons name="star-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeletePaymentMethod(method.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#F44336" />
          <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPaymentMethod}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={Colors.grey} />
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddPaymentMethod}>
              <Text style={styles.emptyButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {paymentMethods.map(renderPaymentMethod)}
          </>
        )}

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={handleSavePaymentMethod}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Payment Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Type</Text>
                <View style={styles.paymentTypeSelector}>
                  <TouchableOpacity
                    style={[styles.paymentTypeButton, newPaymentMethod.type === 'card' && styles.selectedPaymentType]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'card' }))}
                  >
                    <Ionicons name="card-outline" size={20} color={newPaymentMethod.type === 'card' ? Colors.primary : Colors.grey} />
                    <Text style={[styles.paymentTypeText, newPaymentMethod.type === 'card' && styles.selectedPaymentTypeText]}>Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentTypeButton, newPaymentMethod.type === 'bank' && styles.selectedPaymentType]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'bank' }))}
                  >
                    <Ionicons name="business-outline" size={20} color={newPaymentMethod.type === 'bank' ? Colors.primary : Colors.grey} />
                    <Text style={[styles.paymentTypeText, newPaymentMethod.type === 'bank' && styles.selectedPaymentTypeText]}>Bank</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentTypeButton, newPaymentMethod.type === 'mobile' && styles.selectedPaymentType]}
                    onPress={() => setNewPaymentMethod(prev => ({ ...prev, type: 'mobile' }))}
                  >
                    <Ionicons name="phone-portrait-outline" size={20} color={newPaymentMethod.type === 'mobile' ? Colors.primary : Colors.grey} />
                    <Text style={[styles.paymentTypeText, newPaymentMethod.type === 'mobile' && styles.selectedPaymentTypeText]}>Mobile</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card Fields */}
              {newPaymentMethod.type === 'card' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Card Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.cardNumber}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: formatCardNumber(text) }))}
                      placeholder="1234 5678 9012 3456"
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.inputLabel}>Expiry Date</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newPaymentMethod.expiryDate}
                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, expiryDate: formatExpiryDate(text) }))}
                        placeholder="MM/YY"
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newPaymentMethod.cvv}
                        onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cvv: formatCVV(text) }))}
                        placeholder="123"
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cardholder Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.cardholderName}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: text }))}
                      placeholder="John Doe"
                      autoCapitalize="words"
                    />
                  </View>
                </>
              )}

              {/* Bank Fields */}
              {newPaymentMethod.type === 'bank' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bank Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.bankName}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, bankName: text }))}
                      placeholder="Chase Bank"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Account Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.accountNumber}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, accountNumber: text }))}
                      placeholder="1234567890"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              {/* Mobile Fields */}
              {newPaymentMethod.type === 'mobile' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Mobile Provider</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.mobileProvider}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, mobileProvider: text }))}
                      placeholder="M-Pesa, Airtel Money, etc."
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPaymentMethod.phoneNumber}
                      onChangeText={(text) => setNewPaymentMethod(prev => ({ ...prev, phoneNumber: formatPhoneNumber(text) }))}
                      placeholder="+254 700 000 000"
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Custom Alert Component */}
      <AlertComponent />
      
      {/* Delete Confirmation Dialog */}
      <CustomDialog
        visible={showDeleteDialog}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone and the payment method will be permanently removed."
        confirmText="Delete"
        denyText="Cancel"
        onConfirm={handleConfirmDelete}
        onDeny={handleCancelDelete}
        icon="trash"
        iconColor="#F44336"
        confirmColor="#F44336"
        denyColor="#8E8E93"
        confirmWeight="600"
        denyWeight="400"
      />
    </View>
  );
};

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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  paymentNumber: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 2,
  },
  paymentExpiry: {
    fontSize: 12,
    color: Colors.grey,
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  defaultText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.black,
    backgroundColor: Colors.white,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  selectedPaymentType: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  paymentTypeText: {
    fontSize: 14,
    color: Colors.grey,
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedPaymentTypeText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});

export default PaymentMethods;
