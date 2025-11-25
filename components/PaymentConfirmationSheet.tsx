import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BottomSheet from "./BottomSheet";

interface PaymentConfirmationSheetProps {
  visible: boolean;
  onClose: () => void;
  planName: string;
  price: number;
  billingCycle: "monthly" | "annual";
  onProceed: () => void;
}

const PaymentConfirmationSheet: React.FC<PaymentConfirmationSheetProps> = (
  { visible, onClose, planName, price, billingCycle, onProceed },
) => {
  return (
    <BottomSheet visible={visible} onClose={onClose} enableDynamicSizing>
      <View style={styles.container}>
        {/* Added Header for consistency and closing */}
        <View style={styles.header}>
          <View style={{ width: 32 }} />
          <Text style={styles.headerTitle}>Confirmation</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={Colors.black} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons name="card" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Confirm Subscription</Text>
          <Text style={styles.planInfo}>
            You are subscribing to the{" "}
            <Text style={styles.bold}>{planName}</Text> plan.
          </Text>

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>KES</Text>
              <Text style={styles.price}>{price.toLocaleString()}</Text>
              <Text style={styles.billingCycle}>
                /{billingCycle === "monthly" ? "mo" : "yr"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={(
              { pressed },
            ) => [styles.proceedButton, { opacity: pressed ? 0.9 : 1 }]}
            onPress={onProceed}
          >
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.grey,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  bold: {
    fontWeight: "700",
    color: Colors.primary,
  },
  priceCard: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDEEF0",
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 6,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.black,
    lineHeight: 40,
  },
  billingCycle: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 6,
    fontWeight: "500",
  },
  footer: {
    marginTop: 24,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
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
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
  },
});

export default PaymentConfirmationSheet;
