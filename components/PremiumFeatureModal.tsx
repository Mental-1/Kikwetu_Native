import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomSheet, { BottomSheetRef } from "./BottomSheet";

export interface PremiumFeatureModalProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
  benefits?: string[];
}

const defaultBenefits = [
  "Detailed analytics and insights",
  "Performance tracking",
  "Revenue optimization",
  "Advanced reporting",
];

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = (
  {
    visible,
    onClose,
    featureName,
    featureDescription,
    benefits = defaultBenefits,
  },
) => {
  const router = useRouter();
  const bottomSheetRef = React.useRef<BottomSheetRef>(null);

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleUpgrade = () => {
    onClose();
    router.push("/(screens)/(dashboard)/plans-billing");
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onClose={onClose}
      enableDynamicSizing
      initialIndex={-1}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Premium Feature</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={Colors.black} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="diamond" size={40} color={Colors.primary} />
            </View>

            <Text style={styles.featureName}>{featureName}</Text>
            <Text style={styles.description}>{featureDescription}</Text>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.green}
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={(
              { pressed },
            ) => [styles.upgradeButton, { opacity: pressed ? 0.9 : 1 }]}
            onPress={handleUpgrade}
          >
            <Ionicons name="diamond" size={20} color={Colors.white} />
            <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
          </Pressable>

          <Pressable
            style={(
              { pressed },
            ) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 10,
    position: "relative",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.grey,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingBottom: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(3, 65, 252, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  featureName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  benefitsSection: {
    width: "100%",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.darkgrey,
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },
  actionsContainer: {
    gap: 12,
    marginTop: 10,
  },
  upgradeButton: {
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
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.grey,
    fontWeight: "600",
  },
});

export default PremiumFeatureModal;
