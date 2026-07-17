# Security Audit Report

**Date:** July 17, 2026
**Scope:** Full monorepo (marketing, merchant-dashboard, admin-panel, storefront, backend)

---

## Critical (4)

### AUTH-1: Hardcoded JWT Secret Fallback
- **File:** `packages/backend/src/services/auth.ts:5-6`
- **Issue:** `JWT_SECRET = process.env.JWT_SECRET || "local_jwt_secret_key_for_testing_purposes"`
- **Impact:** If env var missing in production, attacker can forge any JWT token including admin tokens
- **Fix:** Remove fallback. Fail startup if `JWT_SECRET` not set.

### SEC-1: API Keys Hardcoded in Client Bundle
- **File:** `packages/admin-panel/src/app/platform/api-keys/page.tsx:16-17`
- **Issue:** Two `bc_live_*` API keys hardcoded in a `"use client"` component
- **Impact:** Keys visible to anyone via browser DevTools/source inspection
- **Fix:** Move to server-side only. Never ship secrets to client.

### AUTH-2: Weak Encryption Secret
- **File:** `.env:11-12`
- **Issue:** `ENCRYPTION_SECRET=0123456789abcdef...` and weak `JWT_SECRET`
- **Impact:** Trivially guessable encryption keys
- **Fix:** Generate cryptographically secure secrets. Never commit real secrets.

### SEC-3: Same Weak Secrets as Code Fallbacks
- **File:** `packages/backend/src/services/auth.ts:6`
- **Issue:** Same weak JWT secret embedded as fallback in source code
- **Fix:** Remove all hardcoded secret fallbacks.

---

## High (8)

### CSRF-1: Zero CSRF Protection
- **File:** `packages/backend/src/app.ts` (entire app)
- **Issue:** No CSRF token generation, validation, or middleware anywhere
- **Impact:** State-changing endpoints (POST/PATCH/DELETE) unprotected. With `credentials: true` CORS + cookies, attacker can forge requests.
- **Mitigating:** CORS origin checking + `sameSite: "Lax"` cookies (but Lax doesn't protect POST-based CSRF)
- **Fix:** Implement CSRF middleware (double-submit cookie or synchronizer token pattern).

### AUTH-5: JWT Tokens in localStorage
- **Files:**
  - `packages/merchant-dashboard/src/app/login/page.tsx:51`
  - `packages/merchant-dashboard/src/app/signup/page.tsx:101`
  - `packages/marketing/src/app/signup/page.tsx:103`
  - `packages/merchant-dashboard/src/app/dashboard/page.tsx:239,245,365,465,481,482,889,890,944,945`
- **Issue:** `localStorage.setItem("basecart_merchant_token", data.accessToken)`
- **Impact:** localStorage accessible to any JS (including XSS payloads). Undermines httpOnly cookie protection.
- **Fix:** Remove localStorage token storage. Rely exclusively on httpOnly cookies.

### AUTH-3: Mock Encryption Bypass
- **File:** `packages/backend/src/lib/crypto.ts:35-37`
- **Issue:** When `NODE_ENV !== "production"`, `encrypt()` returns Base64 (`btoa("mock-encrypted:" + text)`)
- **Impact:** If NODE_ENV misconfigured in production, all credentials stored as trivially reversible Base64
- **Fix:** Remove mock encryption or gate behind explicit feature flag that cannot be set in production.

### AUTH-4: Webhook Signature Bypass
- **File:** `packages/backend/src/routes/orders.ts:595-596` (Razorpay), `758-759` (Shiprocket)
- **Issue:** `signature === "mock-signature-bypass"` bypasses verification in dev/test
- **Impact:** Bypass string is also in client-side code (visible in browser). If NODE_ENV misconfigured, webhooks can be forged.
- **Fix:** Remove mock bypass or require explicit env var to enable.

### SEC-2: Hardcoded Admin Credentials
- **File:** `packages/backend/src/scripts/create-admin.ts:9-10`
- **Issue:** `email = "admin@basecart.io"`, `password = "adminpassword123"`
- **Impact:** If script runs in production, creates admin with known credentials
- **Fix:** Remove hardcoded values. Use env vars or interactive prompt.

### DATA-1: Razorpay Secrets Returned in API
- **File:** `packages/backend/src/routes/store.ts:53-96`
- **Issue:** `/store/settings` GET decrypts and returns `razorpayKey` and `razorpaySecret`
- **Impact:** Plaintext secrets traverse network, visible in browser DevTools/logs
- **Fix:** Use dedicated credential management endpoint. Redact secrets in response.

### HDR-1: Missing Security Headers
- **Files:** All `next.config.js` files
- **Issue:** No CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy
- **Impact:** Vulnerable to clickjacking, MIME sniffing, protocol downgrade attacks
- **Fix:** Add security headers to all Next.js configs and backend responses.

### AUTH-7: Weak Admin Signup Gating
- **File:** `packages/backend/src/routes/admin.ts:63-123`
- **Issue:** Admin signup only checks if zero admins exist. No CAPTCHA, IP restriction, or rate limiting.
- **Impact:** Race condition on fresh deployment could allow attacker to create first admin
- **Fix:** Add CAPTCHA, rate limiting, and IP allowlisting for admin signup.

---

## Medium (12)

### XSS-1, XSS-2: dangerouslySetInnerHTML
- **Files:** `marketing/src/app/discover/[slug]/page.tsx:258`, `storefront/src/app/[tenant]/products/[productId]/page.tsx:125`
- **Issue:** JSON-LD injection with `dangerouslySetInnerHTML` using database content
- **Fix:** Sanitize data before injection. Use JSON-LD library with escaping.

### AUTH-6: Rate Limiting Depends on Binding
- **File:** `packages/backend/src/app.ts:68-87`
- **Issue:** Rate limiter only activates if `API_RATE_LIMITER` binding configured
- **Fix:** Make rate limiter required for production deployment.

### AUTH-8: Weak Password Policy
- **File:** `packages/shared/src/index.ts:6,152`
- **Issue:** 6-character minimum, no complexity requirements
- **Fix:** Minimum 8 characters with uppercase, lowercase, numbers, special chars.

### SEC-4: Test Credentials in Scripts
- **File:** `packages/backend/src/scripts/verify_flows.ts:24,45,190,211`
- **Issue:** Hardcoded test passwords
- **Fix:** Use env vars for test credentials.

### SEC-5: Mock S3 Credentials
- **File:** `packages/backend/src/lib/storage.ts:29-30`
- **Issue:** Mock access keys hardcoded
- **Fix:** Use env vars, never commit credentials.

### SEC-6: Mock Shiprocket Token
- **File:** `packages/backend/src/routes/orders.ts:756`
- **Issue:** Fallback to known mock token
- **Fix:** Require env var, fail if not set.

### DATA-2: Sensitive Info in Error Messages
- **File:** `packages/backend/src/app.ts:90-103`
- **Issue:** Global error handler returns `err.message` directly
- **Fix:** Sanitize error messages in production.

### DATA-3: PII Logged in Plaintext
- **Files:** `backend/src/routes/admin.ts:351`, `emails/src/index.ts:147`, `emails/src/services/zeptomail.ts:100-102`
- **Issue:** Email addresses logged via console.log
- **Fix:** Redact PII in production logs.

### DATA-4: Customer ID from Client Header
- **File:** `packages/backend/src/routes/orders.ts:467`
- **Issue:** `x-customer-id` header spoofable
- **Fix:** Derive customer ID from authenticated session, not client header.

### CSRF-2: Admin Logout Unauthenticated
- **File:** `packages/backend/src/routes/admin.ts:383`
- **Issue:** POST `/admin/auth/logout` has no auth middleware
- **Fix:** Add authentication check.

### DEP-1: Outdated Next.js
- **Files:** All `package.json` files
- **Issue:** Next.js 14.1.x has known vulnerabilities
- **Fix:** Upgrade to latest Next.js 14.x or 15.x.

### PATH-1: Media Proxy Path Extraction
- **File:** `packages/backend/src/app.ts:122-151`
- **Issue:** URL path used as S3 object key without validation
- **Fix:** Validate/allowlist S3 keys.

---

## Low (7)

| ID | Issue | File |
|----|-------|------|
| XSS-3 | Static dangerouslySetInnerHTML (low risk) | `marketing/src/app/page.tsx:141` |
| XSS-4 | Webhook bypass string in client bundle | `storefront/src/app/page.tsx:507-512` |
| SQLI-2 | Dynamic IN clause (safe but fragile) | `backend/src/routes/orders.ts:42-44` |
| SQLI-3 | LIKE wildcards not escaped | `backend/src/routes/admin.ts:400-414` |
| AUTH-9 | Customer login no password min | `packages/shared/src/index.ts:160` |
| AUTH-10 | Math.random() for JTI | `backend/src/services/auth.ts:50` |
| DATA-5 | No HTML sanitization on stored text | Multiple |

---

## Top Priority Fixes

1. **[Immediate]** Remove hardcoded secret fallbacks. Fail startup if secrets not set.
2. **[Immediate]** Remove API keys from client-side code.
3. **[Immediate]** Add CSRF middleware for all state-changing endpoints.
4. **[Immediate]** Remove localStorage token storage. Use httpOnly cookies only.
5. **[Immediate]** Add security headers (CSP, HSTS, X-Frame-Options).
6. **[High]** Remove mock encryption/webhook bypasses or gate with explicit feature flags.
7. **[High]** Stop returning decrypted Razorpay secrets in API responses.
8. **[High]** Upgrade Next.js and run `npm audit`.
9. **[Medium]** Strengthen password policy to 8+ chars with complexity.
10. **[Medium]** Sanitize error messages and PII in logs.
