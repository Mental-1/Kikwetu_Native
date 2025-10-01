import { Colors } from '@/src/constants/constant';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ListingCardSkeleton from './ListingCardSkeleton';

interface ListingsSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

const ListingsSkeleton: React.FC<ListingsSkeletonProps> = ({ 
  viewMode = 'grid', 
  count = 6 
}) => {
  const skeletonData = Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
  }));

  const renderSkeletonItem = () => (
    <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
      <ListingCardSkeleton viewMode={viewMode} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={
          viewMode === 'grid' 
            ? styles.gridContainer 
            : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gridContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 16,
  },
  listContainer: {
    paddingTop: 16,
  },
  gridItem: {
    width: '50%',
    paddingRight: 8,
    paddingLeft: 8,
  },
  listItem: {
    paddingHorizontal: 0,
  },
});

export default ListingsSkeleton;
