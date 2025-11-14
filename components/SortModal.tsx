import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';

interface SortModalProps {
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

export type Ref = BottomSheetModal;

const SortModal = forwardRef<Ref, SortModalProps>(
  ({ currentSortBy, onSortChange }, ref) => {
    const [tempSortBy, setTempSortBy] = useState(currentSortBy);
    const { dismiss } = useBottomSheetModal();

    const snapPoints = useMemo(() => ['50%'], []);

    const handleApply = () => {
      onSortChange(tempSortBy);
      dismiss();
    };

    const handleReset = () => {
      setTempSortBy(DEFAULT_SORT);
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          {...props}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: Colors.lightgrey }}
        backgroundStyle={{ backgroundColor: Colors.white }}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => dismiss()}
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
          <View style={styles.modalContent}>
            <View style={styles.pillsContainer}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.pill,
                    tempSortBy === option.value && styles.selectedPill,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setTempSortBy(option.value)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      tempSortBy === option.value && styles.selectedPillText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Apply Button */}
          <View style={styles.applyButtonContainer}>
            <Pressable style={({ pressed }) => [styles.applyButton, { opacity: pressed ? 0.7 : 1 }]} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Sort</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

SortModal.displayName = 'SortModal';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  selectedPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: '500',
  },
  selectedPillText: {
    color: Colors.white,
    fontWeight: '600',
  },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
