import { Colors } from '@/src/constants/constant';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface ListingCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const SkeletonBox = ({ style }: { style: any }) => (
    <Animated.View style={[styles.skeletonBox, style, shimmerStyle]} />
  );

  if (viewMode === 'list') {
    return (
      <View style={styles.listCard}>
        {/* Image skeleton */}
        <SkeletonBox style={styles.listImageContainer} />
        
        {/* Content skeleton */}
        <View style={styles.listContent}>
          {/* Title and favorite button row */}
          <View style={styles.listTitleRow}>
            <SkeletonBox style={styles.listTitleSkeleton} />
            <SkeletonBox style={styles.favoriteButtonSkeleton} />
          </View>

          {/* Price skeleton */}
          <SkeletonBox style={styles.listPriceSkeleton} />

          {/* Description skeleton */}
          <SkeletonBox style={styles.listDescriptionSkeleton} />

          {/* Footer skeleton */}
          <View style={styles.listFooter}>
            <SkeletonBox style={styles.listLocationSkeleton} />
            <SkeletonBox style={styles.listViewsSkeleton} />
          </View>
        </View>
      </View>
    );
  }

  // Grid view skeleton
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <SkeletonBox style={styles.imageContainer} />
      
      {/* Content skeleton */}
      <View style={styles.content}>
        {/* Title skeleton */}
        <SkeletonBox style={styles.titleSkeleton} />

        {/* Price skeleton */}
        <SkeletonBox style={styles.priceSkeleton} />

        {/* Description skeleton */}
        <SkeletonBox style={styles.descriptionSkeleton} />

        {/* Condition tag skeleton */}
        <SkeletonBox style={styles.conditionTagSkeleton} />

        {/* Footer skeleton */}
        <View style={styles.footer}>
          <SkeletonBox style={styles.locationSkeleton} />
          <SkeletonBox style={styles.viewsSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Grid view styles
  card: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    backgroundColor: Colors.lightgrey,
  },
  content: {
    padding: 12,
  },
  titleSkeleton: {
    height: 16,
    marginBottom: 4,
    borderRadius: 4,
  },
  priceSkeleton: {
    height: 18,
    width: '60%',
    marginBottom: 4,
    borderRadius: 4,
  },
  descriptionSkeleton: {
    height: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  conditionTagSkeleton: {
    height: 20,
    width: 60,
    marginBottom: 8,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationSkeleton: {
    height: 12,
    width: '70%',
    borderRadius: 4,
  },
  viewsSkeleton: {
    height: 12,
    width: 30,
    borderRadius: 4,
  },

  // List view styles
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listImageContainer: {
    width: 120,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  listContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listTitleSkeleton: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  favoriteButtonSkeleton: {
    height: 18,
    width: 18,
    borderRadius: 9,
  },
  listPriceSkeleton: {
    height: 18,
    width: '50%',
    marginBottom: 6,
    borderRadius: 4,
  },
  listDescriptionSkeleton: {
    height: 12,
    width: '90%',
    marginBottom: 8,
    borderRadius: 4,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listLocationSkeleton: {
    height: 12,
    width: '60%',
    borderRadius: 4,
  },
  listViewsSkeleton: {
    height: 12,
    width: 30,
    borderRadius: 4,
  },

  // Common skeleton styles
  skeletonBox: {
    backgroundColor: Colors.lightgrey,
  },
});

export default ListingCardSkeleton;
