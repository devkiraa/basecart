# Basecart Shared package (`@basecart/shared`)

This package houses the shared schemas, validations, and TypeScript types used across both the Fastify backend and the Next.js storefronts/dashboards.

## Schemas & Validations (Zod)
We validate data at the boundaries using Zod schemas:
*   `MerchantSignupSchema`: Merchant registration validator (stores, subdomain lowercase validation).
*   `MerchantLoginSchema`: Handles login validations.
*   `ProductSchema`: Validates price, stock counts, images array, status (active/draft).
*   `CheckoutSchema`: Enforces strict schema validations on customer address, quantity, and product keys. Reject unrecognized input keys.
*   `DiscountCodeSchema`: Handles coupon creations, percentage/fixed amounts, and expiration dates.

## Exported Utilities
*   `encrypt` & `decrypt`: Local KMS-mock helpers utilizing AES-256-GCM.
*   Common TypeScript interfaces (`Product`, `Order`, `TenantDetails`).
