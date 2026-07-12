import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GetCommand, UpdateCommand, QueryCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import { ddbDocClient } from "../lib/aws";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { encrypt, decrypt } from "../lib/crypto";
import { StoreSettingsSchema } from "@basecart/shared";
import { generateInvoicePdf } from "../lib/pdf";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

export async function storeRoutes(fastify: FastifyInstance) {
  /**
   * Get store settings (Merchant-only)
   */
  fastify.get(
    "/store/settings",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );

      const store = result.Item;
      if (!store) {
        return reply.status(404).send({ error: "Store settings not found" });
      }

      // Decrypt Razorpay credentials if they exist
      let razorpayKey = "";
      let razorpaySecret = "";

      if (store.razorpayKeyId) {
        try {
          razorpayKey = await decrypt(store.razorpayKeyId);
        } catch (e) {
          console.error("Failed to decrypt razorpayKeyId", e);
        }
      }
      if (store.razorpaySecret) {
        try {
          razorpaySecret = await decrypt(store.razorpaySecret);
        } catch (e) {
          console.error("Failed to decrypt razorpaySecret", e);
        }
      }

      return reply.send({
        storeName: store.storeName,
        subdomain: store.subdomain,
        customDomain: store.customDomain || "",
        plan: store.plan || "starter",
        addOns: store.addOns || [],
        gstin: store.gstin || "",
        registeredBusinessName: store.registeredBusinessName || "",
        registeredBusinessAddress: store.registeredBusinessAddress || "",
        registeredState: store.registeredState || "",
        razorpayKey,
        razorpaySecret,
        branding: store.branding || { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" },
        termsOfService: store.termsOfService || "",
        privacyPolicy: store.privacyPolicy || "",
        refundPolicy: store.refundPolicy || "",
        createdAt: store.createdAt,
      });
    }
  );

  /**
   * Update store settings (Merchant-only)
   */
  fastify.patch(
    "/store/settings",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const existingRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );
      const store = existingRes.Item;
      if (!store) {
        return reply.status(404).send({ error: "Store settings not found" });
      }

      const parseResult = StoreSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const {
        storeName,
        razorpayKey,
        razorpaySecret,
        customDomain,
        branding,
        addOns,
        gstin,
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
          return reply.status(403).send({
            error: "Feature locked: Custom domains require the Pro tier. Please upgrade.",
          });
        }
      }

      // Block Razorpay configuration if email is unverified
      if (razorpayKey || razorpaySecret) {
        const userRes = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `TENANT#${tenantId}`,
              SK: `USER#${req.user!.email}`,
            },
          })
        );
        if (userRes.Item?.emailVerified === false) {
          return reply.status(400).send({
            error: "Email verification required to configure payment gateway keys",
          });
        }
      }

      // Encrypt keys if provided
      const encryptedKey = razorpayKey ? await encrypt(razorpayKey) : undefined;
      const encryptedSecret = razorpaySecret ? await encrypt(razorpaySecret) : undefined;

      // Build update expression
      let updateExpression = "SET storeName = :storeName";
      const expressionAttributeValues: any = {
        ":storeName": storeName,
      };

      if (encryptedKey !== undefined) {
        updateExpression += ", razorpayKeyId = :razorpayKey";
        expressionAttributeValues[":razorpayKey"] = encryptedKey;
      }
      if (encryptedSecret !== undefined) {
        updateExpression += ", razorpaySecret = :razorpaySecret";
        expressionAttributeValues[":razorpaySecret"] = encryptedSecret;
      }
      if (customDomain !== undefined) {
        updateExpression += ", customDomain = :customDomain";
        expressionAttributeValues[":customDomain"] = customDomain;
      }
      if (branding !== undefined) {
        updateExpression += ", branding = :branding";
        expressionAttributeValues[":branding"] = branding;
      }
      if (addOns !== undefined) {
        updateExpression += ", addOns = :addOns";
        expressionAttributeValues[":addOns"] = addOns;
      }
      if (gstin !== undefined) {
        updateExpression += ", gstin = :gstin";
        expressionAttributeValues[":gstin"] = gstin;
      }
      if (registeredBusinessName !== undefined) {
        updateExpression += ", registeredBusinessName = :registeredBusinessName";
        expressionAttributeValues[":registeredBusinessName"] = registeredBusinessName;
      }
      if (registeredBusinessAddress !== undefined) {
        updateExpression += ", registeredBusinessAddress = :registeredBusinessAddress";
        expressionAttributeValues[":registeredBusinessAddress"] = registeredBusinessAddress;
      }
      if (registeredState !== undefined) {
        updateExpression += ", registeredState = :registeredState";
        expressionAttributeValues[":registeredState"] = registeredState;
      }
      if (termsOfService !== undefined) {
        updateExpression += ", termsOfService = :termsOfService";
        expressionAttributeValues[":termsOfService"] = termsOfService;
      }
      if (privacyPolicy !== undefined) {
        updateExpression += ", privacyPolicy = :privacyPolicy";
        expressionAttributeValues[":privacyPolicy"] = privacyPolicy;
      }
      if (refundPolicy !== undefined) {
        updateExpression += ", refundPolicy = :refundPolicy";
        expressionAttributeValues[":refundPolicy"] = refundPolicy;
      }

      // Generate billing statement for newly enabled add-ons
      if (addOns !== undefined) {
        const oldAddOns = store.addOns || [];
        const added = addOns.filter((x: string) => !oldAddOns.includes(x));
        if (added.length > 0) {
          let newAmount = 0;
          for (const a of added) {
            if (a === "whatsapp") newAmount += 999;
            else if (a === "shiprocket") newAmount += 1499;
            else if (a === "gst_invoice") newAmount += 499;
          }

          if (newAmount > 0) {
            const invoiceId = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
            await ddbDocClient.send(
              new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                  PK: `TENANT#${tenantId}`,
                  SK: `BILLING_INVOICE#${invoiceId}`,
                  invoiceId,
                  date: new Date().toISOString().split("T")[0],
                  amount: newAmount,
                  plan,
                  addOns: added,
                  status: "paid",
                  billingPeriod: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                  storeName: storeName || store.storeName,
                },
              })
            );
          }
        }
      }

      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );

      return reply.send({ message: "Store settings updated successfully" });
    }
  );

  /**
   * Public store info (resolved by subdomain)
   * Does NOT return credentials.
   */
  fastify.get(
    "/store/:subdomain/info",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );

      const store = result.Item;
      if (!store) {
        return reply.status(404).send({ error: "Store not found" });
      }

      // Query published theme for the tenant
      const themesRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "THEME#",
          },
        })
      );
      const themes = themesRes.Items || [];
      const publishedTheme = themes.find(t => t.status === "published") || null;

      return reply.send({
        storeName: store.storeName,
        subdomain: store.subdomain,
        branding: store.branding || { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" },
        theme: publishedTheme,
        termsOfService: store.termsOfService || "",
        privacyPolicy: store.privacyPolicy || "",
        refundPolicy: store.refundPolicy || "",
      });
    }
  );

  /**
   * GET /store/billing
   * Returns current subscription plan, usage limits, and period caps
   */
  fastify.get(
    "/store/billing",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // 1. Get store details
      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
        })
      );
      const store = storeRes.Item;
      if (!store) {
        return reply.status(404).send({ error: "Store not found" });
      }

      const plan = store.plan || "starter";

      // 2. Fetch products count
      const productsRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "PRODUCT#",
          },
        })
      );
      const productsUsed = (productsRes.Items || []).length;

      // 3. Fetch monthly orders count
      const ordersRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );
      const orders = ordersRes.Items || [];

      // Calculate orders placed during the current calendar month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const ordersUsed = orders.filter((o) => new Date(o.createdAt) >= startOfMonth).length;

      // Determine limits based on plan
      let productsLimit = 50;
      let ordersLimit = 100;

      if (plan === "growth") {
        productsLimit = 500;
        ordersLimit = 1000;
      } else if (plan === "pro") {
        productsLimit = 999999; // Unlimited representational threshold
        ordersLimit = 999999;
      }

      // 4. Query billing statements
      const billingRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "BILLING_INVOICE#",
          },
        })
      );
      let statements = billingRes.Items || [];

      // Seed mock history on first load
      if (statements.length === 0) {
        const mockStatements = [
          {
            PK: `TENANT#${tenantId}`,
            SK: `BILLING_INVOICE#INV-2026-001`,
            invoiceId: `INV-2026-001`,
            date: "2026-05-15",
            amount: plan === "pro" ? 2999 : plan === "growth" ? 999 : 0,
            plan,
            addOns: [],
            status: "paid",
            billingPeriod: "May 2026",
            storeName: store.storeName,
          },
          {
            PK: `TENANT#${tenantId}`,
            SK: `BILLING_INVOICE#INV-2026-002`,
            invoiceId: `INV-2026-002`,
            date: "2026-06-15",
            amount: (plan === "pro" ? 2999 : plan === "growth" ? 999 : 0) + (store.addOns?.includes("whatsapp") ? 999 : 0),
            plan,
            addOns: store.addOns || [],
            status: "paid",
            billingPeriod: "June 2026",
            storeName: store.storeName,
          }
        ];

        for (const item of mockStatements) {
          await ddbDocClient.send(
            new PutCommand({
              TableName: TABLE_NAME,
              Item: item,
            })
          );
        }
        statements = mockStatements;
      }

      return reply.send({
        plan,
        productsUsed,
        productsLimit,
        ordersUsed,
        ordersLimit,
        statements,
      });
    }
  );

  /**
   * GET /store/billing/statement/:statementId
   * Downloads GST invoice statement PDF
   */
  fastify.get(
    "/store/billing/statement/:statementId",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { statementId } = req.params as any;

      const statementRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: `BILLING_INVOICE#${statementId}` },
        })
      );
      const statement = statementRes.Item;
      if (!statement) {
        return reply.status(404).send({ error: "Invoice statement not found" });
      }

      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
        })
      );
      const store = storeRes.Item;
      if (!store) {
        return reply.status(404).send({ error: "Store not found" });
      }

      const invoiceData: any = {
        invoiceNumber: statement.invoiceId,
        date: statement.date,
        storeName: "Basecart SaaS Platform",
        storeGstin: "29AAACB1234F1Z1",
        storeAddress: "100 Basecart Tower, Indiranagar, Bangalore, Karnataka",
        storeState: "Karnataka",
        customerName: store.storeName || "Store Owner",
        customerEmail: req.user!.email,
        customerAddress: store.registeredBusinessAddress || "Merchant registered address",
        customerState: store.registeredState || "Karnataka",
        lineItems: [
          {
            name: `Basecart Plan Subscription - ${statement.plan.toUpperCase()}`,
            price: statement.plan === "pro" ? 2999 : statement.plan === "growth" ? 999 : 0,
            quantity: 1,
          },
          ...(statement.addOns || []).map((addon: string) => {
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
          })
        ],
        taxType: (store.registeredState || "Karnataka").toLowerCase() === "karnataka" ? "intrastate" : "interstate",
        subtotal: 0,
        taxAmount: 0,
        total: statement.amount,
      };

      if (statement.amount > 0) {
        invoiceData.subtotal = Number((statement.amount / 1.18).toFixed(2));
        invoiceData.taxAmount = Number((statement.amount - invoiceData.subtotal).toFixed(2));
        invoiceData.lineItems = invoiceData.lineItems.map((item: any) => {
          return {
            ...item,
            price: Number((item.price / 1.18).toFixed(2)),
          };
        });
      } else {
        invoiceData.subtotal = 0;
        invoiceData.taxAmount = 0;
      }

      const pdfBuffer = await generateInvoicePdf(invoiceData);
      reply.header("Content-Type", "application/pdf");
      reply.header("Content-Disposition", `attachment; filename=statement-${statementId}.pdf`);
      return reply.send(pdfBuffer);
    }
  );

  /**
   * POST /store/plan
   * Upgrade or downgrade active store subscription tier
   */
  fastify.post(
    "/store/plan",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { plan: targetPlan } = req.body as any;

      if (targetPlan !== "starter" && targetPlan !== "growth" && targetPlan !== "pro") {
        return reply.status(400).send({ error: "Invalid plan target. Must be starter, growth, or pro." });
      }

      // Check current product usage
      const productsRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "PRODUCT#",
          },
        })
      );
      const productsUsed = (productsRes.Items || []).length;

      // Prevent downgrades that exceed limits
      if (targetPlan === "starter" && productsUsed > 50) {
        return reply.status(400).send({
          error: `Cannot downgrade to Starter. Your store currently contains ${productsUsed} products, which exceeds the Starter plan limit of 50 products. Please delete items first.`,
        });
      }
      if (targetPlan === "growth" && productsUsed > 500) {
        return reply.status(400).send({
          error: `Cannot downgrade to Growth. Your store currently contains ${productsUsed} products, which exceeds the Growth plan limit of 500 products. Please delete items first.`,
        });
      }

      // Update plan
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
          UpdateExpression: "SET #plan = :plan",
          ExpressionAttributeNames: { "#plan": "plan" },
          ExpressionAttributeValues: { ":plan": targetPlan },
        })
      );

      return reply.send({ message: `Successfully changed plan to ${targetPlan}`, plan: targetPlan });
    }
  );

  /**
   * GET /finances/summary
   * Provides aggregated sales revenue, transaction platform fee collections, and ledger lists
   */
  fastify.get(
    "/finances/summary",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // Retrieve all orders
      const ordersRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );
      const orders = ordersRes.Items || [];

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
          customerEmail: order.customerInfo?.email || "Guest",
          total: order.total || 0,
          platformFee: order.platformFee || 0,
          status: order.status,
          reconciliationStatus: order.reconciliationStatus || "pending",
          createdAt: order.createdAt,
        });
      }

      return reply.send({
        totalRevenue,
        totalPlatformFees,
        transactions: transactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      });
    }
  );

  /**
   * GET /store/themes
   * Lists all themes for the tenant. Creates default if none exist.
   */
  fastify.get(
    "/store/themes",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "THEME#",
          },
        })
      );

      let themes = result.Items || [];

      if (themes.length === 0) {
        // Fetch current branding settings from store metadata to seed default
        const metadataRes = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
          })
        );
        const store = metadataRes.Item;
        const branding = store?.branding || { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" };

        const defaultTheme = {
          PK: `TENANT#${tenantId}`,
          SK: "THEME#default",
          themeId: "default",
          name: "Horizon (Default)",
          status: "published",
          templateBase: "Aura",
          colors: {
            primary: branding.primaryColor || "#2563EB",
            accent: branding.accentColor || "#1D4ED8",
          },
          logoUrl: branding.logoUrl || "",
          pageContent: {
            home: {
              heroTitle: "BUILT FOR PERFORMANCE",
              heroSubtext: "Premium active gear for those who never compromise.",
              ctaText: "SHOP NOW"
            },
            catalog: {
              pageTitle: "Latest Catalog Arrivals",
              pageSubtext: "Discover our premium selection of sports goods and apparel."
            },
            checkout: {
              pageTitle: "Secure Stripe & Razorpay Checkout",
              instructions: "All transactions are fully encrypted. Enter details to complete purchase."
            }
          },
          lastSavedAt: new Date().toISOString(),
          version: 1,
        };

        await ddbDocClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: defaultTheme,
          })
        );
        themes = [defaultTheme];
      }

      return reply.send(themes);
    }
  );

  /**
   * POST /store/themes
   * Creates a new draft theme.
   */
  fastify.post(
    "/store/themes",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { name, templateBase, colors, logoUrl, pageContent } = req.body as any;

      if (!name || !templateBase) {
        return reply.status(400).send({ error: "name and templateBase are required" });
      }

      const themeId = crypto.randomUUID();
      const newTheme = {
        PK: `TENANT#${tenantId}`,
        SK: `THEME#${themeId}`,
        themeId,
        name,
        status: "draft",
        templateBase,
        colors: colors || { primary: "#2563EB", accent: "#1D4ED8" },
        logoUrl: logoUrl || "",
        pageContent: pageContent || {
          home: {
            heroTitle: "BUILT FOR PERFORMANCE",
            heroSubtext: "Premium active gear for those who never compromise.",
            ctaText: "SHOP NOW"
          },
          catalog: {
            pageTitle: "Latest Catalog Arrivals",
            pageSubtext: "Discover our premium selection of sports goods and apparel."
          },
          checkout: {
            pageTitle: "Secure Stripe & Razorpay Checkout",
            instructions: "All transactions are fully encrypted. Enter details to complete purchase."
          }
        },
        lastSavedAt: new Date().toISOString(),
        version: 1,
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: newTheme,
        })
      );

      return reply.status(201).send(newTheme);
    }
  );

  /**
   * PATCH /store/themes/:themeId
   * Updates settings for a single theme draft.
   */
  fastify.patch(
    "/store/themes/:themeId",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { themeId } = req.params as any;
      const { name, templateBase, colors, logoUrl, pageContent } = req.body as any;

      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: `THEME#${themeId}` },
        })
      );

      const theme = existing.Item;
      if (!theme) {
        return reply.status(404).send({ error: "Theme not found" });
      }

      const updated = {
        ...theme,
        name: name !== undefined ? name : theme.name,
        templateBase: templateBase !== undefined ? templateBase : theme.templateBase,
        colors: colors !== undefined ? colors : theme.colors,
        logoUrl: logoUrl !== undefined ? logoUrl : theme.logoUrl,
        pageContent: pageContent !== undefined ? pageContent : theme.pageContent,
        lastSavedAt: new Date().toISOString(),
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updated,
        })
      );

      // If active, keep backward-compatibility branding tags updated
      if (theme.status === "published") {
        await ddbDocClient.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
            UpdateExpression: "SET branding = :b",
            ExpressionAttributeValues: {
              ":b": {
                logoUrl: updated.logoUrl,
                primaryColor: updated.colors?.primary || "#2563EB",
                accentColor: updated.colors?.accent || "#1D4ED8",
              },
            },
          })
        );
      }

      return reply.send(updated);
    }
  );

  /**
   * POST /store/themes/:themeId/publish
   * Promotes a draft to published status and demotes previously active templates.
   */
  fastify.post(
    "/store/themes/:themeId/publish",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { themeId } = req.params as any;

      const allThemesRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "THEME#",
          },
        })
      );

      const themes = (allThemesRes.Items || []) as any[];
      const targetTheme = themes.find((t) => t.themeId === themeId);

      if (!targetTheme) {
        return reply.status(404).send({ error: "Theme not found" });
      }

      const currentPublished = themes.find((t) => t.status === "published");
      const nowStr = new Date().toISOString();

      if (currentPublished && currentPublished.themeId !== themeId) {
        await ddbDocClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              ...currentPublished,
              status: "draft",
              lastSavedAt: nowStr,
            },
          })
        );
      }

      const nextVersion = (targetTheme.version || 1) + 1;
      const promotedTheme = {
        ...targetTheme,
        status: "published",
        version: nextVersion,
        lastSavedAt: nowStr,
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: promotedTheme,
        })
      );

      // Sync settings details to storefront branding tags
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: "METADATA" },
          UpdateExpression: "SET branding = :b",
          ExpressionAttributeValues: {
            ":b": {
              logoUrl: promotedTheme.logoUrl,
              primaryColor: promotedTheme.colors?.primary || "#2563EB",
              accentColor: promotedTheme.colors?.accent || "#1D4ED8",
            },
          },
        })
      );

      return reply.send(promotedTheme);
    }
  );

  /**
   * DELETE /store/themes/:themeId
   * Deletes a draft theme. Blocks deletion if it is currently published.
   */
  fastify.delete(
    "/store/themes/:themeId",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { themeId } = req.params as any;

      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: `THEME#${themeId}` },
        })
      );

      const theme = existing.Item;
      if (!theme) {
        return reply.status(404).send({ error: "Theme not found" });
      }

      if (theme.status === "published") {
        return reply.status(400).send({ error: "Cannot delete the currently published theme." });
      }

      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantId}`, SK: `THEME#${themeId}` },
        })
      );

      return reply.send({ message: "Theme deleted successfully" });
    }
  );
}
