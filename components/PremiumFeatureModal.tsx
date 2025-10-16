import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface PremiumFeatureModalProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
  benefits?: string[];
}

const PremiumFeatureModal: React.FC<PremiumFeatureModalProps> = ({
  visible,
  onClose,
  featureName,
  featureDescription,
  benefits = [
    'Detailed analytics and insights',
    'Performance tracking',
    'Revenue optimization',
    'Advanced reporting'
  ]
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/(screens)/(dashboard)/plans-billing');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="diamond" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.title}>Premium Feature</Text>
              <Text style={styles.featureName}>{featureName}</Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{featureDescription}</Text>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What you&apos;ll get:</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.upgradeButton} 
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <Ionicons name="diamond" size={20} color={Colors.white} />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    marginHorizontal: width * 0.075,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(3, 65, 252, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.grey,
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.grey,
    fontWeight: '500',
  },
});

export default PremiumFeatureModal;
