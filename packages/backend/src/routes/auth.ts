import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import {
  QueryCommand,
  GetCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authService } from "../services/auth";
import { resolveStorefrontTenant, authenticateMerchant, authenticateCustomer } from "../middleware/auth";
import {
  MerchantSignupSchema,
  MerchantLoginSchema,
  CustomerSignupSchema,
  CustomerLoginSchema,
} from "@basecart/shared";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

export async function authRoutes(fastify: FastifyInstance) {
  // --- Merchant Auth Endpoints ---

  /**
   * Merchant Signup
   * Creates a store (tenant) and the owner account atomically.
   */
  fastify.post(
    "/auth/merchant/signup",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      // 1. Validate request body
      const parseResult = MerchantSignupSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const { email, password, storeName, subdomain } = parseResult.data;
      const lowerEmail = email.toLowerCase();
      const lowerSubdomain = subdomain.toLowerCase();

      // 2. Check if subdomain already exists using GSI1
      const subdomainQuery = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk",
          ExpressionAttributeValues: {
            ":gsi1pk": `SUBDOMAIN#${lowerSubdomain}`,
            ":gsi1sk": "METADATA",
          },
        })
      );

      if (subdomainQuery.Items && subdomainQuery.Items.length > 0) {
        return reply
          .status(400)
          .send({ error: "Subdomain is already registered by another store" });
      }

      // 3. Check if user already exists globally using GSI2
      const userQuery = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI2",
          KeyConditionExpression: "GSI2PK = :gsi2pk AND GSI2SK = :gsi2sk",
          ExpressionAttributeValues: {
            ":gsi2pk": `USER#${lowerEmail}`,
            ":gsi2sk": "METADATA",
          },
        })
      );

      if (userQuery.Items && userQuery.Items.length > 0) {
        return reply
          .status(400)
          .send({ error: "Email is already registered" });
      }

      // 4. Generate new tenant ID and hash password
      const tenantId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const hashedPassword = await authService.hashPassword(password);
      const createdAt = new Date().toISOString();

      // 5. Write tenant and user records atomically
      await ddbDocClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `TENANT#${tenantId}`,
                  SK: "METADATA",
                  GSI1PK: `SUBDOMAIN#${lowerSubdomain}`,
                  GSI1SK: "METADATA",
                  storeName,
                  subdomain: lowerSubdomain,
                  plan: "starter",
                  createdAt,
                },
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `TENANT#${tenantId}`,
                  SK: `USER#${lowerEmail}`,
                  GSI2PK: `USER#${lowerEmail}`,
                  GSI2SK: "METADATA",
                  userId,
                  email: lowerEmail,
                  hashedPassword,
                  role: "owner",
                  createdAt,
                },
              },
            },
          ],
        })
      );

      // 6. Generate access and refresh tokens
      const tokens = await authService.generateTokens({
        userId,
        email: lowerEmail,
        role: "owner",
        tenantId,
        type: "merchant",
      });

      reply.setCookie("basecart_merchant_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60, // 15 mins
      });
      reply.setCookie("basecart_merchant_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.status(201).send({
        message: "Merchant account and store created successfully",
        tenantId,
        store: {
          storeName,
          subdomain: lowerSubdomain,
        },
        ...tokens,
      });
    }
  );

  /**
   * Merchant Login
   */
  fastify.post(
    "/auth/merchant/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const parseResult = MerchantLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const { email, password } = parseResult.data;
      const lowerEmail = email.toLowerCase();

      // Lookup user globally via GSI2
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI2",
          KeyConditionExpression: "GSI2PK = :gsi2pk AND GSI2SK = :gsi2sk",
          ExpressionAttributeValues: {
            ":gsi2pk": `USER#${lowerEmail}`,
            ":gsi2sk": "METADATA",
          },
        })
      );

      if (!result.Items || result.Items.length === 0) {
        return reply
          .status(401)
          .send({ error: "Invalid email or password" });
      }

      const userItem = result.Items[0];
      const valid = await authService.comparePassword(
        password,
        userItem.hashedPassword
      );

      if (!valid) {
        return reply
          .status(401)
          .send({ error: "Invalid email or password" });
      }

      // Extract tenantId from PK (PK = TENANT#<tenantId>)
      const tenantId = (userItem.PK as string).replace("TENANT#", "");

      const tokens = await authService.generateTokens({
        userId: userItem.userId,
        email: lowerEmail,
        role: userItem.role,
        tenantId,
        type: "merchant",
      });

      reply.setCookie("basecart_merchant_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
      });
      reply.setCookie("basecart_merchant_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({
        tenantId,
        email: lowerEmail,
        role: userItem.role,
        ...tokens,
      });
    }
  );

  /**
   * Merchant Refresh Token
   */
  fastify.post(
    "/auth/merchant/refresh",
    async (req: FastifyRequest, reply: FastifyReply) => {
      let refreshToken = req.cookies.basecart_merchant_refresh_token;
      let tenantId = req.body ? (req.body as any).tenantId : undefined;

      if (!refreshToken && req.body) {
        refreshToken = (req.body as any).refreshToken;
      }

      if (!refreshToken || !tenantId) {
        return reply
          .status(400)
          .send({ error: "refreshToken and tenantId are required" });
      }

      try {
        const tokens = await authService.refreshSession(
          refreshToken,
          tenantId
        );

        reply.setCookie("basecart_merchant_token", tokens.accessToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
        });
        reply.setCookie("basecart_merchant_refresh_token", tokens.refreshToken, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
        });

        return reply.send(tokens);
      } catch (err: any) {
        return reply.status(401).send({ error: err.message || "Invalid session" });
      }
    }
  );

  // --- Customer Auth Endpoints (Storefront-facing) ---

  /**
   * Customer Signup (Per-store scoped)
   */
  fastify.post(
    "/auth/customer/signup",
    {
      preHandler: [resolveStorefrontTenant],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // 1. Fetch store plan details
      const tenantRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );
      const plan = tenantRes.Item?.plan || "starter";
      if (plan === "starter") {
        return reply.status(403).send({
          error: "Feature locked: Customer accounts require the Growth or Pro tier. Please upgrade.",
        });
      }

      const parseResult = CustomerSignupSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const { email, password, name } = parseResult.data;
      const lowerEmail = email.toLowerCase();

      // Check unique email lookup for this tenant
      const lookupResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `CUSTOMER_EMAIL#${lowerEmail}`,
          },
        })
      );

      if (lookupResult.Item) {
        return reply
          .status(400)
          .send({ error: "Email is already registered on this store" });
      }

      const customerId = crypto.randomUUID();
      const hashedPassword = await authService.hashPassword(password);
      const createdAt = new Date().toISOString();

      // Create customer record + unique email lookup atomically
      await ddbDocClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `TENANT#${tenantId}`,
                  SK: `CUSTOMER#${customerId}`,
                  customerId,
                  email: lowerEmail,
                  hashedPassword,
                  name,
                  savedAddresses: [],
                  createdAt,
                },
              },
            },
            {
              Put: {
                TableName: TABLE_NAME,
                Item: {
                  PK: `TENANT#${tenantId}`,
                  SK: `CUSTOMER_EMAIL#${lowerEmail}`,
                  customerId,
                  createdAt,
                },
              },
            },
          ],
        })
      );

      const tokens = await authService.generateTokens({
        userId: customerId,
        email: lowerEmail,
        role: "customer",
        tenantId,
        type: "customer",
      });

      reply.setCookie("basecart_customer_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
      });
      reply.setCookie("basecart_customer_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.status(201).send({
        message: "Customer account created successfully",
        customerId,
        name,
        email: lowerEmail,
        ...tokens,
      });
    }
  );

  /**
   * Customer Login (Per-store scoped)
   */
  fastify.post(
    "/auth/customer/login",
    {
      preHandler: [resolveStorefrontTenant],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // 1. Fetch store plan details
      const tenantRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );
      const plan = tenantRes.Item?.plan || "starter";
      if (plan === "starter") {
        return reply.status(403).send({
          error: "Feature locked: Customer accounts require the Growth or Pro tier. Please upgrade.",
        });
      }

      const parseResult = CustomerLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const { email, password } = parseResult.data;
      const lowerEmail = email.toLowerCase();

      // Get lookup record first to get customerId
      const lookupResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `CUSTOMER_EMAIL#${lowerEmail}`,
          },
        })
      );

      if (!lookupResult.Item) {
        return reply
          .status(401)
          .send({ error: "Invalid email or password" });
      }

      const customerId = lookupResult.Item.customerId;

      // Get full customer profile
      const customerResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `CUSTOMER#${customerId}`,
          },
        })
      );

      const customerItem = customerResult.Item;
      if (!customerItem || !customerItem.hashedPassword) {
        return reply
          .status(401)
          .send({ error: "Invalid email or password" });
      }

      const valid = await authService.comparePassword(
        password,
        customerItem.hashedPassword
      );

      if (!valid) {
        return reply
          .status(401)
          .send({ error: "Invalid email or password" });
      }

      const tokens = await authService.generateTokens({
        userId: customerId,
        email: lowerEmail,
        role: "customer",
        tenantId,
        type: "customer",
      });

      reply.setCookie("basecart_customer_token", tokens.accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
      });
      reply.setCookie("basecart_customer_refresh_token", tokens.refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.send({
        customerId,
        name: customerItem.name,
        email: lowerEmail,
        ...tokens,
      });
    }
  );

  /**
   * Get Current Merchant Profile (Cookie authenticated)
   */
  fastify.get(
    "/auth/merchant/me",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tokens = await authService.generateTokens({
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        tenantId: req.user!.tenantId,
        type: "merchant",
      });

      return reply.send({
        tenantId: req.user!.tenantId,
        email: req.user!.email,
        role: req.user!.role,
        accessToken: tokens.accessToken,
      });
    }
  );

  /**
   * Merchant Logout
   */
  fastify.post(
    "/auth/merchant/logout",
    async (req: FastifyRequest, reply: FastifyReply) => {
      reply.clearCookie("basecart_merchant_token", { path: "/" });
      reply.clearCookie("basecart_merchant_refresh_token", { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    }
  );

  /**
   * Get Current Customer Profile (Cookie authenticated)
   */
  fastify.get(
    "/auth/customer/me",
    {
      preHandler: [resolveStorefrontTenant, authenticateCustomer],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const customerResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${req.user!.tenantId}`,
            SK: `CUSTOMER#${req.user!.userId}`,
          },
        })
      );
      const name = customerResult.Item?.name || req.user!.email.split("@")[0];

      const tokens = await authService.generateTokens({
        userId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        tenantId: req.user!.tenantId,
        type: "customer",
      });

      return reply.send({
        customerId: req.user!.userId,
        email: req.user!.email,
        role: req.user!.role,
        name,
        accessToken: tokens.accessToken,
      });
    }
  );

  /**
   * Customer Logout
   */
  fastify.post(
    "/auth/customer/logout",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      reply.clearCookie("basecart_customer_token", { path: "/" });
      reply.clearCookie("basecart_customer_refresh_token", { path: "/" });
      return reply.send({ message: "Logged out successfully" });
    }
  );
}
