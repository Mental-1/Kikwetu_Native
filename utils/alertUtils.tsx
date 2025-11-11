import CustomAlert from '@/components/ui/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'destructive' | 'cancel';
  color?: string;
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: string;
  iconColor?: string;
  autoDismiss?: number;
}

interface AlertHook {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  AlertComponent: React.FC;
}

export const useCustomAlert = (): AlertHook => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  });
  const autoDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (alertOptions: AlertOptions) => {
    setOptions({
      ...alertOptions,
      buttons: alertOptions.buttons || [{ text: 'OK', onPress: () => hideAlert() }],
    });
    setVisible(true);
    
    // Clear any existing timeout
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
    }
    
    // Set auto-dismiss if specified
    if (alertOptions.autoDismiss && alertOptions.autoDismiss > 0) {
      autoDismissTimeoutRef.current = setTimeout(() => {
        hideAlert();
      }, alertOptions.autoDismiss);
    }
  };

  const hideAlert = () => {
    setVisible(false);
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
      autoDismissTimeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoDismissTimeoutRef.current) {
        clearTimeout(autoDismissTimeoutRef.current);
      }
    };
  }, []);

  const handlePress = React.useCallback((onPress?: () => void) => {
    onPress?.();
    hideAlert();
  }, []);

  const AlertComponent: React.FC = React.useCallback(() => (
    <CustomAlert
      visible={visible}
      title={options.title}
      message={options.message}
      buttons={options.buttons?.map(btn => ({
        ...btn,
        onPress: () => handlePress(btn.onPress),
      })) || [{ text: 'OK', onPress: () => handlePress() }]}
      icon={options.icon as keyof typeof Ionicons.glyphMap}
      iconColor={options.iconColor}
    />
  ), [visible, options, handlePress]);

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

export const createAlertHelpers = (showAlert: (options: AlertOptions) => void) => ({
  success: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      buttons: [{ text: 'OK', color: '#4CAF50' }],
      autoDismiss: 1500,
    }),
  
  error: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'alert-circle',
      iconColor: '#F44336',
      buttons: [{ text: 'OK', color: '#F44336' }],
    }),
  
  warning: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'warning',
      iconColor: '#FF9800',
      buttons: [{ text: 'OK', color: '#FF9800' }],
    }),
  
  info: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'information-circle',
      iconColor: '#2196F3',
      buttons: [{ text: 'OK', color: '#2196F3' }],
    }),
  
  copy: (message?: string) => 
    showAlert({
      title: 'Copied!',
      message: message || 'Text has been copied to clipboard',
      icon: 'copy',
      iconColor: '#4CAF50',
      buttons: [{ text: 'OK', color: '#4CAF50' }],
    }),
  
  locationSuccess: (message?: string) => 
    showAlert({
      title: 'Location Detected!',
      message: message || 'Your location has been automatically detected and filled in.',
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      buttons: [{ text: 'OK', color: '#4CAF50' }],
      autoDismiss: 2000, 
    }),
});
