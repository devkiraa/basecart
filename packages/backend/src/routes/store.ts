import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { encrypt, decrypt } from "../lib/crypto";
import { StoreSettingsSchema } from "@basecart/shared";
import { generateInvoicePdf } from "../lib/pdf";
import { renderEmail, sendEmail } from "@basecart/emails";

const app = new Hono<{ Bindings: any; Variables: any }>();

// Helper to format themes
function formatTheme(theme: any) {
  if (!theme) return theme;
  const copy = { ...theme };
  if (copy.colors && typeof copy.colors === "string") {
    try {
      copy.colors = JSON.parse(copy.colors);
    } catch (e) {
      copy.colors = { primary: "#2563EB", accent: "#1D4ED8" };
    }
  }
  if (copy.pageContent && typeof copy.pageContent === "string") {
    try {
      copy.pageContent = JSON.parse(copy.pageContent);
    } catch (e) {
      copy.pageContent = {};
    }
  }
  return copy;
}

// -------------------------------------------------------------
// 1. Merchant Admin Store Settings & Themes (Writes go straight to DO)
// -------------------------------------------------------------

/**
 * Get store settings (Merchant-only)
 */
app.get("/store/settings", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store settings not found" }, 404);
  }

  // Check if credentials are configured (without returning plaintext secrets)
  const hasRazorpayKey = !!store.razorpayKeyId;
  const hasRazorpaySecret = !!store.razorpaySecret;

  let addOns = [];
  if (store.addOns) {
    try {
      addOns = typeof store.addOns === "string" ? JSON.parse(store.addOns) : store.addOns;
    } catch (e) {}
  }

  let branding = { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" };
  if (store.branding) {
    try {
      branding = typeof store.branding === "string" ? JSON.parse(store.branding) : store.branding;
    } catch (e) {}
  }

  return c.json({
    storeName: store.storeName,
    subdomain: store.subdomain,
    customDomain: store.customDomain || "",
    plan: store.plan || "starter",
    addOns,
    gstin: store.gstin || (branding as any).gstin || "",
    registeredBusinessName: store.registeredBusinessName || "",
    registeredBusinessAddress: store.registeredBusinessAddress || "",
    registeredState: store.registeredState || "",
    panNumber: (branding as any).panNumber || "",
    cinNumber: (branding as any).cinNumber || "",
    tanNumber: (branding as any).tanNumber || "",
    placeOfSupply: (branding as any).placeOfSupply || "",
    bankDetails: (branding as any).bankDetails || {
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankBranch: "",
    },
    invoiceConfig: (branding as any).invoiceConfig || {
      invoiceHeaderDisclaimer: "*This is a computer generated invoice and does not require a physical copy",
      invoiceTerms: "Net 15",
      invoiceNotes: "Thanks for your business. For GST queries, please contact your store support.",
      authorizedSignatoryName: "",
      authorizedSignatoryTitle: "Authorized Signatory",
      signatureStampUrl: "",
    },
    razorpayConfigured: hasRazorpayKey && hasRazorpaySecret,
    branding,
    termsOfService: store.termsOfService || "",
    privacyPolicy: store.privacyPolicy || "",
    refundPolicy: store.refundPolicy || "",
    createdAt: store.createdAt,
  });
});

/**
 * Update store settings (Merchant-only)
 */
app.patch("/store/settings", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store settings not found" }, 404);
  }

  const body = await c.req.json().catch(() => ({}));
  const parseResult = StoreSettingsSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const {
    storeName,
    razorpayKey,
    razorpaySecret,
    customDomain,
    branding,
    addOns,
    gstin,
    panNumber,
    cinNumber,
    tanNumber,
    placeOfSupply,
    bankDetails,
    invoiceConfig,
    registeredBusinessName,
    registeredBusinessAddress,
    registeredState,
    termsOfService,
    privacyPolicy,
    refundPolicy,
  } = parseResult.data;

  const plan = store.plan || "starter";

  // Enforce customDomain Pro plan tier check
  if (customDomain && customDomain.trim() !== "") {
    if (plan !== "pro") {
      return c.json({
        error: "Feature locked: Custom domains require the Pro tier. Please upgrade.",
      }, 403);
    }
  }

  // Block Razorpay configuration if email is unverified
  if (razorpayKey || razorpaySecret) {
    const user = c.get("user");
    const dbUser = await controlDb
      .prepare("SELECT emailVerified FROM merchant_users WHERE email = ? AND tenantId = ?")
      .bind(user.email, tenantId)
      .first<{ emailVerified: number }>();

    if (!dbUser || dbUser.emailVerified === 0) {
      return c.json({
        error: "Email verification required to configure payment gateway keys",
      }, 400);
    }
  }

  // Encrypt keys
  const encryptedKey = razorpayKey ? await encrypt(razorpayKey, c.env.ENCRYPTION_SECRET) : store.razorpayKeyId;
  const encryptedSecret = razorpaySecret ? await encrypt(razorpaySecret, c.env.ENCRYPTION_SECRET) : store.razorpaySecret;

  // Sync brandings and addOns representation
  const oldAddOnsStr = store.addOns || "[]";
  const oldAddOns = JSON.parse(oldAddOnsStr);

  const updatedAddOns = addOns !== undefined ? addOns : oldAddOns;
  const oldBranding = store.branding ? JSON.parse(store.branding) : {};
  const updatedBranding = {
    ...oldBranding,
    ...(branding || {}),
    ...(panNumber !== undefined ? { panNumber } : {}),
    ...(cinNumber !== undefined ? { cinNumber } : {}),
    ...(tanNumber !== undefined ? { tanNumber } : {}),
    ...(placeOfSupply !== undefined ? { placeOfSupply } : {}),
    ...(bankDetails !== undefined ? { bankDetails } : {}),
    ...(invoiceConfig !== undefined ? { invoiceConfig } : {}),
    ...(gstin !== undefined ? { gstin } : {}),
  };

  // Generate billing statement for newly enabled add-ons
  if (addOns !== undefined) {
    const added = updatedAddOns.filter((x: string) => !oldAddOns.includes(x));
    if (added.length > 0) {
      let newAmount = 0;
      for (const a of added) {
        if (a === "whatsapp") newAmount += 999;
        else if (a === "shiprocket") newAmount += 1499;
        else if (a === "gst_invoice") newAmount += 499;
      }

      if (newAmount > 0) {
        const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
        const tenantDb = await getTenantDb(tenantId, c.env);

        await tenantDb
          .prepare(
            "INSERT INTO billing_invoices (invoiceId, date, billingMonth, amount, status, plan, addOns, pdfKey, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(
            invoiceId,
            new Date().toISOString().split("T")[0],
            new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            newAmount,
            "paid",
            plan,
            JSON.stringify(added),
            null,
            new Date().toISOString()
          )
          .run();
      }
    }
  }

  await controlDb
    .prepare(
      "UPDATE tenants SET storeName = ?, razorpayKeyId = ?, razorpaySecret = ?, customDomain = ?, branding = ?, addOns = ?, gstin = ?, registeredBusinessName = ?, registeredBusinessAddress = ?, registeredState = ?, termsOfService = ?, privacyPolicy = ?, refundPolicy = ? WHERE tenantId = ?"
    )
    .bind(
      storeName !== undefined ? storeName : store.storeName,
      encryptedKey || null,
      encryptedSecret || null,
      customDomain !== undefined ? customDomain : store.customDomain,
      JSON.stringify(updatedBranding),
      JSON.stringify(updatedAddOns),
      gstin !== undefined ? gstin : store.gstin,
      registeredBusinessName !== undefined ? registeredBusinessName : store.registeredBusinessName,
      registeredBusinessAddress !== undefined ? registeredBusinessAddress : store.registeredBusinessAddress,
      registeredState !== undefined ? registeredState : store.registeredState,
      termsOfService !== undefined ? termsOfService : store.termsOfService,
      privacyPolicy !== undefined ? privacyPolicy : store.privacyPolicy,
      refundPolicy !== undefined ? refundPolicy : store.refundPolicy,
      tenantId
    )
    .run();

  return c.json({ message: "Store settings updated successfully" });
});

/**
 * GET /store/billing
 */
app.get("/store/billing", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store not found" }, 404);
  }

  const plan = store.plan || "starter";
  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Fetch products count
  const countRow = await tenantDb.prepare("SELECT COUNT(*) as total FROM products").first<{ total: number }>();
  const productsUsed = countRow?.total || 0;

  // 2. Fetch monthly orders count
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const orderCountRow = await tenantDb
    .prepare("SELECT COUNT(*) as total FROM orders WHERE createdAt >= ?")
    .bind(startOfMonth)
    .first<{ total: number }>();
  const ordersUsed = orderCountRow?.total || 0;

  let productsLimit = 50;
  let ordersLimit = 100;

  if (plan === "growth") {
    productsLimit = 500;
    ordersLimit = 1000;
  } else if (plan === "pro") {
    productsLimit = 999999;
    ordersLimit = 999999;
  }

  // 3. Fetch billing statements
  const statementsResult = await tenantDb.prepare("SELECT * FROM billing_invoices ORDER BY createdAt DESC").all();
  const statements = statementsResult.results || [];

  const parsedStatements = statements.map((s: any) => ({
    ...s,
    addOns: typeof s.addOns === "string" ? JSON.parse(s.addOns) : s.addOns,
  }));

  return c.json({
    plan,
    productsUsed,
    productsLimit,
    ordersUsed,
    ordersLimit,
    statements: parsedStatements,
  });
});

/**
 * GET /store/billing/statement/:statementId
 * Downloads GST invoice statement PDF
 */
app.get("/store/billing/statement/:statementId", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const statementId = c.req.param("statementId");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const statement = await tenantDb
    .prepare("SELECT * FROM billing_invoices WHERE invoiceId = ?")
    .bind(statementId)
    .first<any>();

  if (!statement) {
    return c.json({ error: "Invoice statement not found" }, 404);
  }

  const controlDb = getControlDb(c.env);
  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store not found" }, 404);
  }

  const user = c.get("user");
  const addOns = statement.addOns ? JSON.parse(statement.addOns) : [];

  const invoiceData: any = {
    invoiceNumber: statement.invoiceId,
    date: statement.date,
    storeName: "Basecart SaaS Platform",
    storeGstin: "29AAACB1234F1Z1",
    storeAddress: "100 Basecart Tower, Indiranagar, Bangalore, Karnataka",
    storeState: "Karnataka",
    customerName: store.storeName || "Store Owner",
    customerEmail: user.email,
    customerAddress: store.registeredBusinessAddress || "Merchant registered address",
    customerState: store.registeredState || "Karnataka",
    lineItems: [
      {
        name: `Basecart Plan Subscription - ${statement.plan.toUpperCase()}`,
        price: statement.plan === "pro" ? 2999 : statement.plan === "growth" ? 999 : 0,
        quantity: 1,
      },
      ...addOns.map((addon: string) => {
        let price = 0;
        let name = addon;
        if (addon === "whatsapp") {
          price = 999;
          name = "WhatsApp Notification Integration";
        } else if (addon === "shiprocket") {
          price = 1499;
          name = "Shiprocket Fulfillment Integration";
        } else if (addon === "gst_invoice") {
          price = 499;
          name = "GST Tax Invoicing Add-on";
        }
        return { name, price, quantity: 1 };
      }),
    ],
    taxType: (store.registeredState || "Karnataka").toLowerCase() === "karnataka" ? "intrastate" : "interstate",
    subtotal: 0,
    taxAmount: 0,
    total: statement.amount,
  };

  if (statement.amount > 0) {
    invoiceData.subtotal = Number((statement.amount / 1.18).toFixed(2));
    invoiceData.taxAmount = Number((statement.amount - invoiceData.subtotal).toFixed(2));
    invoiceData.lineItems = invoiceData.lineItems.map((item: any) => ({
      ...item,
      price: Number((item.price / 1.18).toFixed(2)),
    }));
  }

  const pdfBuffer = await generateInvoicePdf(invoiceData);
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `attachment; filename=statement-${statementId}.pdf`);
  return c.body(pdfBuffer as any);
});

/**
 * POST /store/plan
 */
app.post("/store/plan", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { plan: targetPlan } = body;

  if (targetPlan !== "starter" && targetPlan !== "growth" && targetPlan !== "pro") {
    return c.json({ error: "Invalid plan target. Must be starter, growth, or pro." }, 400);
  }

  const tenantDb = await getTenantDb(tenantId, c.env);
  const countRow = await tenantDb.prepare("SELECT COUNT(*) as total FROM products").first<{ total: number }>();
  const productsUsed = countRow?.total || 0;

  if (targetPlan === "starter" && productsUsed > 50) {
    return c.json({
      error: `Cannot downgrade to Starter. Your store currently contains ${productsUsed} products, which exceeds the Starter plan limit of 50 products. Please delete items first.`,
    }, 400);
  }
  if (targetPlan === "growth" && productsUsed > 500) {
    return c.json({
      error: `Cannot downgrade to Growth. Your store currently contains ${productsUsed} products, which exceeds the Growth plan limit of 500 products. Please delete items first.`,
    }, 400);
  }

  const controlDb = getControlDb(c.env);
  await controlDb
    .prepare("UPDATE tenants SET plan = ? WHERE tenantId = ?")
    .bind(targetPlan, tenantId)
    .run();

  return c.json({ message: `Successfully changed plan to ${targetPlan}`, plan: targetPlan });
});

/**
 * GET /finances/summary
 */
app.get("/finances/summary", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const result = await tenantDb.prepare("SELECT * FROM orders").all();
  const orders = result.results || [];

  let totalRevenue = 0;
  let totalPlatformFees = 0;
  const transactions = [];

  for (const order of orders) {
    const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
    if (isPaid) {
      totalRevenue += order.total || 0;
      totalPlatformFees += order.platformFee || 0;
    }

    transactions.push({
      orderId: order.orderId,
      customerEmail: order.customerEmail || "Guest",
      total: order.total || 0,
      platformFee: order.platformFee || 0,
      status: order.status,
      reconciliationStatus: order.reconciliationStatus || "pending",
      createdAt: order.createdAt,
    });
  }

  transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return c.json({
    totalRevenue,
    totalPlatformFees,
    transactions,
  });
});

/**
 * GET /store/themes
 */
app.get("/store/themes", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const result = await tenantDb.prepare("SELECT * FROM themes").all();
  let themes = result.results || [];

  if (themes.length === 0) {
    const controlDb = getControlDb(c.env);
    const store = await controlDb
      .prepare("SELECT branding, storeName FROM tenants WHERE tenantId = ?")
      .bind(tenantId)
      .first<any>();

    let branding = { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" };
    if (store?.branding) {
      try {
        branding = typeof store.branding === "string" ? JSON.parse(store.branding) : store.branding;
      } catch (e) {}
    }

    const defaultTheme = {
      themeId: "satoshi",
      name: "Satoshi",
      status: "published",
      templateBase: "Satoshi",
      colors: JSON.stringify({
        primary: branding.primaryColor || "#010101",
        accent: branding.accentColor || "#EDCF5D",
      }),
      logoUrl: branding.logoUrl || "",
      pageContent: JSON.stringify({
        home: {
          heroTitle: "BUILT FOR PERFORMANCE",
          heroSubtext: "Premium active gear for those who never compromise.",
          ctaText: "SHOP NOW",
        },
        catalog: {
          pageTitle: "Latest Catalog Arrivals",
          pageSubtext: "Discover our premium selection of sports goods and apparel.",
        },
        checkout: {
          pageTitle: "Secure Stripe & Razorpay Checkout",
          instructions: "All transactions are fully encrypted. Enter details to complete purchase.",
        },
      }),
      lastSavedAt: new Date().toISOString(),
      version: 1,
    };

    await tenantDb
      .prepare(
        "INSERT INTO themes (themeId, name, status, templateBase, colors, logoUrl, pageContent, lastSavedAt, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
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

    themes = [defaultTheme];
  }

  return c.json(themes.map(formatTheme));
});

/**
 * POST /store/themes
 */
app.post("/store/themes", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { name, templateBase, colors, logoUrl, pageContent } = body;

  if (!name || !templateBase) {
    return c.json({ error: "name and templateBase are required" }, 400);
  }

  const themeId = crypto.randomUUID();
  const tenantDb = await getTenantDb(tenantId, c.env);

  const colorsStr = JSON.stringify(colors || { primary: "#2563EB", accent: "#1D4ED8" });
  const pageContentStr = JSON.stringify(
    pageContent || {
      home: {
        heroTitle: "BUILT FOR PERFORMANCE",
        heroSubtext: "Premium active gear for those who never compromise.",
        ctaText: "SHOP NOW",
      },
      catalog: {
        pageTitle: "Latest Catalog Arrivals",
        pageSubtext: "Discover our premium selection of sports goods and apparel.",
      },
      checkout: {
        pageTitle: "Secure Stripe & Razorpay Checkout",
        instructions: "All transactions are fully encrypted. Enter details to complete purchase.",
      },
    }
  );

  const lastSavedAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "INSERT INTO themes (themeId, name, status, templateBase, colors, logoUrl, pageContent, lastSavedAt, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(themeId, name, "draft", templateBase, colorsStr, logoUrl || "", pageContentStr, lastSavedAt, 1)
    .run();

  const saved = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first();
  return c.json(formatTheme(saved), 201);
});

/**
 * PATCH /store/themes/:themeId
 */
app.patch("/store/themes/:themeId", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const themeId = c.req.param("themeId");
  const body = await c.req.json().catch(() => ({}));
  const { name, templateBase, colors, logoUrl, pageContent } = body;

  const tenantDb = await getTenantDb(tenantId, c.env);
  const theme = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first<any>();

  if (!theme) {
    return c.json({ error: "Theme not found" }, 404);
  }

  const updatedName = name !== undefined ? name : theme.name;
  const updatedTemplateBase = templateBase !== undefined ? templateBase : theme.templateBase;
  const updatedColors = colors !== undefined ? JSON.stringify(colors) : theme.colors;
  const updatedLogoUrl = logoUrl !== undefined ? logoUrl : theme.logoUrl;
  const updatedPageContent = pageContent !== undefined ? JSON.stringify(pageContent) : theme.pageContent;
  const lastSavedAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "UPDATE themes SET name = ?, templateBase = ?, colors = ?, logoUrl = ?, pageContent = ?, lastSavedAt = ? WHERE themeId = ?"
    )
    .bind(updatedName, updatedTemplateBase, updatedColors, updatedLogoUrl, updatedPageContent, lastSavedAt, themeId)
    .run();

  const updatedRow = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first<any>();

  // If active, keep backward-compatibility branding tags updated
  if (theme.status === "published") {
    const controlDb = getControlDb(c.env);
    const parsedColors = JSON.parse(updatedColors);
    await controlDb
      .prepare("UPDATE tenants SET branding = ? WHERE tenantId = ?")
      .bind(
        JSON.stringify({
          logoUrl: updatedLogoUrl,
          primaryColor: parsedColors.primary || "#2563EB",
          accentColor: parsedColors.accent || "#1D4ED8",
        }),
        tenantId
      )
      .run();
  }

  return c.json(formatTheme(updatedRow));
});

/**
 * POST /store/themes/:themeId/publish
 */
app.post("/store/themes/:themeId/publish", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const themeId = c.req.param("themeId");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const targetTheme = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first<any>();
  if (!targetTheme) {
    return c.json({ error: "Theme not found" }, 404);
  }

  const nowStr = new Date().toISOString();

  // Demote current published theme to draft
  await tenantDb.prepare("UPDATE themes SET status = 'draft', lastSavedAt = ? WHERE status = 'published'").bind(nowStr).run();

  const nextVersion = (targetTheme.version || 1) + 1;

  await tenantDb
    .prepare("UPDATE themes SET status = 'published', version = ?, lastSavedAt = ? WHERE themeId = ?")
    .bind(nextVersion, nowStr, themeId)
    .run();

  const promoted = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first<any>();
  const parsedColors = JSON.parse(promoted.colors);

  // Sync settings details to storefront branding tags
  const controlDb = getControlDb(c.env);
  await controlDb
    .prepare("UPDATE tenants SET branding = ? WHERE tenantId = ?")
    .bind(
      JSON.stringify({
        logoUrl: promoted.logoUrl,
        primaryColor: parsedColors.primary || "#2563EB",
        accentColor: parsedColors.accent || "#1D4ED8",
      }),
      tenantId
    )
    .run();

  return c.json(formatTheme(promoted));
});

/**
 * DELETE /store/themes/:themeId
 */
app.delete("/store/themes/:themeId", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const themeId = c.req.param("themeId");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const theme = await tenantDb.prepare("SELECT * FROM themes WHERE themeId = ?").bind(themeId).first<any>();
  if (!theme) {
    return c.json({ error: "Theme not found" }, 404);
  }

  if (theme.status === "published") {
    return c.json({ error: "Cannot delete the currently published theme." }, 400);
  }

  await tenantDb.prepare("DELETE FROM themes WHERE themeId = ?").bind(themeId).run();
  return c.json({ message: "Theme deleted successfully" });
});

// -------------------------------------------------------------
// 2. Storefront Public Endpoints (Reads: Marked Future-Cacheable)
// -------------------------------------------------------------

/**
 * Public store info (resolved by subdomain)
 * FUTURE-CACHEABLE: Public metadata read, safe to cache by subdomain.
 */
app.get("/store/:subdomain/info", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);

  const store = await controlDb
    .prepare("SELECT storeName, subdomain, plan, branding, termsOfService, privacyPolicy, refundPolicy FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store not found" }, 404);
  }

  // Query published theme for the tenant
  const tenantDb = await getTenantDb(tenantId, c.env);
  const theme = await tenantDb
    .prepare("SELECT * FROM themes WHERE status = 'published'")
    .first<any>();

  const branding = store.branding ? JSON.parse(store.branding) : { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" };

  return c.json({
    storeName: store.storeName,
    subdomain: store.subdomain,
    plan: store.plan,
    branding,
    theme: theme ? formatTheme(theme) : null,
    termsOfService: store.termsOfService || "",
    privacyPolicy: store.privacyPolicy || "",
    refundPolicy: store.refundPolicy || "",
  });
});

/**
 * Get store custom email branding settings
 */
app.get("/store/email-settings", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const settingsRes = await tenantDb.prepare("SELECT * FROM store_settings WHERE key IN ('email_color_primary', 'email_logo_url', 'email_signature')").all<any>();
  
  const settings: Record<string, string | null> = {
    email_color_primary: null,
    email_logo_url: null,
    email_signature: null,
  };

  settingsRes.results?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return c.json(settings);
});

/**
 * Save store custom email branding settings
 */
app.patch("/store/email-settings", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const body = await c.req.json().catch(() => ({}));

  const { email_color_primary, email_logo_url, email_signature } = body;

  const statements = [];
  if (email_color_primary !== undefined) {
    statements.push(tenantDb.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('email_color_primary', ?)").bind(email_color_primary));
  }
  if (email_logo_url !== undefined) {
    statements.push(tenantDb.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('email_logo_url', ?)").bind(email_logo_url));
  }
  if (email_signature !== undefined) {
    statements.push(tenantDb.prepare("INSERT OR REPLACE INTO store_settings (key, value) VALUES ('email_signature', ?)").bind(email_signature));
  }

  if (statements.length > 0) {
    await tenantDb.batch(statements);
  }

  return c.json({ success: true, message: "Email settings saved successfully" });
});

/**
 * Get and render merchant-level email templates with customizations
 */
app.get("/store/email-templates", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);
  const tenantDb = await getTenantDb(tenantId, c.env);

  const store = await controlDb
    .prepare("SELECT storeName FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store not found" }, 404);
  }

  // Load custom settings
  const settingsRes = await tenantDb.prepare("SELECT * FROM store_settings WHERE key IN ('email_color_primary', 'email_logo_url', 'email_signature')").all<any>();
  const storeSettings: Record<string, string> = {};
  settingsRes.results?.forEach((row) => {
    storeSettings[row.key] = row.value;
  });

  // Load active theme fallback
  const theme = await tenantDb.prepare("SELECT * FROM themes WHERE status = 'published'").first<any>();
  let themePrimary = "#2563EB";
  let themeLogo = "";
  if (theme) {
    try {
      const parsedColors = typeof theme.colors === "string" ? JSON.parse(theme.colors) : theme.colors;
      if (parsedColors?.primary) themePrimary = parsedColors.primary;
    } catch(e) {}
    if (theme.logoUrl) themeLogo = theme.logoUrl;
  }

  // Final config overrides
  const colorPrimary = c.req.query("email_color_primary") || storeSettings.email_color_primary || themePrimary;
  const logoUrl = c.req.query("email_logo_url") || storeSettings.email_logo_url || themeLogo;
  const emailSignature = c.req.query("email_signature") || storeSettings.email_signature || "";

  const mockPayloads: Record<string, any> = {
    "order-confirmation": {
      orderId: "ord_e4892c",
      customerName: "Rohan K",
      total: 1450,
      invoiceNumber: "INV-2026-0089",
      storeName: store.storeName,
      colorPrimary,
      logoUrl,
      emailSignature,
    },
    "order-shipped": {
      orderId: "ord_e4892c",
      customerName: "Rohan K",
      trackingNumber: "TRK-DELHIVERY-99881",
      carrier: "Delhivery",
      trackingUrl: "https://delhivery.com/track/TRK-DELHIVERY-99881",
      storeName: store.storeName,
      colorPrimary,
      logoUrl,
      emailSignature,
    },
    invoice: {
      invoiceNumber: "INV-2026-0089",
      billingMonth: "July 2026",
      amount: 1450,
      paymentDueDate: "2026-08-01",
      downloadUrl: "https://basecart.app/invoice/download",
      storeName: store.storeName,
      colorPrimary,
      logoUrl,
      emailSignature,
    },
  };

  const typeParam = c.req.query("type");
  const types = Object.keys(mockPayloads);

  if (typeParam) {
    if (!types.includes(typeParam)) {
      return c.json({ error: `Invalid store template type: ${typeParam}` }, 400);
    }

    const customData = { ...mockPayloads[typeParam] };
    const queryParams = c.req.query();
    for (const key in queryParams) {
      if (key !== "type" && key !== "email_color_primary" && key !== "email_logo_url" && key !== "email_signature") {
        if (key === "total" || key === "amount") {
          customData[key] = parseFloat(queryParams[key]);
        } else {
          customData[key] = queryParams[key];
        }
      }
    }

    const { subject, html, text } = renderEmail(typeParam as any, customData);
    return c.json({
      type: typeParam,
      subject,
      html,
      text,
      mockData: customData,
    });
  }

  const results = types.map((type) => {
    const { subject, html, text } = renderEmail(type as any, mockPayloads[type]);
    return {
      type,
      subject,
      html,
      text,
      mockData: mockPayloads[type],
    };
  });

  return c.json(results);
});

/**
 * Dispatch a store test email to the merchant owner
 */
app.post("/store/email-templates/test", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const controlDb = getControlDb(c.env);
  const tenantDb = await getTenantDb(tenantId, c.env);

  const body = await c.req.json().catch(() => ({}));
  const { type, to, mockData } = body;

  if (!type || !to || !mockData) {
    return c.json({ error: "type, to, and mockData are required parameters" }, 400);
  }

  const store = await controlDb
    .prepare("SELECT storeName FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  if (!store) {
    return c.json({ error: "Store not found" }, 404);
  }

  // Load active configurations
  const settingsRes = await tenantDb.prepare("SELECT * FROM store_settings WHERE key IN ('email_color_primary', 'email_logo_url', 'email_signature')").all<any>();
  const storeSettings: Record<string, string> = {};
  settingsRes.results?.forEach((row) => {
    storeSettings[row.key] = row.value;
  });

  const theme = await tenantDb.prepare("SELECT * FROM themes WHERE status = 'published'").first<any>();
  let themePrimary = "#2563EB";
  let themeLogo = "";
  if (theme) {
    try {
      const parsedColors = typeof theme.colors === "string" ? JSON.parse(theme.colors) : theme.colors;
      if (parsedColors?.primary) themePrimary = parsedColors.primary;
    } catch(e) {}
    if (theme.logoUrl) themeLogo = theme.logoUrl;
  }

  const colorPrimary = storeSettings.email_color_primary || themePrimary;
  const logoUrl = storeSettings.email_logo_url || themeLogo;
  const emailSignature = storeSettings.email_signature || "";

  // Merge brand details into mockData
  const finalizedData = {
    ...mockData,
    storeName: store.storeName,
    colorPrimary,
    logoUrl,
    emailSignature,
  };

  try {
    await sendEmail({
      type,
      to,
      data: finalizedData,
    }, c.env);

    return c.json({ success: true, message: `Test email of type '${type}' successfully sent/enqueued to ${to}` });
  } catch (err: any) {
    return c.json({ error: err.message || String(err) }, 500);
  }
});

export default app;
