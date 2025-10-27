import { Colors } from '@/src/constants/constant';
import { useCancelSubscription, useCurrentSubscription, useSubscriptionHistory, useSubscriptionPlans } from '@/src/hooks/useApiSubscriptions';
import { ApiSubscription, ApiSubscriptionPlan } from '@/src/types/api.types';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  annualPrice: number;
  duration: number;
  maxListings?: number;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  color: string;
  icon: string;
  annualDiscount?: string;
  createdAt: string;
  updatedAt: string;
  user_id?: string;
}

interface BillingTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'subscription' | 'one-time' | 'refund';
  invoiceUrl?: string;
  transaction_id?: string | null;
}

const PlansBilling = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const { data: plansData, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { data: currentSubscription, isLoading: subscriptionLoading } = useCurrentSubscription();
  const { data: historyData, isLoading: historyLoading, error: historyError } = useSubscriptionHistory();
  
  const cancelSubscriptionMutation = useCancelSubscription();

    const subscriptionPlans: SubscriptionPlan[] = useMemo(() => {
      return (plansData || []).map((plan: ApiSubscriptionPlan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        annualPrice: plan.price * 10,
        duration: plan.duration,
        maxListings: plan.max_listings,
        features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
        isPopular: plan.is_popular,
        isCurrent: currentSubscription?.plan_id === plan.id,
        color: plan.color,
        icon: plan.icon,
        annualDiscount: 'Save 17%', // This will need to be dynamic based on calculation
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
        user_id: plan.user_id,
      }));
    }, [plansData, currentSubscription]);
  const billingHistory: BillingTransaction[] = useMemo(() => {
    return (historyData || []).map((sub: ApiSubscription) => ({
      id: sub.id,
      date: new Date(sub.created_at).toLocaleDateString(),
      description: `${sub.billing_cycle} subscription - ${sub.plan_id}`,
      amount: `${sub.currency} ${sub.amount.toLocaleString()}`,
            status: sub.status === 'active' || sub.status === 'free' ? 'completed' :
                    sub.status === 'past_due' ? 'pending' :
                    'failed',      type: 'subscription' as const,
      invoiceUrl: undefined, // Will be implemented with real invoice service
      transaction_id: sub.transaction_id,
    }));
  }, [historyData]);

  

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
              price: billingCycle === 'monthly' ? plan.price : plan.annualPrice,
              period: billingCycle === 'monthly' ? 'month' : 'year',
              billingCycle: billingCycle
            }
          });
        }
      });
    }
  };

  const handleCancelSubscription = () => {
    if (!currentSubscription) return;
    
    const planName = subscriptionPlans.find(p => p.id === currentSubscription.plan_id)?.name || 'your subscription';
    
    showAlert({
      title: 'Cancel Subscription',
      message: `Are you sure you want to cancel your ${planName} subscription? You'll lose access to premium features at the end of your billing period.`,
      buttonText: 'Cancel Subscription',
      icon: 'warning-outline',
      iconColor: '#F44336',
      buttonColor: '#F44336',
      onPress: () => {
        cancelSubscriptionMutation.mutate(currentSubscription.id, {
          onSuccess: () => {
            success('Subscription Cancelled', 'Your subscription has been cancelled. You can reactivate it anytime.');
          },
          onError: (error: Error) => {
            showAlert({
              title: 'Cancellation Failed',
              message: error.message || 'Failed to cancel subscription. Please try again.',
              buttonText: 'OK',
              icon: 'close-circle',
              iconColor: '#F44336',
              buttonColor: '#F44336',
            });
          }
        });
      }
    });
  };

  const handleReactivateSubscription = () => {
    if (!currentSubscription) return;
    
    showAlert({
      title: 'Reactivate Subscription',
      message: `To reactivate your subscription, please select a new plan below.`,
      buttonText: 'OK',
      icon: 'refresh-outline',
      iconColor: Colors.primary,
      buttonColor: Colors.primary,
    });
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
    const transaction = billingHistory.find(t => t.id === transactionId);
    if (transaction?.invoiceUrl) {
      showAlert({
        title: 'Download Invoice',
        message: 'Opening invoice in your browser...',
        buttonText: 'OK',
        icon: 'download-outline',
        iconColor: Colors.primary,
        buttonColor: Colors.primary,
        onPress: () => {
          success('Success', 'Invoice opened in browser');
        }
      });
    } else {
      showAlert({
        title: 'Invoice Not Available',
        message: 'Invoice generation is not yet available for this transaction.',
        buttonText: 'OK',
        icon: 'information-circle-outline',
        iconColor: Colors.grey,
        buttonColor: Colors.grey,
      });
    }
  };

  const getStatusColor = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#F44336';
      default: return Colors.grey;
    }
  };

  const getStatusIcon = (status: 'completed' | 'pending' | 'failed') => {
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
              {billingCycle === 'monthly' ? plan.price : plan.annualPrice}
            </Text>
            <Text style={styles.planPeriod}>
              /{billingCycle === 'monthly' ? 'month' : 'year'}
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
          {subscriptionLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading subscription...</Text>
            </View>
          ) : currentSubscription ? (
            <View style={styles.currentPlanCard}>
              <View style={styles.currentPlanInfo}>
                <View style={[styles.currentPlanIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="person-outline" size={24} color={Colors.primary} />
                </View>
                <View style={styles.currentPlanDetails}>
                  <Text style={styles.currentPlanName}>
                    {subscriptionPlans.find(p => p.id === currentSubscription.plan_id)?.name || 'Unknown Plan'}
                  </Text>
                  <Text style={styles.currentPlanStatus}>
                    {currentSubscription.status === 'active' ? 'Active' :
                     currentSubscription.status === 'past_due' ? 'Past Due' :
                     currentSubscription.status === 'cancelled' ? 'Cancelled' :
                     currentSubscription.status === 'free' ? 'Free' :
                     'Inactive'}
                    {currentSubscription.start_date && ` since ${new Date(currentSubscription.start_date).toLocaleDateString()}`}
                  </Text>
                  {currentSubscription.next_billing_date && (
                    <Text style={styles.nextBillingText}>
                      Next billing: {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Subscription Management Actions */}
              <View style={styles.subscriptionActions}>
                {(currentSubscription.status === 'active' || currentSubscription.status === 'free') && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                    <Text style={styles.cancelButtonText}>
                      {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {(currentSubscription.status === 'cancelled' || currentSubscription.status === 'inactive') && (
                  <TouchableOpacity 
                    style={styles.reactivateButton}
                    onPress={handleReactivateSubscription}
                  >
                    <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                    <Text style={styles.reactivateButtonText}>
                      Select New Plan
                    </Text>
                  </TouchableOpacity>
                )}
                
                {currentSubscription.status === 'past_due' && (
                  <TouchableOpacity 
                    style={styles.paymentButton}
                    onPress={() => router.push('/(screens)/(dashboard)/payment')}
                  >
                    <Ionicons name="card-outline" size={16} color={Colors.white} />
                    <Text style={styles.paymentButtonText}>Update Payment Method</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={Colors.grey} />
              <Text style={styles.emptyStateText}>No active subscription</Text>
              <Text style={styles.emptyStateSubtext}>Choose a plan below to get started</Text>
            </View>
          )}
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
            {plansLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : plansError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.grey} />
                <Text style={styles.errorText}>Failed to load plans</Text>
                <Text style={styles.errorSubtext}>Please try again later</Text>
              </View>
            ) : (
              subscriptionPlans.map(renderPlanCard)
            )}
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
            {historyLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : historyError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={32} color={Colors.grey} />
                <Text style={styles.errorText}>Failed to load history</Text>
              </View>
            ) : billingHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="receipt-outline" size={32} color={Colors.grey} />
                <Text style={styles.emptyHistoryText}>No billing history yet</Text>
              </View>
            ) : (
              billingHistory.slice(0, 3).map(renderTransaction)
            )}
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 12,
  },
  emptyHistory: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: Colors.grey,
  },
  nextBillingText: {
    fontSize: 12,
    color: Colors.grey,
    marginTop: 2,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 12,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
  },
  subscriptionActions: {
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
    marginLeft: 8,
  },
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  reactivateButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  paymentButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default PlansBilling;
