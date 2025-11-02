import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View, type TextStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  denyText: string;
  onConfirm: () => void;
  onDeny: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  confirmColor?: string;
  denyColor?: string;
  confirmWeight?: TextStyle['fontWeight'];
  denyWeight?: TextStyle['fontWeight'];
}

const CustomDialog: React.FC<CustomDialogProps> = React.memo(({
  visible,
  title,
  message,
  confirmText,
  denyText,
  onConfirm,
  onDeny,
  icon,
  iconColor = Colors.primary,
  confirmColor = '#007AFF',
  denyColor = '#FF3B30',
  confirmWeight = '600',
  denyWeight = '400',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDeny}
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.dialogContainer}>
          <View style={styles.dialog}>
            {/* Icon */}
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons
                  accessibilityLabel="Dialog icon"
                  name={icon}
                  size={48}
                  color={iconColor}
                />
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Separator Line */}
            <View style={styles.separator} />
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Deny Button */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={denyText}
                style={[styles.button, styles.denyButton]} 
                onPress={onDeny}
                activeOpacity={0.7}
              >
                <Text style={[styles.denyButtonText, { color: denyColor, fontWeight: denyWeight }]}>{denyText}</Text>
              </TouchableOpacity>

              {/* Vertical Separator */}
              <View style={styles.buttonSeparator} />

              {/* Confirm Button */}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={confirmText}
                style={[styles.button, styles.confirmButton]} 
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={[styles.confirmButtonText, { color: confirmColor, fontWeight: confirmWeight }]}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

CustomDialog.displayName = 'CustomDialog';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: width * 0.75,
    marginHorizontal: width * 0.125,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: 16,
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
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 0,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E7',
    width: '100%',
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: 'transparent',
  },
  buttonSeparator: {
    width: 1,
    backgroundColor: '#E5E5E7',
    height: 44,
  },
  denyButton: {
  },
  confirmButton: {
  },
  denyButtonText: {
    fontSize: 17,
  },
  confirmButtonText: {
    fontSize: 17,
  },
});

export default CustomDialog;
