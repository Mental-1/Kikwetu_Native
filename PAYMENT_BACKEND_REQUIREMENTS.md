# Payment System Backend Requirements & Best Practices

## 📋 Overview
This document outlines the complete backend requirements for implementing a secure, scalable payment system that supports M-Pesa STK Push, Paystack, and traditional payment methods for a React Native application.

## 🏗️ Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Backend API   │    │ Payment Gateway │
│     Client      │◄──►│   (Your VPS)    │◄──►│  (M-Pesa/Paystack)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │  (PostgreSQL)   │
                       └─────────────────┘
```

## 🔐 Security Requirements

### 1. Data Protection
- **Never store sensitive payment data** (card numbers, CVV, PINs)
- **Use tokenization** for payment methods
- **Encrypt all payment-related data** at rest and in transit
- **Implement PCI DSS compliance** for card processing
- **Use HTTPS only** for all endpoints

### 2. Authentication & Authorization
- **JWT-based authentication** for API access
- **Role-based access control** (RBAC)
- **API rate limiting** (100 requests/minute per user)
- **Request signing** for webhook verification
- **IP whitelisting** for webhook endpoints

### 3. Payment Security
- **Idempotency keys** to prevent duplicate payments
- **Payment verification** before marking as complete
- **Webhook signature validation**
- **Audit logging** for all payment activities
- **Fraud detection** mechanisms

## 📊 Database Schema

### Core Tables

#### 1. Payment Methods Table
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'bank', 'mobile')),
    name VARCHAR(255) NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    expiry_date VARCHAR(7), -- MM/YYYY format
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    token VARCHAR(255), -- Tokenized payment method ID
    provider VARCHAR(50), -- 'paystack', 'mpesa', 'stripe', etc.
    metadata JSONB, -- Additional provider-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
```

#### 2. Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('subscription', 'one_time', 'refund')),
    provider VARCHAR(50) NOT NULL, -- 'mpesa', 'paystack', 'stripe'
    provider_transaction_id VARCHAR(255), -- External transaction ID
    provider_reference VARCHAR(255), -- External reference
    checkout_request_id VARCHAR(255), -- M-Pesa specific
    merchant_request_id VARCHAR(255), -- M-Pesa specific
    authorization_url TEXT, -- Paystack redirect URL
    access_code VARCHAR(255), -- Paystack access code
    failure_reason TEXT,
    metadata JSONB, -- Additional transaction data
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider ON transactions(provider);
CREATE INDEX idx_transactions_provider_transaction_id ON transactions(provider_transaction_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

#### 3. Payment Webhooks Table
```sql
CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    transaction_id UUID REFERENCES transactions(id),
    webhook_id VARCHAR(255), -- Provider's webhook ID
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INTEGER DEFAULT 0,
    last_processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_webhooks_provider ON payment_webhooks(provider);
CREATE INDEX idx_webhooks_event_type ON payment_webhooks(event_type);
CREATE INDEX idx_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX idx_webhooks_created_at ON payment_webhooks(created_at);
```

#### 4. Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
```

## 🔌 API Endpoints

### 1. Payment Methods Endpoints

#### GET /api/payments/methods
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "card",
      "name": "John Doe",
      "lastFour": "4242",
      "expiryDate": "12/25",
      "isDefault": true,
      "isActive": true,
      "provider": "paystack"
    }
  ]
}
```

#### POST /api/payments/methods
```json
{
  "type": "card",
  "name": "John Doe",
  "lastFour": "4242",
  "expiryDate": "12/25"
}
```

#### PATCH /api/payments/methods/{id}/default
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isDefault": true
  }
}
```

#### DELETE /api/payments/methods/{id}
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

### 2. M-Pesa STK Push Endpoints

#### POST /api/payments/mpesa/stk-push
```json
{
  "amount": 1200,
  "phone_number": "254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkoutRequestId": "ws_CO_123456789",
    "merchantRequestId": "12345-67890-1",
    "transactionId": "txn_123456789",
    "message": "Success. Request accepted for processing"
  }
}
```

**Implementation Requirements:**
- Generate unique `merchantRequestId`
- Call M-Pesa STK Push API
- Store transaction in database with `pending` status
- Return response immediately (don't wait for callback)

### 3. Paystack Integration Endpoints

#### POST /api/payments/paystack/initialize
```json
{
  "amount": 1200,
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "access_code_123",
    "reference": "ref_123456789",
    "transactionId": "txn_123456789"
  }
}
```

#### GET /api/payments/paystack/verify/{reference}
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 1200,
    "currency": "KES",
    "transactionId": "txn_123456789"
  }
}
```

### 4. Webhook Endpoints

#### POST /api/webhooks/mpesa
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "12345-67890-1",
      "CheckoutRequestID": "ws_CO_123456789",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 1200},
          {"Name": "MpesaReceiptNumber", "Value": "QHF1234567"},
          {"Name": "TransactionDate", "Value": 20240101120000},
          {"Name": "PhoneNumber", "Value": 254712345678}
        ]
      }
    }
  }
}
```

#### POST /api/webhooks/paystack
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_123456789",
    "amount": 1200,
    "currency": "KES",
    "status": "success",
    "customer": {
      "email": "user@example.com"
    }
  }
}
```

## 🔄 Payment Flow Implementation

### 1. M-Pesa STK Push Flow
```
1. User initiates payment
2. Backend generates merchantRequestId
3. Call M-Pesa STK Push API
4. Store transaction as 'pending'
5. Return response to client
6. M-Pesa sends webhook callback
7. Process webhook and update transaction status
8. Notify user of payment completion
```

### 2. Paystack Flow
```
1. User initiates payment
2. Backend calls Paystack initialize API
3. Store transaction as 'pending'
4. Return authorization_url to client
5. Client redirects to Paystack
6. User completes payment on Paystack
7. Paystack sends webhook
8. Process webhook and update transaction status
9. Redirect user back to app
```

## 🛡️ Security Implementation

### 1. Webhook Verification

#### M-Pesa Webhook Verification
```python
def verify_mpesa_webhook(request):
    # M-Pesa doesn't provide signature verification
    # Verify by checking merchantRequestId exists in database
    merchant_request_id = request.json['Body']['stkCallback']['MerchantRequestID']
    transaction = get_transaction_by_merchant_request_id(merchant_request_id)
    return transaction is not None
```

#### Paystack Webhook Verification
```python
def verify_paystack_webhook(request):
    signature = request.headers.get('X-Paystack-Signature')
    payload = request.get_data()
    
    # Verify signature using Paystack secret
    expected_signature = hmac.new(
        PAYSTACK_SECRET_KEY.encode(),
        payload,
        hashlib.sha512
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

### 2. Rate Limiting
```python
# Implement rate limiting
@rate_limit(limit=100, per=60)  # 100 requests per minute
def payment_endpoint():
    pass
```

### 3. Idempotency
```python
def process_payment(idempotency_key, payment_data):
    # Check if payment already processed
    existing_transaction = get_transaction_by_idempotency_key(idempotency_key)
    if existing_transaction:
        return existing_transaction
    
    # Process new payment
    transaction = create_transaction(payment_data)
    return transaction
```

## 📈 Monitoring & Analytics

### 1. Payment Metrics
- **Success rate** by payment method
- **Average processing time**
- **Failed payment reasons**
- **Revenue by payment method**
- **User payment preferences**

### 2. Error Tracking
- **Payment failures** with detailed reasons
- **Webhook processing errors**
- **API timeout issues**
- **Provider-specific errors**

### 3. Audit Logging
```sql
CREATE TABLE payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    action VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox  # or production

# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Redis (for caching and rate limiting)
REDIS_URL=redis://localhost:6379
```

## 🚀 Deployment Checklist

### 1. Security Checklist
- [ ] HTTPS enabled for all endpoints
- [ ] Webhook signature verification implemented
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS properly configured

### 2. Performance Checklist
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Caching implemented for frequently accessed data
- [ ] Async processing for webhooks
- [ ] Error handling and retry mechanisms

### 3. Monitoring Checklist
- [ ] Payment success/failure tracking
- [ ] Webhook processing monitoring
- [ ] API response time monitoring
- [ ] Error rate monitoring
- [ ] Database performance monitoring

## 📋 Testing Requirements

### 1. Unit Tests
- Payment method CRUD operations
- Payment processing logic
- Webhook verification
- Error handling scenarios

### 2. Integration Tests
- M-Pesa STK Push flow
- Paystack payment flow
- Webhook processing
- Database transactions

### 3. Load Tests
- Payment endpoint performance
- Webhook processing under load
- Database performance under high volume

## 🔄 Maintenance & Updates

### 1. Regular Tasks
- **Daily**: Monitor payment success rates
- **Weekly**: Review failed payments and errors
- **Monthly**: Update payment method statistics
- **Quarterly**: Security audit and penetration testing

### 2. Backup Strategy
- **Database backups**: Daily automated backups
- **Transaction logs**: 7-year retention policy
- **Webhook logs**: 30-day retention policy

### 3. Disaster Recovery
- **Payment processing**: Multi-region deployment
- **Database**: Read replicas in different regions
- **Webhook processing**: Queue-based processing with retry

## 📞 Support & Documentation

### 1. API Documentation
- Swagger/OpenAPI specification
- Postman collection
- Code examples for common scenarios

### 2. Monitoring Dashboard
- Real-time payment metrics
- Error rate monitoring
- Webhook processing status
- System health indicators

### 3. Alerting
- Payment failure alerts
- Webhook processing errors
- System downtime notifications
- High error rate alerts

---

## 🎯 Implementation Priority

### Phase 1: Core Payment Processing
1. Database schema implementation
2. Basic payment method CRUD
3. M-Pesa STK Push integration
4. Paystack integration
5. Webhook processing

### Phase 2: Security & Reliability
1. Webhook signature verification
2. Rate limiting implementation
3. Idempotency handling
4. Error handling and retry logic
5. Audit logging

### Phase 3: Monitoring & Analytics
1. Payment metrics dashboard
2. Error tracking and alerting
3. Performance monitoring
4. Security monitoring
5. Compliance reporting

This comprehensive backend implementation will provide a robust, secure, and scalable payment system that can handle high-volume transactions while maintaining security and reliability standards.
