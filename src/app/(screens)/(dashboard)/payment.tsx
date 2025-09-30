import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get plan data from navigation parameters
  const selectedPlan: SubscriptionPlan = {
    id: params.planId as string || 'basic',
    name: params.planName as string || 'Basic',
    price: params.price as string || 'KES 1,200',
    period: params.period as string || 'month',
    billingCycle: (params.billingCycle as 'monthly' | 'annual') || 'monthly'
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'John Doe',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
      icon: 'card-outline',
      brand: 'visa'
    },
    {
      id: '2',
      type: 'card',
      name: 'John Doe',
      lastFour: '5555',
      expiryDate: '08/26',
      isDefault: false,
      icon: 'card-outline',
      brand: 'mastercard'
    },
    {
      id: '3',
      type: 'bank',
      name: 'Chase Bank',
      lastFour: '7890',
      isDefault: false,
      icon: 'business-outline'
    }
  ];

  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];

  const handleBack = () => {
    router.back();
  };

  const handleChangePaymentMethod = () => {
    router.push('/(screens)/(settings)/payment_methods');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    // Simulate payment processing
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(false);
      showAlert({
        title: 'Payment Successful!',
        message: `Your ${selectedPlan.name} plan has been activated successfully. You will be charged ${selectedPlan.price}/${selectedPlan.period}.`,
        buttonText: 'Continue',
        icon: 'checkmark-circle',
        iconColor: '#4CAF50',
        buttonColor: '#4CAF50',
        onPress: () => {
          success('Success', 'Welcome to your new plan!');
          router.back(); // Go back to plans screen
        }
      });
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

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
          <Text style={styles.paymentNumber}>
            {method.type === 'card' ? `**** **** **** ${method.lastFour}` :
             method.type === 'bank' ? `**** **** **** ${method.lastFour}` :
             `+*** *** ${method.lastFour}`}
          </Text>
          {method.expiryDate && (
            <Text style={styles.paymentExpiry}>Expires {method.expiryDate}</Text>
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
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
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
  bottomPadding: {
    height: 24,
  },
});

export default Payment;
