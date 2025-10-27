import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { useInitializePaystackPayment, useInitiateMpesaPayment, usePaymentMethods, usePaymentStatus } from '@/src/hooks/useApiPayments';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  icon: string;
  brand?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  billingCycle: 'monthly' | 'annual';
}

const Payment = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mpesa');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | null>(null);

  const selectedPlan: SubscriptionPlan = {
    id: params.planId as string || 'basic',
    name: params.planName as string || 'Basic',
    price: params.price as string || 'KES 1,200',
    period: params.period as string || 'month',
    billingCycle: (params.billingCycle as 'monthly' | 'annual') || 'monthly'
  };

  const { data: paymentMethodsData, isLoading: methodsLoading } = usePaymentMethods();
  const initiateMpesa = useInitiateMpesaPayment();
  const initializePaystack = useInitializePaystackPayment();
  
  const { data: paymentStatusData, isLoading: statusLoading } = usePaymentStatus(currentTransactionId || '');

  const paymentMethods: PaymentMethod[] = (paymentMethodsData || []).map(pm => ({
    id: pm.id,
    type: pm.type,
    name: pm.name,
    lastFour: pm.lastFour,
    expiryDate: pm.expiryDate,
    isDefault: pm.isDefault,
    icon: pm.type === 'card' ? 'card-outline' : pm.type === 'bank' ? 'business-outline' : 'phone-portrait-outline',
    brand: 'visa',
  }));

  const allPaymentOptions = [
    {
      id: 'mpesa',
      type: 'mobile' as const,
      name: 'M-Pesa',
      lastFour: '',
      isDefault: false,
      icon: 'phone-portrait-outline',
    },
    {
      id: 'paystack',
      type: 'card' as const,
      name: 'Paystack',
      lastFour: '',
      isDefault: false,
      icon: 'card-outline',
    },
    ...paymentMethods,
  ];


  const handleBack = () => {
    router.back();
  };

  const handleChangePaymentMethod = () => {
    router.push('/(screens)/(settings)/payment_methods');
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    try {
      const amount = parseFloat(selectedPlan.price.replace(/[^\d.-]/g, ''));

      if (selectedPaymentMethod === 'mpesa') {
        if (!phoneNumber) {
          showAlert({
            title: 'Phone Number Required',
            message: 'Please enter your M-Pesa phone number',
            buttonText: 'OK',
            icon: 'alert-circle-outline',
            iconColor: '#FF9800',
            buttonColor: Colors.primary,
          });
          setIsProcessing(false);
          return;
        }

        const result = await initiateMpesa.mutateAsync({
          amount,
          phoneNumber: phoneNumber.replace(/\s/g, ''),
        });

        if (result.transactionId) {
          setCurrentTransactionId(result.transactionId);
          setPaymentStatus('pending');
        }

        showAlert({
          title: 'Payment Initiated',
          message: result.message || 'Please check your phone and enter your M-Pesa PIN to complete the payment.',
          buttonText: 'OK',
          icon: 'checkmark-circle',
          iconColor: '#4CAF50',
          buttonColor: '#4CAF50',
          onPress: () => {
            if (!result.transactionId) {
              router.back();
            }
          }
        });
      } else if (selectedPaymentMethod === 'paystack') {
        // Paystack Payment
        const result = await initializePaystack.mutateAsync({
          amount,
          email: user?.email || '',
        });

        if (result.transactionId) {
          setCurrentTransactionId(result.transactionId);
          setPaymentStatus('pending');
        }

        if (result.authorization_url) {
          await Linking.openURL(result.authorization_url);
          
          showAlert({
            title: 'Redirecting to Paystack',
            message: 'Complete your payment on the Paystack page that just opened.',
            buttonText: 'OK',
            icon: 'card-outline',
            iconColor: Colors.primary,
            buttonColor: Colors.primary,
            onPress: () => {
              if (!result.transactionId) {
                router.back();
              }
            }
          });
        }
      } else {
        showAlert({
          title: 'Payment Successful!',
          message: `Your ${selectedPlan.name} plan has been activated successfully. You will be charged ${selectedPlan.price}/${selectedPlan.period}.`,
          buttonText: 'Continue',
          icon: 'checkmark-circle',
          iconColor: '#4CAF50',
          buttonColor: '#4CAF50',
          onPress: () => {
            success('Success', 'Welcome to your new plan!');
            router.back();
          }
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const navigateToConfirmation = useCallback((status: 'completed' | 'failed') => {
    router.push({
      pathname: '/(screens)/(dashboard)/payment-confirmation',
      params: {
        transactionId: currentTransactionId,
        amount: selectedPlan.price,
        currency: 'KES',
        planName: selectedPlan.name,
        billingCycle: selectedPlan.billingCycle,
        paymentMethod: selectedPaymentMethod === 'mpesa' ? 'M-Pesa' : 
                     selectedPaymentMethod === 'paystack' ? 'Paystack' : 'Card',
        status,
        processedAt: paymentStatusData?.processedAt,
        failureReason: paymentStatusData?.failureReason,
      }
    });
    setIsProcessing(false);
    setCurrentTransactionId(null);
    setPaymentStatus(null);
  }, [router, currentTransactionId, selectedPlan.price, selectedPlan.name, selectedPlan.billingCycle, selectedPaymentMethod, paymentStatusData?.processedAt, paymentStatusData?.failureReason]);

  useEffect(() => {
    if (paymentStatusData && currentTransactionId) {
      setPaymentStatus(paymentStatusData.status);
      
      if (paymentStatusData.status === 'completed') {
        navigateToConfirmation('completed');
      } else if (paymentStatusData.status === 'failed') {
        navigateToConfirmation('failed');
      }
    }
  }, [paymentStatusData, currentTransactionId, navigateToConfirmation]);


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

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => setSelectedPaymentMethod(method.id)}
    >
      <View style={styles.paymentMethodHeader}>
        <View style={[styles.paymentIcon, { backgroundColor: getPaymentMethodColor(method) + '20' }]}>
          <Ionicons 
            name={getPaymentMethodIcon(method)} 
            size={24} 
            color={getPaymentMethodColor(method)} 
          />
        </View>
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentName}>{method.name}</Text>
          {method.lastFour && (
            <Text style={styles.paymentNumber}>
              {method.type === 'card' ? `**** **** **** ${method.lastFour}` :
               method.type === 'bank' ? `**** **** **** ${method.lastFour}` :
               `+*** *** ${method.lastFour}`}
            </Text>
          )}
          {method.expiryDate && (
            <Text style={styles.paymentExpiry}>Expires {method.expiryDate}</Text>
          )}
          {method.id === 'mpesa' && (
            <Text style={styles.paymentDescription}>Pay with your M-Pesa account</Text>
          )}
          {method.id === 'paystack' && (
            <Text style={styles.paymentDescription}>Pay with card via Paystack</Text>
          )}
        </View>
        <View style={styles.paymentMethodActions}>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === method.id && styles.selectedRadioButton
          ]}>
            {selectedPaymentMethod === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.headerRight} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummaryCard}>
            <View style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>{selectedPlan.name} Plan</Text>
                <Text style={styles.orderDescription}>
                  {selectedPlan.billingCycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
                </Text>
              </View>
              <Text style={styles.orderPrice}>{selectedPlan.price}</Text>
            </View>
            <View style={styles.orderDivider} />
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{selectedPlan.price}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity onPress={handleChangePaymentMethod}>
              <Text style={styles.changeButton}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {methodsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading payment methods...</Text>
            </View>
          ) : (
            <View style={styles.paymentMethodsContainer}>
              {allPaymentOptions.map(renderPaymentMethod)}
            </View>
          )}

          {/* M-Pesa Phone Number Input */}
          {selectedPaymentMethod === 'mpesa' && (
            <View style={styles.phoneInputContainer}>
              <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
              <View style={styles.phoneInput}>
                <Ionicons name="call-outline" size={20} color={Colors.grey} />
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors.grey}
                />
              </View>
            </View>
          )}
        </View>

        {/* Payment Terms */}
        <View style={styles.section}>
          <View style={styles.termsCard}>
            <View style={styles.termsItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
              <Text style={styles.termsText}>Secure payment processing</Text>
            </View>
            <View style={styles.termsItem}>
              <Ionicons name="refresh-outline" size={20} color="#4CAF50" />
              <Text style={styles.termsText}>
                Cancel anytime • No long-term contracts
              </Text>
            </View>
            <View style={styles.termsItem}>
              <Ionicons name="card-outline" size={20} color="#4CAF50" />
              <Text style={styles.termsText}>
                {selectedPlan.billingCycle === 'annual' 
                  ? 'Billed annually • Next charge in 12 months'
                  : 'Billed monthly • Next charge in 30 days'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Payment Status Indicator */}
      {currentTransactionId && paymentStatus && (
        <View style={styles.paymentStatusContainer}>
          <View style={styles.paymentStatusCard}>
            <View style={styles.paymentStatusHeader}>
              <Ionicons 
                name={paymentStatus === 'completed' ? 'checkmark-circle' : 
                      paymentStatus === 'failed' ? 'close-circle' : 
                      'time-outline'} 
                size={24} 
                color={paymentStatus === 'completed' ? '#4CAF50' : 
                       paymentStatus === 'failed' ? '#F44336' : 
                       Colors.primary} 
              />
              <Text style={styles.paymentStatusTitle}>
                {paymentStatus === 'completed' ? 'Payment Completed' :
                 paymentStatus === 'failed' ? 'Payment Failed' :
                 paymentStatus === 'processing' ? 'Processing Payment' :
                 'Waiting for Payment'}
              </Text>
            </View>
            <Text style={styles.paymentStatusMessage}>
              {paymentStatus === 'completed' ? 'Your payment has been processed successfully.' :
               paymentStatus === 'failed' ? 'Your payment could not be processed. Please try again.' :
               paymentStatus === 'processing' ? 'Your payment is being processed. Please wait...' :
               'Please complete your payment to continue.'}
            </Text>
            {statusLoading && (
              <View style={styles.statusLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.statusLoadingText}>Checking status...</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Payment Button */}
      <View style={styles.paymentFooter}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handleProcessPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Ionicons name="refresh" size={20} color={Colors.white} />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.payButtonContainer}>
              <Text style={styles.payButtonText}>Pay {selectedPlan.price}</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.paymentDisclaimer}>
          By completing this payment, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
      
      {/* Custom Alert Component */}
      <AlertComponent />
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
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  changeButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  orderSummaryCard: {
    backgroundColor: Colors.white,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  orderDescription: {
    fontSize: 14,
    color: Colors.grey,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.lightgrey,
    marginVertical: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodCard: {
    backgroundColor: Colors.white,
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paymentMethodActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  termsCard: {
    backgroundColor: Colors.white,
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
  termsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: Colors.grey,
    marginLeft: 12,
    flex: 1,
  },
  paymentFooter: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.2,
    borderTopColor: Colors.lightgrey,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payButtonDisabled: {
    backgroundColor: Colors.lightgrey,
  },
  payButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentDisclaimer: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 16,
  },
  paymentStatusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  paymentStatusCard: {
    backgroundColor: Colors.white,
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
  paymentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginLeft: 12,
  },
  paymentStatusMessage: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
  },
  statusLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLoadingText: {
    fontSize: 12,
    color: Colors.grey,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.grey,
  },
  phoneInputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  phoneTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.black,
  },
  paymentDescription: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 4,
  },
});

export default Payment;
