import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaymentConfirmationSheetProps {
  planName: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  onProceed: () => void;
  onClose: () => void;
}

const PaymentConfirmationSheet = forwardRef<BottomSheetModal, PaymentConfirmationSheetProps>((
  { planName, price, billingCycle, onProceed, onClose },
  ref
) => {
  const { bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['40%', '50%'], []);

  return (
    <BottomSheetModal
      ref={ref}
      index={-1} // Start closed
      snapPoints={snapPoints}
      onDismiss={onClose}
      backgroundStyle={styles.modal}
      handleIndicatorStyle={{ backgroundColor: Colors.lightgrey }}
    >
      <View style={[styles.container, { paddingBottom: bottom > 0 ? bottom : 24 }]}>
        <View style={styles.content}>
            <Ionicons name="card-outline" size={64} color={Colors.primary} />
            <Text style={styles.title}>Confirm Your Plan</Text>
            <Text style={styles.planInfo}>You have selected the <Text style={styles.bold}>{planName}</Text> plan.</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.price}>KES {price.toLocaleString()}</Text>
                <Text style={styles.billingCycle}>/ {billingCycle === 'monthly' ? 'month' : 'year'}</Text>
            </View>
        </View>
        <Pressable style={({ pressed }) => [styles.proceedButton, { opacity: pressed ? 0.8 : 1 }]} onPress={onProceed}>
            <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
});

PaymentConfirmationSheet.displayName = 'PaymentConfirmationSheet';

const styles = StyleSheet.create({
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  planInfo: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.black,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  billingCycle: {
    fontSize: 16,
    color: Colors.grey,
    marginLeft: 8,
  },
  proceedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 24,
    marginTop: 0,
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default PaymentConfirmationSheet;
