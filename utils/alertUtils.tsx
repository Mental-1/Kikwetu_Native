import CustomAlert from '@/components/ui/CustomAlert';
import React, { useEffect, useRef, useState } from 'react';

interface AlertOptions {
  title: string;
  message?: string;
  buttonText?: string;
  icon?: string;
  iconColor?: string;
  buttonColor?: string;
  onPress?: () => void;
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
    buttonText: 'OK',
  });
  const autoDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (alertOptions: AlertOptions) => {
    setOptions(alertOptions);
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

  const handlePress = () => {
    options.onPress?.();
    hideAlert();
  };

  const AlertComponent = React.useMemo(() => () => (
    <CustomAlert
      visible={visible}
      title={options.title}
      message={options.message}
      buttonText={options.buttonText}
      onPress={handlePress}
      icon={options.icon}
      iconColor={options.iconColor}
      buttonColor={options.buttonColor}
    />
  ), [visible, options, handlePress]);

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

// Convenience functions for common alerts
export const createAlertHelpers = (showAlert: (options: AlertOptions) => void) => ({
  success: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      buttonColor: '#4CAF50',
      autoDismiss: 1500,
    }),
  
  error: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'alert-circle',
      iconColor: '#F44336',
      buttonColor: '#F44336',
    }),
  
  warning: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'warning',
      iconColor: '#FF9800',
      buttonColor: '#FF9800',
    }),
  
  info: (title: string, message?: string) => 
    showAlert({
      title,
      message,
      icon: 'information-circle',
      iconColor: '#2196F3',
      buttonColor: '#2196F3',
    }),
  
  copy: (message?: string) => 
    showAlert({
      title: 'Copied!',
      message: message || 'Text has been copied to clipboard',
      icon: 'copy',
      iconColor: '#4CAF50',
      buttonColor: '#4CAF50',
    }),
  
  locationSuccess: (message?: string) => 
    showAlert({
      title: 'Location Detected!',
      message: message || 'Your location has been automatically detected and filled in.',
      icon: 'checkmark-circle',
      iconColor: '#4CAF50',
      buttonColor: '#4CAF50',
      autoDismiss: 2000, // Auto-dismiss after 2 seconds
    }),
});
