import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
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
  }, [visible, slideAnim, opacityAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
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
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdown: {
    width: 280,
    backgroundColor: Colors.white,
    marginTop: 100, // Position below header
    marginRight: 16,
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
