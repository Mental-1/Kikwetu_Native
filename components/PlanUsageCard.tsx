import { Colors } from '@/src/constants/constant';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PlanUsageCardProps {
  usedListings: number;
  maxListings: number;
  planName: string;
}

const PlanUsageCard: React.FC<PlanUsageCardProps> = ({
  usedListings,
  maxListings,
  planName,
}) => {
  const usagePercentage = (usedListings / maxListings) * 100;
  const isFull = usedListings >= maxListings;
  const progressColor = isFull ? Colors.red : Colors.green;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Listings on {planName} Plan</Text>
        <Text style={styles.count}>
          {usedListings} / {maxListings}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(usagePercentage, 100)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.subtitle}>
        {isFull
          ? 'You have reached your listing limit'
          : `${maxListings - usedListings} listings remaining`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.lightgrey,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grey,
  },
});

export default PlanUsageCard;
