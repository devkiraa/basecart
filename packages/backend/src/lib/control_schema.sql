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

CREATE TABLE IF NOT EXISTS marketplace_themes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  authorName TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  manifestJson TEXT NOT NULL,
  rating REAL DEFAULT 5.0,
  downloadsCount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS merchant_theme_installations (
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  themeId TEXT NOT NULL,
  installedVersion TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  customSettingsJson TEXT,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS theme_versions (
  id TEXT PRIMARY KEY,
  themeId TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  bundleUrl TEXT,
  createdAt TEXT NOT NULL
);

