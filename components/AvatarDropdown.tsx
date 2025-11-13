import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AvatarDropdownProps {
  onClose: () => void;
  onDashboard: () => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

const AvatarDropdown = forwardRef<BottomSheetModal, AvatarDropdownProps>((
  { onClose, onDashboard, onSignOut, userName, userEmail },
  ref
) => {
  const snapPoints = useMemo(() => [280], []);
  const { bottom } = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={-1} // Start closed
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={[styles.dropdown, { paddingBottom: bottom > 0 ? bottom : 20 }]}>
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
          <Pressable style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]} onPress={onDashboard}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="grid-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Dashboard</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]} onPress={onSignOut}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="log-out-outline" size={20} color={Colors.red} />
            </View>
            <Text style={[styles.menuText, { color: Colors.red }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
          </Pressable>
        </View>
      </View>
    </BottomSheetModal>
  );
});

AvatarDropdown.displayName = 'AvatarDropdown';

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: Colors.lightgrey,
    width: 40,
  },
  dropdown: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.grey,
  },
  menuOptions: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginHorizontal: 20,
    marginVertical: 8,
  },
});

export default AvatarDropdown;
