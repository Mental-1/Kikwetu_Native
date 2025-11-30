import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PaymentConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  planName: string;
  price: number;
  billingCycle: "monthly" | "annual";
  onProceed: () => void;
}

const PaymentConfirmationSheet: React.FC<PaymentConfirmationSheetProps> = ({
  visible,
  onClose,
  planName,
  price,
  billingCycle,
  onProceed,
}) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  // Effect to handle visibility
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["40%"]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirm Subscription</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>{planName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Billing Cycle</Text>
              <Text style={styles.detailValue}>
                {billingCycle === "monthly" ? "Monthly" : "Annually"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalValue}>
                KES {price.toLocaleString()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={onProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderRadius: 24,
  },
  indicator: {
    backgroundColor: Colors.lightgrey,
    width: 40,
  },
  contentContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.grey,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightgrey,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentConfirmationSheet;
