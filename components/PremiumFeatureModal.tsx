import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PremiumFeatureModalProps {
  featureName: string;
  featureDescription: string;
  benefits?: string[];
  onClose: () => void;
}

const defaultBenefits = [
  'Detailed analytics and insights',
  'Performance tracking',
  'Revenue optimization',
  'Advanced reporting'
]

const PremiumFeatureModal = forwardRef<BottomSheetModal, PremiumFeatureModalProps>((
  { featureName, featureDescription, benefits = defaultBenefits, onClose },
  ref
) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['60%', '85%'], []);

  const handleUpgrade = () => {
    if (ref && typeof ref !== 'function') {
      ref.current?.dismiss();
    }
    router.push('/(screens)/(dashboard)/plans-billing');
  };

  return (
    <BottomSheetModal
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onDismiss={onClose}
        backgroundStyle={styles.modal}
        handleIndicatorStyle={{ backgroundColor: Colors.lightgrey }}
      >
        <BottomSheetScrollView contentContainerStyle={[styles.modalContainer, { paddingBottom: bottom > 0 ? bottom + 12 : 24 }]}>
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
                  <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Pressable 
                style={({ pressed }) => [styles.upgradeButton, { opacity: pressed ? 0.8 : 1 }]} 
                onPress={handleUpgrade}
              >
                <Ionicons name="diamond" size={20} color={Colors.white} />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </Pressable>
            </View>
        </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

PremiumFeatureModal.displayName = 'PremiumFeatureModal';

const styles = StyleSheet.create({
  modalContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    marginTop: 12,
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
