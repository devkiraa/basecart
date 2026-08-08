---
# Basecart Security Assessment: Vulnerability Remediation Register

## Summary
- **Total Issues Found**: 13 remaining (from SECURITY-AUDIT.md) + new findings
- **Assessment Date**: 2026-08-06
- **Scope**: Full monorepo (backend, merchant-dashboard, admin-panel, storefront, marketing, shared, emails)

---

## CRITICAL (1)

### AUTH-2: Weak/Default Secrets in .env
- **File**: `D:\basecart\.env`
- **Issue**:
  - `JWT_SECRET=local_jwt_secret_key_for_testing_purposes` (trivially guessable)
  - `ENCRYPTION_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` (sequential pattern)
- **Impact**: Attackers can forge JWT tokens, decrypt sensitive data including Razorpay credentials
- **Fix**: Generate cryptographically secure secrets:
  ```bash
  openssl rand -hex 64  # for JWT_SECRET
  openssl rand -hex 32  # for ENCRYPTION_SECRET
- Priority: IMMEDIATE

---
HIGH (2)

CSRF-1: CSRF Protection Gaps

- File: D:\basecart\packages\backend\src\middleware\csrf.ts
- Issue: Bearer token requests bypass CSRF protection entirely. While acceptable for API access, state-changing endpoints that accept both cookie AND bearer auth are not fully protected.
- Impact: If a merchant has a Bearer token and cookies, attacker can potentially forge state-changing requests
- Fix:
  - Consider requiring CSRF tokens even for Bearer-authenticated requests in production
  - The current Origin/Referer validation is a reasonable mitigation
- Priority: HIGH

AUTH-7: Admin Signup Race Condition

- File: D:\basecart\packages/backend\src\routes\auth.ts:330, admin.ts:330
- Issue: Admin signup only checks if zero admin accounts exist. No CAPTCHA, IP restriction, or rate limiting. Race condition possible on fresh deployment.
- Impact: Attacker could create first admin account before legitimate admin
- Fix:
  a. Add Cloudflare Turnstile CAPTCHA verification
  b. Add IP allowlisting for admin signup
  c. Stricter rate limiting on admin auth endpoints
- Priority: HIGH

---
MEDIUM (6)

XSS-1: JSON-LD XSS via dangerouslySetInnerHTML

- Files:
  - D:\basecart\packages\storefront\src\app\[tenant]\products\[productId]\page.tsx:167
  - D:\basecart\packages\storefront\src\components\ProductInteractiveSection.tsx:79
- Issue: JSON-LD schema injection uses dangerouslySetInnerHTML with database content (product names, reviews, descriptions) without sanitization
- Impact: Stored XSS if malicious content is injected into product data
- Fix: Sanitize data before JSON-LD injection:
const safeSchema = JSON.stringify(schemaJsonLd)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');
- Priority: MEDIUM

DEP-1: Outdated Next.js

- Files: All packages/*/package.json
- Issue: Next.js 14.2.25 - check for known CVEs
- Fix: Upgrade to latest Next.js stable version, run npm audit
- Priority: MEDIUM

DATA-3: PII Logged in Plaintext

- Files:
  - D:\basecart\packages\backend\src\routes\admin.ts:351
  - D:\basecart\packages\emails\src\index.ts:147
  - D:\basecart\packages\emails\src\services\zeptomail.ts:100-102
- Issue: Email addresses logged via console.log
- Fix: Import and use sanitizeLogPII from audit.ts:
import { sanitizeLogPII } from "../lib/audit";
console.log("Email:", sanitizeLogPII(email));
- Priority: MEDIUM

AUTH-6: Rate Limiter Optional

- File: D:\basecart\packages/backend\src\app.ts:84
- Issue: General API rate limiter only activates if API_RATE_LIMITER binding is configured
- Fix: Enforce API_RATE_LIMITER binding in production wrangler.toml or CI validation
- Priority: MEDIUM

XSS-4: Mock Signature Bypass in Client Code

- File: D:\basecart\packages\storefront\src\app\page.tsx:595
- Issue: Storefront checkout sends x-razorpay-signature: "mock-signature-bypass" in mock payment flow
- Note: Backend checks isTest environment before accepting bypass, so this is acceptable for local dev only
- Priority: MEDIUM (verify production-only behavior)

SEC-5: Mock S3 Credentials

- Files:
  - D:\basecart\packages/backend\src\lib\aws.ts:29-30
  - D:\basecart\packages/backend\src\lib\storage.ts:29-30
- Issue: Mock access keys hardcoded (mock-access-key-id, mock-secret-access-key)
- Note: Acceptable for local development (LocalStack) only. Ensure code path cannot be triggered in production.
- Priority: MEDIUM

---
LOW (3)

XSS-3: Static dangerouslySetInnerHTML

- File: D:\basecart\packages\marketing\src\app\page.tsx (not found - check current paths)
- Issue: Static dangerouslySetInnerHTML with low risk
- Priority: LOW

SQLI-2: Dynamic IN clause

- File: D:\basecart\packages/backend\src\routes\orders.ts:42-44
- Issue: Dynamic IN clause for product ID lookup (currently parameterized, safe)
- Note: Still flagged as fragile - consider batch queries
- Priority: LOW

DATA-5: No HTML sanitization on stored text

- Files: Multiple - product descriptions, blog content, customer notes
- Issue: HTML content stored without sanitization
- Fix: Implement HTML sanitization library for rich text fields
- Priority: LOW

---
Tasks for Fix Implementation

Task 1: Rotate Secrets (CRITICAL)

- [ ] Generate new JWT_SECRET: openssl rand -hex 64
- [ ] Generate new ENCRYPTION_SECRET: openssl rand -hex 32
- [ ] Update D:\basecart\.env with new values
- [ ] Update packages/backend/.dev.vars if exists
- [ ] Invalidate all existing sessions
- [ ] Rotate all environment secrets via wrangler secret put

Task 2: Harden Admin Signup (HIGH)

- [ ] Add Cloudflare Turnstile CAPTCHA to admin signup form
- [ ] Add CAPTCHA verification in /admin/auth/signup endpoint
- [ ] Implement IP allowlisting for admin signup
- [ ] Add stricter rate limiting (lockout after 3 attempts)

Task 3: Fix JSON-LD XSS (MEDIUM)

- [ ] Update ProductInteractiveSection.tsx line 79
- [ ] Update product detail page page.tsx line 167
- [ ] Sanitize all dynamic content before JSON-LD injection
- [ ] Consider using a JSON-LD library with built-in escaping

Task 4: Update Dependencies (MEDIUM)

- [ ] Check latest Next.js version: npm info next version
- [ ] Update all frontend package.json files
- [ ] Run npm audit and fix vulnerabilities
- [ ] Update package-lock.json

Task 5: Redact PII in Logs (MEDIUM)

- [ ] Audit all console.log/console.error in backend routes
- [ ] Apply sanitizeLogPII() to all PII-containing log statements
- [ ] Files to update: admin.ts, emails/index.ts, emails/zeptomail.ts, orders.ts

Task 6: Enforce Production Rate Limiting (MEDIUM)

- [ ] Add CI/CD validation for API_RATE_LIMITER binding
- [ ] Add deployment check in wrangler.toml
- [ ] Consider making rate limiter fail-closed even without binding

Task 7: Review Mock Bypass (MEDIUM)

- [ ] Verify mock-signature-bypass only accepted when NODE_ENV=test
- [ ] Confirm storefront checkout mock flow is dev-only
- [ ] Add explicit environment check in storefront if needed

Task 8: Clean up Mock Credentials (MEDIUM)

- [ ] Document that mock S3 credentials are dev-only
- [ ] Add runtime guard to prevent use in production: if (NODE_ENV === "production" && credentials are mock) throw error

Task 9: Add HTML Sanitization (LOW)

- [ ] Identify all stored HTML fields (product descriptions, blog posts, customer notes)
- [ ] Integrate DOMPurify or similar sanitization library
- [ ] Apply sanitization on input and output

Task 10: Security Monitoring

- [ ] Set up security.txt at /.well-known/security.txt
- [ ] Add CSP nonce support (remove 'unsafe-inline' for scripts in production)
- [ ] Implement input length limits on all endpoints

---
Files Modified Checklist

- [ ] D:\basecart\.env (secrets rotation)
- [ ] D:\basecart\packages/backend\src\app.ts (rate limiter enforcement)
- [ ] D:\basecart\packages/backend\src\routes\auth.ts (admin signup hardening)
- [ ] D:\basecart\packages/backend\src\routes\admin.ts (PII logging)
- [ ] D:\basecart\packages/backend\src\middleware\csrf.ts (review CSRF for Bearer tokens)
- [ ] D:\basecart\packages/storefront\src\app\[tenant]\products\[productId]\page.tsx (XSS fix)
- [ ] D:\basecart\packages/storefront\src\components\ProductInteractiveSection.tsx (XSS fix)
- [ ] D:\basecart\packages/storefront\src\app\page.tsx (verify mock bypass)
- [ ] D:\basecart\packages/emails\src\index.ts (PII logging)
- [ ] D:\basecart\packages/emails\src\services\zeptomail.ts (PII logging)
- [ ] All packages/*/package.json (dependency updates)