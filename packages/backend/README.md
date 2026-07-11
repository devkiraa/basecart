# Basecart Backend API (`@basecart/backend`)

A multi-tenant Fastify backend running on Node.js. It features strict tenant isolation, server-side price verification, and SQS event handling.

## Single-Table DynamoDB Design (`BasecartMain`)

All entity types are stored in a single table. The key patterns are:

| Entity | PK | SK | GSI Key mappings |
|---|---|---|---|
| **Tenant** | `TENANT#<tenantId>` | `METADATA` | `GSI1PK = SUBDOMAIN#<subdomain>`, `GSI1SK = METADATA` |
| **Product** | `TENANT#<tenantId>` | `PRODUCT#<productId>` | `GSI1PK = TENANT#<tenantId>`, `GSI1SK = PRODUCT#<status>#<createdAt>` |
| **Order** | `TENANT#<tenantId>` | `ORDER#<orderId>` | `GSI1PK = TENANT#<tenantId>`, `GSI1SK = ORDER#<status>#<createdAt>`, `GSI2PK = CUSTOMER#<customerEmail>`, `GSI2SK = ORDER#<orderId>` |
| **Discount** | `TENANT#<tenantId>` | `DISCOUNT#<code>` | None (Direct Lookup) |
| **Idempotency**| `IDEMPOTENCY#<key>` | `LOCK` | None |

## Core Architecture
1.  **Tenant Resolution**: Done via `resolveStorefrontTenant` (looks up tenant by `subdomain` GSI1 claim from storefront URL) or `authenticateMerchant` (extracts `tenantId` from verified Merchant JWT).
2.  **Price Security**: Checkout recalculates all totals server-side using the DynamoDB prices, preventing client-side price modification.
3.  **Encrypted Credentials**: Merchant Razorpay credentials are encrypted at rest using AES-256-GCM.
4.  **Razorpay Webhook Verification**:captures the Fastify `rawBody` to compute and check HMAC-SHA256 signatures, ensuring webhook origins are authentic.
5.  **SQS Worker**: The background consumer (`sqs.ts`) processes order notifications and triggers simulated SES order receipts.

## Integration Tests
Run via Vitest:
```bash
npm run test
```
Tests cover: tenant resource cross-access, price tampering block, webhook security, and discount constraints.
