import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authService, TokenPayload } from "../services/auth";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

// Pre-handler middleware to authenticate super admins
export async function authenticateAdmin(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let token = req.cookies.basecart_admin_token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return reply.status(401).send({ error: "Unauthorized: Missing token" });
    }

    const payload = await authService.verifyAccessToken(token);

    if (payload.role !== "admin") {
      return reply.status(403).send({ error: "Forbidden: Admin access required" });
    }

    req.user = payload;
  } catch (error: any) {
    return reply.status(401).send({ error: error.message || "Unauthorized" });
  }
}

export async function adminRoutes(fastify: FastifyInstance) {
  /**
   * Admin Signup (Bootstrap helper)
   */
  fastify.post(
    "/admin/auth/signup",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { email, password } = req.body as any;
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      // Gating signup: Only permit signup if there are zero admin accounts
      const admins = await ddbDocClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :sk",
          ExpressionAttributeValues: {
            ":sk": "METADATA",
          },
        })
      );
      console.log("ALL METADATA ITEMS IN DB:", JSON.stringify(admins.Items));
      const adminExists = (admins.Items || []).some((item) => item.PK.startsWith("ADMIN#"));
      if (adminExists) {
        return reply.status(403).send({
          error: "Admin signup is disabled because an admin account already exists.",
        });
      }

      const lowerEmail = email.toLowerCase();
      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#${lowerEmail}`,
            SK: "METADATA",
          },
        })
      );

      if (existing.Item) {
        return reply.status(400).send({ error: "Admin email already registered" });
      }

      const userId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdAt = new Date().toISOString();

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `ADMIN#${lowerEmail}`,
            SK: "METADATA",
            userId,
            email: lowerEmail,
            hashedPassword,
            role: "admin",
            createdAt,
          },
        })
      );

      const tokens = await authService.generateTokens({
        userId,
        email: lowerEmail,
        role: "admin",
        tenantId: "PLATFORM",
        type: "admin" as any,
      });

      reply.setCookie("basecart_admin_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 mins
      });
      reply.setCookie("basecart_admin_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.status(201).send({
        message: "Admin account registered successfully",
        email: lowerEmail,
        role: "admin",
        ...tokens,
      });
    }
  );

  /**
   * Admin Auth Me (Verification)
   */
  fastify.get(
    "/admin/auth/me",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        userId: req.user?.userId,
        email: req.user?.email,
        role: req.user?.role,
      });
    }
  );

  /**
   * Admin Login
   */
  fastify.post(
    "/admin/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { email, password } = req.body as any;
      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      const lowerEmail = email.toLowerCase();
      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ADMIN#${lowerEmail}`,
            SK: "METADATA",
          },
        })
      );

      const admin = existing.Item;
      if (!admin) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, admin.hashedPassword);
      if (!match) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const tokens = await authService.generateTokens({
        userId: admin.userId,
        email: lowerEmail,
        role: "admin",
        tenantId: "PLATFORM",
        type: "admin" as any,
      });

      reply.setCookie("basecart_admin_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
      });
      reply.setCookie("basecart_admin_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({
        email: lowerEmail,
        role: "admin",
        ...tokens,
      });
    }
  );

  /**
   * List all merchants
   */
  fastify.get(
    "/admin/merchants",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await ddbDocClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :sk AND begins_with(PK, :pk)",
          ExpressionAttributeValues: {
            ":sk": "METADATA",
            ":pk": "TENANT#",
          },
        })
      );

      const merchants = (result.Items || []).map((item) => {
        const tenantId = item.PK.replace("TENANT#", "");
        return {
          tenantId,
          storeName: item.storeName,
          subdomain: item.subdomain,
          plan: item.plan || "starter",
          status: item.status || "active",
          createdAt: item.createdAt,
        };
      });

      return reply.send(merchants);
    }
  );

  /**
   * Drill-down: Get merchant products & orders
   */
  fastify.get(
    "/admin/merchants/:tenantId/details",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { tenantId } = req.params as any;

      // 1. Fetch metadata
      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );

      if (!storeRes.Item) {
        return reply.status(404).send({ error: "Merchant not found" });
      }

      // 2. Query products & orders
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

      // 3. Query billing statements
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

      return reply.send({
        store: {
          storeName: storeRes.Item.storeName,
          subdomain: storeRes.Item.subdomain,
          plan: storeRes.Item.plan || "starter",
          status: storeRes.Item.status || "active",
          gstin: storeRes.Item.gstin || "",
          registeredBusinessName: storeRes.Item.registeredBusinessName || "",
          registeredBusinessAddress: storeRes.Item.registeredBusinessAddress || "",
          registeredState: storeRes.Item.registeredState || "",
          addOns: storeRes.Item.addOns || [],
        },
        products: productsRes.Items || [],
        orders: ordersRes.Items || [],
        statements: billingRes.Items || [],
      });
    }
  );

  /**
   * Update merchant status (activate/suspend)
   */
  fastify.patch(
    "/admin/merchants/:tenantId/status",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { tenantId } = req.params as any;
      const { status } = req.body as any;

      if (status !== "active" && status !== "suspended") {
        return reply.status(400).send({ error: "Invalid status, must be active or suspended" });
      }

      // Update merchant
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
          UpdateExpression: "SET #status = :status",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":status": status,
          },
        })
      );

      // Write Admin Audit Log
      const logId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const adminEmail = req.user?.email || "unknown-admin";

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: "ADMIN_AUDIT",
            SK: `LOG#${timestamp}#${logId}`,
            logId,
            adminEmail,
            action: status === "suspended" ? "suspend_store" : "activate_store",
            targetTenantId: tenantId,
            status,
            createdAt: timestamp,
          },
        })
      );

      return reply.send({ message: `Merchant status updated to ${status} successfully` });
    }
  );

  /**
   * Update merchant subscription plan (Admin-only)
   */
  fastify.patch(
    "/admin/merchants/:tenantId/plan",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { tenantId } = req.params as any;
      const { plan } = req.body as any;

      if (plan !== "starter" && plan !== "growth" && plan !== "pro") {
        return reply.status(400).send({ error: "Invalid plan. Must be starter, growth, or pro." });
      }

      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
          UpdateExpression: "SET #plan = :plan",
          ExpressionAttributeNames: {
            "#plan": "plan",
          },
          ExpressionAttributeValues: {
            ":plan": plan,
          },
        })
      );

      // Write Admin Audit Log
      const logId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const adminEmail = req.user?.email || "unknown-admin";

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: "ADMIN_AUDIT",
            SK: `LOG#${timestamp}#${logId}`,
            logId,
            adminEmail,
            action: "change_plan",
            targetTenantId: tenantId,
            plan,
            createdAt: timestamp,
          },
        })
      );

      return reply.send({ message: `Merchant plan successfully updated to ${plan}` });
    }
  );

  /**
   * Platform KPIs & metrics
   */
  fastify.get(
    "/admin/metrics",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      // 1. Scan for all merchants
      const merchantsRes = await ddbDocClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "SK = :sk AND begins_with(PK, :pk)",
          ExpressionAttributeValues: {
            ":sk": "METADATA",
            ":pk": "TENANT#",
          },
        })
      );

      const merchants = merchantsRes.Items || [];
      const totalMerchants = merchants.length;

      // MRR estimate: starter = 299, growth = 899, pro = 1999
      let estimatedMRR = 0;
      for (const m of merchants) {
        const plan = m.plan || "starter";
        if (plan === "starter") estimatedMRR += 299;
        else if (plan === "growth") estimatedMRR += 899;
        else if (plan === "pro") estimatedMRR += 1999;
      }

      // 2. Scan for total GMV (completed orders)
      const ordersRes = await ddbDocClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "begins_with(SK, :sk) AND #status <> :status",
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":sk": "ORDER#",
            ":status": "pending", // only paid/completed orders contribute to GMV
          },
        })
      );

      let totalGMV = 0;
      for (const o of ordersRes.Items || []) {
        totalGMV += o.total || 0;
      }

      return reply.send({
        totalMerchants,
        estimatedMRR,
        totalGMV,
      });
    }
  );

  /**
   * Get Platform Audit Logs
   */
  fastify.get(
    "/admin/audit-logs",
    { preHandler: [authenticateAdmin] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: {
            ":pk": "ADMIN_AUDIT",
          },
          ScanIndexForward: false, // Descending order (newest first)
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Admin Logout
   */
  fastify.post(
    "/admin/auth/logout",
    async (req: FastifyRequest, reply: FastifyReply) => {
      reply.clearCookie("basecart_admin_token", { path: "/" });
      reply.clearCookie("basecart_admin_refresh_token", { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    }
  );
}
