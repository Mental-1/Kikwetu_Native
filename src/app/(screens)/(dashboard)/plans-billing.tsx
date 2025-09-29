import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  color: string;
  icon: string;
  annualDiscount?: string;
}

interface BillingTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'one-time' | 'refund';
}

const PlansBilling = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 'KES 0',
      annualPrice: 'KES 0',
      period: 'forever',
      features: [
        'Up to 5 listings',
        'Basic search',
        'Community support',
        'Mobile app access'
      ],
      color: '#6B7280',
      icon: 'person-outline',
      isCurrent: true
    },
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 'KES 1,200',
      annualPrice: 'KES 12,000',
      period: 'month',
      features: [
        'Up to 50 listings',
        'Advanced search filters',
        'Priority support',
        'Analytics dashboard',
        'Email notifications'
      ],
      color: '#3B82F6',
      icon: 'star-outline',
      isPopular: true,
      annualDiscount: 'Save 17%'
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 'KES 2,400',
      annualPrice: 'KES 24,000',
      period: 'month',
      features: [
        'Unlimited listings',
        'Premium search filters',
        '24/7 phone support',
        'Advanced analytics',
        'Custom branding',
        'API access'
      ],
      color: '#8B5CF6',
      icon: 'diamond-outline',
      annualDiscount: 'Save 17%'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      annualPrice: 'Custom',
      period: 'contact',
      features: [
        'Everything in Premium',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        'SLA guarantee',
        'On-premise deployment'
      ],
      color: '#F59E0B',
      icon: 'business-outline'
    }
  ];

  const billingHistory: BillingTransaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Premium Plan - Monthly',
      amount: 'KES 2,400',
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '2',
      date: '2023-12-15',
      description: 'Premium Plan - Monthly',
      amount: 'KES 2,400',
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '3',
      date: '2023-11-15',
      description: 'Premium Plan - Monthly',
      amount: 'KES 2,400',
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '4',
      date: '2023-10-15',
      description: 'Basic Plan - Monthly',
      amount: 'KES 1,200',
      status: 'completed',
      type: 'subscription'
    },
    {
      id: '5',
      date: '2023-09-20',
      description: 'Premium Upgrade',
      amount: 'KES 1,200',
      status: 'completed',
      type: 'one-time'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan?.id === 'enterprise') {
      showAlert({
        title: 'Enterprise Plan',
        message: 'Contact our sales team for custom pricing and features.',
        buttonText: 'Contact Sales',
        icon: 'business-outline',
        iconColor: Colors.primary,
        buttonColor: Colors.primary,
        onPress: () => {
          success('Success', 'Our sales team will contact you within 24 hours');
        }
      });
    } else if (plan?.id === 'free') {
      success('Free Plan', 'You are already on the free plan!');
    } else {
      showAlert({
        title: 'Proceed to Payment',
        message: `You've selected the ${plan?.name} plan (${billingCycle}). Proceed to complete your payment?`,
        buttonText: 'Continue',
        icon: 'card-outline',
        iconColor: Colors.primary,
        buttonColor: Colors.primary,
        onPress: () => {
          if (!plan) return;
          router.push({
            pathname: '/(screens)/(dashboard)/payment',
            params: {
              planId: plan.id,
              planName: plan.name,
              price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice,
              period: billingCycle === 'monthly' ? plan.period : 'year',
              billingCycle: billingCycle
            }
          });
        }
      });
    }
  };

  const handleViewAllTransactions = () => {
    showAlert({
      title: 'View All Transactions',
      message: 'Full transaction history will be displayed here',
      buttonText: 'OK',
      icon: 'list-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Full transaction history will be implemented');
      }
    });
  };

  const handleDownloadInvoice = (transactionId: string) => {
    showAlert({
      title: 'Download Invoice',
      message: 'Invoice will be downloaded to your device',
      buttonText: 'Download',
      icon: 'download-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
      onPress: () => {
        success('Success', 'Invoice downloaded successfully');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return Colors.grey;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'failed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlan,
        plan.isPopular && styles.popularPlan
      ]}
      onPress={() => handleSelectPlan(plan.id)}
    >
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      {plan.isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentText}>Current Plan</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
          <Ionicons name={plan.icon as any} size={24} color={plan.color} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>
              {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
            </Text>
            <Text style={styles.planPeriod}>
              /{billingCycle === 'monthly' ? plan.period : 'year'}
            </Text>
          </View>
          {plan.annualDiscount && billingCycle === 'annual' && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{plan.annualDiscount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color={Colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {selectedPlan === plan.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
          <Ionicons name="checkmark" size={20} color={Colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTransaction = (transaction: BillingTransaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>{transaction.amount}</Text>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(transaction.status)} 
              size={16} 
              color={getStatusColor(transaction.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.downloadButton}
        onPress={() => handleDownloadInvoice(transaction.id)}
      >
        <Ionicons name="download-outline" size={16} color={Colors.primary} />
        <Text style={styles.downloadText}>Download Invoice</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Plans & Billing</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => success('Help', 'Support information will be available here')}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Plan</Text>
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanInfo}>
              <View style={[styles.currentPlanIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="person-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.currentPlanDetails}>
                <Text style={styles.currentPlanName}>Free Plan</Text>
                <Text style={styles.currentPlanStatus}>Active since Jan 2024</Text>
              </View>
            </View>
            <View style={styles.usageInfo}>
              <Text style={styles.usageText}>3 of 5 listings used</Text>
              <View style={styles.usageBar}>
                <View style={[styles.usageProgress, { width: '60%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Subscription Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionSubtitle}>Upgrade to unlock more features and capabilities</Text>
          
          {/* Billing Cycle Toggle */}
          <View style={styles.billingToggleContainer}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.billingToggleLabel}>Monthly</Text>
                <Text style={styles.billingToggleSubLabel}>Billed monthly</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.simpleToggle,
                  billingCycle === 'annual' && styles.simpleToggleActive
                ]}
                onPress={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              >
                <View style={[
                  styles.toggleThumb,
                  billingCycle === 'annual' && styles.toggleThumbActive
                ]} />
              </TouchableOpacity>
              <View style={styles.toggleLabelContainer}>
                <Text style={styles.billingToggleLabel}>Annual</Text>
                <Text style={styles.billingToggleSubLabel}>Save 17%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.plansContainer}>
            {subscriptionPlans.map(renderPlanCard)}
          </View>
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <View style={styles.billingHeader}>
            <Text style={styles.sectionTitle}>Billing History</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsContainer}>
            {billingHistory.slice(0, 3).map(renderTransaction)}
          </View>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
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
  helpButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 16,
  },
  billingToggleContainer: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  billingToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  billingToggleSubLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  simpleToggle: {
    width: 52,
    height: 28,
    backgroundColor: Colors.lightgrey,
    borderRadius: 14,
    padding: 2,
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  simpleToggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  currentPlanCard: {
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
  currentPlanInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentPlanDetails: {
    flex: 1,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  currentPlanStatus: {
    fontSize: 14,
    color: Colors.grey,
  },
  usageInfo: {
    marginTop: 8,
  },
  usageText: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 8,
  },
  usageBar: {
    height: 6,
    backgroundColor: Colors.lightgrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
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
    position: 'relative',
  },
  selectedPlan: {
    borderColor: Colors.primary,
    elevation: 3,
  },
  popularPlan: {
    borderColor: '#FF9800',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 16,
    color: Colors.grey,
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 8,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionsContainer: {
    gap: 12,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.grey,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
  },
  downloadText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 24,
  },
});

export default PlansBilling;
