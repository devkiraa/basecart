export const tenantSchema = `
-- Basecart Tenant Database Schema

CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS products (
  productId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stockQuantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  images TEXT,
  compareAtPrice REAL,
  costPerItem REAL,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  productType TEXT,
  vendor TEXT,
  weight REAL,
  seoTitle TEXT,
  seoDescription TEXT,
  continueSellingOutOfStock INTEGER DEFAULT 0,
  variants TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  customerId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  hashedPassword TEXT,
  phone TEXT,
  shippingAddress TEXT,
  firstName TEXT,
  lastName TEXT,
  acceptsEmailMarketing INTEGER DEFAULT 0,
  acceptsSmsMarketing INTEGER DEFAULT 0,
  acceptsWhatsAppMarketing INTEGER DEFAULT 0,
  company TEXT,
  tags TEXT,
  note TEXT,
  taxExempt INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS discount_codes (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value REAL NOT NULL,
  minOrderAmount REAL NOT NULL DEFAULT 0,
  usageLimit INTEGER,
  expiry TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  usageCount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  orderId TEXT PRIMARY KEY,
  orderNumber INTEGER NOT NULL,
  customerId TEXT,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerPhone TEXT,
  shippingAddress TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal REAL NOT NULL,
  taxAmount REAL NOT NULL,
  total REAL NOT NULL,
  discountCode TEXT,
  discountAmount REAL DEFAULT 0,
  paymentId TEXT,
  paymentStatus TEXT NOT NULL DEFAULT 'pending',
  razorpayOrderId TEXT,
  razorpayPaymentId TEXT,
  trackingNumber TEXT,
  carrier TEXT,
  idempotencyKey TEXT UNIQUE,
  invoiceNumber TEXT,
  invoiceUrl TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  itemId TEXT PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES orders(orderId) ON DELETE CASCADE,
  productId TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  variantId TEXT,
  variantName TEXT
);

CREATE TABLE IF NOT EXISTS themes (
  themeId TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  templateBase TEXT NOT NULL,
  colors TEXT NOT NULL,
  logoUrl TEXT,
  pageContent TEXT NOT NULL,
  lastSavedAt TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS billing_invoices (
  invoiceId TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  billingMonth TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  plan TEXT NOT NULL,
  addOns TEXT,
  pdfKey TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  response TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_reviews (
  reviewId TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  customerId TEXT NOT NULL,
  customerName TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews (productId);
CREATE INDEX IF NOT EXISTS idx_product_reviews_customer ON product_reviews (customerId);

-- B-Tree Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customerId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON orders (razorpayOrderId);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (orderId);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices (status);
`;
