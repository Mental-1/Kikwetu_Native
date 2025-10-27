import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ContactSellerModalProps {
  visible: boolean;
  onClose: () => void;
  seller: {
    name: string;
    phone?: string | null;
    email?: string | null;
    whatsapp?: string | null;
  };
  listingTitle: string;
}

export default function ContactSellerModal({
  visible,
  onClose,
  seller,
  listingTitle
}: ContactSellerModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const normalizeE164 = (raw: string | null | undefined) =>
    (raw ?? '').replace(/[^\d+]/g, '');

  const handleCallSeller = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const phone = normalizeE164(seller.phone ?? '');
      if (!phone || phone.replace('+', '').length < 7) {
        Alert.alert('No phone number', 'The seller did not provide a valid phone number.');
      } else {
        const url = `tel:${phone}`;
        if (await Linking.canOpenURL(url)) {
          try {
            await Linking.openURL(url);
            onClose();
          } catch {
            Alert.alert('Unable to place call', 'Please try again or use another contact option.');
          }
        } else {
          Alert.alert('Calling unavailable', 'It looks like calling is not supported on this device.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppSeller = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const phone = normalizeE164(seller.whatsapp ?? '');
      if (!phone || phone.replace('+', '').length < 7) {
        Alert.alert('No WhatsApp number', 'The seller did not provide a valid WhatsApp number.');
      } else {
        const msg = `Hi ${seller.name}, I'm interested in your listing: ${listingTitle}`;
        const appUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(msg)}`;
        const webUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        try {
          if (await Linking.canOpenURL(appUrl)) {
            await Linking.openURL(appUrl);
            onClose();
          } else if (await Linking.canOpenURL(webUrl)) {
            await Linking.openURL(webUrl);
            onClose();
          } else {
            Alert.alert('WhatsApp unavailable', 'Install WhatsApp or try another contact option.');
          }
        } catch {
          Alert.alert('Unable to open WhatsApp', 'Please try again or choose another contact method.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSeller = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const to = (seller.email ?? '').trim();
      if (!to) {
        Alert.alert('No email', 'The seller did not provide an email address.');
      } else {
        const subject = `Inquiry about: ${listingTitle}`;
        const body = `Hi ${seller.name},\n\nI'm interested in your listing: ${listingTitle}\n\nPlease let me know if it's still available.\n\nThanks!`;
        const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (await Linking.canOpenURL(url)) {
          try {
            await Linking.openURL(url);
            onClose();
          } catch {
            Alert.alert('Unable to open email client', 'Please try again or pick another contact option.');
          }
        } else {
          Alert.alert('Email unavailable', 'No email client found on this device.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInAppMessage = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // Navigate to conversations screen
      router.push('/(screens)/(dashboard)/conversations');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.contactModal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contact Seller</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.contactOptions}>
            {/* Call Option */}
            {seller.phone && (
              <TouchableOpacity 
                style={[styles.contactOption, (isProcessing || !seller.phone) && styles.disabledOption]}
                onPress={handleCallSeller} 
                disabled={isProcessing || !seller.phone}
                accessibilityRole="button"
                accessibilityLabel="Call seller"
                accessibilityHint="Opens the dialer to call the seller"
                testID="contact-call-btn"
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call" size={24} color={Colors.primary} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactTitle}>Call</Text>
                  <Text style={styles.contactSubtitle}>{seller.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
              </TouchableOpacity>
            )}

            {/* WhatsApp Option */}
            {seller.whatsapp && (
              <TouchableOpacity 
                style={[styles.contactOption, (isProcessing || !seller.whatsapp) && styles.disabledOption]} 
                onPress={handleWhatsAppSeller} 
                disabled={isProcessing || !seller.whatsapp}
                accessibilityRole="button"
                accessibilityLabel="WhatsApp seller"
                accessibilityHint="Opens WhatsApp to message the seller"
                testID="contact-whatsapp-btn"
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactTitle}>WhatsApp</Text>
                  <Text style={styles.contactSubtitle}>Send a message</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
              </TouchableOpacity>
            )}

            {/* Email Option */}
            {seller.email && (
              <TouchableOpacity 
                style={[styles.contactOption, (isProcessing || !seller.email) && styles.disabledOption]} 
                onPress={handleEmailSeller} 
                disabled={isProcessing || !seller.email}
                accessibilityRole="button"
                accessibilityLabel="Email seller"
                accessibilityHint="Opens the email client to email the seller"
                testID="contact-email-btn"
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail" size={24} color={Colors.red} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactTitle}>Email</Text>
                  <Text style={styles.contactSubtitle}>{seller.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
              </TouchableOpacity>
            )}

            {/* In-App Messaging Option */}
            <TouchableOpacity 
              style={[styles.contactOption, isProcessing && styles.disabledOption]} 
              onPress={handleInAppMessage} 
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Open in-app chat"
              accessibilityHint="Opens the in-app chat to message the seller"
              testID="contact-chat-btn"
            >
              <View style={styles.contactIconContainer}>
                <Ionicons name="chatbubble" size={24} color={Colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>In-App Chat</Text>
                <Text style={styles.contactSubtitle}>Send a message within the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  contactModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 20,
  },
  contactOptions: {
    paddingTop: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.3,
    borderBottomColor: Colors.lightgrey,
  },
  disabledOption: {
    opacity: 0.5,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0.2,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: Colors.grey,
  },
});
