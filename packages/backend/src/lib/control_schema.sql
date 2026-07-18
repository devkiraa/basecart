-- Basecart Central Control Database Schema

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
  receiveUpdates INTEGER DEFAULT 0
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
