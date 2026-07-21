import { getControlDb, getTenantDb, migrateDatabase } from "../lib/db";
import fs from "fs";
import path from "path";
import { isReservedSubdomain } from "@basecart/shared";

// Use TypeScript module for schema
import { tenantSchema } from "../lib/tenant_schema";

export interface TenantDetails {
  tenantId: string;
  storeName: string;
  subdomain: string;
  plan?: string;
  status?: string;
  razorpayKeyId?: string;
  razorpaySecret?: string;
  branding?: any;
  createdAt: string;
}

/**
 * Resolves a store tenant by its subdomain from the D1 control database.
 */
export async function getTenantBySubdomain(
  subdomain: string,
  env: any
): Promise<TenantDetails | null> {
  try {
    const db = getControlDb(env);
    const row = await db
      .prepare("SELECT * FROM tenants WHERE subdomain = ?")
      .bind(subdomain.toLowerCase())
      .first<any>();

    if (!row) {
      return null;
    }

    return {
      tenantId: row.tenantId,
      storeName: row.storeName,
      subdomain: row.subdomain,
      plan: row.plan,
      status: row.status,
      razorpayKeyId: row.razorpayKeyId,
      razorpaySecret: row.razorpaySecret,
      branding: row.branding ? JSON.parse(row.branding) : { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" },
      createdAt: row.createdAt,
    };
  } catch (error) {
    console.error("Error looking up tenant by subdomain in D1:", error);
    return null;
  }
}



/**
 * Dynamically provisions a new tenant:
 * 1. Inserts registry row in control DB (called externally inside transaction)
 * 2. Migrates the tenant-specific D1 database schema
 * 3. Seeds the default theme and settings
 */
export async function provisionTenantDatabase(
  tenantId: string,
  storeName: string,
  env: any
): Promise<void> {
  // Double-check resolved subdomain is not reserved to block direct API bypasses
  const controlDb = getControlDb(env);
  const tenantRow = await controlDb
    .prepare("SELECT subdomain FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ subdomain: string }>();

  if (tenantRow && isReservedSubdomain(tenantRow.subdomain)) {
    throw new Error(`FATAL: Cannot provision database for reserved subdomain "${tenantRow.subdomain}"`);
  }

  const tenantDb = await getTenantDb(tenantId, env);
  
  // 1. Run migrations on the isolated tenant database
  await migrateDatabase(tenantDb, tenantSchema);

  // 2. Seed default store settings
  await tenantDb
    .prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)")
    .bind("storeName", storeName)
    .run();

  // 3. Seed default storefront theme
  const defaultTheme = {
    themeId: "satoshi",
    name: "Satoshi",
    status: "published",
    templateBase: "Satoshi",
    colors: JSON.stringify({ primary: "#010101", accent: "#EDCF5D" }),
    logoUrl: "",
    pageContent: JSON.stringify({
      home: {
        heroTitle: "BUILT FOR PERFORMANCE",
        heroSubtext: "Discover our premium selection of footwear, streetwear, and activewear engineered for high performance.",
        ctaText: "SHOP COLLECTION",
        secondaryCtaText: "EXPLORE CATALOG"
      },
      catalog: {
        pageTitle: "Latest Catalog Arrivals",
        pageSubtext: "Discover our premium selection of footwear and apparel."
      },
      checkout: {
        pageTitle: "Secure Stripe & Razorpay Checkout",
        instructions: "All transactions are fully encrypted. Enter details to complete purchase."
      }
    }),
    lastSavedAt: new Date().toISOString(),
    version: 1
  };

  await tenantDb
    .prepare(
      "INSERT OR REPLACE INTO themes (themeId, name, status, templateBase, colors, logoUrl, pageContent, lastSavedAt, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      defaultTheme.themeId,
      defaultTheme.name,
      defaultTheme.status,
      defaultTheme.templateBase,
      defaultTheme.colors,
      defaultTheme.logoUrl,
      defaultTheme.pageContent,
      defaultTheme.lastSavedAt,
      defaultTheme.version
    )
    .run();
}
