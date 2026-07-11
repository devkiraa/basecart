import { FastifyRequest, FastifyReply } from "fastify";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authService, TokenPayload } from "../services/auth";
import { getTenantBySubdomain } from "../services/tenant";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

// Extend Fastify types
declare module "fastify" {
  interface FastifyRequest {
    tenantId?: string;
    user?: TokenPayload;
  }
}

/**
 * Authenticate merchant request
 */
export async function authenticateMerchant(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let token = req.cookies.basecart_merchant_token;
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

    if (payload.type !== "merchant") {
      return reply
        .status(403)
        .send({ error: "Forbidden: Not a merchant session" });
    }

    // Verify store suspension
    const tenantRes = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${payload.tenantId}`,
          SK: "METADATA",
        },
      })
    );
    if (tenantRes.Item?.status === "suspended") {
      return reply.status(403).send({ error: "Store Suspended: This merchant account has been suspended" });
    }

    req.user = payload;
    req.tenantId = payload.tenantId;
  } catch (error: any) {
    return reply.status(401).send({ error: error.message || "Unauthorized" });
  }
}

/**
 * Authenticate customer request
 */
export async function authenticateCustomer(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    let token = req.cookies.basecart_customer_token;
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

    if (payload.type !== "customer") {
      return reply
        .status(403)
        .send({ error: "Forbidden: Not a customer session" });
    }

    req.user = payload;
    req.tenantId = payload.tenantId;
  } catch (error: any) {
    return reply.status(401).send({ error: error.message || "Unauthorized" });
  }
}

/**
 * Resolves tenant details based on URL subdomain parameters, Host header, or a custom header
 */
export async function resolveStorefrontTenant(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let subdomain = (req.params as any).subdomain;

  if (!subdomain) {
    // Attempt to extract from host header
    const host = req.headers.host || "";
    const parts = host.split(".");
    if (parts.length >= 2) {
      const sub = parts[0];
      // Skip standard root domains or dev domains
      if (
        sub &&
        sub !== "localhost" &&
        sub !== "www" &&
        sub !== "dashboard" &&
        sub !== "storefront"
      ) {
        subdomain = sub;
      }
    }
  }

  if (!subdomain) {
    // Fallback check: Custom header for easy API/integration testing
    subdomain = req.headers["x-subdomain"] as string;
  }

  if (!subdomain) {
    return reply
      .status(400)
      .send({ error: "Bad Request: Subdomain is required" });
  }

  const tenant = await getTenantBySubdomain(subdomain);
  if (!tenant) {
    return reply.status(404).send({ error: `Store "${subdomain}" not found` });
  }

  if (tenant.status === "suspended") {
    return reply.status(403).send({ error: "Store Suspended: This store has been suspended by platform administrators" });
  }

  req.tenantId = tenant.tenantId;
}
