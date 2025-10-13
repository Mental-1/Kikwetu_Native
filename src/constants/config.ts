// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://app.ki-kwetu.com';

// App Configuration
export const APP_CONFIG = {
  name: 'Kikwetu',
  version: '1.0.0',
  currency: 'KES',
  defaultLanguage: 'en',
  defaultTheme: 'light',
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  search: {
    debounceMs: 300,
    minLength: 1,
  },
  imageUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImages: 10,
  },
  listing: {
    maxTitleLength: 100,
    maxDescriptionLength: 1000,
    maxTags: 5,
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  enablePushNotifications: true,
  enableLocationServices: true,
  enableCameraUpload: true,
  enableOfflineMode: false,
  enableAnalytics: true,
  enableCrashReporting: true,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  
  // User
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    avatar: '/user/avatar',
    stats: '/user/stats',
  },
  
  // Listings
  listings: {
    base: '/listings',
    myListings: '/listings/my-listings',
    categories: '/listings/categories',
    search: '/listings/search',
    images: '/listings/images',
  },
  
  // Saved Listings
  savedListings: {
    base: '/saved-listings',
    check: '/saved-listings/check',
    export: '/saved-listings/export',
  },
  
  // Payment Methods
  paymentMethods: {
    base: '/payment-methods',
    setDefault: '/payment-methods/set-default',
    toggle: '/payment-methods/toggle',
  },
  
  // Plans & Subscriptions
  plans: {
    base: '/plans',
    pricing: '/plans/pricing',
  },
  subscriptions: {
    base: '/subscriptions',
    current: '/subscriptions/current',
    cancel: '/subscriptions/cancel',
    reactivate: '/subscriptions/reactivate',
  },
  
  // Transactions
  transactions: {
    base: '/transactions',
    receipt: '/transactions/receipt',
    invoice: '/transactions/invoice',
    export: '/transactions/export',
    categories: '/transactions/categories',
    stats: '/transactions/stats',
  },
  
  // Notifications
  notifications: {
    base: '/notifications',
    markRead: '/notifications/mark-read',
    settings: '/notifications/settings',
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  timeout: 'Request timed out. Please try again.',
  unknown: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  saved: 'Saved successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  created: 'Created successfully',
  uploaded: 'Uploaded successfully',
  sent: 'Sent successfully',
};

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^\+254[0-9]{9}$/,
    message: 'Please enter a valid Kenyan phone number (+254XXXXXXXXX)',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
  },
};
