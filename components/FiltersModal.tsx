import { useSubcategoriesByCategory } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState, useRef } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

const { height, width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;

type Category = { id: number; name: string; emoji?: string };

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  categories: Category[];
  isLoading: boolean;
}

interface FilterOptions {
  priceRange: {
    min: number;
    max: number;
  };
  condition: string[];
  category: string;
  subcategoryId: number | null;
  distance: number;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  categories,
  isLoading,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 1000000 },
    condition: [],
    category: '',
    subcategoryId: null,
    distance: 50,
  });

  const [priceInputs, setPriceInputs] = useState({
    min: '0',
    max: '1000000',
  });

  const sliderWidth = useRef(0);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const conditionOptions = ['New', 'Like New', 'Used', 'Refurbished'];

  const categoryOptions = useMemo(() => 
    categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji
    })),
    [categories]
  );

  const displayedCategories = useMemo(() => 
    showAllCategories ? categoryOptions : categoryOptions.slice(0, 8),
    [categoryOptions, showAllCategories]
  );

  const { data: categorySubcategories, isLoading: subcategoriesLoading } = useSubcategoriesByCategory(
    selectedCategoryId || 0
  );

  const subcategoryOptions = useMemo(() => 
    categorySubcategories || [],
    [categorySubcategories]
  );

  const handleConditionToggle = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      condition: prev.condition.includes(condition)
        ? prev.condition.filter(c => c !== condition)
        : [...prev.condition, condition]
    }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(prev => prev === categoryId ? null : categoryId);
    setFilters(prev => ({
      ...prev,
      category: prev.category === categoryId.toString() ? '' : categoryId.toString(),
      subcategoryId: null,
    }));
  };

  const handleApply = () => {
    const parsedMin = Number.parseInt(priceInputs.min ?? '', 10);
    const parsedMax = Number.parseInt(priceInputs.max ?? '', 10);
    const min = Math.max(0, Number.isFinite(parsedMin) ? parsedMin : 0);
    const maxCandidate = Number.isFinite(parsedMax) ? parsedMax : 1_000_000;
    const max = Math.max(0, maxCandidate);
    const [lo, hi] = min <= max ? [min, max] : [max, min];

    const updatedFilters = {
      ...filters,
      priceRange: { min: lo, max: hi },
    };
    onApplyFilters(updatedFilters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: { min: 0, max: 1000000 },
      condition: [],
      category: '',
      subcategoryId: null,
      distance: 50,
    });
    setPriceInputs({
      min: '0',
      max: '1000000',
    });
    setSelectedCategoryId(null);
    setShowAllCategories(false);
  };

  const translateX = useSharedValue((filters.distance / 100) * SLIDER_WIDTH);
  const context = useSharedValue({ x: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = Math.max(0, Math.min(SLIDER_WIDTH, context.value.x + event.translationX));
    })
    .onEnd(() => {
      const newDistance = Math.round((translateX.value / SLIDER_WIDTH) * 20) * 5;
      runOnJS(setFilters)(prev => ({ ...prev, distance: newDistance }));
      translateX.value = withSpring((newDistance / 100) * SLIDER_WIDTH);
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  const CategorySkeleton = () => (
    <View style={styles.pillsContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={styles.skeletonPill} />
      ))}
    </View>
  );

  const SubcategorySkeleton = () => (
    <View style={styles.pillsContainer}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.skeletonPill} />
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.modalContainer}>
            {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalContent} 
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              {isLoading ? (
                <CategorySkeleton />
              ) : (
                <>
                  <View style={styles.pillsContainer}>
                    {displayedCategories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.pill,
                          selectedCategoryId === category.id && styles.selectedPill
                        ]}
                        onPress={() => handleCategorySelect(category.id)}
                      >
                        <Text style={[
                          styles.pillText,
                          selectedCategoryId === category.id && styles.selectedPillText
                        ]}>
                          {category.emoji} {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* See All Button */}
                  {!showAllCategories && categoryOptions.length > 8 && (
                    <TouchableOpacity 
                      style={styles.seeAllButton}
                      onPress={() => setShowAllCategories(true)}
                    >
                      <Text style={styles.seeAllButtonText}>
                        See All ({categoryOptions.length})
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                  
                  {/* Show Less Button */}
                  {showAllCategories && (
                    <TouchableOpacity 
                      style={styles.seeAllButton}
                      onPress={() => setShowAllCategories(false)}
                    >
                      <Text style={styles.seeAllButtonText}>
                        Show Less
                      </Text>
                      <Ionicons name="chevron-up" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Subcategory Section */}
            {selectedCategoryId !== null && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Subcategory</Text>
                {subcategoriesLoading ? (
                  <SubcategorySkeleton />
                ) : (
                  <View style={styles.pillsContainer}>
                    {subcategoryOptions.map((subcategory) => (
                      <TouchableOpacity
                        key={subcategory.id}
                        style={[
                          styles.pill,
                          filters.subcategoryId === subcategory.id && styles.selectedPill
                        ]}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          subcategoryId: prev.subcategoryId === subcategory.id ? null : subcategory.id
                        }))}
                      >
                        <Text style={[
                          styles.pillText,
                          filters.subcategoryId === subcategory.id && styles.selectedPillText
                        ]}>
                          {subcategory.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Condition Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Condition</Text>
              <View style={styles.pillsContainer}>
                {conditionOptions.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.pill,
                      filters.condition.includes(condition) && styles.selectedPill
                    ]}
                    onPress={() => handleConditionToggle(condition)}
                  >
                    <Text style={[
                      styles.pillText,
                      filters.condition.includes(condition) && styles.selectedPillText
                    ]}>
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceInputs.min}
                    onChangeText={(text) => setPriceInputs(prev => ({ ...prev, min: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.grey}
                  />
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={priceInputs.max}
                    onChangeText={(text) => setPriceInputs(prev => ({ ...prev, max: text }))}
                    placeholder="1000000"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.grey}
                  />
                </View>
              </View>
            </View>

            {/* Distance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance: {filters.distance} km</Text>
              <View style={styles.sliderContainer} onLayout={(e) => sliderWidth.current = e.nativeEvent.layout.width}>
                <View style={styles.sliderTrack}>
                  <Animated.View style={[styles.sliderProgress, animatedProgressStyle]} />
                </View>
                <GestureDetector gesture={gesture}>
                  <Animated.View style={[styles.sliderThumb, animatedThumbStyle]} />
                </GestureDetector>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>0 km</Text>
                  <Text style={styles.sliderLabel}>100 km</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.applyButtonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.75,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
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
  priceRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 8,
  },
  priceInput: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    fontSize: 14,
    color: Colors.black,
  },
  sliderContainer: {
    marginTop: 8,
    height: 40, 
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.lightgrey,
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
    top: 18,
  },
  sliderProgress: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.4,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.grey,
  },
  skeletonPill: {
    backgroundColor: Colors.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
    width: 80,
    marginRight: 8,
    marginBottom: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  seeAllButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default FiltersModal;
