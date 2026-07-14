# Basecart Production Cloudflare Deployment Runbook

Follow this step-by-step checklist to deploy the migrated Basecart multi-tenant platform to a production Cloudflare account.

---

## 📋 Phase 1: Account Setup & Wrangler Authentication
1. **Wrangler CLI Auth**:
   Log in to your Cloudflare account from your local workspace:
   ```bash
   npx wrangler login
   ```
2. **Retrieve Account ID**:
   Obtain your Cloudflare Account ID from the dashboard or via:
   ```bash
   npx wrangler whoami
   ```

---

## 📦 Phase 2: Create Production Resources

Execute these commands from `packages/backend` to provision production storage, message queues, and registry databases:

1. **D1 Control Registry Database**:
   Create the primary control database:
   ```bash
   npx wrangler d1 create basecart-control-prod
   ```
   *Note: Copy the `database_id` from the terminal output and paste it under `database_id` in the `[[env.production.d1_databases]]` block of `wrangler.toml`.*

2. **R2 Media Bucket**:
   Create the storage bucket for assets and invoice PDFs:
   ```bash
   npx wrangler r2 bucket create basecart-media-prod
   ```

3. **Workers Queue**:
   Create the queue for background operations (emails, fullfillment):
   ```bash
   npx wrangler queues create basecart-jobs-queue-prod
   ```

4. **Initialize D1 Schema**:
   Run migrations on the production control registry database:
   ```bash
   npx wrangler d1 migrations apply basecart-control-prod --remote
   ```

---

## ⚙️ Phase 3: Bind Secrets

Configure the production secrets in Cloudflare by running the following commands (or adding them under the backend Worker's **Settings > Variables** tab in the Cloudflare Dashboard):

```bash
# Security Cryptography Keys
npx wrangler secret put ENCRYPTION_SECRET --env production
npx wrangler secret put JWT_SECRET --env production

# Email Client (Resend API key)
npx wrangler secret put RESEND_API_KEY --env production

# Payment Gateways (Razorpay Credentials - if platform-wide)
npx wrangler secret put RAZORPAY_KEY_ID --env production
npx wrangler secret put RAZORPAY_KEY_SECRET --env production

# Fulfillment Integrations (Shiprocket Webhook Verification Token)
npx wrangler secret put SHIPROCKET_WEBHOOK_TOKEN --env production
```

---

## 🚀 Phase 4: Deploy Backend Worker

1. Deploy the backend Hono Worker to production:
   ```bash
   npx wrangler deploy --env production
   ```
2. Note the deployed Worker URL (e.g., `https://basecart-backend-prod.<your-handle>.workers.dev`).

---

## 🖥️ Phase 5: Deploy Frontends (Cloudflare Pages)

For each of the three Next.js frontend applications, connect your GitHub repository to **Cloudflare Pages** and configure the build settings.

### ⚠️ Image Optimization & Cloudflare R2 Architecture
- **Storage**: All merchant assets (images, PDFs, ZIPs) are saved directly in Cloudflare R2 bucket. Database tables store only the relative key/path (e.g. `tenants/{id}/products/...`).
- **Delivery (Image Transformations)**: Dynamic resizing and format conversion (WebP/AVIF) are handled on-the-fly using Cloudflare Image Transformations URL parameters (e.g. `/cdn-cgi/image/width=300,quality=auto,format=auto/<r2-key>`).
- **Local Dev Fallback**: In local development, the backend Worker runs a `/media/*` proxy route that pulls files directly from LocalStack S3/R2 and serves them, ensuring 100% offline development.

### 1. Merchant Dashboard (`packages/merchant-dashboard`)
- **Framework Preset**: `Next.js`
- **Root Directory**: `packages/merchant-dashboard`
- **Build Command**: `npx @cloudflare/next-on-pages` (or standard `next build`)
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NODE_VERSION`: `20`
  - `NEXT_PUBLIC_API_URL`: `https://api.basecart.app` (Your custom backend domain or worker URL)
  - `NEXT_PUBLIC_STOREFRONT_DOMAIN`: `basecart.store` (Production parent domain for storefronts)
  - `NEXT_PUBLIC_STOREFRONT_PROTOCOL`: `https`
  - `NEXT_PUBLIC_CLOUDFLARE_ZONE_URL`: `https://api.basecart.app` (Zone custom domain routing to Worker)

### 2. Super Admin Panel (`packages/admin-panel`)
- **Framework Preset**: `Next.js`
- **Root Directory**: `packages/admin-panel`
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NODE_VERSION`: `20`
  - `NEXT_PUBLIC_API_URL`: `https://api.basecart.app`
  - `NEXT_PUBLIC_STOREFRONT_DOMAIN`: `basecart.store`

### 3. Storefront Router (`packages/storefront`)
- **Framework Preset**: `Next.js`
- **Root Directory**: `packages/storefront`
- **Build Command**: `npx @cloudflare/next-on-pages`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NODE_VERSION`: `20`
  - `NEXT_PUBLIC_API_URL`: `https://api.basecart.app`
  - `NEXT_PUBLIC_CLOUDFLARE_ZONE_URL`: `https://api.basecart.app` (Zone custom domain routing to Worker)

---

## 🌐 Phase 6: DNS & Custom Domains

In your Cloudflare dashboard, route your custom domains as follows:

1. **Backend Gateway**: Route `api.basecart.app` to your `basecart-backend-prod` Worker.
2. **Merchant Dashboard**: Route `dashboard.basecart.app` to the `merchant-dashboard` Pages project.
3. **Super Admin Dashboard**: Route `admin.basecart.app` to the `admin-panel` Pages project.
4. **Dynamic Storefront Domains**: 
   - Route `*.basecart.store` (Wildcard CNAME) to the `storefront` Pages deployment.
   - Set up custom domains for individual merchants in the DNS panel as CNAMEs pointing to `basecart.store`.

---

## 🛡️ Phase 7: Post-Deployment Verification

Perform these manual checks to verify production platform health:

1. **Merchant Onboarding**:
   - Navigate to `https://dashboard.basecart.app` and sign up.
   - Verify that your dynamic per-tenant DO instance database resolves and boots.
   - Verify that you receive the merchant confirmation/welcome email.
2. **Catalog Management**:
   - Create a product in the dashboard, upload an image (verifying R2 integration), and check the active product table.
3. **Storefront Resolution**:
   - Open your store at `https://<your-subdomain>.basecart.store`.
   - Verify products list renders correctly.
   - Sign up a test customer (proves Growth plan capabilities and customer auth scoping).
4. **Checkout Simulation**:
   - Place a test checkout order and make a test payment.
   - Verify that the background queue job fires, generates a valid PDF receipt, saves it to R2, and sends the invoice email to your customer.
5. **Super-Admin Supervision**:
   - Access `https://admin.basecart.app`.
   - Log in using your super-admin credentials.
   - Check the Platform Overview metrics and browse the Audit Trail logs.

---

## 🚀 Phase 8: GitHub Actions CI/CD Integration

To automate deployments when code is pushed to your `main` branch, configure your GitHub Repository Secrets:

1. **Repository Settings**:
   Navigate to your repository on GitHub and go to **Settings > Secrets and variables > Actions**.
2. **Configure Secrets**:
   Add the following secrets:
   - `CLOUDFLARE_API_TOKEN`: A Cloudflare API token with permissions to edit Workers and Pages.
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.

Our CI/CD pipelines will automatically trigger:
- **Backend Worker Deploy**: Deploys the worker to the production environment on push to `packages/backend/**` or `packages/shared/**`.
- **Frontend Pages Deploy**: Builds the frontends using the custom adapter script (`npm run pages:build`) and deploys the built `.vercel/output/static` build directories to Pages.

---

## 🔄 Phase 9: Production Rollback Strategy

If a deployment introduces a regression, utilize these step-by-step rollback procedures:

### 1. Roll back Backend Worker
Cloudflare Workers keeps a versioned history of active deployments. You can roll back instantly:
- **Via Wrangler CLI**:
  List recent deployments:
  ```bash
  npx wrangler deployments list --env production
  ```
  Roll back to the previous deployment version:
  ```bash
  npx wrangler rollback --env production
  ```
- **Via Cloudflare Dashboard**:
  1. Navigate to **Workers & Pages** and select `basecart-backend-prod`.
  2. Click the **Deployments** tab.
  3. Locate the last known stable deployment and click **Rollback** to re-activate it immediately.

### 2. Roll back Next.js Frontends (Cloudflare Pages)
Cloudflare Pages preserves isolated static builds of every commit:
- **Via Cloudflare Dashboard**:
  1. Navigate to **Workers & Pages** and click your Pages project (e.g. `basecart-merchant-dashboard`).
  2. Click the **Deployments** tab to view your build history.
  3. Locate the last known good deployment.
  4. Click the three dots `...` next to it and select **Rollback / Promote to Production**.
  5. The previous version will serve traffic instantly without triggering a rebuild.


