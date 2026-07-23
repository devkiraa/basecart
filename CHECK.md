# Basecart Performance Optimization Checklist

> Generated from codebase analysis. Each item includes the issue, location, estimated impact, and fix approach.

---

## CRITICAL — Immediate Fixes

- [ ] **1. Admin Metrics N+1 across all tenants**
  - **File:** `packages/backend/src/routes/admin.ts:728-748`
  - **Issue:** Loops over every merchant, fires 2 queries per tenant via separate Durable Object RPC calls. 500 merchants = 1000 sequential round-trips.
  - **Current:** ~5000-10000ms (1000 DO RPC calls)
  - **After Fix:** ~50-100ms (single KV cache read or periodic background aggregation)
  - **Savings:** ~99% latency reduction
  - **Fix:** Periodic background job to pre-aggregate GMV/stats into a KV key or a control-DB summary table. Serve from cache on admin dashboard load.

- [ ] **2. Admin Orders N+1 across all tenants**
  - **File:** `packages/backend/src/routes/admin.ts:1205-1208`
  - **Issue:** Opens a separate DO stub per tenant, runs `SELECT * FROM orders LIMIT 20`, merges in-memory.
  - **Current:** ~3000-8000ms (N DO RPC calls)
  - **After Fix:** ~50-100ms (cached aggregated feed)
  - **Savings:** ~98% latency reduction
  - **Fix:** Maintain a recent-orders feed in KV or a control-DB `recent_orders` table populated by the SQS worker on each order event.

- [ ] **3. Customer List: full table scan + O(N×M) in-app join**
  - **File:** `packages/backend/src/routes/customers.ts:31-34`
  - **Issue:** Loads ALL customers then ALL orders, joins in JavaScript with nested loop.
  - **Current:** ~2000-5000ms on 10K customers × 10K orders
  - **After Fix:** ~50-200ms (single SQL aggregation)
  - **Savings:** ~95% latency reduction
  - **Fix:** Replace with `SELECT customerEmail, COUNT(*) as orderCount, SUM(total) as totalSpend, MAX(createdAt) as lastOrder FROM orders GROUP BY customerEmail`.

- [ ] **4. Broadcast: full table scan + in-app join**
  - **File:** `packages/backend/src/routes/customers.ts:281-285`
  - **Issue:** Same as #3 but for broadcast — loads ALL customers (including hashed passwords) + ALL orders, no LIMIT.
  - **Current:** ~3000-8000ms
  - **After Fix:** ~100-300ms
  - **Savings:** ~95% latency reduction
  - **Fix:** Use SQL `GROUP BY` with `HAVING` for spend-range filtering. Select only needed columns (`email`, `firstName`), exclude `hashedPassword`.

- [ ] **5. Stock Decrement: N+1 reads + writes with race condition**
  - **File:** `packages/backend/src/routes/orders.ts:819-851`
  - **Issue:** Per order item: fetch product → parse JSON variants → find variant → update stock → stringify back. Two items sharing a product cause double fetch + inconsistent writes.
  - **Current:** ~500-2000ms (5 items = 10 sequential queries)
  - **After Fix:** ~50-100ms (1 batch read + 1 batch update)
  - **Savings:** ~90% latency reduction + eliminates race condition
  - **Fix:** Batch-fetch all unique product IDs in one query, build a Map, compute all stock updates in-memory, then batch-update all products.

---

## HIGH — Significant Impact

- [ ] **6. Merchant Orders: N+1 order_items**
  - **File:** `packages/backend/src/routes/orders.ts:165`
  - **Issue:** After fetching all orders, fires `SELECT * FROM order_items WHERE orderId = ?` per order. 500 orders = 501 queries.
  - **Current:** ~1000-3000ms
  - **After Fix:** ~30-100ms (single JOIN query)
  - **Savings:** ~95% latency reduction
  - **Fix:** `SELECT o.*, oi.* FROM orders o LEFT JOIN order_items oi ON o.orderId = oi.orderId ORDER BY o.createdAt DESC`.

- [ ] **7. Customer My-Orders: same N+1 pattern**
  - **File:** `packages/backend/src/routes/orders.ts:921`
  - **Issue:** Identical N+1 on the public storefront endpoint hit by every browsing customer.
  - **Current:** ~500-2000ms per customer request
  - **After Fix:** ~20-80ms
  - **Savings:** ~90% latency reduction
  - **Fix:** Same JOIN approach as #6.

- [ ] **8. Dashboard Summary: ALL orders with SELECT ***
  - **File:** `packages/backend/src/routes/dashboard.ts:16`
  - **Issue:** Loads every order row with all columns (including `shippingAddress`, `razorpayOrderId`) just for a 7-day revenue chart.
  - **Current:** ~1000-3000ms on 10K orders
  - **After Fix:** ~10-50ms (indexed aggregation)
  - **Savings:** ~97% latency reduction
  - **Fix:** `SELECT DATE(createdAt) as day, SUM(total) as revenue, COUNT(*) as orderCount FROM orders WHERE createdAt >= ? AND status IN ('paid','shipped','delivered') GROUP BY DATE(createdAt)`.

- [ ] **9. Finances: ALL orders with SELECT ***
  - **File:** `packages/backend/src/routes/store.ts:520`
  - **Issue:** Full scan of all orders with all columns for the merchant finances page.
  - **Current:** ~1000-3000ms
  - **After Fix:** ~10-50ms
  - **Savings:** ~97% latency reduction
  - **Fix:** `SELECT SUM(total) as gmv, SUM(platformFee) as fees, COUNT(*) as totalOrders FROM orders WHERE status IN ('paid','shipped','delivered')`.

- [ ] **10. Bulk Import: N sequential inserts**
  - **File:** `packages/backend/src/routes/customers.ts:191-221`
  - **Issue:** Each customer imported via separate DO RPC call. 1000 customers = 1000 sequential calls.
  - **Current:** ~10000-30000ms (1000 DO calls)
  - **After Fix:** ~200-500ms (single batch)
  - **Savings:** ~98% latency reduction
  - **Fix:** Use existing `db.batch()` method to group all inserts into one round-trip.

- [ ] **11. Admin Tables: DDL on EVERY request**
  - **File:** `packages/backend/src/routes/admin.ts:306` (calls `ensureAdminTables` at lines 55-282)
  - **Issue:** Runs `CREATE TABLE IF NOT EXISTS` for 8 tables + `SELECT COUNT(*)` + conditional `INSERT` loops on every authenticated admin request.
  - **Current:** ~100-300ms overhead per admin request
  - **After Fix:** ~0ms (removed entirely after migration)
  - **Savings:** 100% overhead elimination
  - **Fix:** Move to a one-time migration script run during `npm run bootstrap`. Remove from request path.

- [ ] **12. Customer Columns: PRAGMA + ALTER TABLE on every GET**
  - **File:** `packages/backend/src/routes/customers.ts:17-29`
  - **Issue:** Runs `PRAGMA table_info` + up to 9 `ALTER TABLE ADD COLUMN` statements on every `/customers` page load.
  - **Current:** ~50-200ms overhead per request
  - **After Fix:** ~0ms (removed after migration)
  - **Savings:** 100% overhead elimination
  - **Fix:** Move schema additions to a D1 migration file. Remove runtime ALTER TABLE.

- [ ] **13. Checkout Item Inserts: N sequential**
  - **File:** `packages/backend/src/routes/orders.ts:684-701`
  - **Issue:** N separate `INSERT INTO order_items` during checkout.
  - **Current:** ~100-500ms (5 items = 5 sequential inserts)
  - **After Fix:** ~10-30ms (single batch)
  - **Savings:** ~80% latency reduction
  - **Fix:** Use `db.batch()` to group all order item inserts.

- [ ] **14. Seed Inserts on every admin request**
  - **File:** `packages/backend/src/routes/admin.ts:68-282`
  - **Issue:** `ensureAdminTables` runs INSERT loops for marketplace themes, plans, and add-ons on every admin call.
  - **Current:** ~50-200ms overhead per admin request
  - **After Fix:** ~0ms (one-time seed)
  - **Savings:** 100% overhead elimination
  - **Fix:** Move seeding to bootstrap script. Use `INSERT OR IGNORE` to make idempotent.

---

## MEDIUM — Notable Inefficiencies

- [ ] **15. SKU Validation: full product scan + JSON.parse per row**
  - **File:** `packages/backend/src/routes/products.ts:17-21`
  - **Issue:** Fetches all products, parses `variants` JSON for every one on each create/update.
  - **Current:** ~200-1000ms (500 products × JSON.parse)
  - **After Fix:** ~10-30ms (dedicated `product_skus` table or indexed SKU column)
  - **Savings:** ~90% latency reduction
  - **Fix:** Add a `product_skus` table with `UNIQUE(sku)` constraint, or add a covering index on `products(sku)`.

- [ ] **16. Category Counts in JS**
  - **File:** `packages/backend/src/routes/products.ts:445-453`
  - **Issue:** Full product scan to count categories in JavaScript.
  - **Current:** ~200-500ms
  - **After Fix:** ~10-30ms (SQL GROUP BY)
  - **Savings:** ~90% latency reduction
  - **Fix:** `SELECT category, COUNT(*) as cnt FROM products WHERE category IS NOT NULL AND category != '' GROUP BY category`.

- [ ] **17. Store Files: products scan + JSON.parse for images**
  - **File:** `packages/backend/src/routes/store.ts:1207-1229`
  - **Issue:** Full product scan to extract image URLs with per-row JSON parsing.
  - **Current:** ~200-800ms
  - **After Fix:** ~20-50ms
  - **Savings:** ~85% latency reduction
  - **Fix:** Add a `product_images` table or a computed `primaryImage` column on `products`.

- [ ] **18. KV Settings: sequential upserts**
  - **File:** `packages/backend/src/routes/store.ts:321-325`
  - **Issue:** Up to 23 sequential `INSERT OR REPLACE` calls on settings save.
  - **Current:** ~100-300ms (23 sequential DO calls)
  - **After Fix:** ~10-30ms (single batch)
  - **Savings:** ~85% latency reduction
  - **Fix:** Use `db.batch()` to group all KV upserts.

- [ ] **19. Missing Database Indexes**
  - **File:** `packages/backend/src/lib/tenant_schema.ts`, `packages/backend/src/lib/control_schema.ts`
  - **Missing Indexes:**
    - `orders(customerEmail)` — customer lookup full scans
    - `orders(status)` — pending order checks
    - `products(status, category)` — storefront listing
    - `tenants(plan, status)` — billing aggregation
    - `support_tickets(createdAt)` — ticket listing sort
    - `admin_audit_logs(createdAt)` — audit log sort
  - **Current:** Full table scans on all these queries
  - **After Fix:** Index seeks (~1ms vs ~100-1000ms per query)
  - **Savings:** ~90-99% per affected query
  - **Fix:** Add the missing indexes in a new D1 migration.

- [ ] **20. Subdomain Alternates: up to 8 sequential queries**
  - **File:** `packages/backend/src/routes/auth.ts:135-148`
  - **Issue:** Each suffix checked one at a time to find available alternates.
  - **Current:** ~80-200ms (8 sequential queries)
  - **After Fix:** ~10-20ms (single batch query)
  - **Savings:** ~80% latency reduction
  - **Fix:** `SELECT subdomain FROM tenants WHERE subdomain IN (?, ?, ?, ...)` then compute alternates in JS.

- [ ] **21. ensureDesignTables() on every design request**
  - **File:** `packages/backend/src/routes/storefront-design.ts:24-71`
  - **Issue:** 3 `CREATE TABLE IF NOT EXISTS` on every storefront design read/write (called 6 times).
  - **Current:** ~30-100ms overhead per request
  - **After Fix:** ~0ms (migration)
  - **Savings:** 100% overhead elimination
  - **Fix:** Move to D1 migration.

- [ ] **22. Themes: INSERT inside GET handler**
  - **File:** `packages/backend/src/routes/store.ts:608-623`
  - **Issue:** Default theme seeded via INSERT on every GET when no themes exist.
  - **Current:** Write latency on every page load (cold start)
  - **After Fix:** ~0ms (one-time seed at provisioning)
  - **Savings:** Eliminates write-in-read anti-pattern
  - **Fix:** Seed themes during tenant provisioning, not on GET.

- [ ] **23. Boolean Mapping: O(rows × cols) scan**
  - **File:** `packages/backend/src/lib/tenant_do.ts:87-100`
  - **Issue:** Every query result iterates every column checking against a hardcoded boolean field list.
  - **Current:** ~1-5ms per query (scales with result size)
  - **After Fix:** ~0.1-0.5ms (targeted mapping or schema-level fix)
  - **Savings:** ~80% per-query overhead
  - **Fix:** Use SQLite BOOLEAN type natively or map only known boolean columns at the model layer.

- [ ] **24. Global Search: leading-wildcard LIKE**
  - **File:** `packages/backend/src/routes/admin.ts:825-838`
  - **Issue:** `%query%` LIKE on `storeName`, `subdomain`, `tenantId` — cannot use B-tree indexes.
  - **Current:** ~200-500ms (3 full table scans)
  - **After Fix:** ~10-30ms (FTS5 full-text search index)
  - **Savings:** ~90% latency reduction
  - **Fix:** Add SQLite FTS5 virtual table for search, or use trigram indexes.

- [ ] **25. MAX(orderNumber) on every checkout**
  - **File:** `packages/backend/src/routes/orders.ts:653`
  - **Issue:** Full scan to find the max order number for incrementing.
  - **Current:** ~50-200ms (scales with order count)
  - **After Fix:** ~1ms (counter in store_settings)
  - **Savings:** ~95% latency reduction
  - **Fix:** Store `nextOrderNumber` in `store_settings`, atomically increment with `UPDATE store_settings SET value = value + 1 WHERE key = 'nextOrderNumber'`.

---

## LOW — Minor but Worth Noting

- [ ] **26. Admin billing overview: counts plans in JS**
  - **File:** `packages/backend/src/routes/admin.ts:1010-1036`
  - **Fix:** `SELECT plan, COUNT(*) as cnt FROM tenants WHERE status='active' GROUP BY plan`

- [ ] **27. Merchant notifications: 3 sequential queries**
  - **File:** `packages/backend/src/routes/auth.ts:737-745`
  - **Fix:** JOIN `merchant_users` + `tenants` into a single query.

- [ ] **28. Checkout SELECT * on tenants**
  - **File:** `packages/backend/src/routes/orders.ts:567`
  - **Fix:** Select only `plan`, `razorpayKeyId`, `razorpaySecret`, `addOns`, `storeName`.

- [ ] **29. Discount list: no ORDER BY, no LIMIT**
  - **File:** `packages/backend/src/routes/discounts.ts:158`
  - **Fix:** Add `ORDER BY createdAt DESC LIMIT 50`.

- [ ] **30. Store KV: loads all settings**
  - **File:** `packages/backend/src/routes/store.ts:73`
  - **Fix:** `WHERE key IN ('storeName', 'logo', ...)` for needed keys only.

- [ ] **31. Product list: no status filter**
  - **File:** `packages/backend/src/routes/products.ts:196`
  - **Fix:** `WHERE status = 'active'` or expose status filter param.

- [ ] **32. Collections table creation on every GET**
  - **File:** `packages/backend/src/routes/products.ts:427-438`
  - **Fix:** Move to migration.

- [ ] **33. Purchase orders table creation on every GET**
  - **File:** `packages/backend/src/routes/products.ts:504-516`
  - **Fix:** Move to migration.

- [ ] **34. Gift cards table creation on every GET**
  - **File:** `packages/backend/src/routes/products.ts:554-565`
  - **Fix:** Move to migration.

- [ ] **35. Store menus table creation on every GET**
  - **File:** `packages/backend/src/routes/store.ts:1086-1095`
  - **Fix:** Move to migration.

- [ ] **36. Blog posts table creation on every GET**
  - **File:** `packages/backend/src/routes/store.ts:1153-1167`
  - **Fix:** Move to migration.

- [ ] **37. Duplicate store_menus table creation**
  - **File:** `packages/backend/src/routes/store.ts:1261-1270`
  - **Fix:** Remove duplicate; consolidate with #35.

---

## Estimated Aggregate Impact

| Category | Items | Current Avg Latency | After Fix Avg Latency | Total Savings |
|---|---|---|---|---|
| CRITICAL | 5 | ~5000ms | ~100ms | ~98% |
| HIGH | 9 | ~1000ms | ~50ms | ~95% |
| MEDIUM | 11 | ~200ms | ~20ms | ~90% |
| LOW | 12 | ~50ms | ~10ms | ~80% |
| **Overall** | **37** | **~1500ms avg** | **~45ms avg** | **~97%** |

### Top 5 Quick Wins (highest impact, lowest effort)

1. **Move `ensureAdminTables()` to migration** — eliminates ~200ms overhead on every admin request
2. **Add missing indexes** — eliminates full table scans on 6+ hot paths
3. **Replace in-app joins with SQL GROUP BY** in customers/dashboard — eliminates O(N×M) loops
4. **Batch order_items queries with JOIN** — eliminates N+1 on orders and customer routes
5. **Use `db.batch()` for bulk imports and inserts** — reduces N sequential DO calls to 1
