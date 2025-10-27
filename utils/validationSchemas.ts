import { z } from 'zod';

// Payment method validation schemas
export const cardValidationSchema = z.object({
  cardNumber: z.string()
    .min(1, 'Card number is required')
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Card number must be 16 digits with spaces'),
  expiryDate: z.string()
    .min(1, 'Expiry date is required')
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvv: z.string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardholderName: z.string()
    .min(1, 'Cardholder name is required')
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(50, 'Cardholder name must be less than 50 characters'),
});

export const bankValidationSchema = z.object({
  bankName: z.string()
    .min(1, 'Bank name is required')
    .min(2, 'Bank name must be at least 2 characters')
    .max(50, 'Bank name must be less than 50 characters'),
  accountNumber: z.string()
    .min(1, 'Account number is required')
    .regex(/^\d{8,20}$/, 'Account number must be 8-20 digits'),
});

export const mobileValidationSchema = z.object({
  mobileProvider: z.string()
    .min(1, 'Mobile provider is required')
    .min(2, 'Mobile provider must be at least 2 characters')
    .max(30, 'Mobile provider must be less than 30 characters'),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits with optional country code'),
});

export const paymentMethodValidationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('card'),
    ...cardValidationSchema.shape,
  }),
  z.object({
    type: z.literal('bank'),
    ...bankValidationSchema.shape,
  }),
  z.object({
    type: z.literal('mobile'),
    ...mobileValidationSchema.shape,
  }),
]);

// Utility functions for formatting
export const formatCardNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Add spaces every 4 digits
  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  // Limit to 16 digits (19 characters with spaces)
  return formatted.substring(0, 19);
};

export const formatExpiryDate = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Add slash after 2 digits
  if (digits.length >= 2) {
    return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
  }
  
  return digits;
};

export const formatCVV = (value: string): string => {
  // Remove all non-digits and limit to 4 characters
  return value.replace(/\D/g, '').substring(0, 4);
};

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits and plus sign, then add back plus if it was there
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + if it has country code
  if (cleaned.length > 10 && !cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  
  return cleaned;
};

// Validation helper functions
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(digits);
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  return expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth);
};

export const validateCVV = (cvv: string, cardNumber?: string): boolean => {
  // American Express cards typically have 4-digit CVV, others have 3
  const isAmex = cardNumber?.startsWith('3');
  const expectedLength = isAmex ? 4 : 3;
  
  return /^\d+$/.test(cvv) && cvv.length === expectedLength;
};
