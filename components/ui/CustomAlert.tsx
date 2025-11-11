import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'destructive' | 'cancel';
  color?: string;
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

const CustomAlert = React.memo(({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  icon,
  iconColor = Colors.primary,
}: CustomAlertProps) => {
  const handleButtonPress = React.useCallback((onPress?: () => void) => {
    onPress?.();
  }, []);

  const handleRequestClose = React.useCallback(() => {
    const cancelButton = buttons.find(btn => btn.style === 'cancel');
    if (cancelButton && cancelButton.onPress) {
      cancelButton.onPress();
    } else if (buttons.length > 0 && buttons[0].onPress) {
      buttons[0].onPress();
    }
  }, [buttons]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
      hardwareAccelerated
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.alertContainer}>
          <View style={styles.alert}>
            {/* Icon */}
            {icon && (
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={icon} 
                  size={48} 
                  color={iconColor} 
                />
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Separator Line */}
            {message ? <View style={styles.separator} /> : null}
            
            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleButtonPress(button.onPress)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.buttonText,
                      { color: button.color || (button.style === 'destructive' ? Colors.red : '#007AFF') }
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                  {index < buttons.length - 1 && <View style={styles.buttonSeparator} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

CustomAlert.displayName = 'CustomAlert';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.75,
    marginHorizontal: width * 0.125,
  },
  alert: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  message: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  separator: {
    height: 0.5,
    backgroundColor: '#E5E5E7',
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  buttonSeparator: {
    height: 0.5,
    backgroundColor: '#E5E5E7',
    width: '100%',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CustomAlert;
