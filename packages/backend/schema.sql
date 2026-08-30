-- Central Control Database Schema

CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  hashedPassword TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenants (
  tenantId TEXT PRIMARY KEY,
  storeName TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  accountType TEXT NOT NULL DEFAULT 'live',
  createdAt TEXT NOT NULL,
  customDomain TEXT,
  addOns TEXT,
  razorpayKeyId TEXT,
  razorpaySecret TEXT,
  branding TEXT,
  registeredBusinessName TEXT,
  registeredBusinessAddress TEXT,
  registeredState TEXT,
  gstin TEXT,
  termsOfService TEXT,
  privacyPolicy TEXT,
  refundPolicy TEXT,
  businessCategory TEXT,
  businessType TEXT,
  country TEXT DEFAULT 'India',
  state TEXT,
  ownerName TEXT,
  phone TEXT,
  teamSize TEXT,
  monthlyOrders TEXT,
  currentPlatform TEXT,
  hearAboutUs TEXT,
  receiveUpdates INTEGER DEFAULT 0,
  utmSource TEXT,
  utmMedium TEXT,
  utmCampaign TEXT,
  utmTerm TEXT,
  utmContent TEXT,
  referrer TEXT
);

CREATE TABLE IF NOT EXISTS merchant_users (
  email TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  userId TEXT NOT NULL,
  hashedPassword TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  emailVerified INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  ttl INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reset_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  tenantId TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  ttl INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  logId TEXT PRIMARY KEY,
  adminEmail TEXT NOT NULL,
  action TEXT NOT NULL,
  targetTenantId TEXT,
  plan TEXT,
  status TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
  ticketId TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  storeName TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  userId TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
  logId TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  status TEXT NOT NULL,
  providerResponse TEXT,
  timestamp TEXT NOT NULL,
  duration INTEGER NOT NULL,
  errorMessage TEXT
);

CREATE TABLE IF NOT EXISTS plan_configs (
  planId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  billingPeriod TEXT NOT NULL DEFAULT 'monthly',
  targetAudience TEXT NOT NULL,
  orderCap INTEGER NOT NULL DEFAULT -1,
  gmvCap REAL NOT NULL DEFAULT -1,
  productCap INTEGER NOT NULL DEFAULT -1,
  aiCreditsCap INTEGER NOT NULL DEFAULT 50,
  allowCustomDomain INTEGER NOT NULL DEFAULT 1,
  allowAutomatedGateways INTEGER NOT NULL DEFAULT 1,
  allowAutomatedShipping INTEGER NOT NULL DEFAULT 1,
  allowAbandonedCart INTEGER NOT NULL DEFAULT 1,
  allowAiWriter INTEGER NOT NULL DEFAULT 1,
  allowStaffSeats INTEGER NOT NULL DEFAULT 1,
  maxStaffSeats INTEGER NOT NULL DEFAULT 1,
  allowDeveloperApi INTEGER NOT NULL DEFAULT 1,
  allowCustomCssJs INTEGER NOT NULL DEFAULT 1,
  allowGstInvoices INTEGER NOT NULL DEFAULT 1,
  platformFeePercent REAL NOT NULL DEFAULT 0.0,
  featuresJson TEXT DEFAULT '[]',
  paywallMessage TEXT,
  updatedAt TEXT NOT NULL
);

-- B-Tree Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants (subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants (customDomain);
CREATE INDEX IF NOT EXISTS idx_merchant_users_tenant ON merchant_users (tenantId);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens (email);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_email ON reset_tokens (email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_email ON admin_audit_logs (adminEmail);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_tenant ON admin_audit_logs (targetTenantId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON support_tickets (tenantId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (userId);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens (expiresAt);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs (recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs (template);
