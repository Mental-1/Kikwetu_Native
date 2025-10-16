# 🔍 Database Schema vs API Types - Alignment Analysis

## ⚠️ **Critical Mismatches Found**

This document compares `utils/supabase/database.types.ts` (actual database) with `src/types/api.types.ts` (frontend API types).

---

## 🚨 **CRITICAL ISSUES**

### 1. **Subscriptions & Plans - Major Discrepancy**

**Database Schema (plans table):**
```typescript
{
  id: string;
  name: string;
  price: number;              // SINGLE PRICE FIELD
  duration: number;
  max_listings: number | null;
  features: Json | null;
  user_id: string | null;     // User-specific plans?
  created_at: string | null;
  updated_at: string | null;
}
```

**Current API Type (WRONG):**
```typescript
{
  id: string;
  name: string;
  monthly_price: number;      // ❌ DOESN'T EXIST
  annual_price: number;       // ❌ DOESN'T EXIST
  color: string;              // ❌ DOESN'T EXIST
  icon: string;               // ❌ DOESN'T EXIST
  // Missing: user_id
}
```

**Fix Required:** Plans table only has ONE `price` field. The backend needs to either:
- Store billing cycle in subscriptions table
- Have separate plan records for monthly/annual
- Calculate pricing based on `duration` field

---

### 2. **Messages/Conversations - Encrypted Structure**

**Database Schema (conversations):**
```typescript
{
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  listing_id: string | null;
  encryption_key: string;     // Messages are ENCRYPTED
  created_at: string | null;
  updated_at: string | null;
}
```

**Database Schema (encrypted_messages):**
```typescript
{
  id: string;
  conversation_id: string | null;
  sender_id: string | null;
  encrypted_content: string;  // Not plain text!
  iv: string;                 // Encryption IV
  message_type: string | null;
  read_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

**Current API Type (WRONG):**
```typescript
ApiConversation {
  participant_1_id: string;   // ❌ Should be buyer_id/seller_id
  participant_2_id: string;   // ❌ Should be buyer_id/seller_id
  // Missing: listing_id, encryption_key
}

ApiMessage {
  message: string;            // ❌ Should be encrypted_content
  recipient_id: string;       // ❌ Not in schema
  // Missing: iv, message_type, encrypted_content
}
```

**Fix Required:** Messages need encryption/decryption handling in the API layer.

---

### 3. **Subscriptions Table - Missing Fields**

**Database Schema:**
```typescript
{
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'free';
  start_date: string;
  end_date: string | null;
  transaction_id: string | null;  // ❌ MISSING in API type
  created_at: string;
  updated_at: string;
}
```

**Current API Type (has fields that DON'T EXIST):**
```typescript
{
  billing_cycle: 'monthly' | 'annual';  // ❌ NOT IN DATABASE
  next_billing_date?: string;           // ❌ NOT IN DATABASE
  auto_renew: boolean;                  // ❌ NOT IN DATABASE
  amount: number;                       // ❌ NOT IN DATABASE
  currency: string;                     // ❌ NOT IN DATABASE
}
```

---

## 📋 **Field-by-Field Analysis**

### **Listings Table**

| Field | Database Type | API Type | Status | Fix Needed |
|-------|--------------|----------|--------|------------|
| `plan_id` | `string \| null` | ❌ Missing | **CRITICAL** | Add to ApiListing |
| `plan_name` | `string \| null` | ❌ Missing | **CRITICAL** | Add to ApiListing |
| `featured` | `boolean \| null` | ❌ Missing | **HIGH** | Add to ApiListing |
| `featured_tier` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiListing |
| `featured_until` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiListing |
| `activated_at` | `string \| null` | ❌ Missing | **MEDIUM** | Add to ApiListing |
| `tags` | `string[] \| null` | ❌ Missing | **MEDIUM** | Add to ApiListing |
| `negotiable` | `boolean \| null` | `boolean` (not null) | **LOW** | Make nullable |
| `images` | `string[] \| null` | `string[]` (not null) | **LOW** | Make nullable |
| `views` | `number \| null` | `number` (not null) | **LOW** | Make nullable |
| `store_id` | ❌ Not in DB | `number` in API type | **REMOVE** | Remove from API type |

### **Profiles Table**

| Field | Database | API Type | Status | Fix Needed |
|-------|----------|----------|--------|------------|
| `timezone` | `string` | ❌ Missing | **HIGH** | Add to UserProfile |
| `birth_date` | `string \| null` | ❌ Missing | **MEDIUM** | Add to UserProfile |
| `nationality` | `string \| null` | ❌ Missing | **LOW** | Add to UserProfile |
| `email_verified` | `boolean` | ❌ Missing | **HIGH** | Add to UserProfile |
| `phone_verified` | `boolean` | ❌ Missing | **HIGH** | Add to UserProfile |
| `mfa_enabled` | `boolean \| null` | ❌ Missing | **HIGH** | Add to UserProfile |
| `referral_code` | `string \| null` | ❌ Missing | **MEDIUM** | Add to UserProfile |
| `current_plan_id` | `string \| null` | ❌ Missing | **HIGH** | Add to UserProfile |
| `deleted_at` | `string \| null` | ❌ Missing | **MEDIUM** | Add to UserProfile |
| `banned_until` | `string \| null` | ❌ Missing | **MEDIUM** | Add to UserProfile |
| `is_flagged` | `boolean \| null` | ❌ Missing | **MEDIUM** | Add to UserProfile |
| `authenticated` | `boolean \| null` | ❌ Missing | **LOW** | Add to UserProfile |
| `phone` | `string \| null` | Exists as `phone_number` | ✅ OK | - |

### **Transactions Table**

| Field | Database | API Type | Status | Fix Needed |
|-------|----------|----------|--------|------------|
| `checkout_request_id` | `string \| null` | ❌ Missing | **CRITICAL** | Add (M-Pesa) |
| `merchant_request_id` | `string \| null` | ❌ Missing | **CRITICAL** | Add (M-Pesa) |
| `phone_number` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiTransaction |
| `email` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiTransaction |
| `psp_transaction_id` | `string \| null` | ❌ Missing | **CRITICAL** | Add (PSP = Payment Service Provider) |
| `psp_event_id` | `string \| null` | ❌ Missing | **CRITICAL** | Add (for webhooks) |
| `transaction_token` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiTransaction |
| `listing_id` | `string \| null` | ❌ Missing | **HIGH** | Add to ApiTransaction |
| `discount_code_id` | `number \| null` | ❌ Missing | **MEDIUM** | Add to ApiTransaction |
| `type` | ❌ Not in DB | Exists in API | **REMOVE** | Derive from context |
| `category` | ❌ Not in DB | Exists in API | **REMOVE** | Derive from context |
| `currency` | ❌ Not in DB | Exists in API | **REMOVE** | Get from profile |

### **Stores Table** (lines 969-1049)

**Database has stores, but no API service created yet!**

```typescript
{
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  description: string | null;
  profile_url: string | null;
  banner_url: string | null;
  category: string | null;
  location_city: string | null;
  location_country: string | null;
  contact_email: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  verification_date: string | null;
  follower_count: number | null;
  like_count: number | null;
  average_rating: number | null;
  total_ratings: number | null;
  total_sales: number | null;
  total_products: number | null;
  currency: string | null;
  policies: Json | null;
  created_at: string;
  updated_at: string;
}
```

---

## 🔧 **Required Fixes**

### **Priority 1 - Critical (Breaks Core Functionality)**

1. **Fix Subscription Plans Structure**
   - Remove `monthly_price`, `annual_price`, `color`, `icon` from API type
   - Add `user_id` field
   - Backend needs to clarify billing cycle handling

2. **Fix Message Encryption**
   - Update `ApiConversation` to use `buyer_id`, `seller_id`, `listing_id`
   - Update `ApiMessage` to handle `encrypted_content` and `iv`
   - Add encryption/decryption in backend controllers

3. **Fix Transaction Fields for M-Pesa/Paystack**
   - Add `checkout_request_id`, `merchant_request_id` (M-Pesa)
   - Add `psp_transaction_id`, `psp_event_id` (PSP tracking)
   - Add `phone_number`, `email`, `listing_id`, `transaction_token`

### **Priority 2 - High (Missing Important Features)**

4. **Complete Listings Type**
   - Add `plan_id`, `plan_name` (critical for billing)
   - Add `featured`, `featured_tier`, `featured_until` (premium features)
   - Add `tags` (search functionality)
   - Add `activated_at` (listing lifecycle)

5. **Complete Profile Type**
   - Add `timezone` (localization)
   - Add `email_verified`, `phone_verified` (security)
   - Add `mfa_enabled` (2FA support)
   - Add `current_plan_id` (subscription status)
   - Add `referral_code` (referral program)

6. **Create Stores API Service** (currently missing entirely!)

### **Priority 3 - Medium (Nice to Have)**

7. Add remaining profile fields: `birth_date`, `nationality`, `deleted_at`, `banned_until`, `is_flagged`
8. Add `discount_code_id` to transactions
9. Make nullable fields properly nullable in API types

---

## 📝 **Recommended Actions**

### **Immediate (Before Testing)**

1. ✅ Create corrected `api.types.ts` with all missing fields
2. ⚠️ Discuss with backend team: How are monthly/annual plans differentiated?
3. ⚠️ Clarify message encryption strategy (client-side or server-side?)
4. ✅ Create `stores.service.ts` and corresponding hooks

### **Before Production**

5. Align backend API responses with actual database schema
6. Add database migration if monthly/annual pricing needed
7. Implement message encryption/decryption layer
8. Add comprehensive type validation in backend controllers

---

## 🎯 **Backend API Alignment Needed**

The backend `vps-api` controllers should return:
- Actual database field names (not invented fields)
- Handle encryption/decryption for messages
- Map `plans.price` to monthly/annual pricing logic
- Return nullable fields as nullable

---

## ✅ **What's Working Well**

- Basic auth structure ✅
- Core listing fields (title, description, price, location) ✅
- Transaction status tracking ✅
- Payment method basics ✅

---

## 📊 **Compatibility Score**

| Entity | Match % | Critical Issues |
|--------|---------|-----------------|
| **Listings** | 65% | Missing 8 fields |
| **Profiles** | 70% | Missing 11 fields |
| **Transactions** | 50% | Missing 9 fields, 3 extra |
| **Subscriptions** | 40% | 5 invented fields |
| **Plans** | 30% | 3 invented fields |
| **Messages** | 20% | Wrong structure |
| **Stores** | 0% | No API service |

**Overall: ~50% alignment** ⚠️

---

## 🚀 **Next Steps**

Would you like me to:
1. ✅ **Create corrected `api.types.ts`** with all proper fields?
2. ✅ **Update all services** to use correct field names?
3. ✅ **Create `stores.service.ts`** and hooks?
4. ⚠️ **Create backend alignment guide** for VPS API?
5. ⚠️ **Add message encryption handling**?

Let me know which fixes to prioritize!

