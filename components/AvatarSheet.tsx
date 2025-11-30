import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "./BottomSheet";

interface AvatarSheetProps {
  visible: boolean;
  onClose: () => void;
  onDashboard: () => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

const AvatarSheet: React.FC<AvatarSheetProps> = (
  { visible, onClose, onDashboard, onSignOut, userName, userEmail },
) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      enableDynamicSizing={false}
      snapPoints={["45%"]}
    >
      <View
        style={[styles.dropdown]}
      >
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userName?.charAt(0)?.toUpperCase() ||
                userEmail?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {userName || "User"}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userEmail || ""}
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuOptions}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onDashboard}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="grid-outline" size={20} color={Colors.primary} />
              <Text style={styles.menuText}>Dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onSignOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemContent}>
              <Ionicons name="log-out-outline" size={20} color={Colors.red} />
              <Text style={[styles.menuText, { color: Colors.red }]}>
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightgrey,
    marginHorizontal: 20,
    marginVertical: 8,
  },
});

export default AvatarSheet;
