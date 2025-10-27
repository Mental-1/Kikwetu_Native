import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryItemProps {
  id: number;
  name: string;
  icon?: string;
  isLoading?: boolean;
  onPress: (id: number) => void;
  getIconFromEmoji: (emoji: string) => string;
}

const CategoryItem = memo(({ 
  id, 
  name, 
  icon, 
  isLoading, 
  onPress, 
  getIconFromEmoji 
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
    >
      <View style={styles.categoryIconContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons 
            name={getIconFromEmoji(icon || "") as any} 
            size={24} 
            color={Colors.primary} 
          />
        )}
      </View>
      <Text style={styles.categoryName}>{name}</Text>
    </TouchableOpacity>
  );
});

CategoryItem.displayName = 'CategoryItem';

const styles = StyleSheet.create({
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
