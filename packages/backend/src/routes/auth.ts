import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import {
  QueryCommand,
  GetCommand,
  TransactWriteCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { ddbDocClient, sesClient } from "../lib/aws";
import { authService } from "../services/auth";
import { resolveStorefrontTenant, authenticateMerchant, authenticateCustomer } from "../middleware/auth";
import {
  MerchantSignupSchema,
  MerchantLoginSchema,
  CustomerSignupSchema,
  CustomerLoginSchema,
} from "@basecart/shared";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

async function sendEmailSafely(to: string, subject: string, htmlContent: string) {
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: "noreply@basecart.io",
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: htmlContent }
          }
        }
      })
    );
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
}

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
                  emailVerified: false,
                },
              },
            },
          ],
        })
      );

      // Generate verification token and email
      const verificationToken = crypto.randomUUID();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `VERIFY_TOKEN#${verificationToken}`,
            SK: "METADATA",
            email: lowerEmail,
            tenantId,
            expiresAt: verificationExpiry,
            ttl: verificationTtl,
          }
        })
      );
      
      const verifyLink = `http://localhost:3001/auth/merchant/verify-email?token=${verificationToken}`;
      await sendEmailSafely(
        lowerEmail,
        "Verify Your Basecart Store Account",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563EB;">Welcome to Basecart!</h2>
            <p>Thank you for signing up for ${storeName}. Please click the button below to verify your email address and unlock complete account access:</p>
            <div style="margin: 24px 0;">
              <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="font-size: 12px; color: #64748B;">This verification link will expire in 24 hours.</p>
          </div>
        `
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
        emailVerified: userItem.emailVerified !== false,
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

      const userRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${req.user!.tenantId}`,
            SK: `USER#${req.user!.email}`,
          },
        })
      );
      const emailVerified = userRes.Item?.emailVerified !== false;

      return reply.send({
        tenantId: req.user!.tenantId,
        email: req.user!.email,
        role: req.user!.role,
        emailVerified,
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

  /**
   * Merchant Forgot Password
   */
  fastify.post(
    "/auth/merchant/forgot-password",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { email } = req.body as any;
      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }
      const lowerEmail = email.toLowerCase();

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
        const userItem = userQuery.Items[0];
        const tenantId = userItem.PK.replace("TENANT#", "");

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const ttl = Math.floor(Date.now() / 1000) + 30 * 60;

        await ddbDocClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `RESET_TOKEN#${token}`,
              SK: "METADATA",
              email: lowerEmail,
              tenantId,
              type: "merchant",
              expiresAt,
              ttl,
            },
          })
        );

        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        await sendEmailSafely(
          lowerEmail,
          "Reset Your Basecart Password",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for your Basecart store account. Click the link below to set a new password:</p>
              <div style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p style="font-size: 12px; color: #64748B;">This password reset link will expire in 30 minutes. If you did not request this, you can safely ignore this email.</p>
            </div>
          `
        );
      }

      return reply.send({ message: "If the email is registered, a password reset link has been sent." });
    }
  );

  /**
   * Merchant Reset Password
   */
  fastify.post(
    "/auth/merchant/reset-password",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { token, newPassword } = req.body as any;
      if (!token || !newPassword || newPassword.length < 6) {
        return reply.status(400).send({ error: "Token and password (min 6 chars) are required" });
      }

      const tokenRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESET_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      const tokenItem = tokenRes.Item;
      if (!tokenItem || tokenItem.type !== "merchant") {
        return reply.status(400).send({ error: "Invalid or expired reset token" });
      }

      if (new Date(tokenItem.expiresAt) < new Date()) {
        return reply.status(400).send({ error: "Reset token has expired" });
      }

      const hashedPassword = await authService.hashPassword(newPassword);
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tokenItem.tenantId}`,
            SK: `USER#${tokenItem.email}`,
          },
          UpdateExpression: "SET hashedPassword = :hp",
          ExpressionAttributeValues: {
            ":hp": hashedPassword,
          },
        })
      );

      // Invalidate active sessions
      const tokensRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tokenItem.tenantId}`,
            ":sk": "REFRESH_TOKEN#",
          },
        })
      );
      const tokensToRevoke = (tokensRes.Items || []).filter(item => item.email === tokenItem.email);
      for (const item of tokensToRevoke) {
        await ddbDocClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
          })
        );
      }

      // Invalidate token
      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESET_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      return reply.send({ message: "Password has been successfully reset" });
    }
  );

  /**
   * Customer Forgot Password
   */
  fastify.post(
    "/auth/customer/forgot-password",
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
      const { email } = req.body as any;
      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }
      const lowerEmail = email.toLowerCase();

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
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        const ttl = Math.floor(Date.now() / 1000) + 30 * 60;

        await ddbDocClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `RESET_TOKEN#${token}`,
              SK: "METADATA",
              email: lowerEmail,
              tenantId,
              type: "customer",
              customerId: lookupResult.Item.customerId,
              expiresAt,
              ttl,
            },
          })
        );

        const tenantRes = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `TENANT#${tenantId}`,
              SK: "METADATA",
            },
          })
        );
        const subdomain = tenantRes.Item?.subdomain || "demo";
        const resetLink = `http://${subdomain}.localhost:3002/reset-password?token=${token}`;

        await sendEmailSafely(
          lowerEmail,
          "Reset Your Storefront Password",
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2>Reset Your Storefront Password</h2>
              <p>You requested a password reset for your account. Click the link below to set a new password:</p>
              <div style="margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p style="font-size: 12px; color: #64748B;">This password reset link will expire in 30 minutes.</p>
            </div>
          `
        );
      }

      return reply.send({ message: "If the email is registered, a password reset link has been sent." });
    }
  );

  /**
   * Customer Reset Password
   */
  fastify.post(
    "/auth/customer/reset-password",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { token, newPassword } = req.body as any;
      if (!token || !newPassword || newPassword.length < 6) {
        return reply.status(400).send({ error: "Token and password (min 6 chars) are required" });
      }

      const tokenRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESET_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      const tokenItem = tokenRes.Item;
      if (!tokenItem || tokenItem.type !== "customer" || tokenItem.tenantId !== tenantId) {
        return reply.status(400).send({ error: "Invalid or expired reset token" });
      }

      if (new Date(tokenItem.expiresAt) < new Date()) {
        return reply.status(400).send({ error: "Reset token has expired" });
      }

      const hashedPassword = await authService.hashPassword(newPassword);
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `CUSTOMER#${tokenItem.customerId}`,
          },
          UpdateExpression: "SET hashedPassword = :hp",
          ExpressionAttributeValues: {
            ":hp": hashedPassword,
          },
        })
      );

      // Invalidate customer sessions
      const tokensRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "REFRESH_TOKEN#",
          },
        })
      );
      const tokensToRevoke = (tokensRes.Items || []).filter(item => item.email === tokenItem.email);
      for (const item of tokensToRevoke) {
        await ddbDocClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
          })
        );
      }

      // Clean up token
      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `RESET_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      return reply.send({ message: "Password has been successfully reset" });
    }
  );

  /**
   * Resend Verification Email (Merchant-only)
   */
  fastify.post(
    "/auth/merchant/resend-verification",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const email = req.user!.email;
      const tenantId = req.user!.tenantId;

      const userRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `USER#${email}`,
          },
        })
      );
      if (!userRes.Item) {
        return reply.status(404).send({ error: "User not found" });
      }

      if (userRes.Item.emailVerified === true) {
        return reply.status(400).send({ error: "Email is already verified" });
      }

      const verificationToken = crypto.randomUUID();
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const verificationTtl = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `VERIFY_TOKEN#${verificationToken}`,
            SK: "METADATA",
            email,
            tenantId,
            expiresAt: verificationExpiry,
            ttl: verificationTtl,
          }
        })
      );

      const verifyLink = `http://localhost:3001/auth/merchant/verify-email?token=${verificationToken}`;
      await sendEmailSafely(
        email,
        "Verify Your Basecart Store Account",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563EB;">Verify Your Basecart Email</h2>
            <p>Please click the button below to verify your email address:</p>
            <div style="margin: 24px 0;">
              <a href="${verifyLink}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="font-size: 12px; color: #64748B;">This verification link will expire in 24 hours.</p>
          </div>
        `
      );

      return reply.send({ message: "Verification email resent successfully" });
    }
  );

  /**
   * Verify Email
   */
  fastify.get(
    "/auth/merchant/verify-email",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const token = (req.query as any).token;
      if (!token) {
        return reply.status(400).send({ error: "Token is required" });
      }

      const tokenRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `VERIFY_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      const tokenItem = tokenRes.Item;
      if (!tokenItem) {
        return reply.status(400).send({ error: "Invalid or expired token" });
      }

      if (new Date(tokenItem.expiresAt) < new Date()) {
        return reply.status(400).send({ error: "Token has expired" });
      }

      // Mark user as verified
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tokenItem.tenantId}`,
            SK: `USER#${tokenItem.email}`,
          },
          UpdateExpression: "SET emailVerified = :val",
          ExpressionAttributeValues: {
            ":val": true,
          },
        })
      );

      // Clean up token
      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `VERIFY_TOKEN#${token}`,
            SK: "METADATA",
          },
        })
      );

      // Redirect back to merchant dashboard
      return reply.redirect("http://localhost:3000/?verified=true");
    }
  );
}
