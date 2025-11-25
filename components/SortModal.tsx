import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomSheet from "./BottomSheet";

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  currentSortBy: string;
  onSortChange: (sortBy: string) => void;
}

const DEFAULT_SORT = "newest";

const sortOptions = [
  { value: DEFAULT_SORT, label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  currentSortBy,
  onSortChange,
}) => {
  const [tempSortBy, setTempSortBy] = useState(currentSortBy);

  const handleApply = () => {
    onSortChange(tempSortBy);
    onClose();
  };

  const handleReset = () => {
    setTempSortBy(DEFAULT_SORT);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={["50%"]}
      enableDynamicSizing={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <Pressable
            onPress={onClose}
            style={(
              { pressed },
            ) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="close" size={20} color={Colors.black} />
          </Pressable>
          <Pressable
            onPress={handleReset}
            style={(
              { pressed },
            ) => [styles.resetButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

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
              <View
                style={[
                  styles.radioButton,
                  tempSortBy === option.value && styles.radioButtonSelected,
                ]}
              >
                {tempSortBy === option.value && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.radioButtonLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.applyButtonContainer}>
          <Pressable
            style={(
              { pressed },
            ) => [styles.applyButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Sort</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingBottom: 20,
    flex: 1,
  },
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
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  sortOptionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 20,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 4,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  radioButtonLabel: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});

export default SortModal;
