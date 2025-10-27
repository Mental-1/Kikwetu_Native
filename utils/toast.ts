import Toast from 'react-native-simple-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

export const showToast = (type: ToastType, options: ToastOptions) => {
  const { title, message, duration = 3000, position = 'bottom' } = options;
  
  const fullMessage = title ? `${title}: ${message}` : message;
  
  // Convert duration from milliseconds to seconds (simple-toast expects seconds)
  const durationInSeconds = Math.round(duration / 1000);
  
  // Use the correct gravity constants
  const gravity = position === 'top' ? Toast.TOP : position === 'center' ? Toast.CENTER : Toast.BOTTOM;
  Toast.showWithGravity(fullMessage, durationInSeconds, gravity);
};

// Convenience methods
export const showSuccessToast = (message: string, title?: string) => {
  showToast('success', { title: title || 'Success', message });
};

export const showErrorToast = (message: string, title?: string) => {
  showToast('error', { title: title || 'Error', message });
};

export const showInfoToast = (message: string, title?: string) => {
  showToast('info', { title: title || 'Info', message });
};

export const showWarningToast = (message: string, title?: string) => {
  showToast('warning', { title: title || 'Warning', message });
};

export default Toast;
