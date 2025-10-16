# 🎯 Full Schema Alignment Plan - Option 2

## 📋 **Executive Summary**

**Goal:** Align frontend types, services, and backend API with actual Supabase database schema  
**Estimated Time:** 3-4 hours  
**Files to Modify:** 25 files  
**Files to Create:** 6 files  
**Risk Level:** Medium (breaking changes to types, but systematic approach)

---

## 🗂️ **Phase Breakdown**

### **PHASE 1: Type System Corrections** (45 min)
Fix all type definitions to match actual database schema

### **PHASE 2: Backend API Alignment** (60 min)  
Update Deno API controllers to return correct schema fields

### **PHASE 3: Frontend Service Updates** (45 min)
Update all services to use corrected types

### **PHASE 4: Stores Implementation** (30 min)
Create missing stores functionality

### **PHASE 5: Encryption & Complex Features** (30 min)
Add message encryption and advanced features

### **PHASE 6: Testing & Validation** (30 min)
Verify all changes work end-to-end

---

## 📝 **Detailed Task List**

---

## **PHASE 1: Type System Corrections** ⚡

### **Task 1.1: Create Corrected `api.types.ts`**
**File:** `src/types/api.types.ts`  
**Action:** Complete rewrite with database-aligned types  

**Changes:**
```typescript
// ❌ REMOVE these invented fields:
ApiSubscriptionPlan {
  - monthly_price
  - annual_price
  - color
  - icon
}

// ✅ ADD correct database fields:
ApiSubscriptionPlan {
  + price: number              // Single price field
  + duration: number           // Plan duration
  + max_listings: number | null
  + features: string[]         // From JSON
  + user_id: string | null     // User-specific plans
}

// ❌ REMOVE invented subscription fields:
ApiSubscription {
  - billing_cycle
  - next_billing_date
  - auto_renew
  - amount
  - currency
}

// ✅ ADD correct fields:
ApiSubscription {
  + transaction_id: string | null
  // Keep: plan_id, user_id, status, start_date, end_date
}

// ✅ FIX Messages structure:
ApiConversation {
  - participant_1_id           // Remove
  - participant_2_id           // Remove
  + buyer_id: string | null    // Add
  + seller_id: string | null   // Add
  + listing_id: string | null  // Add
  + encryption_key: string     // Add (for message encryption)
}

ApiMessage {
  - recipient_id               // Remove
  + conversation_id: string    // Add
  + encrypted_content: string  // Add
  + iv: string                 // Add (encryption IV)
  + message_type: string | null // Add
  + read_at: string | null     // Change from is_read
}

// ✅ ADD missing listing fields:
ApiListing {
  + plan_id: string | null
  + plan_name: string | null
  + featured: boolean | null
  + featured_tier: string | null
  + featured_until: string | null
  + activated_at: string | null
  + tags: string[] | null
  + negotiable: boolean | null  // Make nullable
  - store_id                    // Remove (not in DB)
}

// ✅ ADD missing transaction fields:
ApiTransaction {
  + checkout_request_id: string | null  // M-Pesa
  + merchant_request_id: string | null  // M-Pesa
  + psp_transaction_id: string | null   // PSP tracking
  + psp_event_id: string | null         // Webhook events
  + phone_number: string | null
  + email: string | null
  + listing_id: string | null
  + discount_code_id: number | null
  + transaction_token: string | null
  - type                                 // Remove
  - category                             // Remove
  - currency                             // Remove
}

// ✅ COMPLETE profile type:
UserProfile {
  + timezone: string
  + birth_date: string | null
  + nationality: string | null
  + email_verified: boolean
  + phone_verified: boolean
  + mfa_enabled: boolean | null
  + referral_code: string | null
  + current_plan_id: string | null
  + deleted_at: string | null
  + banned_until: string | null
  + is_flagged: boolean | null
  + authenticated: boolean | null
}
```

**New Types to Add:**
```typescript
// Stores (completely missing)
export interface ApiStore {
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
  policies: any | null;
  created_at: string;
  updated_at: string;
}

// Discount Codes
export interface ApiDiscountCode {
  id: number;
  code: string;
  type: 'PERCENTAGE_DISCOUNT' | 'FIXED_AMOUNT_DISCOUNT' | 'EXTRA_LISTING_DAYS';
  value: number;
  max_uses: number | null;
  use_count: number | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string;
}

// Reviews
export interface ApiReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

// Notifications
export interface ApiNotification {
  id: string;
  user_id: string | null;
  listing_id: string | null;
  type: string;
  title: string;
  message: string;
  data: any | null;
  read: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
```

---

## **PHASE 2: Backend API Alignment** 🔧

### **Task 2.1: Update Plans Controller**
**File:** `vps-api/src/v1/controllers/subscriptionsController.ts`

**Changes Needed:**
```typescript
// Current (WRONG):
return plans.map(plan => ({
  ...plan,
  monthly_price: plan.price,      // ❌ Remove
  annual_price: plan.price * 10,  // ❌ Remove
  color: '#3B82F6',               // ❌ Remove
  icon: 'star'                    // ❌ Remove
}));

// Corrected:
return plans.map(plan => ({
  id: plan.id,
  name: plan.name,
  price: plan.price,              // ✅ Single price
  duration: plan.duration,        // ✅ Duration in days
  max_listings: plan.max_listings,
  features: plan.features || [],
  user_id: plan.user_id,
  created_at: plan.created_at,
  updated_at: plan.updated_at
}));

// Add helper endpoint for pricing calculation:
// GET /subscriptions/plans/:id/pricing?cycle=monthly|annual
async getPlanPricing(ctx) {
  const { id } = ctx.params;
  const { cycle } = ctx.request.url.searchParams;
  
  const plan = await db.from('plans').select('*').eq('id', id).single();
  
  const pricing = {
    monthly: plan.price,
    annual: plan.price * 12 * 0.85, // 15% annual discount
    duration: plan.duration
  };
  
  return { pricing, cycle: cycle || 'monthly' };
}
```

### **Task 2.2: Update Messages Controller**
**File:** `vps-api/src/v1/controllers/messagesController.ts`

**Add encryption utilities:**
```typescript
// Create: vps-api/src/v1/utils/encryption.ts
import { crypto } from "https://deno.land/std/crypto/mod.ts";

export async function encryptMessage(message: string, key: string) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  // Implementation for AES-256-GCM encryption
  return { encrypted: encryptedBase64, iv: ivBase64 };
}

export async function decryptMessage(encrypted: string, iv: string, key: string) {
  // Implementation for AES-256-GCM decryption
  return decryptedMessage;
}
```

**Update controller:**
```typescript
// GET /messages/conversations
async getConversations(ctx) {
  const conversations = await db
    .from('conversations')
    .select(`
      *,
      buyer:profiles!buyer_id(id, username, avatar_url),
      seller:profiles!seller_id(id, username, avatar_url),
      listing:listings(id, title, images)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  
  return conversations; // Return with buyer_id, seller_id, listing_id
}

// GET /messages/conversations/:id
async getConversationMessages(ctx) {
  const { id } = ctx.params;
  
  const conversation = await db
    .from('conversations')
    .select('encryption_key')
    .eq('id', id)
    .single();
  
  const messages = await db
    .from('encrypted_messages')
    .select('*')
    .eq('conversation_id', id);
  
  // Decrypt messages before sending
  const decrypted = await Promise.all(
    messages.map(async (msg) => ({
      ...msg,
      message: await decryptMessage(msg.encrypted_content, msg.iv, conversation.encryption_key)
    }))
  );
  
  return decrypted;
}

// POST /messages
async sendMessage(ctx) {
  const { recipient_id, message, listing_id } = await ctx.request.body().value;
  
  // Get or create conversation
  const conversation = await getOrCreateConversation(userId, recipient_id, listing_id);
  
  // Encrypt message
  const { encrypted, iv } = await encryptMessage(message, conversation.encryption_key);
  
  // Store encrypted message
  const newMessage = await db.from('encrypted_messages').insert({
    conversation_id: conversation.id,
    sender_id: userId,
    encrypted_content: encrypted,
    iv: iv,
    message_type: 'text'
  }).select().single();
  
  return newMessage;
}
```

### **Task 2.3: Update Listings Controller**
**File:** `vps-api/src/v1/controllers/listingsController.ts`

**Add missing fields to responses:**
```typescript
async getListings(ctx) {
  const listings = await db
    .from('listings')
    .select(`
      *,
      category:categories(id, name, icon),
      plan:plans(id, name, price, duration),
      user:profiles(id, username, avatar_url, rating)
    `)
    .eq('status', 'active');
  
  // Map to include plan_name from relationship
  return listings.map(listing => ({
    ...listing,
    plan_name: listing.plan?.name || null,
    // All other fields already exist in DB
  }));
}
```

### **Task 2.4: Update Transactions Controller**
**File:** `vps-api/src/v1/controllers/transactionsController.ts`

**Return all database fields:**
```typescript
async getTransactions(ctx) {
  const transactions = await db
    .from('transactions')
    .select(`
      *,
      listing:listings(id, title),
      discount:discount_codes(code, type, value)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  // Return ALL fields from database
  return transactions.map(txn => ({
    id: txn.id,
    amount: txn.amount,
    status: txn.status,
    payment_method: txn.payment_method,
    reference: txn.reference,
    user_id: txn.user_id,
    listing_id: txn.listing_id,
    phone_number: txn.phone_number,
    email: txn.email,
    checkout_request_id: txn.checkout_request_id,
    merchant_request_id: txn.merchant_request_id,
    psp_transaction_id: txn.psp_transaction_id,
    psp_event_id: txn.psp_event_id,
    transaction_token: txn.transaction_token,
    discount_code_id: txn.discount_code_id,
    created_at: txn.created_at,
    updated_at: txn.updated_at,
    // Related data
    listing: txn.listing,
    discount: txn.discount
  }));
}
```

### **Task 2.5: Update User/Profile Controller**
**File:** `vps-api/src/v1/controllers/userController.ts`

**Return complete profile:**
```typescript
async getProfile(ctx) {
  const profile = await db
    .from('profiles')
    .select(`
      *,
      current_plan:plans(id, name, price, duration)
    `)
    .eq('id', userId)
    .single();
  
  // Return ALL fields from database
  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    location: profile.location,
    phone_number: profile.phone_number,
    website: profile.website,
    rating: profile.rating,
    reviews_count: profile.reviews_count,
    listing_count: profile.listing_count,
    verified: profile.verified,
    role: profile.role,
    // Preferences
    theme: profile.theme,
    language: profile.language,
    timezone: profile.timezone,
    currency: profile.currency,
    // Notifications
    email_notifications: profile.email_notifications,
    push_notifications: profile.push_notifications,
    sms_notifications: profile.sms_notifications,
    marketing_emails: profile.marketing_emails,
    listing_updates: profile.listing_updates,
    new_messages: profile.new_messages,
    price_alerts: profile.price_alerts,
    // Privacy
    show_email: profile.show_email,
    show_phone: profile.show_phone,
    show_last_seen: profile.show_last_seen,
    profile_visibility: profile.profile_visibility,
    // Verification
    email_verified: profile.email_verified,
    phone_verified: profile.phone_verified,
    mfa_enabled: profile.mfa_enabled,
    // Additional
    birth_date: profile.birth_date,
    nationality: profile.nationality,
    referral_code: profile.referral_code,
    current_plan_id: profile.current_plan_id,
    deleted_at: profile.deleted_at,
    banned_until: profile.banned_until,
    is_flagged: profile.is_flagged,
    authenticated: profile.authenticated,
    // Timestamps
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    // Related
    current_plan: profile.current_plan
  };
}
```

### **Task 2.6: Create Stores Controller**
**File:** `vps-api/src/v1/controllers/storesController.ts` (NEW)

```typescript
import { RouterContext } from "oak";
import { db } from "../config/database.ts";
import { successResponse, errorResponse } from "../utils/responses.ts";

export class StoresController {
  // GET /stores - Get all stores
  async getStores(ctx: RouterContext<string>) {
    try {
      const { page = 1, pageSize = 20, category, verified } = ctx.request.url.searchParams;
      
      let query = db.from('stores').select('*', { count: 'exact' });
      
      if (category) query = query.eq('category', category);
      if (verified) query = query.eq('is_verified', true);
      
      query = query.eq('is_active', true);
      
      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      ctx.response.body = successResponse(data, {
        page: Number(page),
        pageSize: Number(pageSize),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      });
    } catch (error) {
      ctx.response.body = errorResponse(error.message);
    }
  }

  // GET /stores/:id - Get single store
  async getStore(ctx: RouterContext<string>) {
    try {
      const { id } = ctx.params;
      
      const { data, error } = await db
        .from('stores')
        .select(`
          *,
          owner:profiles(id, username, avatar_url),
          listings:listings(id, title, price, images, status)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      ctx.response.body = successResponse(data);
    } catch (error) {
      ctx.response.body = errorResponse(error.message);
    }
  }

  // POST /stores - Create store
  async createStore(ctx: RouterContext<string>) {
    try {
      const userId = ctx.state.user.id;
      const body = await ctx.request.body().value;
      
      const { data, error } = await db
        .from('stores')
        .insert({
          ...body,
          owner_id: userId,
          is_active: true,
          is_verified: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      ctx.response.body = successResponse(data);
    } catch (error) {
      ctx.response.body = errorResponse(error.message);
    }
  }

  // PUT /stores/:id - Update store
  async updateStore(ctx: RouterContext<string>) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;
      const body = await ctx.request.body().value;
      
      const { data, error } = await db
        .from('stores')
        .update(body)
        .eq('id', id)
        .eq('owner_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      ctx.response.body = successResponse(data);
    } catch (error) {
      ctx.response.body = errorResponse(error.message);
    }
  }

  // DELETE /stores/:id - Delete store
  async deleteStore(ctx: RouterContext<string>) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;
      
      const { error } = await db
        .from('stores')
        .update({ is_active: false })
        .eq('id', id)
        .eq('owner_id', userId);
      
      if (error) throw error;
      
      ctx.response.body = successResponse({ message: 'Store deleted successfully' });
    } catch (error) {
      ctx.response.body = errorResponse(error.message);
    }
  }
}

export const storesController = new StoresController();
```

### **Task 2.7: Create Stores Routes**
**File:** `vps-api/src/v1/routes/stores.ts` (NEW)

```typescript
import { Router } from "oak";
import { storesController } from "../controllers/storesController.ts";
import { authenticateToken } from "../../middleware.ts";

const router = new Router();

router.get("/stores", storesController.getStores);
router.get("/stores/:id", storesController.getStore);
router.post("/stores", authenticateToken, storesController.createStore);
router.put("/stores/:id", authenticateToken, storesController.updateStore);
router.delete("/stores/:id", authenticateToken, storesController.deleteStore);

export default router;
```

### **Task 2.8: Add Stores Routes to Main Router**
**File:** `vps-api/src/router.ts`

```typescript
// Add import
import storesRouter from './v1/routes/stores.ts';

// Add route
router.use('/api/v1', storesRouter.routes());
```

---

## **PHASE 3: Frontend Service Updates** 🔄

### **Task 3.1: Update Subscriptions Service**
**File:** `src/services/subscriptions.service.ts`

```typescript
// Update getPlans to handle single price field
async getPlans(): Promise<ApiResponse<ApiSubscriptionPlan[]>> {
  return await apiClient.get<ApiSubscriptionPlan[]>('/subscriptions/plans');
}

// Add pricing calculation endpoint
async getPlanPricing(planId: string, cycle: 'monthly' | 'annual'): Promise<ApiResponse<any>> {
  return await apiClient.get(`/subscriptions/plans/${planId}/pricing`, { cycle });
}
```

### **Task 3.2: Update Messages Service**
**File:** `src/services/messages.service.ts`

```typescript
// Update getConversations to use buyer_id/seller_id
async getConversations(): Promise<ApiResponse<ApiConversation[]>> {
  return await apiClient.get<ApiConversation[]>('/messages/conversations');
}

// Message encryption handled by backend
async sendMessage(data: {
  recipient_id: string;
  message: string; // Plain text, backend encrypts
  listing_id?: string;
}): Promise<ApiResponse<ApiMessage>> {
  return await apiClient.post<ApiMessage>('/messages', data);
}
```

### **Task 3.3: Update Transactions Service**
**File:** `src/services/transactions.service.ts`

```typescript
// Update type to include all new fields
async getTransactions(filters?: any): Promise<ApiResponse<ApiTransaction[]>> {
  return await apiClient.get<ApiTransaction[]>('/transactions', filters);
}
```

### **Task 3.4: Create Stores Service**
**File:** `src/services/stores.service.ts` (NEW)

```typescript
import { ApiStore } from '../types/api.types';
import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

class StoresService {
  async getStores(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    verified?: boolean;
  }): Promise<PaginatedResponse<ApiStore>> {
    return await apiClient.get('/stores', params) as any;
  }

  async getStore(id: string): Promise<ApiResponse<ApiStore>> {
    return await apiClient.get<ApiStore>(`/stores/${id}`);
  }

  async createStore(data: Partial<ApiStore>): Promise<ApiResponse<ApiStore>> {
    return await apiClient.post<ApiStore>('/stores', data);
  }

  async updateStore(id: string, data: Partial<ApiStore>): Promise<ApiResponse<ApiStore>> {
    return await apiClient.put<ApiStore>(`/stores/${id}`, data);
  }

  async deleteStore(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/stores/${id}`);
  }

  async getStoreListings(id: string): Promise<ApiResponse<any[]>> {
    return await apiClient.get<any[]>(`/stores/${id}/listings`);
  }
}

export const storesService = new StoresService();
```

### **Task 3.5: Create Stores Hooks**
**File:** `src/hooks/useApiStores.ts` (NEW)

```typescript
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storesService } from '../services/stores.service';

export function useStores(params?: any) {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: async () => {
      const response = await storesService.getStores(params);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch stores');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStore(id: string) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      const response = await storesService.getStore(id);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch store');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storesService.createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      showSuccessToast('Store created successfully', 'Success');
    },
    onError: (error: Error) => {
      showErrorToast(error.message, 'Creation Failed');
    },
  });
}
```

### **Task 3.6: Update Subscriptions Hooks**
**File:** `src/hooks/useApiSubscriptions.ts`

```typescript
// Update to handle pricing calculation
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await subscriptionsService.getPlans();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch plans');
      }
      
      // Transform plans to include calculated pricing
      return response.data.map(plan => ({
        ...plan,
        monthlyPrice: plan.price,
        annualPrice: Math.round(plan.price * 12 * 0.85), // 15% discount
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}
```

---

## **PHASE 4: UI Updates** 🎨

### **Task 4.1: Update Plans-Billing Screen**
**File:** `src/app/(screens)/(dashboard)/plans-billing.tsx`

```typescript
// Update to use single price field with calculation
const subscriptionPlans = useMemo(() => {
  return (plansData || []).map(plan => ({
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.price,
    annualPrice: Math.round(plan.price * 12 * 0.85),
    duration: plan.duration,
    features: plan.features,
    // ... rest
  }));
}, [plansData]);
```

### **Task 4.2: Update Conversations Screen**
**File:** `src/app/(screens)/(dashboard)/conversations.tsx`

```typescript
// Update to use buyer_id/seller_id structure
const conversations = useMemo(() => {
  return (conversationsData || []).map(conv => {
    const isBuyer = conv.buyer_id === user?.id;
    const otherUser = isBuyer ? conv.seller : conv.buyer;
    
    return {
      id: conv.id,
      otherUser: otherUser,
      listing: conv.listing,
      lastMessage: conv.last_message,
      // ... rest
    };
  });
}, [conversationsData, user]);
```

---

## **PHASE 5: Documentation & Validation** 📚

### **Task 5.1: Update API Documentation**
Create: `vps-api/SCHEMA_ALIGNED_API.md`
- Document all corrected endpoints
- Show example responses matching database
- Note encryption handling for messages

### **Task 5.2: Create Type Validation Tests**
Create: `src/types/__tests__/api.types.test.ts`
- Validate type structure
- Ensure nullable fields
- Test type compatibility

---

## **PHASE 6: Testing Checklist** ✅

### **Backend Testing:**
- [ ] Plans endpoint returns single `price` field
- [ ] Messages are encrypted/decrypted properly
- [ ] Transactions include all M-Pesa/PSP fields
- [ ] Listings include plan_id, featured fields
- [ ] Profile returns all database fields
- [ ] Stores CRUD operations work

### **Frontend Testing:**
- [ ] Plans screen calculates monthly/annual pricing
- [ ] Messages send/receive encrypted properly
- [ ] Transactions display all fields
- [ ] My Listings show plan info
- [ ] Profile displays complete info
- [ ] Stores screens work (if UI exists)

### **Integration Testing:**
- [ ] M-Pesa payment creates transaction with correct fields
- [ ] Paystack payment creates transaction with PSP fields
- [ ] Message encryption roundtrip works
- [ ] Subscription creation uses correct schema
- [ ] All API types match database schema

---

## 📊 **File Modification Summary**

### **Files to Modify (19):**

**Backend (8 files):**
1. `vps-api/src/v1/controllers/subscriptionsController.ts`
2. `vps-api/src/v1/controllers/messagesController.ts`
3. `vps-api/src/v1/controllers/listingsController.ts`
4. `vps-api/src/v1/controllers/transactionsController.ts`
5. `vps-api/src/v1/controllers/userController.ts`
6. `vps-api/src/v1/controllers/paymentsController.ts`
7. `vps-api/src/router.ts`
8. `vps-api/src/middleware.ts` (if encryption utils needed)

**Frontend (11 files):**
1. `src/types/api.types.ts` - Complete rewrite
2. `src/services/subscriptions.service.ts`
3. `src/services/messages.service.ts`
4. `src/services/transactions.service.ts`
5. `src/services/listings.service.ts`
6. `src/services/user.service.ts`
7. `src/hooks/useApiSubscriptions.ts`
8. `src/hooks/useApiMessages.ts`
9. `src/app/(screens)/(dashboard)/plans-billing.tsx`
10. `src/app/(screens)/(dashboard)/conversations.tsx`
11. `src/app/(screens)/(dashboard)/transactions.tsx`

### **Files to Create (6):**

**Backend (3 files):**
1. `vps-api/src/v1/controllers/storesController.ts`
2. `vps-api/src/v1/routes/stores.ts`
3. `vps-api/src/v1/utils/encryption.ts`

**Frontend (3 files):**
1. `src/services/stores.service.ts`
2. `src/hooks/useApiStores.ts`
3. `SCHEMA_ALIGNED_API.md` (documentation)

---

## ⚠️ **Breaking Changes**

These changes WILL break existing functionality temporarily:

1. **Subscription Plans** - UI expects `monthly_price`/`annual_price`, backend returns `price`
2. **Messages** - Structure changes from participant_1/2 to buyer/seller
3. **Transactions** - Many new fields, some removed fields

**Mitigation:** We'll update everything systematically in phases to minimize breakage.

---

## 🎯 **Success Criteria**

✅ All types match database schema 100%  
✅ No invented fields in API responses  
✅ Message encryption working  
✅ M-Pesa transactions have all required fields  
✅ Stores functionality complete  
✅ All existing features still work  
✅ TypeScript compilation with no errors  
✅ All tests pass  

---

## ⏱️ **Estimated Timeline**

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Types | 45 min | None |
| Phase 2: Backend | 60 min | Phase 1 |
| Phase 3: Services | 45 min | Phases 1-2 |
| Phase 4: UI | 30 min | Phases 1-3 |
| Phase 5: Docs | 15 min | All phases |
| Phase 6: Testing | 30 min | All phases |
| **TOTAL** | **3-4 hours** | Sequential |

---

## 🚀 **Execution Strategy**

### **Approach:**
1. **Start with types** - Foundation for everything
2. **Fix backend** - Ensure API returns correct data
3. **Update services** - Connect to corrected API
4. **Fix UI** - Display correct data
5. **Test everything** - Validate end-to-end

### **Rollback Plan:**
- Git commit after each phase
- Can revert to previous working state
- Keep old types in `api.types.old.ts` temporarily

---

## 🤔 **Approval Questions**

Before proceeding, please confirm:

1. **Message Encryption:** Should encryption be handled entirely on the backend (recommended), or do you want client-side encryption?

2. **Subscription Pricing:** How should monthly vs annual plans be differentiated?
   - Option A: Single plan with duration field, calculate pricing in UI
   - Option B: Separate plan records (basic-monthly, basic-annual)
   - Option C: Add billing_cycle column to plans table

3. **Stores UI:** Do you have existing store screens that need updating, or should I note them as "ready for implementation"?

4. **Priority:** Should I do all phases, or prioritize certain features (e.g., skip stores if not used yet)?

5. **Testing:** Do you want me to create automated tests, or just manual testing checklist?

---

## ✅ **Ready to Execute**

If approved, I will:
1. ✅ Execute all 6 phases systematically
2. ✅ Commit after each phase for safety
3. ✅ Test thoroughly before marking complete
4. ✅ Document all changes
5. ✅ Provide final validation report

**Estimated completion:** 3-4 hours of focused work

---

**Please review and approve to proceed! 🚀**

Let me know if you want any adjustments to the plan before we start.

