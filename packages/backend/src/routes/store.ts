import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { encrypt, decrypt } from "../lib/crypto";
import { StoreSettingsSchema } from "@basecart/shared";

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

      return reply.send({
        storeName: store.storeName,
        subdomain: store.subdomain,
        branding: store.branding || { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" },
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

      return reply.send({
        plan,
        productsUsed,
        productsLimit,
        ordersUsed,
        ordersLimit,
      });
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
}
