import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export interface ContextMenuItem {
  id: string;
  title: string;
  icon: string;
  color?: string;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  items: ContextMenuItem[];
  onItemPress: (item: ContextMenuItem) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  items,
  onItemPress,
  onClose,
  position = { x: width * 0.2, y: 200 }
}) => {
  const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });
  const [isMeasured, setIsMeasured] = useState(false);
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Calculate safe position with bounds checking
  const menuWidth = Math.min(screenWidth * 0.6, 280);
  const safeLeft = Math.min(
    Math.max(16, position.x),
    screenWidth - menuWidth - 16,
  );
  const safeTop = isMeasured 
    ? Math.max(16, Math.min(position.y, screenHeight - menuSize.height - 16))
    : Math.max(16, position.y);

  const handleItemPress = (item: ContextMenuItem) => {
    onItemPress(item);
    onClose();
  };

  const handleMenuLayout = (event: any) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    setMenuSize({ width: measuredWidth, height: measuredHeight });
    setIsMeasured(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          style={[
            styles.menuContainer, 
            { left: safeLeft, top: safeTop, width: menuWidth, opacity: isMeasured ? 1 : 0 }
          ]}
          onLayout={handleMenuLayout}
        >
          <BlurView intensity={20} style={styles.menuBlur}>
            <View style={styles.menu}>
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.6}
                  >
                    <Text style={[
                      styles.menuItemText,
                      item.destructive && styles.destructiveText
                    ]}>
                      {item.title}
                    </Text>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={item.destructive ? Colors.red : (item.color || Colors.black)}
                    />
                  </TouchableOpacity>
                  {index < items.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              ))}
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    maxWidth: 280,
    minWidth: 200,
  },
  menuBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menu: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '400',
    flex: 1,
  },
  destructiveText: {
    color: Colors.red,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 16,
  },
});

export default ContextMenu;
