import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handlePostListing = () => {
    router.push('/(screens)/post-ad/step1');
  };

  const handleMyListings = () => {
    router.push('/(screens)/(dashboard)/mylistings');
  };

  const handleSavedItems = () => {
    router.push('/(screens)/(dashboard)/saved');
  };

  const handleMessages = () => {
    router.push('/(screens)/(dashboard)/conversations');
  };

  const handleSettings = () => {
    router.push('/(screens)/(settings)');
  };

  const handleTransactions = () => {
    router.push('/(screens)/(dashboard)/transactions');
  };

  const handlePlansBilling = () => {
    router.push('/(screens)/(dashboard)/plans-billing');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
          </Text>
          <Text style={styles.welcomeSubtitle}>Manage your listings and account</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="eye-outline" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard} onPress={handlePostListing}>
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="add-circle-outline" size={24} color="#1976D2" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Post New Listing</Text>
                <Text style={styles.actionSubtitle}>Create a new listing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleMyListings}>
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="list-outline" size={24} color="#7B1FA2" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Listings</Text>
                <Text style={styles.actionSubtitle}>Manage your listings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleSavedItems}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="heart-outline" size={24} color="#C62828" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Saved Items</Text>
                <Text style={styles.actionSubtitle}>Your favorite listings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleMessages}>
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="chatbubble-outline" size={24} color="#2E7D32" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Messages</Text>
                <Text style={styles.actionSubtitle}>Chat with buyers and sellers</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handlePlansBilling}>
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="card-outline" size={24} color="#4CAF50" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Plans & Billing</Text>
                <Text style={styles.actionSubtitle}>Manage subscription & billing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} onPress={handleTransactions}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="receipt-outline" size={24} color="#EF6C00" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Transactions</Text>
                <Text style={styles.actionSubtitle}>View payment history</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="eye" size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New view on iPhone 14 Pro</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New message from buyer</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="heart" size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>MacBook Air M2 was favorited</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.grey,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 0.6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.grey,
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  activityList: {
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.grey,
  },
});

export default Dashboard;
