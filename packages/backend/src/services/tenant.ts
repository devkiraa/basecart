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

/**
 * Cascade deletion for tenant D1 databases (L3 Requirement)
 * Completely purges a tenant's registry, merchant users, refresh tokens, and isolated tables.
 */
export async function purgeTenantData(tenantId: string, env: any): Promise<void> {
  const controlDb = getControlDb(env);

  // 1. Purge tenant records from central control database
  await controlDb.prepare("DELETE FROM merchant_users WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM refresh_tokens WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM verification_tokens WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM reset_tokens WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM support_tickets WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM merchant_notifications WHERE tenantId = ?").bind(tenantId).run();
  await controlDb.prepare("DELETE FROM tenants WHERE tenantId = ?").bind(tenantId).run();

  // 2. Purge isolated tenant database tables
  try {
    const tenantDb = await getTenantDb(tenantId, env);
    await tenantDb.prepare("DROP TABLE IF EXISTS orders").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS order_items").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS products").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS customers").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS discount_codes").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS store_settings").run();
    await tenantDb.prepare("DROP TABLE IF EXISTS themes").run();
  } catch (err) {
    console.error(`purgeTenantData error for tenant ${tenantId}:`, err);
  }
}

/**
 * Data retention cleanup task (L2 Requirement)
 * Purges expired verification tokens, reset tokens, stale refresh tokens, and old logs.
 */
export async function cleanupExpiredRetentionData(env: any): Promise<{ cleaned: number }> {
  const controlDb = getControlDb(env);
  const nowIso = new Date().toISOString();
  const nowSec = Math.floor(Date.now() / 1000);
  const ninetyDaysAgoIso = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  let cleaned = 0;

  try {
    // 1. Delete expired verification & reset tokens
    await controlDb.prepare("DELETE FROM verification_tokens WHERE expiresAt < ?").bind(nowIso).run();
    await controlDb.prepare("DELETE FROM reset_tokens WHERE expiresAt < ?").bind(nowIso).run();
    
    // 2. Delete expired refresh tokens
    await controlDb.prepare("DELETE FROM refresh_tokens WHERE expiresAt < ?").bind(nowSec).run();

    // 3. Delete auth logs older than 90 days
    await controlDb.prepare("DELETE FROM auth_logs WHERE timestamp < ?").bind(ninetyDaysAgoIso).run();

    // 4. Delete processed webhooks older than 30 days
    const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await controlDb.prepare("DELETE FROM processed_webhooks WHERE processedAt < ?").bind(thirtyDaysAgoIso).run();

    cleaned += 1;
  } catch (err) {
    console.error("cleanupExpiredRetentionData error:", err);
  }

  return { cleaned };
}
