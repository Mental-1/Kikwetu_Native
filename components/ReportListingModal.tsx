import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';

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
    id: 'spam',
    title: 'Spam or Scam',
    description: 'This listing appears to be spam or fraudulent'
  },
  {
    id: 'inappropriate',
    title: 'Inappropriate Content',
    description: 'Contains offensive, illegal, or inappropriate material'
  },
  {
    id: 'fake',
    title: 'Fake or Misleading',
    description: 'False information, fake items, or misleading description'
  },
  {
    id: 'duplicate',
    title: 'Duplicate Listing',
    description: 'This is a duplicate of another listing'
  },
  {
    id: 'wrong_category',
    title: 'Wrong Category',
    description: 'This item is listed in the wrong category'
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other reason not listed above'
  }
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report</Text>
          </View>
          
          <View style={styles.modalContent}>
            <ScrollView 
              style={styles.formContainer} 
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subtitle}>Why are you reporting this listing?</Text>
              
              <View style={styles.reasonsContainer}>
                {reportReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReason === reason.id && styles.selectedReason
                    ]}
                    onPress={() => setSelectedReason(reason.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.reasonContent}>
                      <View style={styles.radioContainer}>
                        <View style={[
                          styles.radioButton,
                          selectedReason === reason.id && styles.radioSelected
                        ]}>
                          {selectedReason === reason.id && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                      </View>
                      <View style={styles.reasonText}>
                        <Text style={[
                          styles.reasonTitle,
                          selectedReason === reason.id && styles.selectedReasonTitle
                        ]}>
                          {reason.title}
                        </Text>
                        <Text style={[
                          styles.reasonDescription,
                          selectedReason === reason.id && styles.selectedReasonDescription
                        ]}>
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
                  !selectedReason && styles.submitButtonDisabled
                ]}
                labelStyle={styles.submitButtonText}
                disabled={!selectedReason}
              >
                Report Listing
              </Button>
            </ScrollView>
          </View>
        </View>
      </View>
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
    height: '75%',
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
    color: Colors.red,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    color: Colors.red,
    letterSpacing: 1.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 10,
  },
  reasonsContainer: {
    marginVertical: 10,
  },
  reasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedReason: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.red,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  reasonText: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  selectedReasonTitle: {
    color: Colors.red,
  },
  reasonDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 18,
  },
  selectedReasonDescription: {
    color: '#B91C1C',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: Colors.red,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.lightgrey,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
    color: Colors.white,
  },
});

export default ReportListingModal;
