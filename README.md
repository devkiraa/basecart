# Basecart - Headless Multi-Tenant E-Commerce Platform

Basecart is an isolated multi-tenant shop platform (Shopify alternative) designed for Indian merchants. It consists of a single-table DynamoDB backend, SQS-based async worker, and Next.js interfaces for storefronts and merchant managers.

## Project Structure
This repository is managed as an npm monorepo workspace:
*   `packages/shared`: Shared types, utility functions, and Zod input validation schemas.
*   `packages/backend`: Fastify API server & background SQS consumer utilizing LocalStack/AWS SDK.
*   `packages/merchant-dashboard`: Next.js App Router merchant dashboard (Port 3000) built with Tailwind CSS.
*   `packages/storefront`: Next.js App Router customer storefront (Port 3002) supporting subdomain-based tenant routing.

## Monorepo Tech Stack
*   **Backend**: Node.js, Fastify, AWS SDK v3, `@fastify/aws-lambda` compatible, bcrypt, jsonwebtoken.
*   **Database & Storage**: DynamoDB (Single-Table design, GSI index), S3 (presigned direct media upload).
*   **Async Processing**: SQS (order-processing queue) + SES (transactional email confirmations).
*   **Frontend**: React 18, Next.js 14, Tailwind CSS, Lucide icons.
*   **Testing & Validation**: Vitest (integration tests), Zod (strict validation on all inputs).

## Running the Platform Locally

Follow these steps to run the entire multi-tenant platform and stack locally on LocalStack:

### 1. Stack Initialization
1.  **Configure**: Set your `LOCALSTACK_AUTH_TOKEN` in the root `.env` file (if you have one, or run in Community Mode).
2.  **Start LocalStack**: Start the Docker-backed infrastructure container:
    ```bash
    npm run localstack:up
    ```

### 2. Monorepo Setup & Bootstrapping
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Compile Shared Schemas**: Compile the Zod schemas and models in the shared package:
    ```bash
    npm run build --workspace=packages/shared
    ```
3.  **Bootstrap Infrastructure**: Run the local provisioning script to build the DynamoDB table, S3 media bucket, SQS jobs queue, SES verified emails, and provision/alias the AWS KMS customer-managed key:
    ```bash
    npm run bootstrap --workspace=packages/backend
    ```
    *Note: This script automatically writes the generated LocalStack KMS Key ARN directly to your root `.env` file (`KMS_KEY_ID`).*

### 3. Start Development Servers
Start all servers simultaneously:
*   **Backend Fastify API**: `npm run dev:backend` (runs on Port `3001`)
*   **Merchant Dashboard (Next.js)**: `npm run dev:merchant` (runs on Port `3000`)
*   **Customer Storefront (Next.js)**: `npm run dev:storefront` (runs on Port `3002` with subdomain-based routing support)

Alternatively, start them individually inside their workspace scopes.

### 4. Running Integration Tests
Execute the comprehensive integration test suite to verify tenant isolation, billing limits, KMS encryption, and paid add-ons:
```bash
npm run test:backend
```
*Runs 19 end-to-end integration tests verifying correctness and security.*
