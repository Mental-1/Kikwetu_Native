/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// User types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  verified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// Profile types
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone_number?: string;
  website?: string;
  rating: number;
  reviews_count: number;
  listing_count: number;
  verified?: boolean;
  role: string;
  theme: string;
  language: string;
  currency: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  listing_updates: boolean;
  new_messages: boolean;
  price_alerts: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_last_seen: boolean;
  profile_visibility: string;
  created_at?: string;
  updated_at?: string;
}

// Stats types
export interface UserStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalSaved: number;
  rating: number;
  reviewsCount: number;
}

// Listing types
export interface ApiListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id: number;
  subcategory_id?: number;
  condition: string;
  location: string;
  latitude?: number;
  longitude?: number;
  negotiable: boolean;
  images: string[];
  user_id: string;
  store_id?: number;
  status: 'draft' | 'active' | 'pending' | 'rejected' | 'under_review' | 'deleted' | 'sold' | 'expired';
  payment_status?: 'pending' | 'completed' | 'failed';
  plan?: string;
  views: number;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
}

// Transaction types
export interface ApiTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'one-time' | 'refund' | 'payout';
  category: 'plan' | 'listing' | 'feature' | 'refund' | 'withdrawal';
  description: string;
  payment_method: string;
  reference: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Payment types
export interface ApiPaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'mobile';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Subscription types
export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  monthly_price: number;
  annual_price: number;
  duration: number;
  max_listings?: number;
  features: string[];
  is_popular?: boolean;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSubscription {
  id: string;
  plan_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'free';
  billing_cycle: 'monthly' | 'annual';
  start_date: string;
  end_date?: string;
  next_billing_date?: string;
  auto_renew: boolean;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// Message types
export interface ApiConversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Saved listing types
export interface ApiSavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  notes?: string;
  created_at: string;
  listing?: ApiListing;
}

// Payment response types
export interface MpesaPaymentResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  transactionId: string;
  message: string;
}

export interface PaystackPaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
  transactionId: string;
}

