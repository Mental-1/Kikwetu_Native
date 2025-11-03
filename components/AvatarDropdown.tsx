import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface AvatarDropdownProps {
  visible: boolean;
  onClose: () => void;
  onDashboard: () => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  visible,
  onClose,
  onDashboard,
  onSignOut,
  userName,
  userEmail,
}) => {
  const screenWidth = Dimensions.get('window').width;
  // Start from off-screen right (screenWidth means fully to the right of screen)
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values when opening - start from off-screen right
      slideAnim.setValue(screenWidth);
      opacityAnim.setValue(0);
      
      // Use requestAnimationFrame to ensure layout is measured before animating
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0, // Animate to final position (translateX: 0 means no translation from right: 0)
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenWidth, // Animate back off-screen right
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim, screenWidth]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlayContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
        <TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.dropdown,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {/* User Info Header */}
            <View style={styles.userHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userName?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {userName || 'User'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {userEmail || ''}
                </Text>
              </View>
            </View>

            {/* Menu Options */}
            <View style={styles.menuOptions}>
              <TouchableOpacity style={styles.menuItem} onPress={onDashboard}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="grid-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuText}>Dashboard</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={onSignOut}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.red} />
                </View>
                <Text style={[styles.menuText, { color: Colors.red }]}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    width: 280,
    backgroundColor: Colors.white,
    marginTop: 100,
    marginRight: 16,
    right: 0,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.grey,
  },
  menuOptions: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightgrey,
    marginHorizontal: 16,
    marginVertical: 4,
  },
});

export default AvatarDropdown;
