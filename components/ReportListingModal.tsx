import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import BottomSheet from "./BottomSheet";

interface ReportReason {
  id: string;
  title: string;
  description: string;
}

interface ReportListingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const reportReasons: ReportReason[] = [
  {
    id: "spam",
    title: "Spam or Scam",
    description: "This listing appears to be spam or fraudulent",
  },
  {
    id: "inappropriate",
    title: "Inappropriate Content",
    description: "Contains offensive, illegal, or inappropriate material",
  },
  {
    id: "fake",
    title: "Fake or Misleading",
    description: "False information, fake items, or misleading description",
  },
  {
    id: "duplicate",
    title: "Duplicate Listing",
    description: "This is a duplicate of another listing",
  },
  {
    id: "wrong_category",
    title: "Wrong Category",
    description: "This item is listed in the wrong category",
  },
  { id: "other", title: "Other", description: "Other reason not listed above" },
];

const ReportListingModal: React.FC<ReportListingModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason);
      setSelectedReason(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} enableDynamicSizing>
      <View style={styles.modalContainer}>
        {/* New Header Style */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report Listing</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Why are you reporting this listing?
          </Text>

          <View style={styles.reasonsContainer}>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.id && styles.selectedReason,
                ]}
                onPress={() => setSelectedReason(reason.id)}
                activeOpacity={0.7}
              >
                <View style={styles.reasonContent}>
                  <View style={styles.radioContainer}>
                    <View
                      style={[
                        styles.radioButton,
                        selectedReason === reason.id && styles.radioSelected,
                      ]}
                    >
                      {selectedReason === reason.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                  <View style={styles.reasonText}>
                    <Text
                      style={[
                        styles.reasonTitle,
                        selectedReason === reason.id &&
                        styles.selectedReasonTitle,
                      ]}
                    >
                      {reason.title}
                    </Text>
                    <Text
                      style={[
                        styles.reasonDescription,
                        selectedReason === reason.id &&
                        styles.selectedReasonDescription,
                      ]}
                    >
                      {reason.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              !selectedReason && styles.submitButtonDisabled,
            ]}
            labelStyle={styles.submitButtonText}
            disabled={!selectedReason}
          >
            Report Listing
          </Button>
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingVertical: 10,
    marginBottom: 10,
  },
  modalTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.red,
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
  formContainer: {
    maxHeight: 500,
  },
  formContent: {},
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedReason: {
    backgroundColor: "#FFF5F5",
    borderColor: Colors.red,
  },
  reasonContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.red,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red,
  },
  reasonText: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 2,
  },
  selectedReasonTitle: {
    color: Colors.red,
  },
  reasonDescription: {
    fontSize: 13,
    color: Colors.grey,
    lineHeight: 18,
  },
  selectedReasonDescription: {
    color: "#B91C1C",
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: Colors.red,
    paddingVertical: 6,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.lightgrey,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
  },
});

export default ReportListingModal;
