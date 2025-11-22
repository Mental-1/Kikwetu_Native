import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  currentSortBy: string;
  onSortChange: (sortBy: string) => void;
}

const DEFAULT_SORT = 'newest';

const sortOptions = [
  { value: DEFAULT_SORT, label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

const SortModal: React.FC<SortModalProps> = (
  { visible, onClose, currentSortBy, onSortChange },
) => {
  const [tempSortBy, setTempSortBy] = useState(currentSortBy);

  const handleApply = () => {
    onSortChange(tempSortBy);
    onClose();
  };

  const handleReset = () => {
    setTempSortBy(DEFAULT_SORT);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={['50%']} enableDynamicSizing={false}>
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="close" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.modalTitle}>Sort By</Text>
          <Pressable onPress={handleReset} style={({ pressed }) => [styles.resetButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        {/* Sort Options */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sortOptionsContainer}
        >
          {sortOptions.map((option) => (
            <Pressable
              key={option.value}
              style={styles.radioButtonContainer}
              onPress={() => setTempSortBy(option.value)}
            >
              <View style={[styles.radioButton, tempSortBy === option.value && styles.radioButtonSelected]}>
                {tempSortBy === option.value && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={styles.radioButtonLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.applyButtonContainer}>
          <Pressable style={({ pressed }) => [styles.applyButton, { opacity: pressed ? 0.7 : 1 }]} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Sort</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  resetButton: {
    padding: 8,
  },
  resetText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  sortOptionsContainer: {
    padding: 20,
    flexDirection: 'column',
    gap: 16,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioButtonLabel: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default SortModal;
