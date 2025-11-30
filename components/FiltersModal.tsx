import { useSubcategoriesByCategory } from "@/hooks/useCategories";
import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Chip } from "react-native-paper";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import BottomSheet from "./BottomSheet";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width - 80;
const DEBOUNCE_DELAY = 500;

type Category = { id: number; name: string; emoji?: string };

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  categories: Category[];
  isLoading: boolean;
  initialFilters?: Partial<FilterOptions>;
}

interface FilterOptions {
  priceRange: { min: number; max: number };
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
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: initialFilters?.priceRange || { min: 0, max: 1000000 },
    condition: initialFilters?.condition || [],
    category: initialFilters?.category || "",
    subcategoryId: initialFilters?.subcategoryId || null,
    distance: initialFilters?.distance || 50,
  });

  const [priceInputs, setPriceInputs] = useState({ min: "0", max: "1000000" });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialFilters?.category ? parseInt(initialFilters.category, 10) : null,
  );
  const [showAllCategories, setShowAllCategories] = useState(false);

  const priceDebounceRef = useRef<number | undefined>(undefined);
  const distanceDebounceRef = useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (visible && initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
      translateX.value = ((initialFilters.distance || 50) / 100) * SLIDER_WIDTH;
      if (initialFilters.category) {
        setSelectedCategoryId(parseInt(initialFilters.category, 10));
      }
    }
  }, [visible, initialFilters]);
  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      if (distanceDebounceRef.current) {
        clearTimeout(distanceDebounceRef.current);
      }
    };
  }, []);

  const conditionOptions = ["New", "Like New", "Used", "Refurbished"];

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
      })),
    [categories],
  );

  const displayedCategories = useMemo(
    () => showAllCategories ? categoryOptions : categoryOptions.slice(0, 8),
    [categoryOptions, showAllCategories],
  );

  const { data: categorySubcategories, isLoading: subcategoriesLoading } =
    useSubcategoriesByCategory(
      selectedCategoryId || 0,
    );

  const subcategoryOptions = useMemo(() => categorySubcategories || [], [
    categorySubcategories,
  ]);

  const handleConditionToggle = (condition: string) => {
    setFilters((prev) => ({
      ...prev,
      condition: prev.condition.includes(condition)
        ? prev.condition.filter((c) => c !== condition)
        : [...prev.condition, condition],
    }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId((prev) => prev === categoryId ? null : categoryId);
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryId.toString()
        ? ""
        : categoryId.toString(),
      subcategoryId: null,
    }));
  };

  const handlePriceChange = useCallback((type: "min" | "max", text: string) => {
    setPriceInputs((prev) => ({ ...prev, [type]: text }));

    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(() => {
      const value = parseInt(text, 10);
      if (!isNaN(value)) {
        setFilters((prev) => ({
          ...prev,
          priceRange: {
            ...prev.priceRange,
            [type]: value,
          },
        }));
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const handleApply = () => {
    const parsedMin = Number.parseInt(priceInputs.min ?? "", 10);
    const parsedMax = Number.parseInt(priceInputs.max ?? "", 10);
    const min = Math.max(0, Number.isFinite(parsedMin) ? parsedMin : 0);
    const maxCandidate = Number.isFinite(parsedMax) ? parsedMax : 1_000_000;
    const max = Math.max(0, maxCandidate);
    const [lo, hi] = min <= max ? [min, max] : [max, min];

    onApplyFilters({ ...filters, priceRange: { min: lo, max: hi } });
  };

  const handleReset = () => {
    setFilters({
      priceRange: { min: 0, max: 1000000 },
      condition: [],
      category: "",
      subcategoryId: null,
      distance: 50,
    });
    setPriceInputs({ min: "0", max: "1000000" });
    setSelectedCategoryId(null);
    setShowAllCategories(false);
    translateX.value = (50 / 100) * SLIDER_WIDTH;
  };

  const translateX = useSharedValue((filters.distance / 100) * SLIDER_WIDTH);
  const context = useSharedValue({ x: 0 });

  // Debounced distance update
  const updateDistanceState = useCallback((dist: number) => {
    if (distanceDebounceRef.current) {
      clearTimeout(distanceDebounceRef.current);
    }

    distanceDebounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, distance: dist }));
    }, DEBOUNCE_DELAY);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = Math.max(
        0,
        Math.min(SLIDER_WIDTH, context.value.x + event.translationX),
      );
    })
    .onEnd(() => {
      const newDistance = Math.round((translateX.value / SLIDER_WIDTH) * 20) *
        5;
      translateX.value = withTiming((newDistance / 100) * SLIDER_WIDTH, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      scheduleOnRN(updateDistanceState, newDistance);
    });

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedFilledTrackStyle = useAnimatedStyle(() => ({
    width: translateX.value,
  }));

  const animatedTextProps = useAnimatedProps(() => {
    const currentDist = Math.round((translateX.value / SLIDER_WIDTH) * 20) * 5;
    return { text: `Distance: ${currentDist} km` } as any;
  });

  const CategorySkeleton = () => (
    <View style={styles.chipsContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.skeletonChip} />
      ))}
    </View>
  );

  const SubcategorySkeleton = () => (
    <View style={styles.chipsContainer}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} style={styles.skeletonChip} />
      ))}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={["90%"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.resetButton}
            activeOpacity={0.7}
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            {isLoading ? <CategorySkeleton /> : (
              <>
                <View style={styles.chipsContainer}>
                  {displayedCategories.map((category) => (
                    <Chip
                      key={category.id}
                      mode="outlined"
                      selected={selectedCategoryId === category.id}
                      onPress={() => handleCategorySelect(category.id)}
                      style={[
                        styles.chip,
                        selectedCategoryId === category.id &&
                        styles.selectedChip,
                      ]}
                      textStyle={[
                        styles.chipText,
                        selectedCategoryId === category.id &&
                        styles.selectedChipText,
                      ]}
                    >
                      {category.emoji} {category.name}
                    </Chip>
                  ))}
                </View>
                {!showAllCategories && categoryOptions.length > 8 && (
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() => setShowAllCategories(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeAllButtonText}>
                      See All ({categoryOptions.length})
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                )}
                {showAllCategories && (
                  <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={() => setShowAllCategories(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeAllButtonText}>Show Less</Text>
                    <Ionicons
                      name="chevron-up"
                      size={16}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {selectedCategoryId !== null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subcategory</Text>
              {subcategoriesLoading
                ? <SubcategorySkeleton />
                : (
                  <View style={styles.chipsContainer}>
                    {subcategoryOptions.map((subcategory) => (
                      <Chip
                        key={subcategory.id}
                        mode="outlined"
                        selected={filters.subcategoryId === subcategory.id}
                        onPress={() =>
                          setFilters((prev) => ({
                            ...prev,
                            subcategoryId: prev.subcategoryId === subcategory.id
                              ? null
                              : subcategory.id,
                          }))}
                        style={[
                          styles.chip,
                          filters.subcategoryId === subcategory.id &&
                          styles.selectedChip,
                        ]}
                        textStyle={[
                          styles.chipText,
                          filters.subcategoryId === subcategory.id &&
                          styles.selectedChipText,
                        ]}
                      >
                        {subcategory.name}
                      </Chip>
                    ))}
                  </View>
                )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condition</Text>
            <View style={styles.chipsContainer}>
              {conditionOptions.map((condition) => (
                <Chip
                  key={condition}
                  mode="outlined"
                  selected={filters.condition.includes(condition)}
                  onPress={() => handleConditionToggle(condition)}
                  style={[
                    styles.chip,
                    filters.condition.includes(condition) &&
                    styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.chipText,
                    filters.condition.includes(condition) &&
                    styles.selectedChipText,
                  ]}
                >
                  {condition}
                </Chip>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Min</Text>
                <TextInput
                  style={styles.priceInput}
                  value={priceInputs.min}
                  onChangeText={(text) => handlePriceChange("min", text)}
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
                  onChangeText={(text) => handlePriceChange("max", text)}
                  placeholder="1000000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.grey}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <AnimatedTextInput
              underlineColorAndroid="transparent"
              editable={false}
              value={`Distance: ${filters.distance} km`}
              animatedProps={animatedTextProps}
              style={[styles.sectionTitle, { padding: 0, margin: 0 }]}
            />
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack} />
              <Animated.View
                style={[styles.sliderFilledTrack, animatedFilledTrackStyle]}
              />
              <GestureDetector gesture={panGesture}>
                <Animated.View
                  style={[styles.sliderThumb, animatedThumbStyle]}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                />
              </GestureDetector>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 km</Text>
                <Text style={styles.sliderLabel}>100 km</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.applyButtonContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    zIndex: -1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
  },
  resetButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  resetText: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  modalContent: { padding: 20, paddingBottom: 10 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightgrey,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "500",
  },
  selectedChipText: {
    color: Colors.white,
    fontWeight: "600",
  },
  priceRangeContainer: { flexDirection: "row", gap: 12 },
  priceInputContainer: { flex: 1 },
  priceLabel: { fontSize: 14, color: Colors.grey, marginBottom: 8 },
  priceInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    fontSize: 14,
    color: Colors.black,
  },
  sliderContainer: { height: 50, justifyContent: "center" },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.lightgrey,
    borderRadius: 2,
    width: "100%",
  },
  sliderFilledTrack: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    position: "absolute",
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    position: "absolute",
    top: -10,
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderLabel: { fontSize: 12, color: Colors.grey },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  skeletonChip: {
    backgroundColor: Colors.lightgrey,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
    width: 80,
    marginRight: 8,
    marginBottom: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  seeAllButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    marginRight: 4,
  },
});

export default FiltersModal;
