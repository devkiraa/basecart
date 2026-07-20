# Basecart — Completed System Audit & TODO Status

## 🔴 Critical / Security
- [x] Remove `"mock-signature-bypass"` from Razorpay webhook — anyone can forge payment confirmations (`packages/backend/src/routes/orders.ts:594`)
- [x] Admin logout revokes refresh tokens from DB (`packages/backend/src/routes/auth.ts`, `admin.ts`)
- [x] Admin password reset audit log always shows `"system"` — `c.get("admin")` should be `c.get("user")` (`packages/backend/src/routes/admin.ts:878`)
- [x] Fix cookie `sameSite`/`secure` for cross-origin — detects HTTPS via `x-forwarded-proto` (`packages/backend/src/routes/auth.ts`, `admin.ts`)
- [x] Admin cookies include `domain` property — uses `COOKIE_DOMAIN_ADMIN` env var

## 🟠 High — Storefront & Engine
- [x] Storefront architecture connected to Storefront SDK & Storefront API
- [x] `images.remotePatterns` added to all `next.config.js` files (Unsplash, R2, CDN)
- [x] Font layout alignment across storefronts
- [x] Full Razorpay SDK integration for checkout & order verification

## 🟠 High — Admin Panel
- [x] Storefront Design linked in sidebar navigation under Marketplaces
- [x] All 26 Admin Panel views connected to live D1 database tables (`basecart-control-prod`)
- [x] Analytics, Monitoring, and Dashboard cards driven by real SQL aggregations

## 🟡 Medium — Backend & Queues
- [x] All control DB tables created via `control_schema.sql` and ensured at runtime
- [x] Durable Object class migrated to clean production `TenantDOProd` namespace
- [x] Queue consumer `max_retries = 3` configured in `wrangler.toml`

## ✅ Verified Production System Checklist
- [x] All workspace packages (`@basecart/shared`, `@basecart/theme-sdk`, `@basecart/theme-engine`, `@basecart/backend`, `@basecart/merchant-dashboard`, `@basecart/storefront`, `@basecart/admin-panel`) compile cleanly.
- [x] Production deployment verified on Cloudflare Workers & D1 (`basecart-backend`).

