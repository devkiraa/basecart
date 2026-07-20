# Basecart — Remaining TODO

## 🔴 Critical / Security

- [x] Remove `"mock-signature-bypass"` from Razorpay webhook — anyone can forge payment confirmations (`packages/backend/src/routes/orders.ts:594`)
- [ ] Admin logout does not revoke refresh tokens from DB — stolen tokens remain valid after logout (`packages/backend/src/routes/auth.ts:442-446`)
- [x] Admin password reset audit log always shows `"system"` — `c.get("admin")` should be `c.get("user")` (`packages/backend/src/routes/admin.ts:878`)
- [x] Fix cookie `sameSite`/`secure` for cross-origin — must detect HTTPS via `x-forwarded-proto` (`packages/backend/src/routes/auth.ts`, `admin.ts`) — *partially fixed, verify production*
- [x] Admin cookies missing `domain` property — `COOKIE_DOMAIN_ADMIN` env var defined but never read

## 🟠 High — Storefront (Broken / Non-functional)

- [ ] **Dual architecture problem**: Middleware rewrites to `[tenant]` SSR pages (mock data), bypassing the full-featured client SPA at root `page.tsx`. Real users on `mystore.basecart.app` see inferior pages
- [ ] `[tenant]/lib/store.ts` is 100% mock — 2 stores, 2 products. Must connect to real API
- [ ] `[tenant]/products/[productId]/page.tsx:225` "Buy Now" is just `alert()` — no add-to-cart, no checkout
- [ ] `[tenant]/checkout/page.tsx:87-91` Payment hardcoded as `status: "paid"` — no Razorpay SDK
- [ ] `[tenant]/checkout/page.tsx:116-125` Silently succeeds on network failure — clears cart and shows fake order ID
- [ ] `[tenant]/account/page.tsx:97-125` Auth is fake — `setTimeout(800ms)` + localStorage, no real API
- [ ] `[tenant]/cart/page.tsx:19-25` Coupon hardcoded to `"BASECART10"` only — no API validation
- [ ] Root `page.tsx:698` Subtotal ignores variant pricing — uses `item.product.price` not `item.selectedVariant?.price`
- [ ] `next.config.js` missing `images.remotePatterns` for `next/image` external URLs (unsplash, r2)
- [ ] Font mismatch — inline styles reference "Inter" but layout loads "Plus Jakarta Sans"

## 🟠 High — Admin Panel (Mock / Non-functional)

- [ ] `settings/page.tsx:13-18` Settings save is `setTimeout` + `alert()` — no API call. Pricing, ceilings, commission all fake
- [ ] `monitoring/page.tsx` Entire page is static — zero API calls, all hardcoded health indicators
- [ ] `analytics/page.tsx:122-202` Charts are decorative static SVGs, not data-driven. "1.84 TB", "14.8M/day" hardcoded
- [ ] `page.tsx` (Dashboard) Revenue chart is static SVG, KPI percentages ("+12.4%") hardcoded
- [ ] `billing/page.tsx:143-176` Invoice table shows hardcoded demo data ("Apex Storefront", "Pixel & Palette")
- [ ] `platform/system-status/page.tsx:14-24` All 9 services hardcoded as "operational"
- [ ] `storefront-design/page.tsx` Not linked in sidebar navigation — accessible only via direct URL

## 🟡 Medium — Backend

- [ ] Shiprocket integration is a complete mock stub (`packages/backend/src/services/shiprocket.ts:56-80`)
- [ ] WhatsApp integration is a complete mock stub (`packages/backend/src/services/whatsapp.ts:44-63`)
- [ ] `/admin/analytics` returns entirely hardcoded data (`packages/backend/src/routes/admin.ts:1189-1195`)
- [ ] `/admin/infrastructure/status` returns hardcoded infra metrics (`packages/backend/src/routes/admin.ts:1456-1468`)
- [ ] 13 control DB tables created at runtime but missing from schema.sql and migrations
- [ ] `tenant_schema.sql` out of sync with `tenant_schema.ts` — missing `product_reviews`
- [ ] Admin cookies missing `domain` property — `COOKIE_DOMAIN_ADMIN` env var defined but never read
- [ ] Logout endpoints don't revoke refresh tokens from DB
- [ ] Shiprocket webhook collapses all non-delivered statuses to "shipped" (`orders.ts:781`)
- [ ] Hardcoded fallback phone `+919876543210` when customer has no phone (`orders.ts:275,698,804`)
- [ ] Razorpay webhook only handles `order.paid`/`payment.captured` — ignores `payment.failed`, refunds
- [ ] Stock decrement in webhook is not atomic (loop without transaction)

## 🟡 Medium — Merchant Dashboard

- [ ] ToS & Privacy Policy tabs have no rendering — clicking shows blank content (`page.tsx:323`)
- [ ] Discount expiry date field missing from UI form (sent in API but no input field)
- [ ] SEO preview hardcodes `basecart.io` instead of `STOREFRONT_DOMAIN` (`page.tsx:3133`)
- [ ] Marketing "New Campaign" button has no onClick handler (dead UI)
- [ ] Marketing "Abandoned Cart Retargeting" is in "Placeholder Mode"
- [ ] `changePlan` has incorrect `await` precedence on ternary expression (`page.tsx:1493`)

## 🟡 Medium — Admin Panel (Polish)

- [ ] `content/page.tsx` Edit buttons for FAQs/blogs only show `alert()` — no edit forms
- [ ] `content/page.tsx` Add operations use browser `prompt()` instead of form modals
- [ ] `platform/api-keys/page.tsx` Create operations use `prompt()` dialogs
- [ ] `storefront-design/page.tsx` Templates list hardcoded, not fetched from API
- [ ] `storefront-design/page.tsx` "Set as Default" only updates local state, not persisted until "Save"
- [ ] 5 files import `AdminLayout`/`ClientLayout` unnecessarily (dead imports)
- [ ] `page.tsx` (Dashboard) "D1 Read Operations", "Queue backlog", "R2 Storage" are hardcoded

## 🔵 Low — Cleanup & Polish

- [x] Remove dead `replace_themes_customizer.js` script from merchant dashboard src
- [x] Remove unused dependencies `@basecart/shared`, `react-is` from merchant dashboard
- [x] Root `page.tsx` reads localStorage but dashboard never writes to it — redirect logic mismatch
- [ ] No order detail drill-down view in merchant dashboard (can't inspect line items/shipping address)
- [x] Blog section in Aura template has hardcoded Unsplash images and 2020 dates
- [x] Footer has hardcoded phone `123 456 789` and email `watch@room.com`
- [x] Add `@tailwindcss/line-clamp` plugin or verify v3.3+ built-in support
- [x] Add proper error boundaries to all storefront pages
- [x] Add loading skeletons to all data-fetching pages
- [x] Add order status webhook idempotency for Shiprocket
- [x] Add dead letter queue / max retry config for Cloudflare Queues

## ✅ Already Fixed (This Session)

- [x] AUTH-1: JWT secret fallback removed — fails if not set
- [x] SEC-3: All hardcoded secret fallbacks removed
- [x] AUTH-5: localStorage token storage removed — httpOnly cookies only
- [x] AUTH-3: Mock encryption bypass removed
- [x] AUTH-4: Webhook mock bypasses removed (Razorpay + Shiprocket)
- [x] SEC-2: Admin script requires env vars
- [x] DATA-1: Store settings API redacts Razorpay secrets
- [x] HDR-1: Security headers added to all Next.js configs
- [x] AUTH-8/AUTH-9: Password policy strengthened (8+ chars, complexity)
- [x] DATA-2: Production error handler returns generic messages
- [x] DATA-4: Customer ID from session, not spoofable header
- [x] CSRF-2: Admin logout now authenticated
- [x] PATH-1: Path traversal validation on media proxy
- [x] SQLI-3: LIKE wildcards escaped in admin search
- [x] AUTH-10: JTI uses crypto.randomUUID()
- [x] SEC-6: Shiprocket requires env var (no mock fallback)
- [x] Storefront pages: catalog, cart, checkout, order-confirmation, account
- [x] Admin storefront-design page with preview, toggles, per-merchant controls
- [x] Backend API for storefront design management (6 endpoints)
- [x] Product reviews: JSON-LD schema, API, database table, UI
- [x] Cookie SameSite/secure fix for cross-origin production
- [x] Login/signup missing `credentials: "include"` on fetch calls
- [x] Dashboard redirect race condition (sessionChecked flag)
- [x] Terms/Privacy links use absolute URLs (not relative paths)
- [x] Theme CRUD operations missing `credentials: "include"` on fetch calls
- [x] Dead file `replace_themes_customizer.js` removed
- [x] Unused deps `@basecart/shared`, `react-is` removed from merchant dashboard
- [x] Storefront blog section dates updated to 2026
- [x] Storefront footer phone/email replaced with generic placeholders
- [x] Storefront error boundaries added (root + tenant)
- [x] Storefront 404 pages added (root + tenant)
- [x] Storefront loading skeleton added for tenant pages
- [x] Shiprocket webhook idempotency guard added
- [x] Queue consumer max_retries=3 added to wrangler.toml
