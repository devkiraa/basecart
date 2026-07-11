import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ddbDocClient, s3Client } from "../lib/aws";
import { authenticateMerchant, resolveStorefrontTenant } from "../middleware/auth";
import { ProductSchema } from "@basecart/shared";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";
const S3_BUCKET = process.env.S3_BUCKET || "basecart-media-bucket";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates image magic bytes (file signature) to ensure true file type
 */
function validateMagicBytes(headerHex: string, mimeType: string): boolean {
  const hex = headerHex.toLowerCase().replace(/\s+/g, "");

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return hex.startsWith("ffd8ff");
  }
  if (mimeType === "image/png") {
    return hex.startsWith("89504e470d0a1a0a");
  }
  if (mimeType === "image/gif") {
    return hex.startsWith("47494638");
  }
  if (mimeType === "image/webp") {
    // RIFF (52494646) and WEBP (57454250)
    return hex.startsWith("52494646") && hex.substring(16, 24) === "57454250";
  }
  return false;
}

async function validateSkuUniqueness(
  tenantId: string,
  currentProductId: string | null,
  payload: any
): Promise<string | null> {
  const result = await ddbDocClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `TENANT#${tenantId}`,
        ":sk": "PRODUCT#",
      },
    })
  );

  const existingProducts = result.Items || [];
  const usedSkus = new Set<string>();

  for (const prod of existingProducts) {
    if (currentProductId && prod.productId === currentProductId) {
      continue;
    }

    if (prod.sku && prod.sku.trim() !== "") {
      usedSkus.add(prod.sku.trim().toLowerCase());
    }

    if (Array.isArray(prod.variants)) {
      for (const variant of prod.variants) {
        if (variant.sku && variant.sku.trim() !== "") {
          usedSkus.add(variant.sku.trim().toLowerCase());
        }
      }
    }
  }

  // Check the payload itself
  const payloadSkus = new Set<string>();

  if (payload.sku && payload.sku.trim() !== "") {
    const s = payload.sku.trim().toLowerCase();
    if (usedSkus.has(s)) {
      return `SKU "${payload.sku}" is already in use by another product.`;
    }
    payloadSkus.add(s);
  }

  if (Array.isArray(payload.variants)) {
    for (const variant of payload.variants) {
      if (variant.sku && variant.sku.trim() !== "") {
        const s = variant.sku.trim().toLowerCase();
        if (usedSkus.has(s)) {
          return `SKU "${variant.sku}" is already in use by another variant or product.`;
        }
        if (payloadSkus.has(s)) {
          return `Duplicate SKU "${variant.sku}" specified within the same product configuration.`;
        }
        payloadSkus.add(s);
      }
    }
  }

  return null;
}

export async function productRoutes(fastify: FastifyInstance) {
  // --- Merchant Admin Endpoints ---

  /**
   * Create Product
   */
  fastify.post(
    "/products",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const parseResult = ProductSchema.safeParse(req.body);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const productData = parseResult.data;

      // Validate SKU uniqueness per tenant
      const skuError = await validateSkuUniqueness(tenantId, null, productData);
      if (skuError) {
        return reply.status(400).send({ error: skuError });
      }

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

      // 2. Count existing products
      const countRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "PRODUCT#",
          },
          Select: "COUNT",
        })
      );
      const count = countRes.Count || 0;

      // 3. Enforce plan limit
      if (plan === "starter" && count >= 50) {
        return reply.status(403).send({
          error: "Plan limit reached: Starter tier allows a maximum of 50 products. Please upgrade your plan.",
        });
      }
      if (plan === "growth" && count >= 500) {
        return reply.status(403).send({
          error: "Plan limit reached: Growth tier allows a maximum of 500 products. Please upgrade your plan.",
        });
      }

      const productId = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const item = {
        PK: `TENANT#${tenantId}`,
        SK: `PRODUCT#${productId}`,
        GSI1PK: `TENANT#${tenantId}`,
        GSI1SK: `PRODUCT#${productData.status}#${createdAt}`,
        productId,
        ...productData,
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
   * List Products (Merchant-only)
   */
  fastify.get(
    "/products",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "PRODUCT#",
          },
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Get Product (Merchant-only)
   */
  fastify.get(
    "/products/:id",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const productId = (req.params as any).id;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
          },
        })
      );

      if (!result.Item) {
        return reply.status(404).send({ error: "Product not found" });
      }

      return reply.send(result.Item);
    }
  );

  /**
   * Update Product
   */
  fastify.patch(
    "/products/:id",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const productId = (req.params as any).id;

      const parseResult = ProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const productData = parseResult.data;

      // Verify the product exists first
      const current = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
          },
        })
      );

      if (!current.Item) {
        return reply.status(404).send({ error: "Product not found" });
      }

      const createdAt = current.Item.createdAt;

      // Validate SKU uniqueness per tenant
      const skuError = await validateSkuUniqueness(tenantId, productId, productData);
      if (skuError) {
        return reply.status(400).send({ error: skuError });
      }

      // Update in DB
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
            GSI1PK: `TENANT#${tenantId}`,
            GSI1SK: `PRODUCT#${productData.status}#${createdAt}`,
            productId,
            ...productData,
            createdAt,
          },
        })
      );

      return reply.send({ message: "Product updated successfully" });
    }
  );

  /**
   * Delete Product
   */
  fastify.delete(
    "/products/:id",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const productId = (req.params as any).id;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
          },
        })
      );

      if (!result.Item) {
        return reply.status(404).send({ error: "Product not found" });
      }

      await ddbDocClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
          },
        })
      );

      return reply.send({ message: "Product deleted successfully" });
    }
  );

  /**
   * Generate S3 Presigned Upload URL after validating magic bytes and size
   */
  fastify.post(
    "/products/:id/upload-image",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const productId = (req.params as any).id;

      const { fileName, contentType, fileSize, headerHex } = req.body as any;

      if (!fileName || !contentType || !fileSize || !headerHex) {
        return reply.status(400).send({
          error:
            "Missing parameters: fileName, contentType, fileSize, headerHex are required",
        });
      }

      // 1. Enforce size limit
      if (fileSize > MAX_FILE_SIZE) {
        return reply.status(400).send({
          error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        });
      }

      // 2. Validate MIME type
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(contentType)) {
        return reply.status(400).send({
          error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
        });
      }

      // 3. Validate Magic Bytes (File Signatures)
      if (!validateMagicBytes(headerHex, contentType)) {
        return reply.status(400).send({
          error: "Security Check Failed: File header does not match expected image magic bytes",
        });
      }

      // 4. Create S3 path key
      const fileId = crypto.randomBytes(8).toString("hex");
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `tenants/${tenantId}/products/${productId}/${fileId}-${cleanFileName}`;

      // 5. Generate Presigned Upload URL (PUT method)
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      try {
        const uploadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 300, // 5 minutes
        });

        // 6. Build the public/GET image URL
        let imageUrl = "";
        if (
          process.env.NODE_ENV === "development" ||
          process.env.AWS_ENDPOINT_URL
        ) {
          const s3Endpoint =
            process.env.AWS_ENDPOINT_URL || "http://localhost:4566";
          imageUrl = `${s3Endpoint}/${S3_BUCKET}/${key}`;
        } else {
          imageUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        }

        return reply.send({ uploadUrl, imageUrl });
      } catch (err: any) {
        console.error("Failed to generate presigned S3 URL:", err);
        return reply
          .status(500)
          .send({ error: "Failed to generate upload credentials" });
      }
    }
  );

  // --- Storefront Public Endpoints ---

  /**
   * List Active Products (Storefront public)
   */
  fastify.get(
    "/store/:subdomain/products",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // Query products by GSI1 sorted by status/creation date
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)",
          ExpressionAttributeValues: {
            ":gsi1pk": `TENANT#${tenantId}`,
            ":gsi1sk": "PRODUCT#active#",
          },
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Get Product detail (Storefront public)
   */
  fastify.get(
    "/store/:subdomain/products/:id",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const productId = (req.params as any).id;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `PRODUCT#${productId}`,
          },
        })
      );

      const product = result.Item;
      if (!product || product.status !== "active") {
        return reply.status(404).send({ error: "Product not found or unavailable" });
      }

      return reply.send(product);
    }
  );
}
