import { categoryIcons, Colors } from '@/src/constants/constant';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryItemProps {
  id: number;
  name: string;
  isLoading: boolean;
  onPress: (id: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 32;
const ITEMS_PER_ROW = 4;
const ITEM_SPACING = 8;

const CATEGORY_ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - (ITEM_SPACING * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;
const CATEGORY_ICON_SIZE = Math.min(CATEGORY_ITEM_WIDTH * 0.75, 65);

const getCategoryIcon = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return categoryIcons[key] || categoryIcons.default;
};

const CategoryItem = memo(({
  id,
  name,
  isLoading,
  onPress
}: CategoryItemProps) => {
  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        isLoading && styles.categoryItemLoading
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessible={true}
      accessibilityLabel={`${name} category`}
      accessibilityHint="Opens category"
      accessibilityState={{ busy: isLoading, disabled: isLoading }}
    >
      <View style={styles.categoryIconContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Image
            source={getCategoryIcon(name)}
            style={styles.categoryIcon}
            resizeMode="cover"
          />
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>
        {name}
      </Text>
    </TouchableOpacity>
  );
});

CategoryItem.displayName = 'CategoryItem';

const styles = StyleSheet.create({
  categoryItem: {
    width: CATEGORY_ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIconContainer: {
    width: CATEGORY_ICON_SIZE,
    height: CATEGORY_ICON_SIZE,
    borderRadius: CATEGORY_ICON_SIZE / 2,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  categoryIcon: {
    width: CATEGORY_ICON_SIZE,
    height: CATEGORY_ICON_SIZE,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.black,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryItemLoading: {
    opacity: 0.7,
  },
});

export default CategoryItem;