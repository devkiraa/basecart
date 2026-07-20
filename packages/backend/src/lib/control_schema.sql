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

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  folder_name TEXT NOT NULL,
  preview TEXT,
  thumbnail TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  downloads INTEGER NOT NULL DEFAULT 0,
  purchases INTEGER NOT NULL DEFAULT 0,
  rating REAL DEFAULT 5.0,
  active_stores INTEGER NOT NULL DEFAULT 0,
  current_version TEXT NOT NULL DEFAULT '1.0.0',
  minimum_version TEXT NOT NULL DEFAULT '1.0.0',
  maximum_version TEXT NOT NULL DEFAULT '2.5.0',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS theme_versions (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  version TEXT NOT NULL,
  release_notes TEXT,
  folder TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS merchant_themes (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  theme_version TEXT NOT NULL,
  purchase_type TEXT NOT NULL DEFAULT 'free',
  activated INTEGER NOT NULL DEFAULT 0,
  installed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS theme_reviews (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS theme_downloads (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL,
  merchant_id TEXT NOT NULL,
  downloaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marketplace_apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  developer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  scopesJson TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  iconUrl TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  audience TEXT NOT NULL DEFAULT 'all',
  readCount INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mail_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  bodyHtml TEXT NOT NULL,
  variablesJson TEXT,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  flagKey TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled INTEGER NOT NULL DEFAULT 0,
  targetAudience TEXT DEFAULT 'all',
  percentageRollout INTEGER DEFAULT 100,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  keyPrefix TEXT NOT NULL,
  hashedKey TEXT NOT NULL,
  scopesJson TEXT,
  expiresAt TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  targetUrl TEXT NOT NULL,
  eventsJson TEXT NOT NULL,
  secret TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS queue_logs (
  id TEXT PRIMARY KEY,
  queueName TEXT NOT NULL,
  batchSize INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'completed',
  processedCount INTEGER NOT NULL DEFAULT 1,
  failedCount INTEGER NOT NULL DEFAULT 0,
  durationMs INTEGER NOT NULL DEFAULT 12,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_health_status (
  id TEXT PRIMARY KEY,
  serviceName TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational',
  latencyMs INTEGER NOT NULL DEFAULT 15,
  uptimePercentage REAL NOT NULL DEFAULT 99.99,
  region TEXT DEFAULT 'global',
  lastCheckedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contentHtml TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  author TEXT NOT NULL DEFAULT 'System Admin',
  publishedAt TEXT,
  updatedAt TEXT NOT NULL
);



