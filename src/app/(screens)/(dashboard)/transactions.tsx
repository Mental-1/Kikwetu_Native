import { Colors } from '@/src/constants/constant';
import { useDownloadReceipt, useExportTransactions, useTransactions } from '@/src/hooks/useApiTransactions';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'subscription' | 'one-time' | 'refund' | 'payout';
  category: 'plan' | 'listing' | 'feature' | 'refund' | 'withdrawal';
  paymentMethod: string;
  reference: string;
}


interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'subscription' | 'one-time' | 'refund' | 'payout';
  category: 'plan' | 'listing' | 'feature' | 'refund' | 'withdrawal';
  paymentMethod: string;
  reference: string;
}

const Transactions = () => {
  const router = useRouter();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success } = createAlertHelpers(showAlert);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch transactions from API
  const { data: transactionsData, isLoading, error: fetchError, refetch } = useTransactions(
    selectedFilter === 'all' ? undefined : selectedFilter
  );
  const downloadReceipt = useDownloadReceipt();
  const exportTransactions = useExportTransactions();

  // Transform API data to match UI
  const transactions: Transaction[] = useMemo(() => {
    if (!transactionsData || !Array.isArray(transactionsData)) {
      return [];
    }

    return transactionsData.map((t) => {
      // Defensive checks for all required fields
      const createdAt = t.created_at || t.date || new Date().toISOString();
      let dateStr: string;
      try {
        dateStr = new Date(createdAt).toLocaleDateString();
      } catch {
        dateStr = 'Invalid Date';
      }

      return {
        id: t.id || '',
        date: dateStr,
        description: t.description || t.title || 'Transaction',
        amount: typeof t.amount === 'number' ? t.amount : 0,
        currency: t.currency || 'KES',
        status: (t.status || 'pending') as 'completed' | 'pending' | 'failed' | 'refunded',
        type: (t.type || 'one-time') as 'subscription' | 'one-time' | 'refund' | 'payout',
        category: (t.category || 'plan') as 'plan' | 'listing' | 'feature' | 'refund' | 'withdrawal',
        paymentMethod: t.payment_method || t.paymentMethod || 'Unknown',
        reference: t.reference || t.id || '',
      };
    });
  }, [transactionsData]);

  const filterOptions = [
    { id: 'all', label: 'All', count: transactions.length },
    {
      id: 'completed',
      label: 'Completed',
      count: transactions.filter((t) => t.status === 'completed').length,
    },
    { id: 'pending', label: 'Pending', count: transactions.filter((t) => t.status === 'pending').length },
    { id: 'failed', label: 'Failed', count: transactions.filter((t) => t.status === 'failed').length },
    {
      id: 'refunded',
      label: 'Refunded',
      count: transactions.filter((t) => t.status === 'refunded').length,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleViewTransactionDetails = (transaction: Transaction) => {
    showAlert({
      title: 'Transaction Details',
      message: `${transaction.description}\n\nAmount: ${transaction.amount}\nDate: ${transaction.date}\nStatus: ${transaction.status}\nReference: ${transaction.reference}\nPayment Method: ${transaction.paymentMethod}`,
      buttons: [
        {
          text: 'OK',
          color: Colors.primary,
          onPress: () => {
            success('Success', 'Transaction details displayed');
          },
        },
      ],
      icon: 'receipt-outline',
      iconColor: Colors.primary,
    });
  };

  const handleDownloadReceipt = async (transaction: Transaction) => {
    try {
      await downloadReceipt.mutateAsync(transaction.id);
    } catch {
      // Error toast shown by mutation
    }
  };

  const handleExportTransactions = async () => {
    showAlert({
      title: 'Export Transactions',
      message: 'Choose export format',
      buttons: [
        {
          text: 'CSV',
          color: Colors.primary,
          onPress: async () => {
            try {
              await exportTransactions.mutateAsync('csv');
            } catch {
              // Error toast shown by mutation
            }
          },
        },
      ],
      icon: 'document-outline',
      iconColor: Colors.primary,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      case 'refunded':
        return '#9C27B0';
      default:
        return Colors.grey;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'failed':
        return 'close-circle';
      case 'refunded':
        return 'refresh-circle';
      default:
        return 'help-circle';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plan':
        return 'card-outline';
      case 'listing':
        return 'list-outline';
      case 'feature':
        return 'star-outline';
      case 'refund':
        return 'refresh-outline';
      case 'withdrawal':
        return 'arrow-up-outline';
      default:
        return 'receipt-outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plan':
        return '#3B82F6';
      case 'listing':
        return '#8B5CF6';
      case 'feature':
        return '#F59E0B';
      case 'refund':
        return '#9C27B0';
      case 'withdrawal':
        return '#10B981';
      default:
        return Colors.grey;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter = selectedFilter === 'all' || transaction.status === selectedFilter;
    const description = transaction.description || '';
    const reference = transaction.reference || '';
    const matchesSearch =
      !searchQuery ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reference.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterButton, selectedFilter === filter.id && styles.selectedFilter]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text
        style={[styles.filterText, selectedFilter === filter.id && styles.selectedFilterText]}
      >
        {filter.label} ({filter.count})
      </Text>
    </TouchableOpacity>
  );

  const truncateId = (id: string, maxLength: number = 12) => {
    if (id.length <= maxLength) {
      return id;
    }
    const start = id.substring(0, Math.ceil(maxLength / 2) - 1); 
    const end = id.substring(id.length - Math.floor(maxLength / 2) + 1);
    return `${start}...${end}`;
  };

  const renderTransaction = (transaction: Transaction) => {
    // Safety check - skip rendering if transaction is invalid
    if (!transaction || !transaction.id) {
      return null;
    }

    const category = transaction.category || 'plan';
    const status = transaction.status || 'pending';
    const description = transaction.description || 'Transaction';
    const date = transaction.date || '';
    const reference = transaction.reference || '';
    const currency = transaction.currency || 'KES';
    const amount = typeof transaction.amount === 'number' ? transaction.amount : 0;
    const type = transaction.type || 'one-time';

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionCard}
        onPress={() => handleViewTransactionDetails(transaction)}
      >
        <View style={styles.transactionHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) + '20' }]}>
            <Ionicons name={getCategoryIcon(category)} size={20} color={getCategoryColor(category)} />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{description}</Text>
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionDate}>{date}</Text>
              {reference && <Text style={styles.transactionReference}>• {truncateId(reference)}</Text>}
            </View>
          </View>
          <View style={styles.transactionAmount}>
            <Text
              style={[
                styles.amountText,
                type === 'refund' || type === 'payout' ? styles.refundAmount : null,
              ]}
            >
              {currency} {amount.toLocaleString()}
            </Text>
            <View style={styles.statusContainer}>
              <Ionicons name={getStatusIcon(status)} size={14} color={getStatusColor(status)} />
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDownloadReceipt(transaction)}>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>Receipt</Text>
          </TouchableOpacity>
          {status === 'pending' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => success('Info', 'Payment is being processed')}
            >
              <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
              <Text style={[styles.actionText, { color: '#FF9800' }]}>Track</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const totalAmount = filteredTransactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />

          {/* Header */}
          <SafeAreaView style={styles.header} edges={['top']}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transactions</Text>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportTransactions}>
              <Ionicons name="download-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </SafeAreaView>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Transactions</Text>
                <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>KES {totalAmount.toLocaleString()}</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={Colors.grey} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={Colors.grey}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={Colors.grey} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {filterOptions.map(renderFilterButton)}
              </ScrollView>
            </View>

            {/* Transactions List */}
            <View style={styles.transactionsSection}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading transactions...</Text>
                </View>
              ) : fetchError ? (
                <View style={styles.emptyState}>
                  <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
                  <Text style={styles.emptyTitle}>Failed to Load Transactions</Text>
                  <Text style={styles.emptySubtitle}>
                    Please check your connection and try again
                  </Text>
                  <TouchableOpacity style={styles.emptyButton} onPress={() => refetch()}>
                    <Text style={styles.emptyButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={64} color={Colors.grey} />
                  <Text style={styles.emptyTitle}>No Transactions Found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search terms' : 'No transactions match your current filter'}
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsContainer}>
                  {filteredTransactions
                    .filter((t) => t && t.id) // Filter out invalid transactions
                    .map(renderTransaction)
                    .filter(Boolean)}
                </View>
              )}
            </View>

            {/* Bottom padding for better scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Custom Alert Component */}
          <AlertComponent />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  exportButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.black,
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  selectedFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: Colors.white,
    fontWeight: '600',
  },
  transactionsSection: {
    paddingHorizontal: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  transactionReference: {
    fontSize: 12,
    color: Colors.grey,
    marginLeft: 4,
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
  refundAmount: {
    color: '#F44336',
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
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
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
  bottomPadding: {
    height: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 12,
  },
});

export default Transactions;
