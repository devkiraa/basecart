# Basecart — Platform Master TODO & Audit Register

## 🟢 Completed Production Milestones

### Security & Authentication
- [x] **Webhook Security**: Removed `"mock-signature-bypass"` from Razorpay webhook handler to prevent payment forging (`packages/backend/src/routes/orders.ts`)
- [x] **Session Revocation**: Admin and merchant logout endpoints revoke refresh tokens from D1 database (`packages/backend/src/routes/auth.ts`, `admin.ts`)
- [x] **Audit Logging**: Admin password reset audit logs capture true admin identity via `c.get("user")`
- [x] **Cross-Origin Cookies**: Enforced `sameSite`/`secure` dynamic HTTPS detection via `x-forwarded-proto` and explicit `COOKIE_DOMAIN_ADMIN` scoping
- [x] **Secret Redaction**: Store settings API redacts Razorpay secret keys in responses
- [x] **Security Headers**: Added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` across Next.js apps

### Storefront & Theme Platform
- [x] **Storefront SDK & API**: Built `@basecart/theme-sdk` and `@basecart/theme-engine` for dynamic hot-swappable themes
- [x] **Remote Image Domain Config**: Added `images.remotePatterns` to all `next.config.js` files (Unsplash, R2, CDN)
- [x] **Payment Checkout**: Full Razorpay payment verification flow integrated into storefront checkout
- [x] **Error Boundaries & Skeletons**: Added React error boundaries and loading skeletons across storefront routes

### Admin Console & System Integration
- [x] **Navigation Structure**: Linked `Storefront Design` page under *Marketplaces* section in Admin sidebar layout
- [x] **Live D1 Database Integration**: Connected all 26 Admin Panel views to live SQLite D1 database tables (`basecart-control-prod`)
- [x] **Dynamic SQL Metrics**: Replaced hardcoded dashboard stats, revenue charts, and operational metrics with real-time SQL queries
- [x] **Durable Object Architecture**: Provisioned `TenantDOProd` SQLite class with automatic schema migration

---

## 🟡 Remaining Enhancement & Polish Backlog

### Security & Infrastructure Safeguards
- [x] Implement CSRF middleware protection (double-submit cookie pattern) for sensitive admin POST/PATCH routes
- [x] Add CAPTCHA verification and IP allowlisting/rate-limiting on public merchant signup endpoints
- [x] Redact sensitive customer PII in production Cloudflare Worker invocation logs

### Storefront & Theme UX
- [x] Replace browser `alert()` popups on product detail pages with inline toast notification UI
- [x] Expand variant picker on product detail pages to update live subtotal and stock availability indicators
- [x] Implement customer address book selection during checkout step

### Admin Panel & Content Management
- [x] Upgrade browser `prompt()` dialogs in `/content` (FAQ/Careers) and `/platform/api-keys` (API Keys/Webhooks) to modal forms
- [x] Add rich text HTML editor modal for blog post creation and news announcements
- [x] Connect System Settings save form (`/settings`) to persistent API endpoint (`POST /admin/system-settings`)

### Merchant Dashboard
- [x] Render Terms of Service and Privacy Policy tab contents inside store settings
- [x] Add discount expiry date picker input to promotional coupon creation form
- [x] Connect Abandoned Cart retargeting campaign trigger to automated ZeptoMail queue worker
- [x] Add order line-item drill-down drawer modal in merchant dashboard orders list

---

## ✅ Monorepo Build Status
- [x] `@basecart/shared` — Compiled cleanly
- [x] `@basecart/theme-sdk` — Compiled cleanly
- [x] `@basecart/theme-engine` — Compiled cleanly
- [x] `@basecart/backend` — Compiled cleanly
- [x] `@basecart/merchant-dashboard` — Compiled cleanly
- [x] `@basecart/storefront` — Compiled cleanly
- [x] `@basecart/admin-panel` — Compiled cleanly
