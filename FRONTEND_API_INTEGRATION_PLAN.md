# Frontend to Backend API Integration Plan

Complete list of all screens that need API integration, organized in batches.

---

## 🎯 BATCH 1: Authentication (Priority 1)

### Files to Modify:
1. `src/app/(screens)/(auth)/signin.tsx`
2. `src/app/(screens)/(auth)/signup.tsx`
3. `src/app/forgot-password.tsx`
4. `contexts/authContext.tsx`

### Changes Needed:

#### 1. Sign In Screen (`signin.tsx`)
**Current**: Uses Supabase directly
**Change to**: Call API `/api/v1/auth/login`
```typescript
// Replace:
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// With:
const response = await fetch('https://app.ki-kwetu.com/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { success, data, error } = await response.json();
// Store tokens: data.tokens.accessToken, data.tokens.refreshToken
```

#### 2. Sign Up Screen (`signup.tsx`)
**Current**: Uses Supabase directly
**Change to**: Call API `/api/v1/auth/register`
```typescript
// Call POST /api/v1/auth/register
// Body: { email, password, username, full_name }
// Store returned tokens
```

#### 3. Forgot Password (`forgot-password.tsx`)
**Current**: Uses Supabase directly
**Change to**: Call API `/api/v1/auth/forgot-password`
```typescript
// Call POST /api/v1/auth/forgot-password
// Body: { email }
```

#### 4. Auth Context (`authContext.tsx`)
**Changes**:
- Store JWT tokens (access + refresh)
- Add Authorization header to all API calls
- Implement token refresh logic
- Check session with `/api/v1/auth/session`

---

## 🎯 BATCH 2: Dashboard & My Listings (Priority 1)

### Files to Modify:
1. `src/app/(screens)/(dashboard)/index.tsx`
2. `src/app/(screens)/(dashboard)/mylistings.tsx`

### Changes Needed:

#### 1. Dashboard (`index.tsx`)
**Lines 82-96**: Replace hardcoded stats
```typescript
// Current: Hardcoded values (12, 1.2K, 45)
// Change to: Call GET /api/v1/user/stats
// Response: { totalListings, activeListings, totalViews, totalSaved, rating, reviewsCount }
```

**Lines 196-224**: Replace hardcoded recent activity
```typescript
// Change to: Call GET /api/v1/analytics/dashboard
// Or GET /api/v1/notifications (first 3 items)
```

#### 2. My Listings (`mylistings.tsx`)
**Lines 33-131**: Replace mock listings array
```typescript
// Current: Hardcoded 8 mock listings
// Change to: Call GET /api/v1/listings/user/:userId
// With filters: ?status=all&page=1&pageSize=20
```

**Functions to connect**:
- `handleDeleteListing` → DELETE `/api/v1/listings/:id`
- `handleMarkAsSold` → PATCH `/api/v1/listings/:id/status` (body: {status: 'sold'})
- `handleRequestReReview` → PATCH `/api/v1/listings/:id/status` (body: {status: 'pending'})
- `handleRenewListing` → PATCH `/api/v1/listings/:id/status` (body: {status: 'active'})

---

## 🎯 BATCH 3: Saved Items & Transactions (Priority 2)

### Files to Modify:
1. `src/app/(screens)/(dashboard)/saved.tsx`
2. `src/app/(screens)/(dashboard)/transactions.tsx`

### Changes Needed:

#### 1. Saved Items (`saved.tsx`)
**Lines 35-126**: Replace savedListings array
```typescript
// Current: Hardcoded 6 mock saved listings
// Change to: Call GET /api/v1/saved-listings
// With filters: ?page=1&pageSize=20&category=electronics
```

**Functions to connect**:
- `handleRemoveFromSaved` → DELETE `/api/v1/saved-listings/listing/:listingId`
- `handleViewListing` → Navigate to listing details
- Clear all → DELETE `/api/v1/saved-listings/clear-all`

#### 2. Transactions (`transactions.tsx`)
**Lines 30-119**: Replace transactions array
```typescript
// Current: Hardcoded 8 mock transactions
// Change to: Call GET /api/v1/transactions
// With filters: ?status=all&page=1&pageSize=20
```

**Functions to connect**:
- `handleDownloadReceipt` → GET `/api/v1/transactions/:id/receipt`
- `handleExportTransactions` → POST `/api/v1/transactions/export` (body: {format: 'csv'})
- Transaction stats (lines 310-312) → GET `/api/v1/transactions/stats/overview`

---

## 🎯 BATCH 4: Payments Integration (Priority HIGH ⭐)

### Files to Modify:
1. `src/app/(screens)/(dashboard)/payment.tsx`
2. `src/app/(screens)/(settings)/payment_methods.tsx`

### Changes Needed:

#### 1. Payment Screen (`payment.tsx`)
**Lines 48-77**: Replace paymentMethods array
```typescript
// Current: Hardcoded 3 payment methods
// Change to: Call GET /api/v1/payments/methods
```

**Lines 89-113**: Connect payment processing
```typescript
// For M-Pesa:
POST /api/v1/payments/mpesa/stk-push
Body: { amount: parseAmount(selectedPlan.price), phone_number: "254..." }
Response: { checkoutRequestId, transactionId, message }

// For Paystack:
POST /api/v1/payments/paystack/initialize
Body: { amount: parseAmount(selectedPlan.price), email: user.email }
Response: { authorization_url, reference, transactionId }
// Then open authorization_url in browser/WebView
```

#### 2. Payment Methods (`payment_methods.tsx`)
**Lines 54-86**: Replace paymentMethods state initialization
```typescript
// Change to: Call GET /api/v1/payments/methods
```

**Functions to connect**:
- `handleSavePaymentMethod` → POST `/api/v1/payments/methods`
- `handleSetDefault` → PATCH `/api/v1/payments/methods/:id/default`
- `handleToggleActive` → PUT `/api/v1/payments/methods/:id` (body: {isActive})
- `handleDeletePaymentMethod` → DELETE `/api/v1/payments/methods/:id`

---

## 🎯 BATCH 5: Plans, Analytics & Messages (Priority 2)

### Files to Modify:
1. `src/app/(screens)/(dashboard)/plans-billing.tsx`
2. `src/app/(screens)/(dashboard)/analytics.tsx`
3. `src/app/(screens)/(dashboard)/conversations.tsx`

### Changes Needed:

#### 1. Plans & Billing (`plans-billing.tsx`)
**Lines 41-111**: Replace subscriptionPlans array
```typescript
// Current: Hardcoded 4 plans
// Change to: Call GET /api/v1/subscriptions/plans
```

**Lines 113-157**: Replace billingHistory array
```typescript
// Change to: Call GET /api/v1/subscriptions/history
// Or GET /api/v1/transactions?category=plan
```

**Functions to connect**:
- Subscribe to plan → POST `/api/v1/subscriptions`
- Cancel subscription → POST `/api/v1/subscriptions/:id/cancel`
- Current subscription info → GET `/api/v1/subscriptions/current`

#### 2. Analytics (`analytics.tsx`)
**Lines 23-59**: Replace mockAnalyticsData
```typescript
// Change to: Call GET /api/v1/analytics/dashboard
// Returns: activeListings, pendingListings, transactions, stats

// Additional endpoints:
// GET /api/v1/analytics/listings - Listing performance
// GET /api/v1/analytics/traffic - Traffic stats
// GET /api/v1/analytics/revenue - Revenue analytics
```

#### 3. Conversations (`conversations.tsx`)
**Lines 21-72**: Replace mockConversations array
```typescript
// Current: Hardcoded 5 conversations
// Change to: Call GET /api/v1/messages/conversations
```

**Functions to connect**:
- Get unread count → GET `/api/v1/messages/unread-count`
- Delete conversation → DELETE `/api/v1/messages/:id`
- Mark as read → PATCH `/api/v1/messages/:id/read`

---

## 🎯 BATCH 6: Profile & Settings (Priority 3)

### Files to Modify:
1. `src/app/(screens)/(profile)/profile.tsx`
2. `src/app/(screens)/(settings)/preferences.tsx`
3. `src/app/(screens)/(settings)/privacy.tsx`
4. `src/app/(screens)/(settings)/account.tsx`

### Changes Needed:

#### 1. Profile Screen
**Changes**:
- Load profile → GET `/api/v1/user/profile`
- Update profile → PUT `/api/v1/user/profile`
- Upload avatar → POST `/api/v1/user/avatar` (body: {avatarUrl})
- Get public profile → GET `/api/v1/user/:userId`

#### 2. Preferences
**Changes**:
- Load preferences → GET `/api/v1/user/preferences`
- Update preferences → PUT `/api/v1/user/preferences`

#### 3. Privacy Settings
**Changes**:
- Load privacy settings → GET `/api/v1/user/preferences`
- Update settings → PUT `/api/v1/user/preferences`

#### 4. Account Settings
**Changes**:
- Change email → POST `/api/v1/auth/change-email`
- Change password → POST `/api/v1/auth/change-password`
- Delete account → DELETE `/api/v1/user/account`

---

## 🎯 BATCH 7: Stores & Reviews (Priority 3)

### Files to Modify:
1. `src/app/(screens)/(dashboard)/stores/index.tsx`
2. `src/app/(screens)/(dashboard)/stores/[id].tsx`
3. `src/app/(screens)/(dashboard)/stores/store-create.tsx`
4. `src/app/(screens)/(dashboard)/stores/store-edit.tsx`

### Changes Needed:

#### Stores Screens
**Changes**:
- List stores → GET `/api/v1/stores`
- Create store → POST `/api/v1/stores`
- Update store → PUT `/api/v1/stores/:id`
- Delete store → DELETE `/api/v1/stores/:id`
- Toggle status → PATCH `/api/v1/stores/:id/toggle`
- Store stats → GET `/api/v1/stores/:id/stats`
- Store listings → GET `/api/v1/stores/:id/listings`
- Follow/unfollow → POST/DELETE `/api/v1/stores/:id/follow`

---

## 🎯 BATCH 8: Post Ad Flow (Priority 2)

### Files to Modify:
1. `src/app/(screens)/post-ad/step1.tsx`
2. `src/app/(screens)/post-ad/step2.tsx`
3. `src/app/(screens)/post-ad/step3.tsx`

### Changes Needed:

#### Post Ad Flow
**Changes**:
- Create listing → POST `/api/v1/listings`
- Upload images → Use existing image upload service (Supabase Storage)
- Save draft → POST `/api/v1/listings` (body: {status: 'draft'})

---

## 📋 Affected Files Summary

### Screens with Mock Data (22 files):
1. ✅ `(dashboard)/index.tsx` - Dashboard stats (lines 82-96) + recent activity (196-224)
2. ✅ `(dashboard)/mylistings.tsx` - Mock listings array (lines 33-131)
3. ✅ `(dashboard)/saved.tsx` - Saved listings array (lines 35-126)
4. ✅ `(dashboard)/transactions.tsx` - Transactions array (lines 30-119)
5. ✅ `(dashboard)/payment.tsx` - Payment methods (lines 48-77)
6. ✅ `(dashboard)/plans-billing.tsx` - Plans (41-111) + history (113-157)
7. ✅ `(dashboard)/analytics.tsx` - Mock analytics data (lines 23-59)
8. ✅ `(dashboard)/conversations.tsx` - Mock conversations (lines 21-72)
9. ✅ `(settings)/payment_methods.tsx` - Payment methods (lines 54-86)
10. ✅ `(auth)/signin.tsx` - Login logic
11. ✅ `(auth)/signup.tsx` - Registration logic
12. ✅ `forgot-password.tsx` - Password reset
13. `(dashboard)/stores/index.tsx` - Stores list
14. `(dashboard)/stores/[id].tsx` - Store details
15. `(dashboard)/stores/store-create.tsx` - Create store
16. `(dashboard)/stores/store-edit.tsx` - Edit store
17. `(profile)/profile.tsx` - User profile
18. `(settings)/preferences.tsx` - User preferences
19. `(settings)/privacy.tsx` - Privacy settings
20. `(settings)/account.tsx` - Account settings
21. `post-ad/step1.tsx` - Create listing step 1
22. `post-ad/step3.tsx` - Create listing step 3 (payment)

---

## 🔧 Infrastructure Changes Needed

### 1. API Client Setup
Create `src/services/apiClient.ts`:
```typescript
const API_BASE_URL = 'https://app.ki-kwetu.com/api/v1';

export const apiClient = {
  async get(endpoint: string, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    return await response.json();
  },
  
  async post(endpoint: string, data: any, token?: string) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  
  // ... PUT, PATCH, DELETE methods
};
```

### 2. Custom Hooks for Each Module
Create React Query hooks:
- `src/hooks/useAuth.ts` - Auth operations
- `src/hooks/useDashboard.ts` - Dashboard stats
- `src/hooks/useTransactions.ts` - Transactions
- `src/hooks/useSavedListings.ts` - Already exists, update it
- `src/hooks/usePayments.ts` - Payment operations
- `src/hooks/useAnalytics.ts` - Analytics data

### 3. Update Existing Hooks
Files to update:
- `src/hooks/useListings.ts` - Update to call new API
- `src/hooks/useMyListings.ts` - Update to call new API
- `src/hooks/useStores.ts` - Update to call new API
- `src/hooks/usePaymentMethods.ts` - Update to call new API
- `src/hooks/useSubscriptions.ts` - Update to call new API

---

## 🚀 Implementation Order (Recommended)

### Week 1: Core Authentication & Authorization
- [ ] Batch 1: Authentication screens (4 files)
- [ ] Create API client utility
- [ ] Update auth context with JWT handling
- [ ] Test login/register/logout flow

### Week 2: Dashboard & Listings
- [ ] Batch 2: Dashboard and My Listings (4 changes)
- [ ] Update useListings hook
- [ ] Test listing CRUD operations

### Week 3: Transactions & Saved Items
- [ ] Batch 3: Saved items and Transactions (4 changes)
- [ ] Create custom hooks for these features
- [ ] Test save/unsave operations

### Week 4: Payment Integration (Critical!)
- [ ] Batch 4: Payment methods and M-Pesa/Paystack (4 changes)
- [ ] Create payment hooks
- [ ] Test M-Pesa STK Push flow
- [ ] Test Paystack payment flow
- [ ] Handle payment callbacks

### Week 5: Advanced Features
- [ ] Batch 5: Plans, Analytics, Messages (4 changes)
- [ ] Create analytics hooks
- [ ] Test subscription management

### Week 6: Profile & Settings
- [ ] Batch 6: Profile and Settings (4 changes)
- [ ] Test profile updates
- [ ] Test preferences/privacy

### Week 7: Stores & Final Features
- [ ] Batch 7: Stores screens (8 endpoints)
- [ ] Batch 8: Post Ad flow (connect to API)
- [ ] Final testing

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Screens to Update | 22 |
| Mock Data Arrays to Replace | 13 |
| API Endpoints to Integrate | 50+ |
| Custom Hooks to Create/Update | 10 |
| Batches | 8 |
| Estimated Time | 4-6 weeks |

---

## ⚠️ Important Notes

1. **Token Management**: Store JWT tokens securely (use SecureStore)
2. **Error Handling**: Handle API errors gracefully with user-friendly messages
3. **Loading States**: Show loading indicators during API calls
4. **Offline Support**: Consider caching with React Query
5. **Rate Limiting**: Handle 429 errors appropriately
6. **Payment Security**: Never store sensitive payment data locally
7. **Testing**: Test each batch thoroughly before moving to next

---

## 🔑 Key API Endpoints by Screen

| Screen | Mock Data Location | API Endpoint | Method |
|--------|-------------------|--------------|--------|
| Sign In | Supabase auth | `/auth/login` | POST |
| Sign Up | Supabase auth | `/auth/register` | POST |
| Dashboard Stats | Lines 82-96 | `/user/stats` | GET |
| My Listings | Lines 33-131 | `/listings/user/:userId` | GET |
| Saved Items | Lines 35-126 | `/saved-listings` | GET |
| Transactions | Lines 30-119 | `/transactions` | GET |
| Payment | Lines 48-77 | `/payments/methods` | GET |
| M-Pesa Pay | - | `/payments/mpesa/stk-push` | POST |
| Paystack Pay | - | `/payments/paystack/initialize` | POST |
| Plans | Lines 41-111 | `/subscriptions/plans` | GET |
| Analytics | Lines 23-59 | `/analytics/dashboard` | GET |
| Conversations | Lines 21-72 | `/messages/conversations` | GET |

---

## 🛠️ Utility Files to Create

1. `src/services/apiClient.ts` - Base API client
2. `src/services/auth.service.ts` - Auth API calls
3. `src/services/listings.service.ts` - Listings API calls
4. `src/services/payments.service.ts` - Payment API calls (M-Pesa + Paystack)
5. `src/services/transactions.service.ts` - Transactions API calls
6. `src/services/subscriptions.service.ts` - Subscriptions API calls
7. `src/utils/tokenManager.ts` - JWT token management
8. `src/types/api.types.ts` - API response types

---

**Ready to start integration!** Each batch is independent and can be worked on sequentially.

