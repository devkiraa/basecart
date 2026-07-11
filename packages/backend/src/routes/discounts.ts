import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { DiscountCodeSchema } from "@basecart/shared";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

/**
 * Validates a discount code against current rules and computes the discount amount.
 */
export async function validateDiscountCode(
  tenantId: string,
  code: string,
  cartTotal: number
): Promise<{
  valid: boolean;
  reason?: string;
  discountAmount?: number;
  code?: string;
  type?: "percentage" | "flat";
  value?: number;
}> {
  const result = await ddbDocClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `TENANT#${tenantId}`,
        SK: `DISCOUNT#${code.toUpperCase()}`,
      },
    })
  );

  const discount = result.Item;
  if (!discount || !discount.active) {
    return { valid: false, reason: "Discount code is invalid or inactive" };
  }

  // Check expiration
  if (discount.expiry) {
    const expiryDate = new Date(discount.expiry);
    if (expiryDate.getTime() < Date.now()) {
      return { valid: false, reason: "Discount code has expired" };
    }
  }

  // Check minimum order amount
  if (discount.minOrderAmount && cartTotal < discount.minOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ₹${discount.minOrderAmount} is required`,
    };
  }

  // Check usage limit
  if (discount.usageLimit !== undefined && discount.usageLimit !== null) {
    const usageCount = discount.usageCount || 0;
    if (usageCount >= discount.usageLimit) {
      return { valid: false, reason: "Discount code usage limit reached" };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = Math.floor((cartTotal * discount.value) / 100);
  } else if (discount.type === "flat") {
    discountAmount = discount.value;
  }

  // Discount amount cannot exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal);

  return {
    valid: true,
    discountAmount,
    code: discount.code,
    type: discount.type,
    value: discount.value,
  };
}

export async function discountRoutes(fastify: FastifyInstance) {
  // --- Merchant Admin Endpoints ---

  /**
   * Create Discount Code
   */
  fastify.post(
    "/discounts",
    { preHandler: [authenticateMerchant] },
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
          error: "Feature locked: Discount codes require the Growth or Pro tier. Please upgrade.",
        });
      }

      const parseResult = DiscountCodeSchema.safeParse(req.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const discountData = parseResult.data;
      const codeUpper = discountData.code.toUpperCase();
      const createdAt = new Date().toISOString();

      // Check if code already exists
      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `DISCOUNT#${codeUpper}`,
          },
        })
      );

      if (existing.Item) {
        return reply
          .status(400)
          .send({ error: "Discount code already exists for this store" });
      }

      const item = {
        PK: `TENANT#${tenantId}`,
        SK: `DISCOUNT#${codeUpper}`,
        code: codeUpper,
        type: discountData.type,
        value: discountData.value,
        minOrderAmount: discountData.minOrderAmount,
        usageLimit: discountData.usageLimit,
        expiry: discountData.expiry,
        active: discountData.active,
        usageCount: 0,
        createdAt,
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );

      return reply.status(201).send(item);
    }
  );

  /**
   * List Discount Codes
   */
  fastify.get(
    "/discounts",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "DISCOUNT#",
          },
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Update Discount Code
   */
  fastify.patch(
    "/discounts/:code",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const code = (req.params as any).code.toUpperCase();

      const parseResult = DiscountCodeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const discountData = parseResult.data;

      // Verify it exists
      const existing = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `DISCOUNT#${code}`,
          },
        })
      );

      if (!existing.Item) {
        return reply.status(404).send({ error: "Discount code not found" });
      }

      const updatedItem = {
        ...existing.Item,
        type: discountData.type,
        value: discountData.value,
        minOrderAmount: discountData.minOrderAmount,
        usageLimit: discountData.usageLimit,
        expiry: discountData.expiry,
        active: discountData.active,
      };

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updatedItem,
        })
      );

      return reply.send({ message: "Discount code updated successfully" });
    }
  );

  /**
   * Delete Discount Code
   */
  fastify.delete(
    "/discounts/:code",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const code = (req.params as any).code.toUpperCase();

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `DISCOUNT#${code}`,
          },
        })
      );

      if (!result.Item) {
        return reply.status(404).send({ error: "Discount code not found" });
      }

      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `DISCOUNT#${code}`,
          },
        })
      );

      return reply.send({ message: "Discount code deleted successfully" });
    }
  );

  // --- Storefront Public Endpoints ---

  /**
   * Validate Discount Code (Storefront public)
   */
  fastify.post(
    "/store/:subdomain/discounts/validate",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { code, cartTotal } = req.body as any;

      if (!code || cartTotal === undefined) {
        return reply
          .status(400)
          .send({ error: "code and cartTotal are required" });
      }

      const validation = await validateDiscountCode(
        tenantId,
        code,
        Number(cartTotal)
      );

      if (!validation.valid) {
        return reply.status(200).send(validation);
      }

      return reply.send(validation);
    }
  );
}
