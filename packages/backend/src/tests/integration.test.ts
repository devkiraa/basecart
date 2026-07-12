import { beforeAll, describe, expect, it, vi } from "vitest";
import crypto from "crypto";
import { ScanCommand, DeleteCommand, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { buildApp } from "../app";
import { ddbDocClient, sqsClient } from "../lib/aws";
import { validateDiscountCode } from "../routes/discounts";
import { encrypt, decrypt } from "../lib/crypto";

// Mock KMS Client behavior for tests (Task 5)
vi.mock("@aws-sdk/client-kms", async (importOriginal) => {
  const original = await importOriginal<typeof import("@aws-sdk/client-kms")>();
  return {
    ...original,
    KMSClient: class MockKMSClient {
      async send(command: any) {
        if (command.constructor.name === "EncryptCommand") {
          const plaintext = command.input.Plaintext;
          const text = Buffer.from(plaintext).toString("utf8");
          return {
            CiphertextBlob: Buffer.from(`mock-kms-encrypted:${text}`),
          };
        }
        if (command.constructor.name === "DecryptCommand") {
          const ciphertext = Buffer.from(command.input.CiphertextBlob).toString("utf8");
          const text = ciphertext.replace("mock-kms-encrypted:", "");
          return {
            Plaintext: Buffer.from(text, "utf8"),
          };
        }
        throw new Error(`MockKMSClient unhandled command: ${command.constructor.name}`);
      }
    }
  };
});

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

// Helper to clear DynamoDB between test segments
async function clearTable() {
  try {
    const scan = await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    if (scan.Items) {
      for (const item of scan.Items) {
        await ddbDocClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: item.PK,
              SK: item.SK,
            },
          })
        );
      }
    }
  } catch (error) {
    console.error("Error clearing DynamoDB table for tests:", error);
  }
}

describe("Basecart Integration Tests", () => {
  const app = buildApp();

  let tokenA = "";
  let tenantIdA = "";
  let subdomainA = "mystore-a";
  let adminToken = "";

  let tokenB = "";
  let tenantIdB = "";
  let subdomainB = "mystore-b";
  let productId = "";

  beforeAll(async () => {
    // Empty the local DB table to ensure consistent test inputs
    await clearTable();

    // 1. Sign up Tenant A
    const resA = await app.inject({
      method: "POST",
      url: "/auth/merchant/signup",
      payload: {
        email: "merchant.a@test.com",
        password: "password123",
        storeName: "Store A",
        subdomain: subdomainA,
      },
    });
    expect(resA.statusCode).toBe(201);
    expect(resA.cookies).toBeDefined();
    const cookieA = resA.cookies.find((c) => c.name === "basecart_merchant_token");
    expect(cookieA).toBeDefined();
    expect(cookieA?.httpOnly).toBe(true);

    const bodyA = JSON.parse(resA.body);
    tokenA = bodyA.accessToken;
    tenantIdA = bodyA.tenantId;

    // 2. Sign up Tenant B
    const resB = await app.inject({
      method: "POST",
      url: "/auth/merchant/signup",
      payload: {
        email: "merchant.b@test.com",
        password: "password123",
        storeName: "Store B",
        subdomain: subdomainB,
      },
    });
    expect(resB.statusCode).toBe(201);
    expect(resB.cookies).toBeDefined();
    const cookieB = resB.cookies.find((c) => c.name === "basecart_merchant_token");
    expect(cookieB).toBeDefined();
    expect(cookieB?.httpOnly).toBe(true);

    const bodyB = JSON.parse(resB.body);
    tokenB = bodyB.accessToken;
    tenantIdB = bodyB.tenantId;

    // Mark test merchant accounts as verified to prevent settings config locks in existing tests
    await Promise.all([
      ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: `USER#merchant.a@test.com` },
          UpdateExpression: "SET emailVerified = :ev",
          ExpressionAttributeValues: { ":ev": true }
        })
      ),
      ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdB}`, SK: `USER#merchant.b@test.com` },
          UpdateExpression: "SET emailVerified = :ev",
          ExpressionAttributeValues: { ":ev": true }
        })
      )
    ]);
  });

  describe("1. Tenant Isolation", () => {
    let productIdA = "";

    it("should allow Tenant A to create a product successfully", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/products",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Tenant A Shirt",
          price: 500,
          stockQuantity: 20,
          status: "active",
          category: "Clothing",
          images: ["https://example.com/shirt.jpg"],
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      productIdA = body.productId;
      expect(productIdA).toBeDefined();
    });

    it("should prevent Tenant B from reading Tenant A's product", async () => {
      const res = await app.inject({
        method: "GET",
        url: `/products/${productIdA}`,
        headers: { Authorization: `Bearer ${tokenB}` },
      });

      // Assert isolation returns 404 (Resource not found in Tenant B's partition key)
      expect(res.statusCode).toBe(404);
    });

    it("should prevent Tenant B from updating Tenant A's product", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/products/${productIdA}`,
        headers: { Authorization: `Bearer ${tokenB}` },
        payload: {
          name: "Hacked Shirt",
          price: 1,
          stockQuantity: 100,
          status: "active",
          category: "Clothing",
          images: ["https://example.com/shirt.jpg"],
        },
      });

      expect(res.statusCode).toBe(404);
    });

    it("should prevent Tenant B from deleting Tenant A's product", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: `/products/${productIdA}`,
        headers: { Authorization: `Bearer ${tokenB}` },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("2. Price Tampering Prevention", () => {

    beforeAll(async () => {
      // Create product under Tenant A
      const res = await app.inject({
        method: "POST",
        url: "/products",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Premium Watch",
          price: 1500,
          stockQuantity: 10,
          status: "active",
          category: "Clothing",
          images: ["https://example.com/watch.jpg"],
        },
      });
      productId = JSON.parse(res.body).productId;

      // Mock the Razorpay credentials for Tenant A in DB so checkouts work
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "METADATA",
            GSI1PK: `SUBDOMAIN#${subdomainA}`,
            GSI1SK: "METADATA",
            storeName: "Store A",
            subdomain: subdomainA,
            razorpayKeyId: await encrypt("mock-key"),
            razorpaySecret: await encrypt("mock-secret"),
            createdAt: new Date().toISOString(),
          },
        })
      );
    });

    it("should ignore client-supplied pricing totals and calculate cart prices server-side", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/checkout`,
        payload: {
          customerName: "Kiran G",
          customerEmail: "kiran@basecart.io",
          shippingAddress: {
            addressLine1: "123 Main St",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560001",
          },
          lineItems: [{ productId, quantity: 2 }],
          idempotencyKey: crypto.randomUUID(),
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);

      // Total must be recalculated server side: 1500 * 2 = 3000
      expect(body.amount).toBe(3000);

      // Verify the order record saved in DynamoDB is also 3000
      const orderRecord = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantIdA}`,
            SK: `ORDER#${body.orderId}`,
          },
        })
      );

      expect(orderRecord.Item).toBeDefined();
      expect(orderRecord.Item?.total).toBe(3000);
    });

    it("should handle duplicate checkouts atomically and avoid duplicate order creations", async () => {
      const key = crypto.randomUUID();
      const payload = {
        customerName: "Duplicate Test",
        customerEmail: "dup@basecart.io",
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
        },
        lineItems: [{ productId, quantity: 1 }],
        idempotencyKey: key,
      };

      // 1. First request
      const res1 = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/checkout`,
        payload,
      });
      expect(res1.statusCode).toBe(200);

      // 2. Immediate duplicate request
      const res2 = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/checkout`,
        payload,
      });

      // The duplicate must return 200 with the cached response
      expect(res2.statusCode).toBe(200);
      const body1 = JSON.parse(res1.body);
      const body2 = JSON.parse(res2.body);
      expect(body1.orderId).toBe(body2.orderId);
    });

    it("should prevent concurrent duplicate checkouts with 409 Conflict or return cached response", async () => {
      const key = crypto.randomUUID();
      const payload = {
        customerName: "Concurrent Test",
        customerEmail: "concurrent@basecart.io",
        shippingAddress: {
          addressLine1: "123 Main St",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
        },
        lineItems: [{ productId, quantity: 1 }],
        idempotencyKey: key,
      };

      const [res1, res2] = await Promise.all([
        app.inject({
          method: "POST",
          url: `/store/${subdomainA}/checkout`,
          payload,
        }),
        app.inject({
          method: "POST",
          url: `/store/${subdomainA}/checkout`,
          payload,
        }),
      ]);

      const codes = [res1.statusCode, res2.statusCode];
      expect(codes).toContain(200);
      expect(codes.every(c => c === 200 || c === 409)).toBe(true);
    });
  });

  describe("3. Webhook Signature Validation", () => {
    it("should reject unsigned or invalid signature Razorpay webhooks", async () => {
      const res = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/webhooks/razorpay`,
        headers: {
          "x-razorpay-signature": "garbage-sig",
        },
        payload: {
          event: "order.paid",
          payload: {
            payment: {
              entity: {
                id: "pay_xyz",
                order_id: "order_mock_abc",
              },
            },
          },
        },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toContain("signature verification failed");
    });
  });

  describe("4. Discount Code Rules & Edge Cases", () => {
    it("should calculate correct discount amounts and respect minOrderAmount and limits", async () => {
      // 1. Setup a flat ₹50 discount code with min order ₹200
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "DISCOUNT#SAVE50",
            code: "SAVE50",
            type: "flat",
            value: 50,
            minOrderAmount: 200,
            usageLimit: 5,
            usageCount: 0,
            active: true,
          },
        })
      );

      // Test valid code
      let result = await validateDiscountCode(tenantIdA, "SAVE50", 300);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(50);

      // Test min order amount unmet (order total 150 < min 200)
      result = await validateDiscountCode(tenantIdA, "SAVE50", 150);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Minimum order amount");

      // Test inactive code
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "DISCOUNT#SAVE50",
            code: "SAVE50",
            type: "flat",
            value: 50,
            minOrderAmount: 200,
            usageLimit: 5,
            usageCount: 0,
            active: false, // inactive!
          },
        })
      );
      result = await validateDiscountCode(tenantIdA, "SAVE50", 300);
      expect(result.valid).toBe(false);

      // Test expired code
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "DISCOUNT#SAVE50",
            code: "SAVE50",
            type: "flat",
            value: 50,
            minOrderAmount: 200,
            expiry: pastDate.toISOString(),
            active: true,
          },
        })
      );
      result = await validateDiscountCode(tenantIdA, "SAVE50", 300);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("expired");

      // Test usage limit reached
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "DISCOUNT#SAVE50",
            code: "SAVE50",
            type: "flat",
            value: 50,
            minOrderAmount: 200,
            usageLimit: 5,
            usageCount: 5, // Limit reached!
            active: true,
          },
        })
      );
      result = await validateDiscountCode(tenantIdA, "SAVE50", 300);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("usage limit");
    });
  });

  describe("5. Billing Plan Tier Enforcement", () => {
    it("should restrict discount code creation on Starter tier, but allow on Growth tier", async () => {
      // 1. Attempt to create a discount code. By default tenantIdA starts on "starter" plan.
      const res1 = await app.inject({
        method: "POST",
        url: "/discounts",
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
        payload: {
          code: "STARTER10",
          type: "percentage",
          value: 10,
          active: true,
        },
      });
      expect(res1.statusCode).toBe(403);
      expect(JSON.parse(res1.body).error).toContain("Feature locked");

      // 2. Temporarily upgrade store to "growth" in DynamoDB
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "METADATA",
            GSI1PK: `SUBDOMAIN#${subdomainA}`,
            GSI1SK: "METADATA",
            storeName: "Store A",
            subdomain: subdomainA,
            plan: "growth",
            createdAt: new Date().toISOString(),
          },
        })
      );

      // 3. Re-attempt to create the discount code under Growth plan
      const res2 = await app.inject({
        method: "POST",
        url: "/discounts",
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
        payload: {
          code: "GROWTH10",
          type: "percentage",
          value: 10,
          active: true,
        },
      });
      expect(res2.statusCode).toBe(201);
    });

    it("should restrict customer signup/login on Starter tier, but allow on Growth tier", async () => {
      // 1. Revert store to "starter" plan in DynamoDB
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "METADATA",
            GSI1PK: `SUBDOMAIN#${subdomainA}`,
            GSI1SK: "METADATA",
            storeName: "Store A",
            subdomain: subdomainA,
            plan: "starter",
            createdAt: new Date().toISOString(),
          },
        })
      );

      // 2. Attempt customer signup
      const res1 = await app.inject({
        method: "POST",
        url: "/auth/customer/signup",
        headers: {
          "x-subdomain": subdomainA,
        },
        payload: {
          email: "customer@test.com",
          password: "password123",
          name: "Test Customer",
        },
      });
      expect(res1.statusCode).toBe(403);
      expect(JSON.parse(res1.body).error).toContain("Feature locked");

      // 3. Upgrade back to "growth"
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `TENANT#${tenantIdA}`,
            SK: "METADATA",
            GSI1PK: `SUBDOMAIN#${subdomainA}`,
            GSI1SK: "METADATA",
            storeName: "Store A",
            subdomain: subdomainA,
            plan: "growth",
            createdAt: new Date().toISOString(),
          },
        })
      );

      // 4. Try customer signup again
      const res2 = await app.inject({
        method: "POST",
        url: "/auth/customer/signup",
        headers: {
          "x-subdomain": subdomainA,
        },
        payload: {
          email: "customer@test.com",
          password: "password123",
          name: "Test Customer",
        },
      });
      expect(res2.statusCode).toBe(201);
    });
  });

  describe("6. Super-Admin Console & Store Suspension", () => {

    it("should allow registering a new super-admin and logging in", async () => {
      // 1. Signup admin
      const res1 = await app.inject({
        method: "POST",
        url: "/admin/auth/signup",
        payload: {
          email: "superadmin@basecart.io",
          password: "adminpassword",
        },
      });
      expect(res1.statusCode).toBe(201);
      const body1 = JSON.parse(res1.body);
      expect(body1.role).toBe("admin");
      expect(body1.accessToken).toBeDefined();

      // 2. Login admin
      const res2 = await app.inject({
        method: "POST",
        url: "/admin/auth/login",
        payload: {
          email: "superadmin@basecart.io",
          password: "adminpassword",
        },
      });
      expect(res2.statusCode).toBe(200);
      const body2 = JSON.parse(res2.body);
      expect(body2.role).toBe("admin");
      adminToken = body2.accessToken;
      expect(adminToken).toBeDefined();
    });

    it("should prevent duplicate admin registrations and verify admin/auth/me session state", async () => {
      // Attempt to register a second admin (should fail with 403)
      const signupRes = await app.inject({
        method: "POST",
        url: "/admin/auth/signup",
        payload: {
          email: "anotheradmin@basecart.io",
          password: "adminpassword2",
        },
      });
      expect(signupRes.statusCode).toBe(403);
      expect(JSON.parse(signupRes.body).error).toContain("disabled");

      // Verify /admin/auth/me returns the active session profile
      const meRes = await app.inject({
        method: "GET",
        url: "/admin/auth/me",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(meRes.statusCode).toBe(200);
      const meBody = JSON.parse(meRes.body);
      expect(meBody.email).toBe("superadmin@basecart.io");
      expect(meBody.role).toBe("admin");
    });

    it("should allow listing merchants and loading metrics", async () => {
      const res1 = await app.inject({
        method: "GET",
        url: "/admin/merchants",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(res1.statusCode).toBe(200);
      const merchants = JSON.parse(res1.body);
      expect(merchants.length).toBeGreaterThan(0);
      expect(merchants.some((m: any) => m.subdomain === subdomainA)).toBe(true);

      const res2 = await app.inject({
        method: "GET",
        url: "/admin/metrics",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(res2.statusCode).toBe(200);
      const metrics = JSON.parse(res2.body);
      expect(metrics.totalMerchants).toBeDefined();
      expect(metrics.estimatedMRR).toBeDefined();
      expect(metrics.totalGMV).toBeDefined();
    });

    it("should suspend a merchant store, block checkout and admin access, and reactivate successfully", async () => {
      // 1. Suspend the merchant
      const suspendRes = await app.inject({
        method: "PATCH",
        url: `/admin/merchants/${tenantIdA}/status`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: "suspended",
        },
      });
      expect(suspendRes.statusCode).toBe(200);

      // 2. Attempt storefront checkout (should fail with 403 Suspended)
      const checkoutRes = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/checkout`,
        payload: {
          customerName: "Kiran G",
          customerEmail: "kiran@basecart.io",
          shippingAddress: {
            addressLine1: "123 Main St",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560001",
          },
          lineItems: [{ productId, quantity: 1 }],
          idempotencyKey: crypto.randomUUID(),
        },
      });
      expect(checkoutRes.statusCode).toBe(403);
      expect(JSON.parse(checkoutRes.body).error).toContain("Store Suspended");

      // 3. Attempt merchant dashboard request (should fail with 403 Suspended)
      const dashboardRes = await app.inject({
        method: "GET",
        url: "/products",
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });
      expect(dashboardRes.statusCode).toBe(403);
      expect(JSON.parse(dashboardRes.body).error).toContain("Store Suspended");

      // 4. Verify audit log was recorded
      const logsRes = await app.inject({
        method: "GET",
        url: "/admin/audit-logs",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      expect(logsRes.statusCode).toBe(200);
      const logs = JSON.parse(logsRes.body);
      expect(logs.some((l: any) => l.action === "suspend_store" && l.targetTenantId === tenantIdA)).toBe(true);

      // 5. Reactivate the merchant
      const activateRes = await app.inject({
        method: "PATCH",
        url: `/admin/merchants/${tenantIdA}/status`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: "active",
        },
      });
      expect(activateRes.statusCode).toBe(200);

      // 6. Confirm merchant request succeeds again
      const dashboardRes2 = await app.inject({
        method: "GET",
        url: "/products",
        headers: {
          Authorization: `Bearer ${tokenA}`,
        },
      });
      expect(dashboardRes2.statusCode).toBe(200);
    });
  });

  describe("5. AWS KMS Integration & Production Hardening", () => {
    it("should encrypt and decrypt Razorpay credentials correctly via KMS", async () => {
      const secret = "super-secret-razorpay-credential-key-12345";
      const encrypted = await encrypt(secret);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(secret);

      const decrypted = await decrypt(encrypted);
      expect(decrypted).toBe(secret);
    });

    it("should fail loudly in production if process.env.KMS_KEY_ID is missing", async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalKmsKeyId = process.env.KMS_KEY_ID;

      try {
        process.env.NODE_ENV = "production";
        delete process.env.KMS_KEY_ID;

        await expect(encrypt("test")).rejects.toThrow("KMS_KEY_ID is missing");
        await expect(decrypt("test")).rejects.toThrow("KMS_KEY_ID is missing");
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
        process.env.KMS_KEY_ID = originalKmsKeyId;
      }
    });
  });

  describe("6. Paid Add-Ons Integration", () => {
    let orderIdGst = "";

    it("should generate a GST invoice, upload to S3, and attach to confirmation email when gst_invoice is enabled", async () => {
      // 1. Configure GST settings & enable add-on
      const patchRes = await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "Store A GST",
          gstin: "29AAAAA1111A1Z1",
          registeredBusinessName: "Store A Legal",
          registeredBusinessAddress: "123 Main St, Bangalore, Karnataka",
          registeredState: "Karnataka",
          addOns: ["gst_invoice"],
          razorpayKey: "mock-key",
          razorpaySecret: "mock-secret",
        },
      });
      expect(patchRes.statusCode).toBe(200);

      // 2. Setup spy to automatically execute SQS queue jobs in-memory
      const { handler: sqsHandler } = await import("../sqs");
      const sqsSpy = vi.spyOn(sqsClient, "send").mockImplementation(async (command: any) => {
        if (command.constructor.name === "SendMessageCommand") {
          const body = command.input.MessageBody;
          await sqsHandler(
            {
              Records: [
                {
                  messageId: "mock-msg-id",
                  receiptHandle: "mock-handle",
                  body,
                  attributes: {} as any,
                  messageAttributes: {},
                  md5OfBody: "mock-md5",
                  eventSource: "aws:sqs",
                  eventSourceARN: "mock-arn",
                  awsRegion: "us-east-1",
                },
              ],
            },
            {} as any,
            () => {}
          );
        }
        return { MessageId: "mock-message-id" } as any;
      });

      try {
        // 3. Checkout a product
        const checkoutRes = await app.inject({
          method: "POST",
          url: `/store/${subdomainA}/checkout`,
          payload: {
            customerName: "GST Buyer",
            customerEmail: "gstbuyer@test.com",
            customerPhone: "+919876543210",
            shippingAddress: {
              addressLine1: "456 Side St",
              city: "Bangalore",
              state: "Karnataka", // Intrastate same as seller
              postalCode: "560001",
            },
            lineItems: [{ productId, quantity: 1 }],
            idempotencyKey: crypto.randomUUID(),
          },
        });
        expect(checkoutRes.statusCode).toBe(200);
        const orderData = JSON.parse(checkoutRes.body);
        orderIdGst = orderData.orderId;

        // 4. Send successful Razorpay webhook payment capture
        const webhookRes = await app.inject({
          method: "POST",
          url: `/store/${subdomainA}/webhooks/razorpay`,
          headers: {
            "x-razorpay-signature": "mock-signature-bypass",
          },
          payload: {
            event: "order.paid",
            payload: {
              payment: {
                entity: {
                  id: "pay_gst_123",
                  order_id: orderData.razorpayOrderId,
                },
              },
            },
          },
        });
        expect(webhookRes.statusCode).toBe(200);

        // 5. Verify the order record now contains the GST invoice details
        const getOrder = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `TENANT#${tenantIdA}`,
              SK: `ORDER#${orderIdGst}`,
            },
          })
        );
        expect(getOrder.Item).toBeDefined();
        expect(getOrder.Item?.invoiceNumber).toBeDefined();
        expect(getOrder.Item?.invoiceNumber).toContain("INV-2026-");
        expect(getOrder.Item?.invoiceUrl).toBeDefined();
        expect(getOrder.Item?.invoiceUrl).toContain("s3.amazonaws.com");
      } finally {
        sqsSpy.mockRestore();
      }
    });

    it("should queue WhatsApp notification jobs when whatsapp is enabled", async () => {
      // 1. Enable WhatsApp notifications add-on
      await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "Store A WhatsApp",
          addOns: ["whatsapp"],
          razorpayKey: "mock-key",
          razorpaySecret: "mock-secret",
        },
      });

      // Spy on SQS message sending
      const sqsSpy = vi.spyOn(sqsClient, "send");

      try {
        // 2. Perform checkout
        const checkoutRes = await app.inject({
          method: "POST",
          url: `/store/${subdomainA}/checkout`,
          payload: {
            customerName: "WhatsApp Buyer",
            customerEmail: "wabuyer@test.com",
            customerPhone: "+919876543210",
            shippingAddress: {
              addressLine1: "123 Main St",
              city: "Bangalore",
              state: "Karnataka",
              postalCode: "560001",
            },
            lineItems: [{ productId, quantity: 1 }],
            idempotencyKey: crypto.randomUUID(),
          },
        });
        const orderData = JSON.parse(checkoutRes.body);

        // 3. Trigger Razorpay payment
        await app.inject({
          method: "POST",
          url: `/store/${subdomainA}/webhooks/razorpay`,
          headers: {
            "x-razorpay-signature": "mock-signature-bypass",
          },
          payload: {
            event: "order.paid",
            payload: {
              payment: {
                entity: {
                  id: "pay_wa_123",
                  order_id: orderData.razorpayOrderId,
                },
              },
            },
          },
        });

        // 4. Verify SQS messages were pushed for both customer & merchant
        const callBodies = sqsSpy.mock.calls
          .filter((c) => c[0].constructor.name === "SendMessageCommand")
          .map((c) => JSON.parse((c[0] as any).input.MessageBody));

        const waJobs = callBodies.filter((job) => job.type === "WHATSAPP_NOTIFICATION");
        expect(waJobs.length).toBe(2);
        expect(waJobs.some((j) => j.recipientType === "customer")).toBe(true);
        expect(waJobs.some((j) => j.recipientType === "merchant")).toBe(true);
      } finally {
        sqsSpy.mockRestore();
      }
    });

    it("should book Shiprocket shipments and handle webhook delivery updates when shiprocket is enabled", async () => {
      // 1. Configure settings: enable Shiprocket and WhatsApp add-ons
      await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "Store A Logistics",
          addOns: ["shiprocket", "whatsapp"],
          razorpayKey: "mock-key",
          razorpaySecret: "mock-secret",
        },
      });

      // 2. Perform checkout and mark paid
      const checkoutRes = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/checkout`,
        payload: {
          customerName: "Logistics Buyer",
          customerEmail: "logbuyer@test.com",
          shippingAddress: {
            addressLine1: "123 Main St",
            city: "Bangalore",
            state: "Karnataka",
            postalCode: "560001",
          },
          lineItems: [{ productId, quantity: 1 }],
          idempotencyKey: crypto.randomUUID(),
        },
      });
      const orderId = JSON.parse(checkoutRes.body).orderId;

      // Update order to "paid" status first
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: `ORDER#${orderId}` },
          UpdateExpression: "SET #status = :s",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":s": "paid" },
        })
      );

      // 3. Mark status as "shipped" (triggers Shiprocket shipment booking)
      const shipRes = await app.inject({
        method: "PATCH",
        url: `/orders/${orderId}/status`,
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: { status: "shipped" },
      });
      expect(shipRes.statusCode).toBe(200);

      // 4. Verify tracking number was set on the order record
      const getShippedOrder = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: `ORDER#${orderId}` },
        })
      );
      expect(getShippedOrder.Item?.trackingNumber).toBeDefined();
      expect(getShippedOrder.Item?.trackingNumber).toContain("SR-");
      expect(getShippedOrder.Item?.carrier).toBe("Shiprocket (Mock)");

      // 5. Inject Shiprocket Webhook to mark delivered
      const webhookRes = await app.inject({
        method: "POST",
        url: `/store/${subdomainA}/webhooks/shiprocket`,
        headers: {
          "x-shiprocket-signature": "mock-signature-bypass",
        },
        payload: {
          order_id: orderId,
          current_status: "delivered",
          awb: getShippedOrder.Item?.trackingNumber,
        },
      });
      expect(webhookRes.statusCode).toBe(200);

      // 6. Verify order status is updated to "delivered"
      const getDeliveredOrder = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: `ORDER#${orderId}` },
        })
      );
      expect(getDeliveredOrder.Item?.status).toBe("delivered");
    });
  });

  describe("7. Advanced Merchant Pages Support (Customers, Finances, Billing)", () => {
    it("should retrieve billing usage and handle plan changes", async () => {
      // Reset plan to starter first
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: "METADATA" },
          UpdateExpression: "SET #plan = :p",
          ExpressionAttributeNames: { "#plan": "plan" },
          ExpressionAttributeValues: { ":p": "starter" },
        })
      );

      // 1. Fetch current billing settings
      const billingRes = await app.inject({
        method: "GET",
        url: "/store/billing",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(billingRes.statusCode).toBe(200);
      const billing = JSON.parse(billingRes.body);
      expect(billing.plan).toBe("starter");
      expect(billing.productsLimit).toBe(50);
      expect(billing.ordersLimit).toBe(100);

      // 2. Try upgrading plan
      const planRes = await app.inject({
        method: "POST",
        url: "/store/plan",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: { plan: "growth" },
      });
      expect(planRes.statusCode).toBe(200);
      expect(JSON.parse(planRes.body).plan).toBe("growth");

      // Verify the upgrade reflected in settings
      const settingsRes = await app.inject({
        method: "GET",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(JSON.parse(settingsRes.body).plan).toBe("growth");
    });

    it("should retrieve aggregated customer listings and specific customer order history", async () => {
      const customersRes = await app.inject({
        method: "GET",
        url: "/customers",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(customersRes.statusCode).toBe(200);
      const list = JSON.parse(customersRes.body);
      expect(list.length).toBeGreaterThan(0);
      
      const targetCustomer = list.find((c: any) => c.totalOrders > 0);
      expect(targetCustomer).toBeDefined();
      const email = targetCustomer.email;
      
      const historyRes = await app.inject({
        method: "GET",
        url: `/customers/${email}/orders`,
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(historyRes.statusCode).toBe(200);
      expect(JSON.parse(historyRes.body).length).toBeGreaterThan(0);
    });

    it("should retrieve accurate platform fees and transaction histories in finances summary", async () => {
      const financeRes = await app.inject({
        method: "GET",
        url: "/finances/summary",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(financeRes.statusCode).toBe(200);
      const data = JSON.parse(financeRes.body);
      expect(data.totalRevenue).toBeGreaterThan(0);
      expect(data.totalPlatformFees).toBeDefined();
      expect(data.transactions.length).toBeGreaterThan(0);
    });
  });

  describe("7. Advanced Product Management & Variants Upgrade", () => {
    let advancedProductId = "";

    it("should allow creating a product with compareAtPrice, costPerItem, weight, and proper variants", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/products",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Shopify Style T-Shirt",
          price: 499,
          compareAtPrice: 999,
          costPerItem: 200,
          stockQuantity: 100,
          status: "active",
          category: "Clothing",
          productType: "T-Shirt",
          vendor: "Basecart Apparel",
          weight: 0.25,
          seoTitle: "Custom Printed Premium T-Shirt",
          seoDescription: "Buy custom printed premium cotton T-Shirts online.",
          continueSellingOutOfStock: true,
          images: ["https://example.com/tshirt.jpg"],
          variants: [
            {
              id: "var-1",
              options: { Size: "M", Color: "Red" },
              price: 499,
              stockQuantity: 40,
              sku: "TSHIRT-M-RED",
              barcode: "BAR-M-RED",
            },
            {
              id: "var-2",
              options: { Size: "L", Color: "Red" },
              price: 549,
              stockQuantity: 60,
              sku: "TSHIRT-L-RED",
              barcode: "BAR-L-RED",
            }
          ]
        }
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      advancedProductId = body.productId;
      expect(advancedProductId).toBeDefined();
      expect(body.compareAtPrice).toBe(999);
      expect(body.costPerItem).toBe(200);
      expect(body.variants.length).toBe(2);
    });

    it("should enforce SKU uniqueness per tenant on product creation", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/products",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Another Product",
          price: 299,
          stockQuantity: 10,
          status: "active",
          category: "Clothing",
          images: ["https://example.com/another.jpg"],
          sku: "TSHIRT-M-RED",
        }
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toContain("already in use");
    });

    it("should enforce SKU uniqueness per tenant on product updates", async () => {
      const resCreate = await app.inject({
        method: "POST",
        url: "/products",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Unique SKU Product",
          price: 199,
          stockQuantity: 5,
          status: "active",
          category: "Clothing",
          sku: "UNIQUE-SKU-999",
          images: ["https://example.com/unique.jpg"],
        }
      });
      expect(resCreate.statusCode).toBe(201);
      const newProductId = JSON.parse(resCreate.body).productId;

      const resUpdate = await app.inject({
        method: "PATCH",
        url: `/products/${newProductId}`,
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Unique SKU Product",
          price: 199,
          stockQuantity: 5,
          status: "active",
          category: "Clothing",
          sku: "TSHIRT-M-RED",
          images: ["https://example.com/unique.jpg"],
        }
      });
      expect(resUpdate.statusCode).toBe(400);
    });
  });

  describe("10. Themes Integration Tests", () => {
    let draftThemeId = "";

    it("should allow a merchant to fetch their default theme", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/store/themes",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(res.statusCode).toBe(200);
      const themes = JSON.parse(res.body);
      expect(themes.length).toBeGreaterThan(0);
      
      const published = themes.find((t: any) => t.status === "published");
      expect(published).toBeDefined();
      expect(published.themeId).toBe("default");
    });

    it("should allow a merchant to create a new draft theme", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/store/themes",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Pulse Draft Theme",
          templateBase: "Pulse",
          colors: { primary: "#EF4444", accent: "#F59E0B" },
          logoUrl: "https://example.com/logo.png",
        },
      });
      expect(res.statusCode).toBe(201);
      const theme = JSON.parse(res.body);
      expect(theme.themeId).toBeDefined();
      expect(theme.status).toBe("draft");
      expect(theme.templateBase).toBe("Pulse");
      expect(theme.colors.primary).toBe("#EF4444");
      
      draftThemeId = theme.themeId;
    });

    it("should allow updating a draft theme", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: `/store/themes/${draftThemeId}`,
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          name: "Updated Pulse Theme",
          colors: { primary: "#3B82F6", accent: "#10B981" },
        },
      });
      expect(res.statusCode).toBe(200);
      const theme = JSON.parse(res.body);
      expect(theme.name).toBe("Updated Pulse Theme");
      expect(theme.colors.primary).toBe("#3B82F6");
      expect(theme.colors.accent).toBe("#10B981");
    });

    it("should prevent deleting the currently active published theme", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/store/themes/default",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toContain("Cannot delete the currently published theme");
    });

    it("should allow publishing a draft theme, demoting the previous active theme, and incrementing the version", async () => {
      // 1. Publish the draft theme
      const resPublish = await app.inject({
        method: "POST",
        url: `/store/themes/${draftThemeId}/publish`,
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(resPublish.statusCode).toBe(200);
      const publishedTheme = JSON.parse(resPublish.body);
      expect(publishedTheme.status).toBe("published");
      expect(publishedTheme.version).toBe(2); // Initial draft was version 1, incremented to 2 on publish

      // 2. Fetch all themes and verify active statuses
      const resList = await app.inject({
        method: "GET",
        url: "/store/themes",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const themes = JSON.parse(resList.body);
      const oldDefault = themes.find((t: any) => t.themeId === "default");
      const newActive = themes.find((t: any) => t.themeId === draftThemeId);

      expect(oldDefault.status).toBe("draft");
      expect(newActive.status).toBe("published");

      // 3. Confirm that the store metadata branding was updated
      const resMetadata = await app.inject({
        method: "GET",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const settings = JSON.parse(resMetadata.body);
      expect(settings.branding.primaryColor).toBe("#3B82F6");
      expect(settings.branding.logoUrl).toBe("https://example.com/logo.png");
    });

    it("should allow deleting a draft theme", async () => {
      // The original default theme is now a draft, so we should be able to delete it
      const resDelete = await app.inject({
        method: "DELETE",
        url: "/store/themes/default",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(resDelete.statusCode).toBe(200);

      // Verify it is no longer listed
      const resList = await app.inject({
        method: "GET",
        url: "/store/themes",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const themes = JSON.parse(resList.body);
      const deletedThemeExists = themes.some((t: any) => t.themeId === "default");
      expect(deletedThemeExists).toBe(false);
    });
  });

  describe("11. Auth Recovery & Email Verification", () => {
    it("should return generic success for forgot-password regardless of email existence", async () => {
      const resNonExistent = await app.inject({
        method: "POST",
        url: "/auth/merchant/forgot-password",
        payload: { email: "nonexistent-merchant-email-recovery@basecart.io" },
      });
      expect(resNonExistent.statusCode).toBe(200);
      expect(JSON.parse(resNonExistent.body).message).toContain("password reset link has been sent");

      const resExisting = await app.inject({
        method: "POST",
        url: "/auth/merchant/forgot-password",
        payload: { email: "merchant.a@test.com" },
      });
      expect(resExisting.statusCode).toBe(200);
      expect(JSON.parse(resExisting.body).message).toContain("password reset link has been sent");
    });

    it("should fail when reset token is expired or reused", async () => {
      const token = crypto.randomUUID();
      const expiredTime = new Date(Date.now() - 1000).toISOString();

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `RESET_TOKEN#${token}`,
            SK: "METADATA",
            email: "merchant.a@test.com",
            tenantId: tenantIdA,
            type: "merchant",
            expiresAt: expiredTime,
            ttl: Math.floor(Date.now() / 1000) - 10,
          },
        })
      );

      const resResetExpired = await app.inject({
        method: "POST",
        url: "/auth/merchant/reset-password",
        payload: { token, newPassword: "newsecretpassword123" },
      });
      expect(resResetExpired.statusCode).toBe(400);
      expect(JSON.parse(resResetExpired.body).error).toContain("expired");

      const activeToken = crypto.randomUUID();
      const futureTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `RESET_TOKEN#${activeToken}`,
            SK: "METADATA",
            email: "merchant.a@test.com",
            tenantId: tenantIdA,
            type: "merchant",
            expiresAt: futureTime,
            ttl: Math.floor(Date.now() / 1000) + 600,
          },
        })
      );

      const resResetSuccess = await app.inject({
        method: "POST",
        url: "/auth/merchant/reset-password",
        payload: { token: activeToken, newPassword: "newsecretpassword123" },
      });
      expect(resResetSuccess.statusCode).toBe(200);

      const resResetReused = await app.inject({
        method: "POST",
        url: "/auth/merchant/reset-password",
        payload: { token: activeToken, newPassword: "anotherpassword999" },
      });
      expect(resResetReused.statusCode).toBe(400);
      expect(JSON.parse(resResetReused.body).error).toContain("Invalid or expired");
    });

    it("should prevent Razorpay credential setup until merchant email is verified", async () => {
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `TENANT#${tenantIdA}`, SK: "USER#merchant.a@test.com" },
          UpdateExpression: "SET emailVerified = :ev",
          ExpressionAttributeValues: { ":ev": false },
        })
      );

      const resConfigUnverified = await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "My Verified Store Test",
          razorpayKey: "rzp_test_unverified",
          razorpaySecret: "rzp_secret_unverified",
        },
      });
      expect(resConfigUnverified.statusCode).toBe(400);
      expect(JSON.parse(resConfigUnverified.body).error).toContain("verification required");

      const verifyToken = crypto.randomUUID();
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `VERIFY_TOKEN#${verifyToken}`,
            SK: "METADATA",
            email: "merchant.a@test.com",
            tenantId: tenantIdA,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            ttl: Math.floor(Date.now() / 1000) + 600,
          },
        })
      );

      const resVerify = await app.inject({
        method: "GET",
        url: `/auth/merchant/verify-email?token=${verifyToken}`,
      });
      expect(resVerify.statusCode).toBe(302);

      const resConfigVerified = await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "My Verified Store Test",
          razorpayKey: "rzp_test_verified",
          razorpaySecret: "rzp_secret_verified",
        },
      });
      expect(resConfigVerified.statusCode).toBe(200);
    });
  });

  describe("12. Add-On Billing & Admin Plan Control", () => {
    it("should initialize statements history and generate billing statements for new add-ons", async () => {
      const resGetBilling = await app.inject({
        method: "GET",
        url: "/store/billing",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(resGetBilling.statusCode).toBe(200);
      const billingData = JSON.parse(resGetBilling.body);
      expect(billingData.statements.length).toBeGreaterThanOrEqual(2);

      const resPatch = await app.inject({
        method: "PATCH",
        url: "/store/settings",
        headers: { Authorization: `Bearer ${tokenA}` },
        payload: {
          storeName: "Billing Track Store",
          addOns: ["shiprocket"],
        },
      });
      expect(resPatch.statusCode).toBe(200);

      const resGetUpdatedBilling = await app.inject({
        method: "GET",
        url: "/store/billing",
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const updatedBilling = JSON.parse(resGetUpdatedBilling.body);
      expect(updatedBilling.statements.length).toBeGreaterThan(2);

      const latestInvoice = updatedBilling.statements.find((s: any) => s.addOns.includes("shiprocket"));
      expect(latestInvoice).toBeDefined();
      expect(latestInvoice.amount).toBe(1499);

      const resDownloadPdf = await app.inject({
        method: "GET",
        url: `/store/billing/statement/${latestInvoice.invoiceId}`,
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      expect(resDownloadPdf.statusCode).toBe(200);
      expect(resDownloadPdf.headers["content-type"]).toBe("application/pdf");
    });

    it("should return detailed billing info in admin view and allow plan tier adjustments", async () => {
      const resAdminDetail = await app.inject({
        method: "GET",
        url: `/admin/merchants/${tenantIdA}/details`,
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(resAdminDetail.statusCode).toBe(200);
      const detailData = JSON.parse(resAdminDetail.body);
      expect(detailData.store.plan).toBe("growth");
      expect(detailData.statements.length).toBeGreaterThan(0);

      const resAdminPlan = await app.inject({
        method: "PATCH",
        url: `/admin/merchants/${tenantIdA}/plan`,
        headers: { Authorization: `Bearer ${adminToken}` },
        payload: { plan: "pro" },
      });
      expect(resAdminPlan.statusCode).toBe(200);

      const resAdminDetailUpdated = await app.inject({
        method: "GET",
        url: `/admin/merchants/${tenantIdA}/details`,
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const detailDataUpdated = JSON.parse(resAdminDetailUpdated.body);
      expect(detailDataUpdated.store.plan).toBe("pro");
    });
  });
});
