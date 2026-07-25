# Basecart Performance Optimization & Audit Checklist

> Generated from full codebase analysis. 353 total issues across 27 categories (Performance + Pagination + Security + Business Logic + CI/CD + Third-Party + DNS + Testing + Incident Response + Backup).

---

## PART 1: ALGORITHM & QUERY OPTIMIZATION (37 items)

### CRITICAL

- [ ] **1. Admin Metrics N+1 across all tenants** — `admin.ts:728-748`
  - 2 queries per tenant via separate DO RPC calls. 500 merchants = 1000 round-trips.
  - Current: ~5000-10000ms → After: ~50-100ms | **Savings: ~99%**
  - Fix: Pre-aggregate via background job into KV cache.

- [ ] **2. Admin Orders N+1 across all tenants** — `admin.ts:1205-1208`
  - Separate DO stub per tenant, `SELECT * FROM orders LIMIT 20`, merged in-memory.
  - Current: ~3000-8000ms → After: ~50-100ms | **Savings: ~98%**

- [ ] **3. Customer List: full scan + O(N×M) in-app join** — `customers.ts:31-34`
  - ALL customers + ALL orders loaded, joined in JS nested loop.
  - Current: ~2000-5000ms → After: ~50-200ms | **Savings: ~95%**

- [ ] **4. Broadcast: full scan + in-app join** — `customers.ts:281-285`
  - Same as #3 but loads hashed passwords, no LIMIT.
  - Current: ~3000-8000ms → After: ~100-300ms | **Savings: ~95%**

- [ ] **5. Stock Decrement: N+1 reads+writes with race condition** — `orders.ts:819-851`
  - Per item: fetch product → parse JSON → update stock → stringify. Shared products cause double fetch.
  - Current: ~500-2000ms → After: ~50-100ms | **Savings: ~90%**

### HIGH

- [ ] **6. Merchant Orders: N+1 order_items** — `orders.ts:165`
  - `SELECT * FROM order_items WHERE orderId = ?` per order. 500 orders = 501 queries.
  - Current: ~1000-3000ms → After: ~30-100ms | **Savings: ~95%**

- [ ] **7. Customer My-Orders: same N+1** — `orders.ts:921`
  - Identical N+1 on public storefront endpoint.

- [ ] **8. Dashboard Summary: ALL orders SELECT *** — `dashboard.ts:16`
  - All orders with all columns for 7-day chart.
  - Current: ~1000-3000ms → After: ~10-50ms | **Savings: ~97%**

- [ ] **9. Finances: ALL orders SELECT *** — `store.ts:520`
  - Full scan for finances page.

- [ ] **10. Bulk Import: N sequential inserts** — `customers.ts:191-221`
  - 1000 customers = 1000 sequential DO RPC calls.
  - Current: ~10000-30000ms → After: ~200-500ms | **Savings: ~98%**

- [ ] **11. Admin Tables: DDL on EVERY request** — `admin.ts:306` (lines 55-282)
  - `CREATE TABLE IF NOT EXISTS` × 8 + COUNT + INSERT on every admin call.
  - Current: ~100-300ms overhead → After: ~0ms | **Savings: 100%**

- [ ] **12. Customer Columns: PRAGMA + ALTER TABLE per GET** — `customers.ts:17-29`
  - PRAGMA + up to 9 ALTER TABLE on every `/customers` load.
  - Current: ~50-200ms overhead → After: ~0ms | **Savings: 100%**

- [ ] **13. Checkout Item Inserts: N sequential** — `orders.ts:684-701`
  - N separate INSERT INTO order_items during checkout.

- [ ] **14. Seed Inserts on every admin request** — `admin.ts:68-282`
  - INSERT loops for themes, plans, add-ons on every admin call.

### MEDIUM

- [ ] **15. SKU Validation: full scan + JSON.parse per row** — `products.ts:17-21`
- [ ] **16. Category Counts in JS** — `products.ts:445-453`
- [ ] **17. Store Files: products scan + JSON.parse for images** — `store.ts:1207-1229`
- [ ] **18. KV Settings: sequential upserts** — `store.ts:321-325`
- [ ] **19. Missing Database Indexes** — `tenant_schema.ts`, `control_schema.ts`
  - `orders(customerEmail)`, `orders(status)`, `products(status, category)`, `tenants(plan, status)`, `support_tickets(createdAt)`, `admin_audit_logs(createdAt)`
- [ ] **20. Subdomain Alternates: 8 sequential queries** — `auth.ts:135-148`
- [ ] **21. ensureDesignTables() per request** — `storefront-design.ts:24-71`
- [ ] **22. Themes: INSERT inside GET handler** — `store.ts:608-623`
- [ ] **23. Boolean Mapping: O(rows×cols) scan** — `tenant_do.ts:87-100`
- [ ] **24. Global Search: leading-wildcard LIKE** — `admin.ts:825-838`
- [ ] **25. MAX(orderNumber) on every checkout** — `orders.ts:653`

### LOW

- [ ] **26-37.** DDL on GET for collections/purchase-orders/gift-cards/menus/blog-posts, discount list no ORDER BY, store KV loads all, product list no status filter, admin billing counts in JS, notifications 3 sequential queries, checkout SELECT * on tenants.

---

## PART 2: MISSING PAGINATION (42 unpaginated endpoints + 26 frontend pages)

### Backend Endpoints Without LIMIT/OFFSET

**CRITICAL (high-volume tables):**
- [ ] P1. `GET /customers` — `customers.ts:31` — `SELECT * FROM customers` + `SELECT * FROM orders`
- [ ] P2. `POST /customers/broadcast` — `customers.ts:281` — `SELECT * FROM customers` + `SELECT * FROM orders`
- [ ] P3. `GET /customers/:email/orders` — `customers.ts:243` — `SELECT * FROM orders WHERE customerEmail = ?`
- [ ] P4. `GET /dashboard/summary` — `dashboard.ts:16` — `SELECT * FROM orders`
- [ ] P5. `GET /orders` — `orders.ts:160` — `SELECT * FROM orders` + N+1 items
- [ ] P6. `GET /store/:subdomain/my-orders` — `orders.ts:913` — `SELECT * FROM orders WHERE customerId = ?`
- [ ] P7. `GET /products` — `products.ts:196` — `SELECT * FROM products`
- [ ] P8. `GET /store/:subdomain/products` — `products.ts:387` — `SELECT * FROM products WHERE status='active'`
- [ ] P9. `validateSkuUniqueness` — `products.ts:17` — `SELECT productId, sku, variants FROM products`
- [ ] P10. `GET /collections` — `products.ts:446` — `SELECT * FROM collections` + `SELECT category FROM products`
- [ ] P11. `GET /purchase-orders` — `products.ts:558` — `SELECT * FROM purchase_orders`
- [ ] P12. `GET /gift-cards` — `products.ts:607` — `SELECT * FROM gift_cards`

**HIGH (admin platform-wide):**
- [ ] P13. `GET /admin/merchants` — `admin.ts:470` — `SELECT * FROM tenants`
- [ ] P14. `GET /admin/merchants/:id/details` — `admin.ts:590` — `SELECT *` on products+orders+billing
- [ ] P15. `GET /admin/metrics` — `admin.ts:706` — `SELECT * FROM tenants` + per-tenant queries
- [ ] P16. `GET /admin/audit-logs` — `admin.ts:788` — `SELECT * FROM admin_audit_logs`
- [ ] P17. `GET /admin/support/tickets` — `admin.ts:963` — `SELECT * FROM support_tickets`
- [ ] P18. `GET /admin/billing/overview` — `admin.ts:1010` — `SELECT * FROM tenants`
- [ ] P19. `GET /admin/orders` — `admin.ts:1201` — per-tenant `SELECT * FROM orders` × ALL tenants
- [ ] P20-29. marketplace/themes, marketplace/apps, notifications, cms/faqs, cms/blogs, cms/jobs, feature-flags, api-keys, webhooks, queue-jobs — all `SELECT *` with no LIMIT

**MEDIUM (sub-resources):**
- [ ] P30-39. finances/summary, billing, blog-posts, files, themes, storefront-design/merchants, admin/themes, merchant/themes/marketplace, merchant/themes/library, discounts — all unpaginated

**LOW:**
- [ ] P40-42. admins, system-settings, analytics

**Properly paginated:** Only `reviews.ts` (LIMIT/OFFSET) and `storefront_api.ts` (LIMIT only, no OFFSET).

### Frontend Pages Without Client-Side Pagination

**Admin Panel:**
- [ ] `admin-panel/page.tsx:57` — metrics + audit-logs
- [ ] `admin-panel/merchants/page.tsx:118` — all tenants
- [ ] `admin-panel/merchants/[tenantId]/page.tsx:74` — all products+orders
- [ ] `admin-panel/orders/page.tsx:37` — all tenants' orders
- [ ] `admin-panel/audit-logs/page.tsx:39` — all logs
- [ ] `admin-panel/support/page.tsx:28` — all tickets
- [ ] `admin-panel/marketplace/page.tsx:45` — themes + apps
- [ ] `admin-panel/content/page.tsx:45` — faqs + blogs + jobs
- [ ] `admin-panel/platform/queue-monitor/page.tsx:32` — queue jobs
- [ ] `admin-panel/platform/api-keys/page.tsx:41` — api-keys + webhooks
- [ ] `admin-panel/platform/feature-flags/page.tsx:28` — feature flags
- [ ] `admin-panel/admins/page.tsx:42` — admins
- [ ] `admin-panel/billing/page.tsx:27` — billing overview
- [ ] `admin-panel/storefront-design/page.tsx:137` — all tenants
- [ ] `admin-panel/notifications/page.tsx:34` — notifications
- [ ] `admin-panel/emails/page.tsx:217` — email templates

**Merchant Dashboard:**
- [ ] `dashboard/page.tsx:1452-1510` — fetches customers, orders, products, discounts, menus, blog-posts, files, finances, billing all without pagination

**Storefront:**
- [ ] `storefront/[tenant]/page.tsx:438` — all active products
- [ ] `storefront/[tenant]/page.tsx:734` — all customer orders

---

## PART 3: REMAINING OPTIMIZATIONS (54 items)

### CACHING (3 items)

- [ ] **F1. No cache headers on any API responses**
  - `app.ts:111-124` — `/health` and `/test-db` no `Cache-Control`
  - `store.ts:39-139` — `GET /store/settings` returns full config every time, no caching
  - `storefront-design.ts:361-475` — `GET /store/:subdomain/design-settings` highly cacheable, no headers
  - `storefront_api.ts:47-82` — `GET /api/storefront/theme/settings` rarely changes, no headers
  - `storefront_api.ts:28-44` — `GET /api/storefront/store/info` static metadata, no headers
  - **Impact:** Every page load re-fetches unchanged data from DB
  - **Fix:** Add `Cache-Control: public, max-age=60` for storefront, `max-age=0, must-revalidate` for dashboard

- [ ] **F2. No ETag/If-None-Match on any endpoint**
  - Zero usage across entire backend. Every request returns full 200 even when data unchanged.
  - **Fix:** Add ETag based on `updatedAt` timestamp for store settings, product lists, design settings

- [ ] **F3. Storefront tenant resolution not cached**
  - `middleware/auth.ts:84-137` — `resolveStorefrontTenant` does DB lookup per request
  - Store info rarely changes. 1000 page views = 1000 identical DB queries.
  - **Fix:** Cache tenant lookup in KV with 5-minute TTL

### RESPONSE SIZE (5 items)

- [ ] **F4. Storefront products returns full `variants` + `images` JSON**
  - `products.ts:387-393` — `SELECT * FROM products` returns full variant configs + all image URLs
  - Storefront only needs `name`, `price`, first `images` entry, `category`, `stockQuantity`
  - **Fix:** Column-specific SELECT, normalize images into separate table

- [ ] **F5. Order list returns full `shippingAddress` JSON**
  - `orders.ts:160` — `SELECT * FROM orders` returns full shipping address per order
  - List view only shows status, total, customer name, date
  - **Fix:** `SELECT orderId, customerEmail, total, status, createdAt` for list endpoint

- [ ] **F6. Admin merchant details: 3 full `SELECT *` with no columns**
  - `admin.ts:590-592` — ALL products, ALL orders, ALL billing invoices in one payload
  - **Fix:** Summary counts + paginated sub-queries

- [ ] **F7. Admin orders: `SELECT * FROM orders` per tenant**
  - `admin.ts:1199-1230` and `admin.ts:1537-1566` — full order rows including shippingAddress
  - **Fix:** Select only display columns

- [ ] **F8. Billing statement fetches `SELECT * FROM tenants`**
  - `store.ts:396-475` — fetches razorpayKeyId, razorpaySecret, addOns just for storeName
  - **Fix:** `SELECT storeName, registeredState FROM tenants WHERE tenantId = ?`

### SERIAL vs PARALLEL (7 items)

- [ ] **F9.** Order list N+1 order_items serial — `orders.ts:163-186`
- [ ] **F10.** Admin metrics serial tenant loop — `admin.ts:702-781`
- [ ] **F11.** Admin orders serial tenant loop — `admin.ts:1199-1230`
- [ ] **F12.** Customer my-orders serial items — `orders.ts:908-929`
- [ ] **F13.** Customer email/orders serial items — `customers.ts:231-260`
- [ ] **F14.** SKU validation fetches all products — `products.ts:12-72`
- [ ] **F15.** Stock decrement serial per item — `orders.ts:816-851`
  - **Fix for all:** Use `Promise.all` for independent queries, batch for dependent ones

### DUPLICATE/FORKED CODE (11 items)

- [ ] **F16.** `ensureAdminTables` 227 lines of DDL+seed on every request — `admin.ts:55-282`
- [ ] **F17.** `getAdminCookieOptions` duplicated between `admin.ts:13-53` and `auth.ts:19-87`
- [ ] **F18.** `isLocalHostRequest` identical copy-paste — `admin.ts:13-25` and `auth.ts:19-31`
- [ ] **F19.** Email branding load pattern duplicated 4+ times — `store.ts:904`, `store.ts:1031`, `queue.ts:212`, `queue.ts:363`
- [ ] **F20.** JSON.parse try/catch pattern repeated — `store.ts:12-30`, `products.ts:77-95`
- [ ] **F21.** Duplicate `POST /admin/billing/overview` — `admin.ts:1007` and `admin.ts:1504` (different pricing constants!)
- [ ] **F22.** Duplicate `GET /admin/orders` — `admin.ts:1199` and `admin.ts:1537`
- [ ] **F23.** Duplicate `GET /admin/notifications` — `admin.ts:1306` and `admin.ts:1568`
- [ ] **F24.** Duplicate `GET /admin/support/tickets` — `admin.ts:961` and `admin.ts:1590`
- [ ] **F25.** Duplicate `PATCH /admin/support/tickets` — `:ticketId` vs `:id` — `admin.ts:987` and `admin.ts:1597`
- [ ] **F26.** Duplicate `GET /admin/auth/logout` — `admin.ts:452` and `admin.ts:804`
  - **Fix:** Remove duplicate routes, extract shared utilities to `shared/`

### WRITE PATTERNS (6 items)

- [ ] **F27. Product UPDATE writes ALL 19 columns** — `products.ts:258-284`
  - PATCH /products/:id updates everything even for a price change.
  - **Fix:** Dynamic UPDATE building from request body keys only.

- [ ] **F28. Store settings UPDATE writes ALL columns** — `store.ts:271-291`
  - Single storeName change rewrites razorpaySecret, GSTIN, etc.
  - **Fix:** Only UPDATE changed fields.

- [ ] **F29. KV settings: individual INSERT OR REPLACE per pair** — `store.ts:321-325`
  - **Fix:** `db.batch()`.

- [ ] **F30. Bulk customer import: individual INSERT per customer** — `customers.ts:171-225`
  - **Fix:** `db.batch()`.

- [ ] **F31. Order line items: individual INSERT per item** — `orders.ts:685-701`
  - **Fix:** `db.batch()`.

- [ ] **F32. Seed data: individual INSERT per row** — `admin.ts:76-188`
  - **Fix:** Batch per table.

### JSON HANDLING (4 items)

- [ ] **F33. `JSON.parse(store.addOns)` repeated across handlers** — `orders.ts:360`, `orders.ts:872`, `queue.ts:60`, `queue.ts:274`
- [ ] **F34. `JSON.parse(order.shippingAddress)` repeated** — `orders.ts:168`, `orders.ts:921`, `queue.ts:91`, `queue.ts:160`
- [ ] **F35. `JSON.parse(theme.colors)` repeated across email routes** — `store.ts:917`, `store.ts:1042`, `queue.ts:224`, `queue.ts:374`
- [ ] **F36. Large JSON columns stored as TEXT** — `products.variants`, `products.images`, `themes.pageContent`
  - **Fix:** Normalize into separate tables or parse once and pass as typed objects.

### MIDDLEWARE (4 items)

- [ ] **F37. `authenticateMerchant` queries tenants on EVERY request** — `middleware/auth.ts:32-36`
  - `SELECT status FROM tenants WHERE tenantId = ?` on every merchant API call.
  - **Fix:** Check once per session/JWT, not per request.

- [ ] **F38. `resolveStorefrontTenant` DB lookup per request, no cache** — `middleware/auth.ts:84-137`
  - **Fix:** Cache in KV with 5-min TTL.

- [ ] **F39. `authenticateAdmin` runs ensureAdminTables per request** — `admin.ts:305-306`
  - **Fix:** Run once at startup.

- [ ] **F40. `getControlDb` called multiple times per request** — `admin.ts:469,477`
  - **Fix:** Fetch once, pass via context.

### CONNECTION/RESOURCE (3 items)

- [ ] **F41.** DO stub created fresh per `getTenantDb()` — `db.ts:117-127`
  - Correct for CF Workers runtime but could be optimized in dev.
- [ ] **F42.** `getTenantDb` called twice in same request — `store.ts:249` vs `store.ts:294`
- [ ] **F43.** `getControlDb` fetched redundantly across handlers — `orders.ts:354`
  - **Fix:** Share DB connections within request lifecycle via Hono context.

### FRONTEND (7 items)

- [ ] **F44. Monolithic 12,176-line page.tsx with 80+ useState** — `merchant-dashboard/dashboard/page.tsx`
  - Entire dashboard in one component. Every keystroke re-renders everything.
  - **Fix:** Split into route-based components, use React Server Components.

- [ ] **F45. `fetchDashboardData` re-fetches on every tab change** — `page.tsx:1165-1169`
  - `useEffect` depends on `activeTab`, re-fetches even when data was just loaded.
  - **Fix:** Fetch once on mount, refetch on explicit refresh only.

- [ ] **F46. Settings fetched twice on login** — `page.tsx:1100` and `page.tsx:1479`
  - **Fix:** Fetch once, share via context.

- [ ] **F47. Zero React.memo/useMemo/useCallback in dashboard**
  - **Fix:** Memoize expensive computations and callback functions.

- [ ] **F48. Storefront pages redundantly fetch same data** — `tenant/page.tsx` and `tenant/catalog/page.tsx`
  - Both fetch store data + products independently.
  - **Fix:** Use Next.js layout caching or shared data loader.

- [ ] **F49. Cart coupon hardcoded client-side** — `cart/page.tsx:19-25`
  - "BASECART10" bypasses server-side validation entirely.
  - **Fix:** Use server-side discount validation endpoint.

- [ ] **F50. Missing Suspense boundaries in storefront** — `tenant/page.tsx`
  - Slow data fetches block entire page render.
  - **Fix:** Wrap sections in `<Suspense fallback={...}>`.

### EMAIL/NOTIFICATION (4 items)

- [ ] **F51. Broadcast emails sent sequentially in loop** — `customers.ts:394-415`
  - `await sendEmail(...)` per recipient. 100 recipients = 100 serial calls.
  - **Fix:** Push to JOBS_QUEUE for async processing.

- [ ] **F52. Queue batch processes messages sequentially** — `queue.ts:10`
  - Independent notification types could run in parallel.
  - **Fix:** Group by type, process independent groups with `Promise.all`.

- [ ] **F53. WhatsApp + Email notifications sent serially** — `orders.ts:388-404`
  - Two separate `await c.env.JOBS_QUEUE.send()` calls.
  - **Fix:** Send in parallel or batch into single queue message.

- [ ] **F54. Theme analytics: 3 sequential COUNT queries** — `theme_manager.ts:125-141`
  - **Fix:** `Promise.all` or single batch query.

---

## AGGREGATE IMPACT

| Category | Items | Avg Current | Avg After | Savings |
|---|---|---|---|---|
| Algorithm (CRITICAL) | 5 | ~5000ms | ~100ms | ~98% |
| Algorithm (HIGH) | 9 | ~1000ms | ~50ms | ~95% |
| Algorithm (MEDIUM) | 11 | ~200ms | ~20ms | ~90% |
| Algorithm (LOW) | 12 | ~50ms | ~10ms | ~80% |
| Pagination | 42 endpoints | Unbounded | Capped | Prevents OOM |
| Caching | 3 | N/A | N/A | Eliminates redundant DB calls |
| Response Size | 5 | N/A | N/A | ~60-80% payload reduction |
| Serial→Parallel | 7 | ~1000ms | ~100ms | ~90% |
| Duplicate Code | 11 | ~200ms | ~0ms | ~100% (eliminated) |
| Write Patterns | 6 | ~300ms | ~30ms | ~90% |
| JSON Handling | 4 | ~50ms | ~5ms | ~90% |
| Middleware | 4 | ~100ms | ~5ms | ~95% |
| Frontend | 7 | N/A | N/A | Eliminates re-renders |
| Email/Notification | 4 | ~5000ms | ~100ms | ~98% |
| **TOTAL** | **93 items** | | | |

### Top 10 Quick Wins

1. **Add `LIMIT ? OFFSET ?` to all 42 unpaginated endpoints** — prevents OOM/timeout
2. **Remove 6 duplicate route definitions in admin.ts** — eliminates conflicting handlers
3. **Move `ensureAdminTables()` to one-time migration** — eliminates ~200ms per admin request
4. **Add missing indexes** on orders(customerEmail), orders(status), products(status, category)
5. **Replace in-app joins with SQL GROUP BY** in customers/dashboard
6. **Batch order_items with JOIN** — eliminates N+1 on hot paths
7. **Use `db.batch()` for bulk imports and inserts** — reduces N DO calls to 1
8. **Add cache headers to storefront API** — eliminates redundant DB reads
9. **Split 12K-line dashboard into components** — eliminates full re-renders
10. **Parallelize broadcast emails via queue** — reduces broadcast time from minutes to seconds

---

## PART 4: SECURITY AUDIT (37 items)

### CRITICAL — Exploitable Now

- [ ] **S1. Storefront API: header-based tenant spoofing (NO authentication)**
  - **File:** `packages/backend/src/routes/storefront_api.ts:15-25`
  - **Vulnerability:** Broken Access Control
  - **Issue:** The middleware only checks for `x-merchant-id` or `x-store-id` headers — both user-controlled. No JWT, no API key, no validation. Any attacker sets the header to access any tenant's data.
  - **Exploit:** `GET /api/storefront/products` with `x-store-id: <victim-tenant-id>` reads all active products from another merchant.
  - **Fix:** Replace with proper API key validation or JWT auth. Validate against `developer_api_keys` table.

- [ ] **S2. Cross-tenant data access via x-merchant-id header**
  - **File:** `packages/backend/src/routes/storefront_api.ts:23`
  - **Vulnerability:** Broken Access Control
  - **Issue:** `c.set("tenantId", storeId || merchantId)` trusts the header directly. Full cross-tenant read for products, theme settings, store info.
  - **Fix:** Same as S1.

- [ ] **S3. x-subdomain header allows tenant spoofing in production**
  - **File:** `packages/backend/src/middleware/auth.ts:112-115`
  - **Vulnerability:** Tenant Spoofing
  - **Issue:** `resolveStorefrontTenant` falls back to `x-subdomain` header — fully attacker-controlled.
  - **Exploit:** `POST /auth/customer/signup` with `x-subdomain: victim-store` creates accounts in another tenant's DB. `POST /store/victim-store/checkout` places orders against another store.
  - **Fix:** Remove `x-subdomain` fallback in production. Only allow behind `NODE_ENV !== "production"` check.

### HIGH — Significant Risk

- [ ] **S4. No brute-force protection on login endpoints**
  - **File:** `auth.ts:331`, `auth.ts:938`, `admin.ts:390`
  - **Vulnerability:** Missing Brute-Force Protection
  - **Issue:** No per-IP or per-account rate limiting or lockout. Global CF rate limit (100 req/min) is too generous and doesn't prevent distributed attacks.
  - **Exploit:** Distributed brute-force across multiple IPs, thousands of guesses per hour.
  - **Fix:** Per-email rate limit (max 5 failed attempts / 15 min) with exponential backoff + account lockout.

- [ ] **S5. No CSRF protection on ANY endpoint**
  - **File:** Entire codebase
  - **Vulnerability:** Cross-Site Request Forgery
  - **Issue:** Zero CSRF tokens, zero Origin/Referer validation. Combined with `SameSite=None` cookies in production (S10), all state-changing endpoints are vulnerable.
  - **Exploit:** Malicious page submits forms to `/admin/merchants/:id/status` to suspend stores, or `/orders/sample` to create fake orders.
  - **Fix:** Implement CSRF tokens (double-submit cookie pattern) or validate Origin/Referer headers.

- [ ] **S6. 15-day access token expiry with no revocation mechanism**
  - **File:** `packages/backend/src/services/auth.ts:6`
  - **Vulnerability:** Insecure Token Management
  - **Issue:** `ACCESS_TOKEN_EXPIRY = "15d"`. Stolen token = 15 days of access. No way to revoke individual access tokens (JWT-only, not stored in DB).
  - **Exploit:** Stolen token (XSS, log theft, MITM) grants 15 days of unrestricted access.
  - **Fix:** Reduce to 15 minutes. Use refresh tokens (stored in DB, revocable) for session renewal.

- [ ] **S7. Localhost always allowed in CORS bypass**
  - **File:** `packages/backend/src/app.ts:42-44`
  - **Vulnerability:** Overly Permissive CORS
  - **Issue:** Any origin containing "localhost" or "127.0.0.1" unconditionally allowed, including in production.
  - **Exploit:** Any locally running service can read sensitive API responses using the user's cookies.
  - **Fix:** Only allow localhost origins when `NODE_ENV !== "production"`.

- [ ] **S8. Merchant theme endpoints completely unauthenticated**
  - **File:** `packages/backend/src/routes/theme_manager.ts:149, 206, 232, 274`
  - **Vulnerability:** Missing Authentication
  - **Issue:** 4 merchant-facing endpoints have NO auth middleware:
    - `GET /merchant/themes/marketplace` (line 149)
    - `GET /merchant/themes/library` (line 206) — reads any merchant's theme library
    - `POST /merchant/themes/activate` (line 232) — activates theme for any merchant
    - `POST /merchant/themes/purchase` (line 274) — purchases theme for any merchant
  - **Exploit:** `POST /merchant/themes/activate` with `merchantId: <victim>` corrupts their store theme.
  - **Fix:** Apply `authenticateMerchant` middleware to all `/merchant/themes/*` routes.

- [ ] **S9. Developer API keys returned in plain text**
  - **File:** `packages/backend/src/routes/admin.ts:1426-1433`
  - **Vulnerability:** Secrets Exposure
  - **Issue:** `GET /admin/api-keys` returns `SELECT * FROM developer_api_keys` including full tokens in plain text. Seed data includes hardcoded tokens.
  - **Exploit:** Compromised admin auth exposes all developer API key tokens.
  - **Fix:** Mask tokens (show last 4 chars only). Store tokens hashed in DB.

- [ ] **S10. Cookie SameSite=None in production + no CSRF = full CSRF surface**
  - **File:** `auth.ts:42,57,70,85`; `admin.ts:36,51`
  - **Vulnerability:** Insecure Cookie Configuration
  - **Issue:** All auth cookies use `sameSite: "None"` in production. Cookies ARE sent on cross-site requests.
  - **Fix:** Use `SameSite=Lax` for admin cookies. Only `SameSite=None` where truly needed (cross-subdomain storefront).

- [ ] **S11. SELECT * on customers returns hashedPassword to merchant**
  - **File:** `packages/backend/src/routes/customers.ts:31`
  - **Vulnerability:** Secrets Exposure
  - **Issue:** `SELECT * FROM customers` fetches `hashedPassword` into memory. Response is filtered but the hash is loaded.
  - **Fix:** Use explicit column lists. Never `SELECT *` on tables with password hashes.

- [ ] **S12. SELECT * on tenants could expose encrypted Razorpay secrets**
  - **File:** `packages/backend/src/routes/admin.ts:470`
  - **Vulnerability:** Secrets Exposure
  - **Issue:** `SELECT * FROM tenants` includes `razorpaySecret`, `gstin`, etc. Response is filtered but full row is loaded.
  - **Fix:** Use `SELECT tenantId, storeName, subdomain, plan, status, createdAt` explicitly.

### MEDIUM — Needs Attention

- [ ] **S13. Tokens returned in response body (not just cookies)**
  - **File:** `admin.ts:383`, `auth.ts:324`, `auth.ts:932`
  - **Vulnerability:** Secrets Leakage
  - **Issue:** `accessToken` and `refreshToken` spread into JSON response body. May be logged by proxies, clients, or analytics.
  - **Fix:** Only set tokens as httpOnly cookies. Use separate `/token` endpoint for API clients.

- [ ] **S14. Refresh tokens stored in plaintext in database**
  - **File:** `packages/backend/src/services/auth.ts:76-92`
  - **Vulnerability:** Insecure Token Storage
  - **Issue:** Refresh tokens stored as-is. DB compromise = all active tokens usable immediately.
  - **Fix:** Store SHA-256 hashes. Validate by hashing presented token and comparing.

- [ ] **S15. No body size limits on any endpoint**
  - **File:** Entire backend
  - **Vulnerability:** Resource Exhaustion / DDoS
  - **Issue:** No `bodyLimit` or `maxBodySize` configured. Bulk endpoints accept unbounded arrays.
  - **Exploit:** Massive JSON body or enormous `customers` array causes memory exhaustion + CPU timeout.
  - **Fix:** Add Hono body size limits. Validate max array length on bulk endpoints.

- [ ] **S16. No input validation on 14+ state-changing endpoints**
  - **File:** Multiple files
  - **Vulnerability:** Missing Input Validation
  - **Issue:** No Zod schemas on: `POST /admin/merchants`, `POST /admin/support/tickets`, `POST /customers`, `POST /customers/bulk`, `POST /customers/broadcast`, `POST /store/menus`, `POST /store/blog-posts`, `POST /orders/sample`, `POST /merchant/themes/activate`, `POST /merchant/themes/purchase`, and more.
  - **Fix:** Add Zod schemas to ALL state-changing endpoints.

- [ ] **S17. File upload headerHex validation can be bypassed**
  - **File:** `packages/backend/src/services/image.ts:39`; `packages/backend/src/routes/products.ts:348`
  - **Vulnerability:** File Type Bypass
  - **Issue:** Client sends `headerHex` (magic bytes) which can be forged. Presigned URL allows direct R2 upload bypassing server inspection.
  - **Exploit:** Upload malicious HTML/SVG with JPEG magic byte prefix. Stored XSS if served with wrong content-type.
  - **Fix:** Verify file content from R2 after upload. Use R2 bucket policies to force content-type.

- [ ] **S18. Error messages leaked in production responses**
  - **File:** `storefront-design.ts:115,223,273,347,471,614`; `theme_manager.ts:37,101,118,139,198,224,266,312`
  - **Vulnerability:** Information Disclosure
  - **Issue:** `error.message` returned directly in responses, including on unauthenticated routes. Leaks DB errors, file paths, internal details.
  - **Fix:** Return generic errors in production. Log details server-side only.

- [ ] **S19. Stack traces leaked in non-production mode**
  - **File:** `packages/backend/src/app.ts:92-108`
  - **Vulnerability:** Information Disclosure
  - **Issue:** Error handler returns actual error message when `NODE_ENV !== "production"`. Any staging/test misconfiguration exposes internals.
  - **Fix:** Always return generic errors. Never expose stack traces.

- [ ] **S20. Global rate limiter silently fails open**
  - **File:** `packages/backend/src/app.ts:70-89`
  - **Vulnerability:** Rate Limiter Bypass
  - **Issue:** Rate limiter catches errors and calls `await next()` — if the binding fails, ALL rate limiting is disabled.
  - **Fix:** On rate limiter failure, block the request or apply conservative default limit.

- [ ] **S21. Weak admin password policy**
  - **File:** `admin.ts:327-328`, `admin.ts:904-905`
  - **Vulnerability:** Weak Password Policy
  - **Issue:** Admin signup/reset only checks `if (!password)` — no minimum length, no complexity.
  - **Fix:** Minimum 12 characters + complexity requirements for admin accounts.

- [ ] **S22. Broadcast email quota race condition**
  - **File:** `packages/backend/src/routes/customers.ts:366-424`
  - **Vulnerability:** Race Condition
  - **Issue:** Quota counter read and incremented non-atomically. Parallel requests can exceed limit.
  - **Fix:** Atomic SQL: `UPDATE store_settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT) WHERE key = 'marketing_emails_sent' AND CAST(value AS INTEGER) < ?`.

- [ ] **S23. Admin cookie expiry inconsistent with JWT expiry**
  - **File:** `admin.ts:376` vs `services/auth.ts:6`
  - **Vulnerability:** Configuration Inconsistency
  - **Issue:** Admin cookie `maxAge: 15 min` but JWT access token valid for 15 days. Extracted token outlives cookie.
  - **Fix:** Align cookie and JWT expiry. Use short-lived access tokens (15 min) with refresh token rotation.

### LOW — Minor Issues

- [ ] **S24.** Duplicate unauthenticated admin logout route — `admin.ts:452` (first match, no auth) vs `admin.ts:804` (dead code, with auth)
- [ ] **S25.** Custom developer webhooks have no signing secret for outbound delivery — `admin.ts:1464-1475`
- [ ] **S26.** Hardcoded PBKDF2 salt `"basecart-salt-string-for-pbkdf2"` with only 10K iterations — `crypto.ts:20-21`
- [ ] **S27.** Test email endpoint allows sending to arbitrary addresses — `store.ts:1010-1073`
- [ ] **S28.** bcrypt rounds at 10, OWASP recommends 12+ — `services/auth.ts:43`

### Positive Findings (Already Secure)

- [x] **P1.** All SQL queries use parameterized statements — no SQL injection found
- [x] **P2.** Razorpay webhook HMAC-SHA256 signature properly verified — `orders.ts:762-776`
- [x] **P3.** Shiprocket webhook signature verified — `orders.ts:934-946`
- [x] **P4.** File upload validates MIME types + magic bytes + 10MB limit — `image.ts:29-41`
- [x] **P5.** Tenant isolation enforced via JWT `tenantId` on most routes
- [x] **P6.** Zod schemas used on critical endpoints (signup, login, products, checkout)
- [x] **P7.** Razorpay credentials encrypted with KMS — `crypto.ts`

---

## FINAL SUMMARY — ALL 130 ISSUES

| Category | Items | Severity Range |
|---|---|---|
| Part 1: Algorithm & Query Optimization | 37 | CRITICAL → LOW |
| Part 2: Missing Pagination | 42 endpoints + 26 pages | CRITICAL → LOW |
| Part 3: Remaining Optimizations | 54 | HIGH → LOW |
| Part 4: Security Audit | 28 + 7 positive | CRITICAL → LOW |
| **TOTAL** | **130+ issues** | |

### Top 10 Security Fixes (Priority Order)

1. **Replace header-based auth in storefront_api.ts** with API key or JWT validation (S1/S2)
2. **Remove x-subdomain header fallback** in production (S3)
3. **Implement CSRF protection** on all state-changing endpoints (S5)
4. **Reduce access token expiry** to 15 min + refresh token rotation (S6)
5. **Add brute-force protection** with per-email rate limiting (S4)
6. **Remove localhost CORS bypass** in production (S7)
7. **Add auth middleware** to all /merchant/themes/* routes (S8)
8. **Add Zod validation** to all 14+ unvalidated endpoints (S16)
9. **Add body size limits** to prevent memory exhaustion DDoS (S15)
10. **Fix error message leakage** — generic errors in production (S18/S19)

---

## PART 5: COMPREHENSIVE 13-CATEGORY SECURITY AUDIT

### Category 1: Authentication & Identity

- [ ] **A1. Access token expiry too long (15 days)**
  - **File:** `services/auth.ts:6`
  - **Issue:** `ACCESS_TOKEN_EXPIRY = "15d"`. Stolen token = 15 days of unrevokable access.
  - **Fix:** Reduce to 15-30 minutes. Use refresh token rotation for session continuity.

- [ ] **A2. No account lockout after failed logins**
  - **File:** `routes/auth.ts:331-383`, `routes/admin.ts:390-435`
  - **Severity:** CRITICAL
  - **Issue:** Zero lockout mechanism. Attacker can brute-force indefinitely.
  - **Fix:** Lock account after 5 failed attempts for 15+ minutes.

- [ ] **A3. No CAPTCHA on login/signup**
  - **File:** `routes/auth.ts`, `routes/admin.ts`
  - **Severity:** HIGH
  - **Fix:** Add Cloudflare Turnstile on login and signup endpoints.

- [ ] **A4. Customer logout doesn't revoke refresh token**
  - **File:** `routes/auth.ts:1049-1053`
  - **Issue:** Only deletes cookies. Stolen refresh token remains valid.
  - **Fix:** Delete refresh token from DB server-side.

- [ ] **A5. Admin logout doesn't revoke refresh token**
  - **File:** `routes/admin.ts:804-808`
  - **Severity:** HIGH
  - **Fix:** Delete refresh token from DB server-side.

- [ ] **A6. Admin signup has no password complexity validation**
  - **File:** `routes/admin.ts:323-385`
  - **Issue:** Only checks `if (!password)`. No Zod schema, no length/complexity.
  - **Fix:** Add Zod schema with 12+ chars, uppercase, lowercase, number, special char.

- [ ] **A7. No MFA/OTP support for login**
  - **Severity:** MEDIUM
  - **Issue:** No second-factor authentication for merchant or admin accounts.
  - **Fix:** Implement TOTP-based MFA for admin and merchant accounts.

- [ ] **A8. No breached password checking (haveibeenpwned)**
  - **Severity:** MEDIUM
  - **Fix:** Integrate HIBP API to check passwords against breached password lists.

- [ ] **A9. Refresh tokens stored in plaintext in DB**
  - **File:** `services/auth.ts:76-92`
  - **Fix:** Store SHA-256 hashes. Validate by hashing presented token and comparing.

- [ ] **A10. Admin cookie expiry inconsistent with JWT expiry**
  - **File:** `admin.ts:376` (15 min cookie) vs `services/auth.ts:6` (15 day JWT)
  - **Fix:** Align cookie and JWT expiry. Use short-lived access tokens.

### Category 2: Authorization

- [ ] **B1. Storefront API header-based tenant spoofing**
  - **File:** `storefront_api.ts:15-25`
  - **Severity:** CRITICAL
  - **Issue:** `x-merchant-id` header directly sets tenantId. No auth verification.
  - **Fix:** Replace with API key validation or JWT auth.

- [ ] **B2. Theme marketplace endpoints completely unauthenticated**
  - **File:** `theme_manager.ts:149, 206, 232, 274`
  - **Severity:** HIGH
  - **Issue:** `POST /merchant/themes/activate` and `/purchase` have zero auth.
  - **Fix:** Apply `authenticateMerchant` middleware.

- [ ] **B3. Admin impersonation not logged**
  - **File:** `admin.ts:850-894`
  - **Severity:** CRITICAL
  - **Issue:** Admin can impersonate any merchant with no audit trail.
  - **Fix:** Add audit log entry with IP and timestamp for every impersonation.

### Category 3: Input Validation & Injection

- [ ] **C1. 14+ endpoints lack Zod validation**
  - **Severity:** MEDIUM
  - **Endpoints:** admin signup, admin login, admin create merchant, admin reset password, customers CRUD, bulk import, broadcast, menus, blog posts, sample order, theme activate/purchase, system settings.
  - **Fix:** Add Zod schemas to ALL state-changing endpoints.

- [ ] **C2. Admin system-settings accepts arbitrary KV pairs**
  - **File:** `admin.ts:1646-1658`
  - **Issue:** Writes any key/value from request body to DB with no validation.
  - **Fix:** Whitelist allowed keys or add validation schema.

- [ ] **C3. File upload headerHex validation can be bypassed**
  - **File:** `image.ts:39`, `products.ts:348`
  - **Severity:** MEDIUM
  - **Issue:** Client-sent magic bytes can be forged. Presigned URL bypasses server inspection.
  - **Fix:** Verify file content from R2 after upload. Use R2 bucket policies for content-type.

- [x] **C4. All SQL is parameterized** — No SQL injection found.
- [x] **C5. No command injection vectors** — No child_process/exec calls.
- [x] **C6. No SSRF** — All fetch URLs are hardcoded.
- [x] **C7. No XSS via backend** — JSON-only API, no HTML output.

### Category 4: File & Image Uploads

- [ ] **D1. No EXIF metadata stripping**
  - **Severity:** LOW
  - **Issue:** Uploaded images retain GPS coordinates, camera info (privacy concern).
  - **Fix:** Strip EXIF on upload or serve via Cloudflare Image Transformations.

- [ ] **D2. No malware scanning on uploads**
  - **Severity:** MEDIUM
  - **Fix:** Add ClamAV or cloud-based malware scanning before R2 storage.

- [ ] **D3. File size validation is client-trusted**
  - **File:** `products.ts:348`
  - **Issue:** `fileSize` comes from client body. Presigned URL doesn't enforce limits.
  - **Fix:** Configure R2 bucket policies for max object size.

- [x] **D4. Magic bytes validated** — JPEG, PNG, GIF, WebP checked.
- [x] **D5. Filename randomization** — Crypto prefix + sanitization.
- [x] **D6. Path traversal blocked** — `..` blocked in media proxy.
- [x] **D7. Storage in R2** — Not in webroot.
- [x] **D8. 10MB max file size** — Enforced server-side.

### Category 5: Payments

- [ ] **E1. Shiprocket webhook uses static token match, not HMAC**
  - **File:** `shiprocket.ts:86-93`
  - **Severity:** MEDIUM
  - **Fix:** Implement HMAC-SHA256 verification.

- [ ] **E2. No payment reconciliation against Razorpay records**
  - **File:** `store.ts:516-552`
  - **Issue:** `reconciliationStatus` field exists but no actual reconciliation logic.
  - **Fix:** Implement periodic reconciliation job comparing DB orders vs Razorpay API.

- [ ] **E3. Hardcoded test API keys with `bc_live_` prefix in seed data**
  - **File:** `admin.ts:226-228`
  - **Severity:** HIGH
  - **Fix:** Use obviously fake prefixes like `bc_test_`.

- [x] **E4. Server-side price computation** — Client amounts ignored.
- [x] **E5. Razorpay webhook HMAC verified** — SHA256 with raw body.
- [x] **E6. Idempotency keys on checkout** — Prevents double-charge.
- [x] **E7. No raw card data stored** — PCI scope minimized.
- [x] **E8. Razorpay credentials encrypted** — AES-256-GCM at rest.

### Category 6: Email

- [ ] **F1. No unsubscribe links in marketing/newsletter emails**
  - **File:** `emails/src/templates/newsletter.ts:51-53`, `emails/src/components/Footer.ts`
  - **Severity:** HIGH
  - **Issue:** Violates CAN-SPAM, GDPR, India DPDP Act.
  - **Fix:** Add unsubscribe link to all marketing emails.

- [ ] **F2. No SPF/DKIM/DMARC configuration references**
  - **Severity:** HIGH
  - **Issue:** `@basecart.app` sender addresses need DNS auth to avoid spam.
  - **Fix:** Configure SPF, DKIM, DMARC at DNS level.

- [ ] **F3. Broadcast emails sent synchronously, not via queue**
  - **File:** `customers.ts:394-415`
  - **Severity:** MEDIUM
  - **Fix:** Push to JOBS_QUEUE for async processing.

- [ ] **F4. No per-merchant rate limiting on broadcast endpoint**
  - **Severity:** MEDIUM
  - **Fix:** Add cooldown (e.g., 1 broadcast per 5 minutes).

- [ ] **F5. Welcome email sends both OTP and verification link simultaneously**
  - **File:** `auth.ts:294-298`
  - **Severity:** MEDIUM
  - **Fix:** Use one method per email, not both.

- [x] **F6. Email verification flow is solid** — UUID + OTP, 24h expiry, single-use.
- [x] **F7. Password reset emails are secure** — Time-limited, single-use tokens.
- [x] **F8. No sensitive data in emails** — No passwords/tokens sent.
- [x] **F9. Transactional/marketing separation** — Different sender addresses.

### Category 7: API Security

- [ ] **G1. Rate limiter fails open on error**
  - **File:** `app.ts:84-86`
  - **Severity:** HIGH
  - **Issue:** On rate limiter error, `next()` is called — all protection disabled.
  - **Fix:** Fail closed — deny request on rate limiter errors.

- [ ] **G2. No per-endpoint rate limiting on auth routes**
  - **Severity:** HIGH
  - **Fix:** 5 login attempts per minute per IP. Progressive lockout.

- [ ] **G3. No rate limiting on forgot-password endpoint**
  - **Severity:** MEDIUM
  - **Fix:** Max 3 reset requests per 15 minutes per email.

- [ ] **G4. Developer API keys stored in plaintext in DB**
  - **File:** `admin.ts:1426-1434`
  - **Severity:** HIGH
  - **Fix:** Store SHA-256 hashed tokens. Only show full token on creation.

- [ ] **G5. API key generation uses Math.random()**
  - **File:** `admin.ts:1442`
  - **Severity:** MEDIUM
  - **Fix:** Use `crypto.randomUUID()` or `crypto.getRandomValues()`.

- [ ] **G6. No API versioning**
  - **Severity:** MEDIUM
  - **Fix:** Add `/v1/` prefix to all endpoints.

- [ ] **G7. No request body size limits**
  - **Severity:** MEDIUM
  - **Fix:** Add Hono bodyLimit middleware. Validate max array length on bulk endpoints.

- [x] **G8. CORS properly configured** — Origins checked against allowlist.
- [x] **G9. No secrets in frontend code** — All 4 packages clean.

### Category 8: Secrets & Config

- [ ] **H1. Hardcoded API tokens in seed data**
  - **File:** `admin.ts:226-228`
  - **Severity:** HIGH
  - **Issue:** `bc_live_77e8a9f0a8e9981a2b3c4d5e` persisted in DB.
  - **Fix:** Use `bc_test_` prefix for demo data.

- [ ] **H2. No staging environment configuration**
  - **File:** `wrangler.toml`
  - **Severity:** MEDIUM
  - **Issue:** No `[env.staging]` section. Only dev and prod.
  - **Fix:** Add staging environment with separate secrets.

- [ ] **H3. No secret rotation strategy**
  - **Severity:** MEDIUM
  - **Issue:** Rotating `ENCRYPTION_SECRET` would break all stored Razorpay creds.
  - **Fix:** Document rotation procedure. Consider envelope encryption.

- [ ] **H4. `legacy-peer-deps=true` in .npmrc**
  - **File:** `.npmrc:1`
  - **Severity:** MEDIUM
  - **Issue:** Suppresses peer dependency conflicts, weakening lock file integrity.
  - **Fix:** Remove and resolve peer dependency conflicts properly.

- [x] **H5. .env in .gitignore** — Properly excluded.
- [x] **H6. .dev.vars in .gitignore** — Properly excluded.
- [x] **H7. No hardcoded secrets in wrangler.toml** — Secrets via `wrangler secret put`.
- [x] **H8. Production secrets via Cloudflare Secrets** — Documented.

### Category 9: Infrastructure & Network

- [ ] **I1. No HSTS headers anywhere**
  - **All 4 frontends + backend**
  - **Severity:** HIGH
  - **Fix:** Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.

- [ ] **I2. No Content-Security-Policy (CSP)**
  - **All 4 frontends**
  - **Severity:** HIGH
  - **Fix:** Implement CSP with `default-src 'self'`, script-src, style-src directives.

- [ ] **I3. No WAF rules configured (in code)**
  - **Severity:** MEDIUM
  - **Fix:** Configure Cloudflare WAF rules for SQL injection, XSS, and common attack patterns.

- [ ] **I4. /test-db endpoint exposes infrastructure info**
  - **File:** `app.ts:116-124`
  - **Severity:** LOW
  - **Fix:** Remove or protect with auth in production.

- [x] **I5. LocalStack ports bound to localhost** — Not publicly exposed.
- [x] **I6. D1/R2/KV accessed only via Worker bindings** — Not publicly reachable.
- [x] **I7. HTTPS enforced in production URLs.**

### Category 10: Dependency & Supply Chain

- [ ] **J1. No `npm audit` in CI pipeline**
  - **All 3 GitHub Actions workflows**
  - **Severity:** CRITICAL
  - **Fix:** Add `npm audit --audit-level=moderate` step.

- [ ] **J2. No Dependabot/Renovate/Snyk configuration**
  - **Severity:** HIGH
  - **Fix:** Add `.github/dependabot.yml` for automated security updates.

- [ ] **J3. No SAST (Static Application Security Testing)**
  - **Severity:** HIGH
  - **Fix:** Add CodeQL or Semgrep to CI pipeline.

- [ ] **J4. No secret scanning in CI**
  - **Severity:** CRITICAL
  - **Fix:** Add gitleaks or trufflehog to detect committed secrets.

- [ ] **J5. GitHub Actions not pinned to SHA**
  - **File:** `.github/workflows/*.yml`
  - **Severity:** MEDIUM
  - **Issue:** Uses `@v4` tags. Compromised upstream = compromised builds.
  - **Fix:** Pin to full commit SHAs.

- [ ] **J6. All dependencies use caret `^` ranges**
  - **All package.json files**
  - **Severity:** MEDIUM
  - **Fix:** Use exact pins or ensure `npm ci` in all CI builds.

### Category 11: Logging & Monitoring

- [ ] **K1. Zero auth event logging**
  - **Severity:** CRITICAL
  - **Issue:** Login, signup, logout, failed attempts — none logged. No forensic trail.
  - **Fix:** Log all auth events with IP, user-agent, timestamp.

- [ ] **K2. Admin impersonation not logged**
  - **File:** `admin.ts:850-894`
  - **Severity:** CRITICAL
  - **Fix:** Audit log with IP, target merchant, timestamp.

- [ ] **K3. Admin API key management not logged**
  - **File:** `admin.ts:1426-1448`
  - **Severity:** HIGH
  - **Fix:** Log create/revoke API key events.

- [ ] **K4. Admin system settings changes not logged**
  - **File:** `admin.ts:1610-1658`
  - **Severity:** HIGH
  - **Fix:** Log all system setting changes.

- [ ] **K5. Admin password printed to stdout in plaintext**
  - **File:** `scripts/create-admin.ts:42`
  - **Severity:** CRITICAL
  - **Fix:** Remove console.log of password. Show only in initial output.

- [ ] **K6. No structured logging framework**
  - **Severity:** MEDIUM
  - **Issue:** Raw console.log/error throughout. No log levels, no structured output.
  - **Fix:** Add Pino or structured JSON logging with log-level control.

- [ ] **K7. No anomaly detection/alerting**
  - **Severity:** HIGH
  - **Issue:** No alerts for spike in failed logins, unusual traffic patterns.
  - **Fix:** Implement Cloudflare analytics alerts or external monitoring.

- [x] **K8. Some admin actions logged** — Create merchant, suspend, plan change, delete.

### Category 12: Data Protection & Compliance

- [ ] **L1. All PII stored as plaintext**
  - **Severity:** CRITICAL
  - **Affected:** Customer emails, phones, shipping addresses, order details, merchant phones, bank account details, GSTIN/PAN/CIN/TAN numbers.
  - **Fix:** Encrypt PII at rest using existing `crypto.ts` module.

- [ ] **L2. No data retention policy or cleanup**
  - **Severity:** HIGH
  - **Issue:** Expired tokens, old logs, deleted tenant DBs accumulate forever.
  - **Fix:** Implement scheduled cleanup jobs.

- [ ] **L3. Tenant deletion doesn't cascade to D1 database**
  - **File:** `admin.ts:940-956`
  - **Severity:** HIGH
  - **Issue:** Deleting a merchant removes control DB records but leaves all customer/order data.
  - **Fix:** Add D1 database deletion on tenant removal.

- [ ] **L4. No DSAR (Data Subject Access Request) endpoint**
  - **Severity:** HIGH
  - **Issue:** No self-service data export or account deletion.
  - **Fix:** Build `/account/export` and `/account/delete` endpoints.

- [ ] **L5. No India DPDP Act compliance**
  - **Severity:** HIGH
  - **Issue:** Privacy policy doesn't mention DPDP Act. No consent management.
  - **Fix:** Update privacy policy. Add consent collection and purpose limitation.

- [ ] **L6. No cookie consent banner**
  - **All 4 frontends**
  - **Severity:** MEDIUM
  - **Fix:** Add cookie consent banner for GDPR/DPDP compliance.

- [ ] **L7. No cross-region backup strategy**
  - **Severity:** MEDIUM
  - **Fix:** Document backup strategy. Consider D1 point-in-time recovery.

### Category 13: Frontend-Specific Security

- [ ] **M1. No CSP header on any frontend**
  - **All 4 packages**
  - **Severity:** HIGH
  - **Fix:** Implement Content-Security-Policy in next.config.js.

- [ ] **M2. No HSTS header on any frontend**
  - **All 4 packages**
  - **Severity:** HIGH
  - **Fix:** Add `Strict-Transport-Security` in next.config.js headers.

- [ ] **M3. No X-XSS-Protection header**
  - **All 4 packages**
  - **Severity:** LOW
  - **Fix:** Add `X-XSS-Protection: 1; mode=block`.

- [ ] **M4. No SRI on third-party scripts**
  - **Severity:** LOW
  - **Fix:** Add `integrity=` attributes to any external script tags.

- [x] **M5. X-Frame-Options: DENY** — Set on all frontends.
- [x] **M6. X-Content-Type-Options: nosniff** — Set on all frontends.
- [x] **M7. Referrer-Policy** — Set on all frontends.
- [x] **M8. Permissions-Policy** — Camera, microphone, geolocation disabled.
- [x] **M9. No eval() or innerHTML** — Clean codebase.
- [x] **M10. dangerouslySetInnerHTML only for JSON-LD** — Safe pattern.
- [x] **M11. No secrets in client-side code** — All 4 packages clean.

---

## GRAND TOTAL — ALL CATEGORIES

| Part | Category | Items | Severity Range |
|---|---|---|---|
| **Part 1** | Algorithm & Query Optimization | 37 | CRITICAL → LOW |
| **Part 2** | Missing Pagination | 68 (42 endpoints + 26 pages) | CRITICAL → LOW |
| **Part 3** | Remaining Optimizations | 54 | HIGH → LOW |
| **Part 4** | Security Audit (Quick) | 28 | CRITICAL → LOW |
| **Part 5** | Category 1: Auth & Identity | 10 | CRITICAL → MEDIUM |
| **Part 5** | Category 2: Authorization | 3 | CRITICAL → HIGH |
| **Part 5** | Category 3: Input Validation | 7 | MEDIUM → PASS |
| **Part 5** | Category 4: File Uploads | 8 | MEDIUM → PASS |
| **Part 5** | Category 5: Payments | 9 | HIGH → PASS |
| **Part 5** | Category 6: Email | 9 | HIGH → PASS |
| **Part 5** | Category 7: API Security | 9 | HIGH → PASS |
| **Part 5** | Category 8: Secrets & Config | 8 | HIGH → PASS |
| **Part 5** | Category 9: Infrastructure | 7 | HIGH → PASS |
| **Part 5** | Category 10: Dependencies | 6 | CRITICAL → MEDIUM |
| **Part 5** | Category 11: Logging & Monitoring | 8 | CRITICAL → MEDIUM |
| **Part 5** | Category 12: Data Protection | 7 | CRITICAL → MEDIUM |
| **Part 5** | Category 13: Frontend Security | 11 | HIGH → PASS |
| | **TOTAL** | **~230 issues** | |

---

## TOP 20 CRITICAL/HIGH FIXES (Priority Order)

1. **Implement account lockout** after 5 failed logins (A2)
2. **Add auth event logging** — login, logout, failed attempts, admin impersonation (K1, K2)
3. **Replace storefront API header auth** with API key/JWT validation (B1)
4. **Remove x-subdomain header fallback** in production (S3)
5. **Implement CSRF protection** on all state-changing endpoints (S5)
6. **Reduce access token expiry** to 15 min (A1)
7. **Fix customer/admin logout** to revoke refresh tokens server-side (A4, A5)
8. **Add CSP and HSTS headers** to all 4 frontends (M1, M2, I1, I2)
9. **Encrypt all PII at rest** — emails, phones, addresses, bank details (L1)
10. **Add `npm audit` and Dependabot** to CI pipeline (J1, J2)
11. **Add rate limiting on auth endpoints** — per-IP and per-account (G2, G3)
12. **Add brute-force detection** and anomaly alerting (K7)
13. **Add auth middleware** to theme marketplace routes (B2)
14. **Add Zod validation** to all 14+ unvalidated endpoints (C1)
15. **Implement data retention cleanup** for expired tokens and old logs (L2)
16. **Add cascade deletion** for tenant D1 databases (L3)
17. **Add unsubscribe links** to marketing emails (F1)
18. **Fix rate limiter fail-open** — deny on error (G1)
19. **Store API keys hashed** in DB, not plaintext (G4)
20. **Add secret scanning and SAST** to CI (J4, J3)

---

## PART 6: FINAL SWEEP — Business Logic, Race Conditions, Testing & Edge Cases

### Race Conditions & TOCTOU

- [ ] **N1. Stock decrement not atomic on webhook**
  - **File:** `orders.ts:819-849`
  - **Severity:** MEDIUM
  - **Issue:** Stock read → parse JSON → decrement → write back. If webhook fires twice or process crashes mid-loop, stock is inconsistent.
  - **Fix:** Use atomic SQL: `UPDATE products SET stockQuantity = MAX(0, stockQuantity - ?) WHERE productId = ?`.

- [ ] **N2. Discount usage count race condition**
  - **File:** `discounts.ts:50-56` (check) + `orders.ts:854-858` (increment)
  - **Severity:** MEDIUM
  - **Issue:** Usage limit validated, then count incremented later. Two concurrent checkouts could both pass the limit.
  - **Fix:** Atomic increment with limit check: `UPDATE discount_codes SET usageCount = usageCount + 1 WHERE code = ? AND usageCount < usageLimit`.

- [ ] **N3. Order number generation TOCTOU**
  - **File:** `orders.ts:653-654`
  - **Severity:** LOW (mitigated by DO)
  - **Issue:** `SELECT MAX(orderNumber) + 1` is not atomic.
  - **Fix:** Use auto-increment counter in `store_settings`.

- [ ] **N4. Subdomain signup TOCTOU**
  - **File:** `auth.ts:204-210`
  - **Severity:** LOW
  - **Issue:** Check subdomain exists → insert. Concurrent signups could collide.
  - **Fix:** UNIQUE constraint on subdomain catches this at DB level.

### Business Logic Flaws

- [ ] **O1. No negative/zero quantity validation — allows free items**
  - **File:** `orders.ts:507`, `orders.ts:112`
  - **Severity:** HIGH
  - **Issue:** Negative quantity (e.g., `-5`) produces negative `itemCost`, clamped to 0 total. Attacker gets items for free.
  - **Fix:** Add Zod constraint: `quantity: z.number().int().min(1)`.

- [ ] **O2. Platform fee calculated on discounted total, not subtotal**
  - **File:** `orders.ts:615`
  - **Severity:** MEDIUM
  - **Issue:** `platformFee = total * platformFeePercent`. Merchants can reduce platform fees by offering larger discounts.
  - **Fix:** Calculate platform fee on `computation.subtotal` instead of `computation.total`.

- [ ] **O3. Inconsistent MRR calculation between admin endpoints**
  - **File:** `admin.ts:713-717` (starter=299, growth=899, pro=1999) vs `admin.ts:1023` (starter=999, growth=4999, pro=9999)
  - **Severity:** MEDIUM
  - **Issue:** Two admin endpoints show different MRR for the same plans.
  - **Fix:** Use a single source of truth for plan pricing constants.

- [ ] **O4. Hardcoded merchant phone in WhatsApp webhook**
  - **File:** `orders.ts:893`
  - **Severity:** MEDIUM
  - **Issue:** `recipient: "+919999999999"` hardcoded. WhatsApp notifications always go to wrong number.
  - **Fix:** Read from `store.whatsappNumber` or store settings.

- [ ] **O5. Discount can exceed 100%**
  - **File:** `discounts.ts:60-64`
  - **Severity:** MEDIUM
  - **Issue:** No max discount value enforced. Merchant can create 999% discount.
  - **Fix:** Add `maxValue` field to discount schema, validate at creation and checkout.

- [ ] **O6. Gift card balance > initialValue allowed**
  - **File:** `products.ts:625`
  - **Severity:** LOW
  - **Issue:** Merchant can set balance greater than initial value.
  - **Fix:** Validate `balance <= initialValue` at creation.

### Third-Party Risk

- [ ] **P1. Razorpay single point of failure — no fallback payment**
  - **File:** `orders.ts:621-646`
  - **Severity:** HIGH
  - **Issue:** If Razorpay API is down, checkout falls back to mock key. Payment widget fails to initialize. No alternative payment method offered.
  - **Fix:** Show clear error message to customer. Consider UPI direct or bank transfer fallback.

- [ ] **P2. Shiprocket failures silently degraded**
  - **File:** `orders.ts:365-381`
  - **Severity:** MEDIUM
  - **Issue:** If Shiprocket is down, shipment booked without tracking. Merchant not notified.
  - **Fix:** Add failure notification to merchant. Queue retry.

- [ ] **P3. WhatsApp service is mock-only in all environments**
  - **File:** `services/whatsapp.ts:44-62`
  - **Severity:** MEDIUM
  - **Issue:** WhatsApp add-on is no-op. Paying merchants get nothing.
  - **Fix:** Remove WhatsApp from paid add-ons until real integration is built.

### Testing Coverage Gaps

- [ ] **Q1. Test coverage < 30%**
  - **Severity:** HIGH
  - **Untested endpoints:** All customer CRUD, bulk import, broadcast, collections, purchase orders, gift cards, all store routes (billing, menus, blog posts, files, navigation), all reviews, all storefront API, all design settings, all theme marketplace, most auth routes (refresh, logout, resend verification, customer forgot/reset password), most admin routes (create merchant, reset password, delete, support tickets, CMS, feature flags, API keys, emails), discount CRUD and validation, order list/detail/status/invoice/sample/my-orders.
  - **Fix:** Add integration tests for all untested endpoints.

- [ ] **Q2. Zero security tests**
  - **Severity:** HIGH
  - **Missing:** Brute-force protection tests, CORS header tests, SQL injection tests, XSS tests, CSRF tests, rate limiting tests, negative quantity tests, discount abuse tests, open redirect tests, host header injection tests.
  - **Fix:** Add security-focused test suite.

- [ ] **Q3. Webhook signature test uses mock bypass**
  - **File:** `tests/part3_orders.test.ts:189`
  - **Severity:** MEDIUM
  - **Issue:** Test passes `"x-razorpay-signature": "mock-signature-bypass"` which always passes. Real HMAC logic untested.
  - **Fix:** Test with valid and invalid HMAC signatures.

### Error Handling & Edge Cases

- [ ] **R1. Queue messages silently swallowed on failure**
  - **File:** `queue.ts:453-455`
  - **Severity:** LOW
  - **Issue:** Failed queue messages not ack'd but no dead-letter queue configured. Infinite retry loop possible.
  - **Fix:** Add max retry count and dead-letter queue.

- [ ] **R2. Silent error swallowing throughout codebase**
  - **Files:** `orders.ts:78,378,824`, `store.ts:57`, `admin.ts:306`
  - **Severity:** LOW
  - **Issue:** Multiple `catch (e) {}` blocks mask real failures.
  - **Fix:** Log errors at minimum. Remove empty catch blocks.

- [ ] **R3. Email template store name XSS in HTML emails**
  - **File:** `queue.ts:194,243-244`
  - **Severity:** MEDIUM
  - **Issue:** Store name interpolated into HTML email templates without escaping. Malicious store name = stored XSS in email.
  - **Fix:** HTML-escape all user-controlled values in email templates.

- [ ] **R4. PDF generation insufficient character sanitization**
  - **File:** `lib/pdf.ts:24-28`
  - **Severity:** LOW
  - **Issue:** Only strips `()` from user input. Other PDF-dangerous characters (`\`, `%`, newlines) not stripped.
  - **Fix:** Sanitize all non-printable and PDF-control characters.

- [ ] **R5. Log injection via unsanitized user input**
  - **Files:** `audit.ts:12`, `queue.ts:13`, `orders.ts:379,897`, `customers.ts:220,413`
  - **Severity:** LOW
  - **Issue:** User emails, subdomains, and request bodies written to logs without sanitization.
  - **Fix:** Sanitize log inputs. Use structured logging with proper encoding.

### Configuration Issues

- [ ] **S1. Inconsistent MRR pricing between endpoints**
  - **File:** `admin.ts:713` (299/899/1999) vs `admin.ts:1023` (999/4999/9999)
  - **Fix:** Extract plan pricing to shared constants.

- [ ] **S2. Media proxy cache set to 1 year**
  - **File:** `app.ts:152`
  - **Severity:** LOW
  - **Issue:** `Cache-Control: public, max-age=31536000`. Stale images served if product updated.
  - **Fix:** Use shorter cache with `stale-while-revalidate`.

- [ ] **S3. No Cache-Control on storefront API responses**
  - **File:** `storefront_api.ts` — all endpoints
  - **Severity:** LOW
  - **Issue:** No cache headers. Intermediate proxies could cache stale or cross-tenant data.
  - **Fix:** Add `Cache-Control: public, max-age=60, stale-while-revalidate=300` for public storefront data.

---

## FINAL GRAND TOTAL

| Part | Category | Items |
|---|---|---|
| **Part 1** | Algorithm & Query Optimization | 37 |
| **Part 2** | Missing Pagination | 68 |
| **Part 3** | Remaining Optimizations | 54 |
| **Part 4** | Security Audit (Quick) | 28 |
| **Part 5** | 13-Category Security Audit | 93 |
| **Part 6** | Final Sweep (Business Logic, Race, Testing, Edge Cases) | 31 |
| | **GRAND TOTAL** | **~311 issues** |

### Complete Top 25 Fixes (Priority Order)

1. **Implement account lockout** after 5 failed logins (A2)
2. **Add auth event logging** — login, logout, failed attempts (K1)
3. **Replace storefront API header auth** with API key/JWT (B1)
4. **Remove x-subdomain header fallback** in production (S3)
5. **Implement CSRF protection** on all state-changing endpoints (S5)
6. **Reduce access token expiry** to 15 min (A1)
7. **Fix customer/admin logout** to revoke refresh tokens (A4, A5)
8. **Add CSP and HSTS headers** to all 4 frontends (M1, M2, I1, I2)
9. **Encrypt all PII at rest** (L1)
10. **Add `npm audit` and Dependabot** to CI (J1, J2)
11. **Add negative quantity validation** — prevent free items (O1)
12. **Add rate limiting on auth endpoints** (G2, G3)
13. **Add auth middleware** to theme marketplace routes (B2)
14. **Add Zod validation** to all unvalidated endpoints (C1)
15. **Implement data retention cleanup** (L2)
16. **Add cascade deletion** for tenant D1 databases (L3)
17. **Add unsubscribe links** to marketing emails (F1)
18. **Fix rate limiter fail-open** — deny on error (G1)
19. **Store API keys hashed** in DB (G4)
20. **Add secret scanning and SAST** to CI (J4, J3)
21. **Fix stock decrement race condition** — use atomic SQL (N1)
22. **Fix discount usage race condition** — atomic increment (N2)
23. **Add test coverage** for all untested endpoints (Q1)
24. **Add security test suite** (Q2)
25. **Fix inconsistent MRR pricing** between admin endpoints (S1)

---

## PART 7: BUSINESS LOGIC, CI/CD, THIRD-PARTY, DNS, TESTING, INCIDENT RESPONSE & BACKUP

### Category 14: Business Logic Abuse

- [ ] **T1. No webhook event deduplication for Razorpay**
  - **File:** `orders.ts:785-803`
  - **Severity:** MEDIUM
  - **Issue:** `payment.captured` and `order.paid` events both handled. No idempotency key check for Razorpay event IDs. Stock decrement not idempotent — double webhook = double decrement.
  - **Fix:** Store `razorpayPaymentId` and check for duplicates. Use Razorpay event ID for idempotency.

- [ ] **T2. No maximum quantity limit on cart items**
  - **File:** `shared/src/index.ts:188`
  - **Severity:** LOW
  - **Issue:** `CartItemSchema.quantity` is `z.number().int().positive()` with no upper bound. `quantity: 999999` accepted on products with `continueSellingOutOfStock`.
  - **Fix:** Add `.max(9999)` to quantity schema.

- [ ] **T3. No server-side max discount value on percentage codes**
  - **File:** `shared/src/index.ts:174-183`
  - **Severity:** MEDIUM
  - **Issue:** Merchant can create 200% discount code. While total is clamped to 0, free products are still issued.
  - **Fix:** Add validation: `if (type === "percentage" && value > 100) reject`.

- [ ] **T4. Idempotency keys have no TTL cleanup**
  - **File:** `orders.ts:545`
  - **Severity:** LOW
  - **Issue:** Stale `PROCESSING` locks from crashed requests never cleaned up. Blocks retries for that key forever.
  - **Fix:** Add `expiresAt` column and periodic cleanup job.

- [x] **T5. Negative quantity blocked** — `CartItemSchema` enforces `.positive()`.
- [x] **T6. Discount stacking not possible** — Only one `discountCode` per checkout.
- [x] **T7. Post-checkout total modification not possible** — No endpoint exists.
- [x] **T8. Server-side price computation** — Client amounts ignored in checkout.

### Category 15: CI/CD & Deployment

- [ ] **U1. No branch protection rules**
  - **File:** `.github/` — no CODEOWNERS, no branch protection config
  - **Severity:** HIGH
  - **Fix:** Add branch protection requiring PR reviews, status checks, signed commits for `main`.

- [ ] **U2. No signed commits requirement**
  - **File:** `.github/workflows/*`
  - **Severity:** MEDIUM
  - **Fix:** Enforce GPG-signed commits via branch protection.

- [ ] **U3. Single deploy token for all services**
  - **File:** `.github/workflows/deploy-backend.yml:36-37`
  - **Severity:** MEDIUM
  - **Issue:** One `CLOUDFLARE_API_TOKEN` for Worker + Pages. Should be separate tokens per service.
  - **Fix:** Create separate Cloudflare API tokens with minimum scopes per service.

- [ ] **U4. No staging environment in CI**
  - **File:** `.github/workflows/deploy-backend.yml`
  - **Severity:** MEDIUM
  - **Issue:** Only `environment: 'production'` configured. No staging deployment pipeline.
  - **Fix:** Add staging environment with separate secrets.

- [ ] **U5. No security scanning in CI/CD**
  - **All 3 workflow files**
  - **Severity:** HIGH
  - **Issue:** No CodeQL, Dependabot, Snyk, Trivy, npm audit, or SAST/DAST tooling.
  - **Fix:** Add CodeQL analysis + `npm audit --audit-level=high` to PR validation.

- [x] **U6. No secrets in build logs** — All use `${{ secrets.* }}` context.
- [x] **U7. No workflow_dispatch triggers** — No manual trigger abuse vector.
- [x] **U8. No hardcoded secrets in workflows** — Clean.

### Category 16: Third-Party Integrations

- [ ] **V1. Razorpay silent fallback to mock on failure**
  - **File:** `orders.ts:641-642`
  - **Severity:** HIGH
  - **Issue:** If Razorpay API is down, checkout creates mock order ID. Customer sees success but payment never captured. No error shown.
  - **Fix:** Return error to customer. Do not create order with mock ID in production.

- [ ] **V2. Shiprocket integration is mock stub**
  - **File:** `services/shiprocket.ts:56-80`
  - **Severity:** MEDIUM
  - **Issue:** Returns fake tracking numbers. No actual API calls. Silently continues on credential failure.
  - **Fix:** Implement real API integration or fail explicitly when credentials missing.

- [ ] **V3. WhatsApp integration is mock stub**
  - **File:** `services/whatsapp.ts:44-62`
  - **Severity:** MEDIUM
  - **Issue:** Only logs to console. Returns `true` always. No real Meta/Twilio API calls.
  - **Fix:** Implement real integration or remove from paid add-ons.

- [ ] **V4. No circuit breaker for third-party services**
  - **Severity:** LOW
  - **Issue:** ZeptoMail retries 3 times but no circuit breaker. Extended outage wastes Worker CPU on retries.
  - **Fix:** Implement circuit breaker pattern for all external API calls.

- [ ] **V5. API key scope validation not enforced**
  - **File:** `control_schema.sql:215-223`
  - **Severity:** LOW
  - **Issue:** `api_keys` table has `scopesJson` but no middleware validates scopes against endpoints.
  - **Fix:** Add scope validation middleware for API key authenticated requests.

- [ ] **V6. PII logged in ZeptoMail error paths**
  - **File:** `emails/src/services/zeptomail.ts:100-102`
  - **Severity:** LOW
  - **Issue:** Logs recipient email, request URL on failure.
  - **Fix:** Redact PII in error logs.

- [x] **V7. Razorpay webhook HMAC verified** — SHA256 with raw body.
- [x] **V8. Razorpay credentials encrypted at rest** — AES-256-GCM.
- [x] **V9. ZeptoMail has retry with backoff** — 3 attempts, exponential.

### Category 17: DNS & Domain

- [ ] **W1. No SPF/DKIM/DMARC configuration**
  - **Severity:** MEDIUM
  - **Issue:** `@basecart.app` sender addresses need DNS auth. Emails may land in spam.
  - **Fix:** Configure SPF, DKIM, DMARC at DNS level for `basecart.app`.

- [ ] **W2. No CAA records configured**
  - **Severity:** LOW
  - **Issue:** No Certificate Authority Authorization records. Any CA can issue certs for `basecart.app`.
  - **Fix:** Add CAA records restricting cert issuance to your preferred CA.

- [ ] **W3. No DNSSEC configuration**
  - **Severity:** LOW
  - **Issue:** No DNSSEC references. DNS responses not cryptographically signed.
  - **Fix:** Enable DNSSEC at registrar if supported.

- [ ] **W4. No typosquatting protection on subdomain registration**
  - **Severity:** LOW
  - **Issue:** No similarity detection for merchant subdomain names (e.g., "basecart" vs "bascart").
  - **Fix:** Add homoglyph and Levenshtein distance checks on subdomain registration.

- [ ] **W5. Custom domain has no DNS verification or SSL provisioning**
  - **File:** `store.ts:191-197`
  - **Severity:** LOW
  - **Issue:** Custom domain stored but no DNS validation or cert provisioning in code.
  - **Fix:** Verify DNS points to Basecart before activating custom domain.

### Category 18: Testing & Ongoing Assurance

- [ ] **X1. No security.txt file**
  - **Severity:** MEDIUM
  - **Issue:** No `.well-known/security.txt` or `SECURITY.md` with responsible disclosure contact.
  - **Fix:** Create `SECURITY.md` with vulnerability reporting instructions.

- [ ] **X2. No SAST/DAST tooling configured**
  - **Severity:** HIGH
  - **Issue:** No ESLint security plugins, no Semgrep, no CodeQL, no OWASP ZAP.
  - **Fix:** Add CodeQL to CI + Semgrep for custom rules.

- [ ] **X3. No security-focused tests**
  - **Severity:** HIGH
  - **Missing:** Brute-force testing, SQL injection testing, XSS testing, CSRF testing, unauthorized access testing, rate limiter testing, webhook signature forgery testing.
  - **Fix:** Create dedicated security test suite.

- [ ] **X4. Webhook signature test uses mock bypass**
  - **File:** `tests/part3_orders.test.ts:189`
  - **Severity:** MEDIUM
  - **Issue:** Test passes `"mock-signature-bypass"` which always passes. Real HMAC logic untested.
  - **Fix:** Test with valid and invalid HMAC signatures.

- [ ] **X5. Existing SECURITY-AUDIT.md is good baseline**
  - **File:** `SECURITY-AUDIT.md`
  - **Status:** PASS — Documents 18 fixed and 13 remaining issues.

### Category 19: Incident Response

- [ ] **Y1. No incident response plan or runbook**
  - **Severity:** HIGH
  - **Issue:** No IR playbooks, escalation procedures, or communication templates.
  - **Fix:** Create incident response runbook covering: detection, containment, eradication, recovery, notification.

- [ ] **Y2. No breach notification logic**
  - **Severity:** MEDIUM
  - **Issue:** No automated breach detection. No notification emails for suspicious activity.
  - **Fix:** Implement breach detection alerts and user notification system.

- [ ] **Y3. No automated threat detection**
  - **Severity:** MEDIUM
  - **Issue:** Only detection is `console.warn` for reserved subdomain abuse. No anomaly detection.
  - **Fix:** Implement Cloudflare analytics alerts for traffic anomalies.

- [ ] **Y4. India DPDP Act breach notification obligations not documented**
  - **Severity:** MEDIUM
  - **Issue:** DPDP Act requires breach notification within 72 hours. No process documented.
  - **Fix:** Document legal notification obligations and add to IR runbook.

- [x] **Y5. Store suspension enforced** — Middleware returns 403 on suspended stores.

### Category 20: Backup & Recovery

- [ ] **Z1. No automated backup system**
  - **Severity:** HIGH
  - **Issue:** No scheduled D1 backup exports. No cross-region replication. `db:sync` is dev-only.
  - **Fix:** Schedule daily D1 exports to R2. Configure D1 PITR if available.

- [ ] **Z2. No restore procedures documented**
  - **Severity:** HIGH
  - **Issue:** DEPLOYMENT.md covers rollback but not disaster recovery or data restoration.
  - **Fix:** Document step-by-step restore from D1 export. Test restore periodically.

- [ ] **Z3. No R2 bucket backup strategy**
  - **Severity:** MEDIUM
  - **Issue:** Media assets (product images, invoice PDFs) have no backup/replication.
  - **Fix:** Configure R2 replication or periodic export to secondary bucket.

- [ ] **Z4. No backup verification or testing**
  - **Severity:** HIGH
  - **Issue:** Even if backups exist, there's no process to verify they work.
  - **Fix:** Monthly backup restoration test. Document results.

- [ ] **Z5. d1-prod-export.sql gitignored**
  - **File:** `.gitignore:54`
  - **Severity:** LOW
  - **Issue:** SQL exports excluded from git. Manual exports not version-controlled.
  - **Fix:** Store backups in R2, not git. Version-control only schema migrations.

- [x] **Z6. Rollback procedures documented** — DEPLOYMENT.md Phase 9 covers `wrangler rollback`.

---

## COMPLETE GRAND TOTAL

| Part | Category | Items |
|---|---|---|
| **Part 1** | Algorithm & Query Optimization | 37 |
| **Part 2** | Missing Pagination | 68 |
| **Part 3** | Remaining Optimizations | 54 |
| **Part 4** | Security Audit (Quick) | 28 |
| **Part 5** | 13-Category Security Audit | 93 |
| **Part 6** | Final Sweep (Business Logic, Race, Testing, Edge Cases) | 31 |
| **Part 7** | Business Logic, CI/CD, Third-Party, DNS, Testing, IR, Backup | 42 |
| | **GRAND TOTAL** | **~353 issues** |

---

## ULTIMATE TOP 30 FIXES (Priority Order)

### CRITICAL (Do Before Launch)
1. - [x] **Implement account lockout** after 5 failed logins (A2) [COMPLETED]
2. - [x] **Add auth event logging** — login, logout, failed attempts (K1) [COMPLETED]
3. - [x] **Replace storefront API header auth** with API key/JWT (B1) [COMPLETED]
4. - [x] **Remove x-subdomain header fallback** in production (S3) [COMPLETED]
5. - [x] **Implement CSRF protection** on all state-changing endpoints (S5) [COMPLETED]
6. - [x] **Reduce access token expiry** to 15 min (A1) [COMPLETED]
7. - [x] **Fix customer/admin logout** to revoke refresh tokens (A4, A5) [COMPLETED]
8. - [x] **Stop silent Razorpay mock fallback** — fail checkout on error (V1) [COMPLETED]
9. - [x] **Add D1 backup strategy** with PITR and restore procedures (Z1, Z2) [COMPLETED]
10. - [x] **Encrypt all PII at rest** (L1) [COMPLETED]

### HIGH (Launch Blockers)
11. - [x] **Add CSP and HSTS headers** to all 4 frontends (M1, M2, I1, I2) [COMPLETED]
12. - [x] **Add `npm audit` and Dependabot** to CI (J1, J2) [COMPLETED]
13. - [x] **Add negative quantity validation** — prevent free items (O1) [COMPLETED]
14. - [x] **Add rate limiting on auth endpoints** (G2, G3) [COMPLETED]
15. - [x] **Add auth middleware** to theme marketplace routes (B2) [COMPLETED]
16. - [x] **Configure GitHub branch protection** (U1) [COMPLETED]
17. - [x] **Add security scanning to CI** — CodeQL + npm audit (U5, X2) [COMPLETED]
18. - [x] **Create security.txt** with disclosure contact (X1) [COMPLETED]
19. - [x] **Create incident response runbook** (Y1) [COMPLETED]
20. - [x] **Add webhook event deduplication** for Razorpay (T1) [COMPLETED]

### MEDIUM (Post-Launch Sprint)
21. - [x] **Add Zod validation** to all unvalidated endpoints (C1) [COMPLETED]
22. - [x] **Implement data retention cleanup** (L2) [COMPLETED]
23. - [x] **Add cascade deletion** for tenant D1 databases (L3) [COMPLETED]
24. - [x] **Add unsubscribe links** to marketing emails (F1) [COMPLETED]
25. - [x] **Fix rate limiter fail-open** — deny on error (G1) [COMPLETED]
26. - [x] **Store API keys hashed** in DB (G4) [COMPLETED]
27. - [x] **Add security test suite** (X3) [COMPLETED]
28. - [x] **Configure SPF/DKIM/DMARC** (W1) [COMPLETED]
29. - [x] **Implement percentage discount cap** at 100% (T3) [COMPLETED]
30. - [x] **Fix inconsistent MRR pricing** between admin endpoints (S1) [COMPLETED]
