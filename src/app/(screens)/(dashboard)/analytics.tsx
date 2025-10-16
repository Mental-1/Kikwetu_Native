import PremiumFeatureModal from '@/components/PremiumFeatureModal';
import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/src/constants/constant';
import { useDashboardAnalytics, useListingAnalytics } from '@/src/hooks/useApiAnalytics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Fetch from API, fallback to mock for development
const mockAnalyticsData = {
  listingPerformance: [
    { month: 'Jan', views: 120, saves: 15, inquiries: 8 },
    { month: 'Feb', views: 180, saves: 22, inquiries: 12 },
    { month: 'Mar', views: 250, saves: 35, inquiries: 18 },
    { month: 'Apr', views: 320, saves: 42, inquiries: 25 },
    { month: 'May', views: 280, saves: 38, inquiries: 22 },
    { month: 'Jun', views: 350, saves: 48, inquiries: 28 },
  ],
  listingStatusDistribution: [
    { x: 'Active', y: 12 },
    { x: 'Pending', y: 3 },
    { x: 'Sold', y: 8 },
    { x: 'Expired', y: 2 },
  ],
  revenueData: [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 25000 },
    { month: 'Apr', revenue: 45000 },
    { month: 'May', revenue: 32000 },
    { month: 'Jun', revenue: 58000 },
  ],
  topListings: [
    { id: '1', title: 'iPhone 13 Pro Max', views: 245, saves: 18, ctr: 7.3 },
    { id: '2', title: 'MacBook Pro 2023', views: 189, saves: 15, ctr: 7.9 },
    { id: '3', title: 'Samsung Galaxy S23', views: 167, saves: 12, ctr: 7.2 },
    { id: '4', title: 'iPad Air 5th Gen', views: 134, saves: 8, ctr: 6.0 },
  ],
  summaryStats: {
    totalListings: 25,
    totalViews: 2840,
    totalSaves: 367,
    totalRevenue: 160000,
    conversionRate: 7.3,
  }
};

export default function Analytics() {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch analytics from API
  const { data: dashboardData, isLoading, refetch } = useDashboardAnalytics();
  const { data: listingData } = useListingAnalytics();

  // Use API data if available, otherwise fallback to mock
  const analyticsData = dashboardData || mockAnalyticsData;

  // Mock premium status - in real app, this would come from user's subscription
  const isPremium = false;

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = async () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePremiumModalClose = () => {
    setShowPremiumModal(false);
  };


  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderSummaryCards = () => (
    <View style={styles.summarySection}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="list-outline" size={20} color="#1976D2" />
          </View>
          <Text style={styles.summaryValue}>{mockAnalyticsData.summaryStats.totalListings}</Text>
          <Text style={styles.summaryLabel}>Total Listings</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="eye-outline" size={20} color="#EF6C00" />
          </View>
          <Text style={styles.summaryValue}>{formatNumber(mockAnalyticsData.summaryStats.totalViews)}</Text>
          <Text style={styles.summaryLabel}>Total Views</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="heart-outline" size={20} color="#C62828" />
          </View>
          <Text style={styles.summaryValue}>{mockAnalyticsData.summaryStats.totalSaves}</Text>
          <Text style={styles.summaryLabel}>Total Saves</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#FF9800" />
          </View>
          <Text style={styles.summaryValue}>{mockAnalyticsData.summaryStats.conversionRate}%</Text>
          <Text style={styles.summaryLabel}>Click Through Rate</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E8' }]}>
            <Ionicons name="cash-outline" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.summaryValue}>4.2</Text>
          <Text style={styles.summaryLabel}>Return on Ad Spend</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceChart = () => {
    const barData = mockAnalyticsData.listingPerformance.map((item, index) => ({
      value: item.views,
      label: item.month,
      frontColor: Colors.primary,
      gradientColor: Colors.primary,
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: { color: Colors.black, fontSize: 10 },
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Listing Performance (Views)</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={barData}
            width={width - 40}
            height={220}
            barWidth={22}
            noOfSections={4}
            barBorderRadius={4}
            frontColor={Colors.primary}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: Colors.grey, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: Colors.black, fontSize: 10 }}
            isAnimated
            animationDuration={1000}
            showGradient
            gradientColor={Colors.primary}
          />
        </View>
      </View>
    );
  };

  const renderStatusDistribution = () => {
    const pieData = mockAnalyticsData.listingStatusDistribution.map((item, index) => ({
      value: item.y,
      color: [Colors.primary, '#FFA726', '#4CAF50', '#F44336'][index],
      text: `${item.y}`,
      textColor: Colors.white,
      textSize: 12,
    }));

    const legendData = mockAnalyticsData.listingStatusDistribution.map((item, index) => ({
      name: item.x,
      color: [Colors.primary, '#FFA726', '#4CAF50', '#F44336'][index],
      text: item.x,
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Listing Status Distribution</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            radius={80}
            innerRadius={40}
            showText
            textColor={Colors.white}
            textSize={12}
            showTextBackground
            textBackgroundRadius={12}
            showValuesAsLabels
            labelsPosition="outward"
            showGradient
            gradientCenterColor={Colors.white}
            backgroundColor={Colors.white}
            centerLabelComponent={() => (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.black }}>
                {mockAnalyticsData.listingStatusDistribution.reduce((sum, item) => sum + item.y, 0)}
              </Text>
            )}
          />
          <View style={styles.legendContainer}>
            {legendData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderRevenueChart = () => {
    const lineData = mockAnalyticsData.revenueData.map((item, index) => ({
      value: item.revenue / 1000, // Convert to thousands
      label: item.month,
      dataPointText: `${Math.round(item.revenue / 1000)}K`,
      hideDataPoint: false,
      dataPointTextShiftY: -20, // Move text above the data point
      dataPointTextShiftX: 0,
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Trend (KES 000s)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={lineData}
            width={width - 40}
            height={240}
            color={Colors.primary}
            thickness={3}
            dataPointsColor={Colors.primary}
            dataPointsRadius={6}
            dataPointsWidth={6}
            hideDataPoints={false}
            showReferenceLine1
            referenceLine1Position={40}
            referenceLine1Config={{
              color: '#4CAF50',
              dashWidth: 2,
              dashGap: 3,
            }}
            yAxisColor={Colors.grey}
            xAxisColor={Colors.grey}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: Colors.grey, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: Colors.black, fontSize: 10 }}
            areaChart
            startFillColor={Colors.primary}
            startOpacity={0.1}
            endFillColor={Colors.primary}
            endOpacity={0.1}
            curved
            isAnimated
            animationDuration={1000}
            noOfSections={4}
          />
        </View>
      </View>
    );
  };

  const renderTopListings = () => (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Top Performing Listings</Text>
      <View style={styles.topListingsContainer}>
        {mockAnalyticsData.topListings.map((listing, index) => (
          <View key={listing.id} style={styles.topListingItem}>
            <View style={styles.rankingBadge}>
              <Text style={styles.rankingNumber}>{index + 1}</Text>
            </View>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {listing.title}
              </Text>
              <View style={styles.listingStats}>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={14} color={Colors.grey} />
                  <Text style={styles.statText}>{listing.views}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="heart-outline" size={14} color={Colors.grey} />
                  <Text style={styles.statText}>{listing.saves}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={14} color={Colors.grey} />
                  <Text style={styles.statText}>{listing.ctr}%</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="download-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="share-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['7d', '30d', '90d', '1y'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}
              >
                {period.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Premium Overlay for Non-Premium Users */}
        {!isPremium && (
          <View style={styles.premiumOverlay}>
            <View style={styles.premiumBanner}>
              <Ionicons name="diamond" size={24} color={Colors.primary} />
              <Text style={styles.premiumBannerText}>
                Upgrade to Premium to unlock full analytics
              </Text>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => setShowPremiumModal(true)}
              >
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Performance Chart */}
        {renderPerformanceChart()}

        {/* Status Distribution */}
        {renderStatusDistribution()}

        {/* Revenue Chart */}
        {renderRevenueChart()}

        {/* Top Listings */}
        {renderTopListings()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Premium Feature Modal */}
      <PremiumFeatureModal
        visible={showPremiumModal}
        onClose={handlePremiumModalClose}
        featureName="Advanced Analytics"
        featureDescription="Unlock detailed insights into your listing performance, revenue trends, and optimization opportunities with our premium analytics dashboard."
        benefits={[
          'Real-time performance metrics',
          'Revenue tracking and trends',
          'Listing optimization insights',
          'Advanced filtering and export options',
          'Historical data analysis',
          'Competitive benchmarking'
        ]}
      />
    </SafeAreaView>
  );
}

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
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey,
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  summarySection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
  },
  chartSection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topListingsContainer: {
    gap: 12,
  },
  topListingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  listingStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.black,
    fontWeight: '500',
  },
  premiumOverlay: {
    backgroundColor: Colors.white,
    padding: 16,
    marginBottom: 8,
  },
  premiumBanner: {
    backgroundColor: 'rgba(3, 65, 252, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBannerText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
