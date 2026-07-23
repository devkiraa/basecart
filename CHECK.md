# Basecart Performance Optimization & Pagination Audit

> Generated from full codebase analysis. Checkboxes for tracking, estimated ms savings, and fix approaches.

---

## PART 1: ALGORITHM & QUERY OPTIMIZATION

### CRITICAL — Immediate Fixes

- [ ] **1. Admin Metrics N+1 across all tenants**
  - **File:** `packages/backend/src/routes/admin.ts:728-748`
  - **Issue:** Loops over every merchant, fires 2 queries per tenant via separate Durable Object RPC calls. 500 merchants = 1000 sequential round-trips.
  - **Current:** ~5000-10000ms | **After Fix:** ~50-100ms | **Savings:** ~99%
  - **Fix:** Periodic background job to pre-aggregate GMV/stats into a KV key or control-DB summary table.

- [ ] **2. Admin Orders N+1 across all tenants**
  - **File:** `packages/backend/src/routes/admin.ts:1205-1208`
  - **Issue:** Opens a separate DO stub per tenant, runs `SELECT * FROM orders LIMIT 20`, merges in-memory.
  - **Current:** ~3000-8000ms | **After Fix:** ~50-100ms | **Savings:** ~98%
  - **Fix:** Maintain a recent-orders feed in KV or a control-DB `recent_orders` table.

- [ ] **3. Customer List: full table scan + O(N×M) in-app join**
  - **File:** `packages/backend/src/routes/customers.ts:31-34`
  - **Issue:** Loads ALL customers then ALL orders, joins in JavaScript with nested loop.
  - **Current:** ~2000-5000ms | **After Fix:** ~50-200ms | **Savings:** ~95%
  - **Fix:** `SELECT customerEmail, COUNT(*) as orderCount, SUM(total) as totalSpend, MAX(createdAt) as lastOrder FROM orders GROUP BY customerEmail`.

- [ ] **4. Broadcast: full table scan + in-app join**
  - **File:** `packages/backend/src/routes/customers.ts:281-285`
  - **Issue:** Same as #3 but for broadcast — loads ALL customers (including hashed passwords) + ALL orders, no LIMIT.
  - **Current:** ~3000-8000ms | **After Fix:** ~100-300ms | **Savings:** ~95%
  - **Fix:** SQL `GROUP BY` with `HAVING` for spend-range filtering. Select only needed columns.

- [ ] **5. Stock Decrement: N+1 reads + writes with race condition**
  - **File:** `packages/backend/src/routes/orders.ts:819-851`
  - **Issue:** Per order item: fetch product → parse JSON variants → find variant → update stock → stringify back. Two items sharing a product cause double fetch + inconsistent writes.
  - **Current:** ~500-2000ms | **After Fix:** ~50-100ms | **Savings:** ~90%
  - **Fix:** Batch-fetch all unique product IDs in one query, compute all stock updates in-memory, then batch-update.

### HIGH — Significant Impact

- [ ] **6. Merchant Orders: N+1 order_items**
  - **File:** `packages/backend/src/routes/orders.ts:165`
  - **Issue:** After fetching all orders, fires `SELECT * FROM order_items WHERE orderId = ?` per order. 500 orders = 501 queries.
  - **Current:** ~1000-3000ms | **After Fix:** ~30-100ms | **Savings:** ~95%
  - **Fix:** `SELECT o.*, oi.* FROM orders o LEFT JOIN order_items oi ON o.orderId = oi.orderId ORDER BY o.createdAt DESC`.

- [ ] **7. Customer My-Orders: same N+1 pattern**
  - **File:** `packages/backend/src/routes/orders.ts:921`
  - **Issue:** Identical N+1 on the public storefront endpoint.
  - **Current:** ~500-2000ms | **After Fix:** ~20-80ms | **Savings:** ~90%
  - **Fix:** Same JOIN approach as #6.

- [ ] **8. Dashboard Summary: ALL orders with SELECT ***
  - **File:** `packages/backend/src/routes/dashboard.ts:16`
  - **Issue:** Loads every order row with all columns for a 7-day revenue chart.
  - **Current:** ~1000-3000ms | **After Fix:** ~10-50ms | **Savings:** ~97%
  - **Fix:** `SELECT DATE(createdAt) as day, SUM(total), COUNT(*) FROM orders WHERE createdAt >= ? GROUP BY DATE(createdAt)`.

- [ ] **9. Finances: ALL orders with SELECT ***
  - **File:** `packages/backend/src/routes/store.ts:520`
  - **Issue:** Full scan of all orders with all columns for finances page.
  - **Current:** ~1000-3000ms | **After Fix:** ~10-50ms | **Savings:** ~97%
  - **Fix:** `SELECT SUM(total), SUM(platformFee), COUNT(*) FROM orders WHERE status IN ('paid','shipped','delivered')`.

- [ ] **10. Bulk Import: N sequential inserts**
  - **File:** `packages/backend/src/routes/customers.ts:191-221`
  - **Issue:** 1000 customers = 1000 sequential DO RPC calls.
  - **Current:** ~10000-30000ms | **After Fix:** ~200-500ms | **Savings:** ~98%
  - **Fix:** Use existing `db.batch()` method.

- [ ] **11. Admin Tables: DDL on EVERY request**
  - **File:** `packages/backend/src/routes/admin.ts:306` (calls `ensureAdminTables` at lines 55-282)
  - **Issue:** `CREATE TABLE IF NOT EXISTS` for 8 tables + `SELECT COUNT(*)` + conditional `INSERT` loops on every admin request.
  - **Current:** ~100-300ms overhead | **After Fix:** ~0ms | **Savings:** 100%
  - **Fix:** Move to one-time migration script.

- [ ] **12. Customer Columns: PRAGMA + ALTER TABLE on every GET**
  - **File:** `packages/backend/src/routes/customers.ts:17-29`
  - **Issue:** `PRAGMA table_info` + up to 9 `ALTER TABLE ADD COLUMN` on every `/customers` load.
  - **Current:** ~50-200ms overhead | **After Fix:** ~0ms | **Savings:** 100%
  - **Fix:** Move schema additions to D1 migration.

- [ ] **13. Checkout Item Inserts: N sequential**
  - **File:** `packages/backend/src/routes/orders.ts:684-701`
  - **Issue:** N separate `INSERT INTO order_items` during checkout.
  - **Current:** ~100-500ms | **After Fix:** ~10-30ms | **Savings:** ~80%
  - **Fix:** Use `db.batch()`.

- [ ] **14. Seed Inserts on every admin request**
  - **File:** `packages/backend/src/routes/admin.ts:68-282`
  - **Issue:** INSERT loops for marketplace themes, plans, add-ons on every admin call.
  - **Current:** ~50-200ms overhead | **After Fix:** ~0ms | **Savings:** 100%
  - **Fix:** Move seeding to bootstrap script.

### MEDIUM — Notable Inefficiencies

- [ ] **15. SKU Validation: full product scan + JSON.parse per row**
  - **File:** `packages/backend/src/routes/products.ts:17-21`
  - **Issue:** Fetches all products, parses variants JSON for every one on each create/update.
  - **Current:** ~200-1000ms | **After Fix:** ~10-30ms | **Savings:** ~90%
  - **Fix:** Add `product_skus` table with `UNIQUE(sku)` or covering index on `products(sku)`.

- [ ] **16. Category Counts in JS**
  - **File:** `packages/backend/src/routes/products.ts:445-453`
  - **Issue:** Full product scan to count categories in JavaScript.
  - **Current:** ~200-500ms | **After Fix:** ~10-30ms | **Savings:** ~90%
  - **Fix:** `SELECT category, COUNT(*) FROM products WHERE category != '' GROUP BY category`.

- [ ] **17. Store Files: products scan + JSON.parse for images**
  - **File:** `packages/backend/src/routes/store.ts:1207-1229`
  - **Issue:** Full product scan to extract image URLs with per-row JSON parsing.
  - **Current:** ~200-800ms | **After Fix:** ~20-50ms | **Savings:** ~85%
  - **Fix:** Add `product_images` table or computed `primaryImage` column.

- [ ] **18. KV Settings: sequential upserts**
  - **File:** `packages/backend/src/routes/store.ts:321-325`
  - **Issue:** Up to 23 sequential `INSERT OR REPLACE` calls.
  - **Current:** ~100-300ms | **After Fix:** ~10-30ms | **Savings:** ~85%
  - **Fix:** Use `db.batch()`.

- [ ] **19. Missing Database Indexes**
  - **File:** `packages/backend/src/lib/tenant_schema.ts`, `control_schema.ts`
  - **Missing:** `orders(customerEmail)`, `orders(status)`, `products(status, category)`, `tenants(plan, status)`, `support_tickets(createdAt)`, `admin_audit_logs(createdAt)`
  - **Current:** Full table scans | **After Fix:** Index seeks | **Savings:** ~90-99% per query
  - **Fix:** Add missing indexes in new D1 migration.

- [ ] **20. Subdomain Alternates: up to 8 sequential queries**
  - **File:** `packages/backend/src/routes/auth.ts:135-148`
  - **Issue:** Each suffix checked one at a time.
  - **Current:** ~80-200ms | **After Fix:** ~10-20ms | **Savings:** ~80%
  - **Fix:** `SELECT subdomain FROM tenants WHERE subdomain IN (?, ?, ?, ...)`.

- [ ] **21. ensureDesignTables() on every design request**
  - **File:** `packages/backend/src/routes/storefront-design.ts:24-71`
  - **Issue:** 3 `CREATE TABLE IF NOT EXISTS` on every read/write.
  - **Current:** ~30-100ms overhead | **After Fix:** ~0ms | **Savings:** 100%
  - **Fix:** Move to D1 migration.

- [ ] **22. Themes: INSERT inside GET handler**
  - **File:** `packages/backend/src/routes/store.ts:608-623`
  - **Issue:** Default theme seeded via INSERT on every GET when no themes exist.
  - **Current:** Write latency on cold start | **After Fix:** ~0ms | **Savings:** Eliminates write-in-read
  - **Fix:** Seed during tenant provisioning.

- [ ] **23. Boolean Mapping: O(rows × cols) scan**
  - **File:** `packages/backend/src/lib/tenant_do.ts:87-100`
  - **Issue:** Every query result iterates every column checking boolean field list.
  - **Current:** ~1-5ms per query | **After Fix:** ~0.1-0.5ms | **Savings:** ~80%
  - **Fix:** Use SQLite BOOLEAN type natively or targeted mapping.

- [ ] **24. Global Search: leading-wildcard LIKE**
  - **File:** `packages/backend/src/routes/admin.ts:825-838`
  - **Issue:** `%query%` LIKE on 3 columns — cannot use B-tree indexes.
  - **Current:** ~200-500ms | **After Fix:** ~10-30ms | **Savings:** ~90%
  - **Fix:** Add SQLite FTS5 virtual table or trigram indexes.

- [ ] **25. MAX(orderNumber) on every checkout**
  - **File:** `packages/backend/src/routes/orders.ts:653`
  - **Issue:** Full scan to find max order number.
  - **Current:** ~50-200ms | **After Fix:** ~1ms | **Savings:** ~95%
  - **Fix:** Store `nextOrderNumber` in `store_settings`, atomically increment.

### LOW — Minor

- [ ] **26.** Admin billing: counts plans in JS (`admin.ts:1010`) — use `GROUP BY plan`
- [ ] **27.** Notifications: 3 sequential queries (`auth.ts:737`) — use JOIN
- [ ] **28.** Checkout SELECT * on tenants (`orders.ts:567`) — select subset only
- [ ] **29.** Discount list: no ORDER BY/LIMIT (`discounts.ts:158`)
- [ ] **30.** Store KV: loads all settings (`store.ts:73`) — select specific keys
- [ ] **31.** Product list: no status filter (`products.ts:196`)
- [ ] **32.** Collections DDL on GET (`products.ts:427`) — move to migration
- [ ] **33.** Purchase orders DDL on GET (`products.ts:504`) — move to migration
- [ ] **34.** Gift cards DDL on GET (`products.ts:554`) — move to migration
- [ ] **35.** Store menus DDL on GET (`store.ts:1086`) — move to migration
- [ ] **36.** Blog posts DDL on GET (`store.ts:1153`) — move to migration
- [ ] **37.** Duplicate store_menus DDL (`store.ts:1261`) — remove duplicate

---

## PART 2: MISSING PAGINATION AUDIT

### Summary

| Category | Count | Description |
|---|---|---|
| **CRITICAL** | 12 endpoints | High-volume tables (orders, customers, products) returned entirely with no LIMIT |
| **HIGH** | 16 endpoints | Admin platform-wide queries without LIMIT |
| **MEDIUM** | 8 endpoints | Sub-resources without LIMIT |
| **LOW** | 6 endpoints | Small bounded tables |
| **Properly paginated** | 1 endpoint | `reviews.ts` — the ONLY endpoint with LIMIT/OFFSET |
| **Partially paginated** | 1 endpoint | `storefront_api.ts` — has LIMIT but no OFFSET |
| **TOTAL** | **42 unpaginated** | Only 1 of 44 endpoints has proper pagination |

---

### CRITICAL — High-Volume Tables, No Pagination

- [ ] **P1. GET /customers** (`customers.ts:31`)
  - **Query:** `SELECT * FROM customers ORDER BY createdAt DESC` + `SELECT * FROM orders` (line 34)
  - **Tables:** `customers`, `orders` (both full scans, no LIMIT)
  - **Risk:** HIGH — 10K customers × 50K orders = OOM/timeout
  - **Fix:** Add `LIMIT ? OFFSET ?` params, default `LIMIT 50`

- [ ] **P2. POST /customers/broadcast** (`customers.ts:281-285`)
  - **Query:** `SELECT * FROM customers` + `SELECT * FROM orders` (no LIMIT)
  - **Tables:** `customers`, `orders` (full scans)
  - **Risk:** HIGH — Broadcast loads everything including hashed passwords
  - **Fix:** Paginate audience selection, exclude `hashedPassword`

- [ ] **P3. GET /customers/:email/orders** (`customers.ts:243`)
  - **Query:** `SELECT * FROM orders WHERE customerEmail = ? ORDER BY createdAt DESC`
  - **Table:** `orders` (no LIMIT)
  - **Risk:** MEDIUM — Customer with 1000+ orders returns everything
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P4. GET /dashboard/summary** (`dashboard.ts:16`)
  - **Query:** `SELECT * FROM orders` (no LIMIT)
  - **Table:** `orders` (full scan for 7-day chart)
  - **Risk:** HIGH — 10K+ orders scanned for every dashboard load
  - **Fix:** Use SQL `SUM()` + `GROUP BY` with date range, no LIMIT needed

- [ ] **P5. GET /orders** (`orders.ts:160`)
  - **Query:** `SELECT * FROM orders ORDER BY createdAt DESC` (no LIMIT) + N+1 on `order_items`
  - **Table:** `orders` + `order_items`
  - **Risk:** HIGH — 10K orders = 10K+ queries total
  - **Fix:** Add `LIMIT ? OFFSET ?` + JOIN for order_items

- [ ] **P6. GET /store/:subdomain/my-orders** (`orders.ts:913`)
  - **Query:** `SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC`
  - **Table:** `orders` (no LIMIT)
  - **Risk:** MEDIUM — Unbounded per-customer history + N+1 items
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P7. GET /products** (`products.ts:196`)
  - **Query:** `SELECT * FROM products ORDER BY createdAt DESC`
  - **Table:** `products` (no LIMIT)
  - **Risk:** HIGH — Plan limits offer partial protection but query is unbounded
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P8. GET /store/:subdomain/products** (`products.ts:387-388`)
  - **Query:** `SELECT * FROM products WHERE status = 'active' ORDER BY createdAt DESC`
  - **Table:** `products` (no LIMIT)
  - **Risk:** HIGH — Public storefront, every visitor loads ALL active products
  - **Fix:** Add `LIMIT ? OFFSET ?`, default 24 per page

- [ ] **P9. validateSkuUniqueness** (`products.ts:17`) — called on POST/PATCH /products
  - **Query:** `SELECT productId, sku, variants FROM products` (no LIMIT)
  - **Table:** `products` (full scan + JSON.parse per row)
  - **Risk:** MEDIUM — Every product write loads all products
  - **Fix:** Add UNIQUE index on `sku`, use `SELECT 1 FROM products WHERE sku = ?`

- [ ] **P10. GET /collections** (`products.ts:446`)
  - **Query:** `SELECT * FROM collections ORDER BY createdAt DESC` + `SELECT category FROM products`
  - **Tables:** `collections`, `products` (both no LIMIT)
  - **Risk:** MEDIUM
  - **Fix:** Add `LIMIT ? OFFSET ?` to both queries

- [ ] **P11. GET /purchase-orders** (`products.ts:558`)
  - **Query:** `SELECT * FROM purchase_orders ORDER BY createdAt DESC`
  - **Table:** `purchase_orders` (no LIMIT)
  - **Risk:** MEDIUM
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P12. GET /gift-cards** (`products.ts:607`)
  - **Query:** `SELECT * FROM gift_cards ORDER BY createdAt DESC`
  - **Table:** `gift_cards` (no LIMIT)
  - **Risk:** MEDIUM
  - **Fix:** Add `LIMIT ? OFFSET ?`

### HIGH — Admin Platform-Wide Queries, No Pagination

- [ ] **P13. GET /admin/merchants** (`admin.ts:470`)
  - **Query:** `SELECT * FROM tenants`
  - **Table:** `tenants` (no LIMIT, includes `razorpaySecret` in SELECT *)
  - **Risk:** HIGH — 1000+ merchants returned entirely
  - **Fix:** Add `LIMIT ? OFFSET ?`, select needed columns only

- [ ] **P14. GET /admin/merchants/:tenantId/details** (`admin.ts:590-592`)
  - **Query:** `SELECT * FROM products` + `SELECT * FROM orders` + `SELECT * FROM billing_invoices` (all no LIMIT)
  - **Tables:** `products`, `orders`, `billing_invoices`
  - **Risk:** HIGH — A merchant with 500 products + 1000 orders = massive payload
  - **Fix:** Add `LIMIT ? OFFSET ?` to each sub-query, or return summary counts

- [ ] **P15. GET /admin/metrics** (`admin.ts:706`)
  - **Query:** `SELECT tenantId, plan, createdAt, storeName FROM tenants` (no LIMIT) + per-tenant DB queries in loop
  - **Table:** `tenants` + N tenant DBs
  - **Risk:** HIGH — N+1 across ALL tenants on every page load
  - **Fix:** Pre-aggregate via background job, serve from cache

- [ ] **P16. GET /admin/audit-logs** (`admin.ts:788`)
  - **Query:** `SELECT * FROM admin_audit_logs ORDER BY createdAt DESC`
  - **Table:** `admin_audit_logs` (no LIMIT)
  - **Risk:** HIGH — Grows indefinitely, unbounded result set
  - **Fix:** Add `LIMIT ? OFFSET ?`, default 50

- [ ] **P17. GET /admin/support/tickets** (`admin.ts:963`, also line 1593)
  - **Query:** `SELECT * FROM support_tickets ORDER BY createdAt DESC`
  - **Table:** `support_tickets` (no LIMIT)
  - **Risk:** MEDIUM-HIGH — Accumulates over time
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P18. GET /admin/billing/overview** (`admin.ts:1010`, also line 1506)
  - **Query:** `SELECT plan, status FROM tenants` / `SELECT plan FROM tenants` (no LIMIT)
  - **Table:** `tenants` (full scan for MRR calc)
  - **Fix:** `SELECT plan, COUNT(*) FROM tenants WHERE status='active' GROUP BY plan`

- [ ] **P19. GET /admin/orders** (`admin.ts:1201-1228`, also line 1537)
  - **Query:** Per-tenant `SELECT * FROM orders ORDER BY createdAt DESC LIMIT 20` × ALL tenants, merged in memory
  - **Table:** `orders` across ALL tenant DBs
  - **Risk:** HIGH — 1000 tenants × 20 orders = 20K rows, no overall pagination
  - **Fix:** Add cursor-based pagination or pre-aggregated feed table

- [ ] **P20. GET /admin/marketplace/themes** (`admin.ts:1248`)
  - **Query:** `SELECT * FROM marketplace_themes`
  - **Table:** `marketplace_themes` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P21. GET /admin/marketplace/apps** (`admin.ts:1281`)
  - **Query:** `SELECT * FROM marketplace_apps`
  - **Table:** `marketplace_apps` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P22. GET /admin/notifications** (`admin.ts:1308`, also line 1571)
  - **Query:** `SELECT * FROM platform_alerts ORDER BY date DESC`
  - **Table:** `platform_alerts` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P23. GET /admin/cms/faqs** (`admin.ts:1329`)
  - **Query:** `SELECT * FROM cms_faqs`
  - **Table:** `cms_faqs` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P24. GET /admin/cms/blogs** (`admin.ts:1354`)
  - **Query:** `SELECT * FROM cms_blogs ORDER BY date DESC`
  - **Table:** `cms_blogs` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P25. GET /admin/cms/jobs** (`admin.ts:1380`)
  - **Query:** `SELECT * FROM cms_jobs`
  - **Table:** `cms_jobs` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P26. GET /admin/feature-flags** (`admin.ts:1408`)
  - **Query:** `SELECT * FROM feature_flags`
  - **Table:** `feature_flags` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P27. GET /admin/api-keys** (`admin.ts:1428`)
  - **Query:** `SELECT * FROM developer_api_keys`
  - **Table:** `developer_api_keys` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P28. GET /admin/webhooks** (`admin.ts:1460`)
  - **Query:** `SELECT * FROM developer_webhooks`
  - **Table:** `developer_webhooks` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P29. GET /admin/queue-jobs** (`admin.ts:1486`)
  - **Query:** `SELECT * FROM queue_jobs`
  - **Table:** `queue_jobs` (no LIMIT)
  - **Risk:** MEDIUM — Queue jobs accumulate
  - **Fix:** Add `LIMIT ? OFFSET ?`

### MEDIUM — Sub-Resources, No Pagination

- [ ] **P30. GET /finances/summary** (`store.ts:520`)
  - **Query:** `SELECT * FROM orders` (no LIMIT)
  - **Fix:** Use SQL aggregation instead of full scan

- [ ] **P31. GET /store/billing** (`store.ts:374`)
  - **Query:** `SELECT * FROM billing_invoices ORDER BY createdAt DESC`
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P32. GET /store/blog-posts** (`store.ts:1169`)
  - **Query:** `SELECT * FROM blog_posts ORDER BY createdAt DESC`
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P33. GET /store/files** (`store.ts:1207`)
  - **Query:** `SELECT productId, name, images, createdAt FROM products`
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P34. GET /store/themes** (`store.ts:561`)
  - **Query:** `SELECT * FROM themes`
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P35. GET /admin/storefront-design/merchants** (`storefront-design.ts:240`)
  - **Query:** Complex JOIN across `tenants` × `merchant_design_settings` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P36. GET /admin/themes** (`theme_manager.ts:34`)
  - **Query:** `SELECT * FROM themes WHERE deleted_at IS NULL` + filters
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P37. GET /merchant/themes/marketplace** (`theme_manager.ts:173`)
  - **Query:** `SELECT * FROM themes WHERE published = 1 AND deleted_at IS NULL`
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P38. GET /merchant/themes/library** (`theme_manager.ts:211`)
  - **Query:** JOIN `merchant_themes` × `themes` (no LIMIT)
  - **Fix:** Add `LIMIT ? OFFSET ?`

- [ ] **P39. GET /discounts** (`discounts.ts:158`)
  - **Query:** `SELECT * FROM discount_codes`
  - **Fix:** Add `LIMIT ? OFFSET ?`

### LOW — Small Bounded Tables

- [ ] **P40. GET /admin/admins** (`admin.ts:797`) — `SELECT email, userId, role, createdAt FROM admins`
- [ ] **P41. GET /admin/system-settings** (`admin.ts:1612`) — `SELECT * FROM system_settings`
- [ ] **P42. GET /admin/analytics** (`admin.ts:1234`) — `SELECT createdAt FROM tenants`

---

## FRONTEND PAGES WITHOUT CLIENT-SIDE PAGINATION

These pages fetch from the unpaginated endpoints above and render everything without any client-side pagination:

### Admin Panel (`packages/admin-panel/src/app/`)

- [ ] `page.tsx:57-58` — Fetches `/admin/metrics` + `/admin/audit-logs` (all logs)
- [ ] `merchants/page.tsx:118` — Fetches `/admin/merchants` (all tenants)
- [ ] `merchants/[tenantId]/page.tsx:74` — Fetches `/admin/merchants/:id/details` (all products+orders)
- [ ] `orders/page.tsx:37` — Fetches `/admin/orders` (all tenants' orders)
- [ ] `audit-logs/page.tsx:39` — Fetches `/admin/audit-logs` (all logs)
- [ ] `support/page.tsx:28` — Fetches `/admin/support/tickets` (all tickets)
- [ ] `marketplace/page.tsx:45-46` — Fetches `/admin/marketplace/themes` + `/admin/marketplace/apps`
- [ ] `content/page.tsx:45-55` — Fetches `/admin/cms/faqs` + `/admin/cms/blogs` + `/admin/cms/jobs`
- [ ] `platform/queue-monitor/page.tsx:32` — Fetches `/admin/queue-jobs`
- [ ] `platform/api-keys/page.tsx:41,47` — Fetches `/admin/api-keys` + `/admin/webhooks`
- [ ] `platform/feature-flags/page.tsx:28` — Fetches `/admin/feature-flags`
- [ ] `admins/page.tsx:42` — Fetches `/admin/admins`
- [ ] `billing/page.tsx:27` — Fetches `/admin/billing/overview`
- [ ] `storefront-design/page.tsx:137` — Fetches `/admin/merchants` (all tenants)
- [ ] `notifications/page.tsx:34` — Fetches `/admin/notifications`
- [ ] `emails/page.tsx:217` — Fetches `/admin/emails/templates`

### Merchant Dashboard (`packages/merchant-dashboard/src/app/`)

- [ ] `dashboard/page.tsx:1452` — Fetches `/customers` (all customers + all orders)
- [ ] `dashboard/page.tsx:1453` — Fetches `/orders` (all orders + N+1 items)
- [ ] `dashboard/page.tsx:1454` — Fetches `/products` (all products)
- [ ] `dashboard/page.tsx:1486` — Fetches `/discounts` (all discount codes)
- [ ] `dashboard/page.tsx:1491` — Fetches `/customers` (re-fetch, all customers)
- [ ] `dashboard/page.tsx:1497-1499` — Fetches `/store/menus` + `/store/blog-posts` + `/store/files`
- [ ] `dashboard/page.tsx:1505` — Fetches `/finances/summary` (all orders, JS aggregate)
- [ ] `dashboard/page.tsx:1510` — Fetches `/store/billing`

### Storefront (`packages/storefront/src/app/`)

- [ ] `page.tsx:438` — Fetches `/store/:subdomain/products` (all active products)
- [ ] `page.tsx:734` — Fetches `/store/:subdomain/my-orders` (all customer orders)

---

## PROPERLY PAGINATED (Only 2 Endpoints)

- [x] `reviews.ts:16-32` — `GET /store/:subdomain/products/:productId/reviews` — Uses `LIMIT ? OFFSET ?` with total count. **The ONLY fully paginated endpoint.**
- [x] `storefront_api.ts:85-111` — `GET /products` (SDK) — Has `LIMIT ?` (default 20) but no OFFSET. Partial pagination only.

---

## AGGREGATE IMPACT

| Category | Items | Current Avg Latency | After Fix | Savings |
|---|---|---|---|---|
| Algorithm Fixes (CRITICAL) | 5 | ~5000ms | ~100ms | ~98% |
| Algorithm Fixes (HIGH) | 9 | ~1000ms | ~50ms | ~95% |
| Algorithm Fixes (MEDIUM) | 11 | ~200ms | ~20ms | ~90% |
| Algorithm Fixes (LOW) | 12 | ~50ms | ~10ms | ~80% |
| Pagination Fixes | 42 | N/A (unbounded) | Capped at LIMIT | Prevents OOM/timeout |
| **TOTAL** | **79 items** | | | |

### Top 10 Quick Wins (highest impact, lowest effort)

1. **Add `LIMIT ? OFFSET ?` to all 42 unpaginated endpoints** — prevents OOM and timeouts
2. **Move `ensureAdminTables()` to migration** — eliminates ~200ms per admin request
3. **Add missing indexes** on `orders(customerEmail)`, `orders(status)`, `products(status, category)`
4. **Replace in-app joins with SQL GROUP BY** in customers/dashboard — eliminates O(N×M)
5. **Batch order_items with JOIN** — eliminates N+1 on hot paths
6. **Use `db.batch()` for bulk imports and inserts** — reduces N DO calls to 1
7. **Add client-side pagination** to all 26+ frontend pages listed above
8. **Replace `SELECT *` with column-specific selects** — reduces payload size
9. **Add `WHERE status = 'active'` to storefront product query** — filters drafts
10. **Pre-aggregate admin metrics via background job** — eliminates N+1 across all tenants
