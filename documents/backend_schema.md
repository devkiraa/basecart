# Backend Schema Specifications — Basecart

## 1. Global Control D1 Database Registry
```sql
-- Central system settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  updatedAt TEXT NOT NULL
);

-- Registered SaaS merchants
CREATE TABLE IF NOT EXISTS tenants (
  tenantId TEXT PRIMARY KEY,
  storeName TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  createdAt TEXT NOT NULL,
  customDomain TEXT,
  ownerName TEXT,
  phone TEXT,
  businessCategory TEXT,
  businessType TEXT,
  country TEXT DEFAULT 'India'
);

-- Super admin credentials
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  hashedPassword TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- System audit trail logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  logId TEXT PRIMARY KEY,
  adminEmail TEXT NOT NULL,
  action TEXT NOT NULL,
  targetTenantId TEXT,
  plan TEXT,
  status TEXT,
  createdAt TEXT NOT NULL
);
```

## 2. Isolated SQLite Schema (Tenant Durable Object)
```sql
-- Store catalog items
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL NOT NULL,
  compareAtPrice REAL,
  sku TEXT,
  trackQuantity INTEGER NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  images TEXT,
  variants TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Customer orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerInfo TEXT NOT NULL,
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paymentMethod TEXT DEFAULT 'Razorpay',
  createdAt TEXT NOT NULL
);
```
