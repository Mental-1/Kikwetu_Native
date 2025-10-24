import { Colors } from '@/src/constants/constant';
import { useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentConfirmationData {
  transactionId: string;
  amount: string;
  currency: string;
  planName: string;
  billingCycle: string;
  paymentMethod: string;
  status: 'completed' | 'failed' | 'processing';
  processedAt?: string;
  failureReason?: string;
}

const PaymentConfirmation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert, AlertComponent } = useCustomAlert();

  const confirmationData: PaymentConfirmationData = {
    transactionId: params.transactionId as string || '',
    amount: params.amount as string || 'KES 1,200',
    currency: params.currency as string || 'KES',
    planName: params.planName as string || 'Basic Plan',
    billingCycle: params.billingCycle as string || 'monthly',
    paymentMethod: params.paymentMethod as string || 'M-Pesa',
    status: (params.status as 'completed' | 'failed' | 'processing') || 'completed',
    processedAt: params.processedAt as string,
    failureReason: params.failureReason as string,
  };

  const handleContinue = useCallback(() => {
    router.replace('/(tabs)/home');
  }, [router]);

  useEffect(() => {
    if (confirmationData.status === 'completed') {
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [confirmationData.status, handleContinue]);

  const handleViewReceipt = () => {
    showAlert({
      title: 'Receipt',
      message: `Transaction ID: ${confirmationData.transactionId}\nAmount: ${confirmationData.amount}\nPlan: ${confirmationData.planName}\nPayment Method: ${confirmationData.paymentMethod}`,
      buttonText: 'OK',
      icon: 'receipt-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
    });
  };

  const handleRetryPayment = () => {
    router.back();
  };

  const getStatusIcon = () => {
    switch (confirmationData.status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'failed':
        return { name: 'close-circle', color: '#F44336' };
      case 'processing':
        return { name: 'time-outline', color: '#FF9800' };
      default:
        return { name: 'checkmark-circle', color: '#4CAF50' };
    }
  };

  const getStatusTitle = () => {
    switch (confirmationData.status) {
      case 'completed':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Payment Processing';
      default:
        return 'Payment Successful!';
    }
  };

  const getStatusMessage = () => {
    switch (confirmationData.status) {
      case 'completed':
        return `Your ${confirmationData.planName} subscription has been activated successfully.`;
      case 'failed':
        return confirmationData.failureReason || 'Your payment could not be processed. Please try again.';
      case 'processing':
        return 'Your payment is being processed. You will be notified once it\'s complete.';
      default:
        return `Your ${confirmationData.planName} subscription has been activated successfully.`;
    }
  };

  const statusIcon = getStatusIcon();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.content}>
        {/* Status Icon */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIcon, { backgroundColor: statusIcon.color + '20' }]}>
            <Ionicons 
              name={statusIcon.name as any} 
              size={64} 
              color={statusIcon.color} 
            />
          </View>
        </View>

        {/* Status Title */}
        <Text style={styles.statusTitle}>{getStatusTitle()}</Text>
        
        {/* Status Message */}
        <Text style={styles.statusMessage}>{getStatusMessage()}</Text>

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{confirmationData.transactionId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={styles.detailValue}>{confirmationData.amount}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>{confirmationData.planName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Billing Cycle</Text>
            <Text style={styles.detailValue}>{confirmationData.billingCycle}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{confirmationData.paymentMethod}</Text>
          </View>
          
          {confirmationData.processedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processed At</Text>
              <Text style={styles.detailValue}>
                {new Date(confirmationData.processedAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {confirmationData.status === 'completed' && (
            <>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleViewReceipt}
              >
                <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>View Receipt</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>Continue to App</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
          
          {confirmationData.status === 'failed' && (
            <>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleViewReceipt}
              >
                <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleRetryPayment}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
                <Ionicons name="refresh" size={20} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
          
          {confirmationData.status === 'processing' && (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>Continue to App</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Auto-dismiss notice for successful payments */}
        {confirmationData.status === 'completed' && (
          <Text style={styles.autoDismissText}>
            This screen will automatically close in a few seconds
          </Text>
        )}
      </SafeAreaView>
      
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.grey,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  autoDismissText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default PaymentConfirmation;
