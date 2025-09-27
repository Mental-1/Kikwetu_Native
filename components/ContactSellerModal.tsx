import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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
    phone: string;
    email: string;
    whatsapp: string;
  };
  listingTitle: string;
}

export default function ContactSellerModal({
  visible,
  onClose,
  seller,
  listingTitle
}: ContactSellerModalProps) {
  const handleCallSeller = () => {
    Linking.openURL(`tel:${seller.phone}`);
    onClose();
  };

  const handleWhatsAppSeller = () => {
    const message = `Hi ${seller.name}, I'm interested in your listing: ${listingTitle}`;
    const url = `whatsapp://send?phone=${seller.whatsapp}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
    onClose();
  };

  const handleEmailSeller = () => {
    const subject = `Inquiry about: ${listingTitle}`;
    const body = `Hi ${seller.name},\n\nI'm interested in your listing: ${listingTitle}\n\nPlease let me know if it's still available.\n\nThanks!`;
    const url = `mailto:${seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
    onClose();
  };

  const handleInAppMessage = () => {
    // TODO: Implement in-app messaging
    console.log('Open in-app chat');
    onClose();
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
            <TouchableOpacity style={styles.contactOption} onPress={handleCallSeller}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="call" size={24} color={Colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>Call</Text>
                <Text style={styles.contactSubtitle}>{seller.phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>

            {/* WhatsApp Option */}
            <TouchableOpacity style={styles.contactOption} onPress={handleWhatsAppSeller}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>WhatsApp</Text>
                <Text style={styles.contactSubtitle}>Send a message</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>

            {/* Email Option */}
            <TouchableOpacity style={styles.contactOption} onPress={handleEmailSeller}>
              <View style={styles.contactIconContainer}>
                <Ionicons name="mail" size={24} color={Colors.red} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactSubtitle}>{seller.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.grey} />
            </TouchableOpacity>

            {/* In-App Messaging Option */}
            <TouchableOpacity style={styles.contactOption} onPress={handleInAppMessage}>
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
