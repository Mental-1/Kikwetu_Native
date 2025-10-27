import PremiumFeatureModal from '@/components/PremiumFeatureModal';
import { Colors } from '@/src/constants/constant';
import { useDashboardAnalytics, useListingAnalytics } from '@/src/hooks/useApiAnalytics';
import { useSubscriptions } from '@/src/hooks/useSubscriptions';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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

export default function Analytics() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useDashboardAnalytics();
  const { data: listingData, isLoading: listingLoading } = useListingAnalytics();
  
  const { currentSubscription } = useSubscriptions();

  const analyticsData = dashboardData;
  
  const combinedAnalytics = {
    ...analyticsData,
    listingAnalytics: listingData,
  };

  const isPremium = currentSubscription?.status === 'active' && 
                   (currentSubscription?.planName?.toLowerCase().includes('premium') || 
                    currentSubscription?.planName?.toLowerCase().includes('pro'));

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

  const PremiumSection = ({ children, style }: { children: React.ReactNode; style?: any }) => {
    if (isPremium) {
      return <View style={style}>{children}</View>;
    }

    return (
      <View style={[style, { position: 'relative' }]}>
        <View style={{ opacity: 0.3 }}>
          {children}
        </View>
        <BlurView
          intensity={20}
          style={styles.blurOverlay}
        >
          <TouchableOpacity 
            style={styles.premiumOverlayContent}
            onPress={() => setShowPremiumModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="diamond" size={32} color={Colors.primary} />
            <Text style={styles.premiumOverlayTitle}>Premium Feature</Text>
            <Text style={styles.premiumOverlaySubtitle}>
              Upgrade to unlock this analytics feature
            </Text>
            <TouchableOpacity 
              style={styles.premiumUpgradeButton}
              onPress={() => setShowPremiumModal(true)}
            >
              <Text style={styles.premiumUpgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
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
          <Text style={styles.summaryValue}>{(combinedAnalytics as any)?.stats?.totalListings || (combinedAnalytics as any)?.listingAnalytics?.totalListings || 0}</Text>
          <Text style={styles.summaryLabel}>Total Listings</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="eye-outline" size={20} color="#EF6C00" />
          </View>
          <Text style={styles.summaryValue}>{formatNumber((combinedAnalytics as any)?.stats?.totalViews || (combinedAnalytics as any)?.listingAnalytics?.totalViews || 0)}</Text>
          <Text style={styles.summaryLabel}>Total Views</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="heart-outline" size={20} color="#C62828" />
          </View>
          <Text style={styles.summaryValue}>{(analyticsData as any)?.summaryStats?.totalSaves || 0}</Text>
          <Text style={styles.summaryLabel}>Total Saves</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#FF9800" />
          </View>
          <Text style={styles.summaryValue}>{(analyticsData as any)?.summaryStats?.conversionRate || 0}%</Text>
          <Text style={styles.summaryLabel}>Click Through Rate</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E8' }]}>
            <Ionicons name="cash-outline" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.summaryValue}>{(analyticsData as any)?.summaryStats?.totalRevenue ? formatNumber((analyticsData as any).summaryStats.totalRevenue) : '0'}</Text>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#9C27B0" />
          </View>
          <Text style={styles.summaryValue}>{Math.round((combinedAnalytics as any)?.listingAnalytics?.averageViews || 0)}</Text>
          <Text style={styles.summaryLabel}>Avg Views/Listing</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceChart = () => {
    const performanceData = (analyticsData as any)?.listingPerformance || [];
    const barData = performanceData.map((item: any, index: number) => ({
      value: item.views || 0,
      label: item.month || `Month ${index + 1}`,
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
          {barData.length > 0 ? (
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
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No performance data available</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderStatusDistribution = () => {
    const statusData = (analyticsData as any)?.listingStatusDistribution || [];
    const pieData = statusData.map((item: any, index: number) => ({
      value: item.y || 0,
      color: [Colors.primary, '#FFA726', '#4CAF50', '#F44336'][index % 4],
      text: `${item.y || 0}`,
      textColor: Colors.white,
      textSize: 12,
    }));

    const legendData = statusData.map((item: any, index: number) => ({
      name: item.x || `Status ${index + 1}`,
      color: [Colors.primary, '#FFA726', '#4CAF50', '#F44336'][index % 4],
      text: item.x || `Status ${index + 1}`,
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Listing Status Distribution</Text>
        <View style={styles.chartContainer}>
          {pieData.length > 0 ? (
            <>
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
                    {statusData.reduce((sum: number, item: any) => sum + (item.y || 0), 0)}
                  </Text>
                )}
              />
              <View style={styles.legendContainer}>
                {legendData.map((item: any, index: number) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No status data available</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRevenueChart = () => {
    const revenueData = (analyticsData as any)?.revenueData || [];
    const lineData = revenueData.map((item: any, index: number) => ({
      value: (item.revenue || 0) / 1000, // Convert to thousands
      label: item.month || `Month ${index + 1}`,
      dataPointText: `${Math.round((item.revenue || 0) / 1000)}K`,
      hideDataPoint: false,
      dataPointTextShiftY: -20, // Move text above the data
      dataPointTextShiftX: 0,
    }));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Trend (KES 000s)</Text>
        <View style={styles.chartContainer}>
          {lineData.length > 0 ? (
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
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No revenue data available</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTopListings = () => {
    const topListings = (analyticsData as any)?.topListings || [];
    
    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Top Performing Listings</Text>
        <View style={styles.topListingsContainer}>
          {topListings.length > 0 ? (
            topListings.map((listing: any, index: number) => (
              <View key={listing.id || index} style={styles.topListingItem}>
                <View style={styles.rankingBadge}>
                  <Text style={styles.rankingNumber}>{index + 1}</Text>
                </View>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {listing.title || `Listing ${index + 1}`}
                  </Text>
                  <View style={styles.listingStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="eye-outline" size={14} color={Colors.grey} />
                      <Text style={styles.statText}>{listing.views || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="heart-outline" size={14} color={Colors.grey} />
                      <Text style={styles.statText}>{listing.saves || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="trending-up-outline" size={14} color={Colors.grey} />
                      <Text style={styles.statText}>{listing.ctr || 0}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No top listings data available</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        {/* Loading State */}
        {(isLoading || listingLoading) && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && !listingLoading && (!analyticsData || !listingData) && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.red} />
            <Text style={styles.errorTitle}>Failed to Load Analytics</Text>
            <Text style={styles.errorText}>
              Unable to fetch analytics data. Please try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content - Only show if not loading and data exists */}
        {!isLoading && !listingLoading && analyticsData && listingData && (
          <>
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
            <PremiumSection style={styles.chartSection}>
              {renderPerformanceChart()}
            </PremiumSection>

            {/* Status Distribution */}
            <PremiumSection style={styles.chartSection}>
              {renderStatusDistribution()}
            </PremiumSection>

            {/* Revenue Chart */}
            <PremiumSection style={styles.chartSection}>
              {renderRevenueChart()}
            </PremiumSection>

            {/* Top Listings */}
            <PremiumSection style={styles.chartSection}>
              {renderTopListings()}
            </PremiumSection>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </>
        )}
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
    paddingTop: 16,
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
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumOverlayContent: {
    alignItems: 'center',
    padding: 20,
  },
  premiumOverlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 12,
    marginBottom: 8,
  },
  premiumOverlaySubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  premiumUpgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  premiumUpgradeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
