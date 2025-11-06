import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StoreCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  products: number;
  rating: number;
  followers: number;
  established: string;
  onPress: (storeId: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({
  id,
  name,
  description,
  image,
  category,
  products,
  rating,
  followers,
  established,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.storeItem} onPress={() => onPress(id)}>
      <Image source={{ uri: image }} style={styles.storeImage} />
      <View style={styles.storeContent}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{name}</Text>
          <View style={styles.storeCategory}>
            <Text style={styles.storeCategoryText}>{category}</Text>
          </View>
        </View>
        <Text style={styles.storeDescription} numberOfLines={2}>{description}</Text>
        <View style={styles.storeStats}>
          <View style={styles.storeStatItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.storeStatText}>{rating.toFixed(1)}</Text>
          </View>
          <View style={styles.storeStatItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.grey} />
            <Text style={styles.storeStatText}>{products} products</Text>
          </View>
          <View style={styles.storeStatItem}>
            <Ionicons name="people-outline" size={14} color={Colors.grey} />
            <Text style={styles.storeStatText}>{followers}</Text>
          </View>
        </View>
        <View style={styles.storeFooter}>
          <Text style={styles.storeEstablished}>Est. {established}</Text>
          <TouchableOpacity style={styles.storeFollowButton}>
            <Ionicons name="add" size={14} color={Colors.primary} />
            <Text style={styles.storeFollowText}>Follow Store</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  storeItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  storeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
    marginRight: 8,
  },
  storeCategory: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  storeDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 12,
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeStatText: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeEstablished: {
    fontSize: 12,
    color: Colors.grey,
    fontStyle: 'italic',
  },
  storeFollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  storeFollowText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default StoreCard;
