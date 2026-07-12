import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
  BatchGetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { ddbDocClient, sqsClient } from "../lib/aws";
import {
  authenticateMerchant,
  authenticateCustomer,
  resolveStorefrontTenant,
} from "../middleware/auth";
import { decrypt } from "../lib/crypto";
import { validateDiscountCode } from "./discounts";
import { CheckoutSchema, OrderStatusUpdateSchema } from "@basecart/shared";
import { createShiprocketShipment, verifyShiprocketSignature } from "../services/shiprocket";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL || "";

// Custom interface to access rawBody for webhook validation
interface FastifyRequestWithRawBody extends FastifyRequest {
  rawBody?: string;
}

/**
 * Recalculate cart totals server-side using current DB pricing to prevent tampering
 */
export async function computeCartTotal(
  tenantId: string,
  lineItems: Array<{ productId: string; quantity: number; variantId?: string | null }>,
  discountCode?: string
): Promise<{
  valid: boolean;
  reason?: string;
  itemsSnapshot: Array<any>;
  subtotal: number;
  discountApplied: number;
  total: number;
}> {
  if (!lineItems || lineItems.length === 0) {
    return {
      valid: false,
      reason: "No items in cart",
      itemsSnapshot: [],
      subtotal: 0,
      discountApplied: 0,
      total: 0,
    };
  }

  // 1. Gather all unique keys for BatchGet
  const keys = lineItems.map((item) => ({
    PK: `TENANT#${tenantId}`,
    SK: `PRODUCT#${item.productId}`,
  }));

  // 2. Fetch products in batch
  const batchRes = await ddbDocClient.send(
    new BatchGetCommand({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: keys,
        },
      },
    })
  );

  const fetchedItems = batchRes.Responses?.[TABLE_NAME] || [];
  const productMap = new Map<string, any>();
  for (const prod of fetchedItems) {
    productMap.set(prod.productId, prod);
  }

  let subtotal = 0;
  const itemsSnapshot: Array<any> = [];

  for (const item of lineItems) {
    const product = productMap.get(item.productId);
    if (!product || product.status !== "active") {
      return {
        valid: false,
        reason: `Product with ID ${item.productId} is unavailable or draft`,
        itemsSnapshot: [],
        subtotal: 0,
        discountApplied: 0,
        total: 0,
      };
    }

    let finalPrice = product.price;
    let availableStock = product.stockQuantity;
    let variantNameSuffix = "";

    if (item.variantId) {
      const variant = product.variants?.find((v: any) => v.id === item.variantId);
      if (!variant) {
        return {
          valid: false,
          reason: `Variant with ID ${item.variantId} is unavailable for product "${product.name}"`,
          itemsSnapshot: [],
          subtotal: 0,
          discountApplied: 0,
          total: 0,
        };
      }
      if (variant.price !== undefined && variant.price !== null) {
        finalPrice = variant.price;
      }
      availableStock = variant.stockQuantity;
      variantNameSuffix = " (" + Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(", ") + ")";
    }

    const continueSelling = !!product.continueSellingOutOfStock;
    if (!continueSelling && availableStock < item.quantity) {
      return {
        valid: false,
        reason: `Product "${product.name}"${variantNameSuffix} is out of stock or has insufficient quantity (Available: ${availableStock})`,
        itemsSnapshot: [],
        subtotal: 0,
        discountApplied: 0,
        total: 0,
      };
    }

    const itemCost = finalPrice * item.quantity;
    subtotal += itemCost;

    itemsSnapshot.push({
      productId: item.productId,
      variantId: item.variantId || null,
      name: product.name + variantNameSuffix,
      price: finalPrice,
      quantity: item.quantity,
      images: product.images,
    });
  }

  let discountApplied = 0;
  if (discountCode) {
    const validation = await validateDiscountCode(
      tenantId,
      discountCode,
      subtotal
    );
    if (validation.valid && validation.discountAmount) {
      discountApplied = validation.discountAmount;
    }
  }

  const total = Math.max(0, subtotal - discountApplied);

  return {
    valid: true,
    itemsSnapshot,
    subtotal,
    discountApplied,
    total,
  };
}

export async function orderRoutes(fastify: FastifyInstance) {
  // Capture the raw body string for Razorpay signature verification
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        const bodyStr = typeof body === "string" ? body : (body as Buffer).toString("utf8");
        (req as any).rawBody = bodyStr;
        const json = JSON.parse(bodyStr);
        done(null, json);
      } catch (err: any) {
        done(err, undefined);
      }
    }
  );

  // --- Merchant Admin Endpoints ---

  /**
   * List Orders (Merchant-only)
   */
  fastify.get(
    "/orders",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Get Order Details
   */
  fastify.get(
    "/orders/:id",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const orderId = (req.params as any).id;

      const result = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `ORDER#${orderId}`,
          },
        })
      );

      if (!result.Item) {
        return reply.status(404).send({ error: "Order not found" });
      }

      return reply.send(result.Item);
    }
  );

  /**
   * Update Order Status (Merchant-only)
   */
  fastify.patch(
    "/orders/:id/status",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const orderId = (req.params as any).id;

      const parseResult = OrderStatusUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const { status } = parseResult.data;

      // Fetch existing order first
      const getResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `ORDER#${orderId}`,
          },
        })
      );

      const order = getResult.Item;
      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }

      const updatedAt = new Date().toISOString();

      // Fetch store metadata to check add-ons
      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );
      const store = storeRes.Item || {};

      let trackingNumber = order.trackingNumber;
      let carrier = order.carrier;

      if (status === "shipped" && store.addOns?.includes("shiprocket") && !order.trackingNumber) {
        try {
          const shipment = await createShiprocketShipment({
            orderId,
            customerName: order.customerInfo.name,
            customerAddress: `${order.customerInfo.shippingAddress.addressLine1}, ${order.customerInfo.shippingAddress.city}`,
            customerCity: order.customerInfo.shippingAddress.city,
            customerState: order.customerInfo.shippingAddress.state,
            customerPostalCode: order.customerInfo.shippingAddress.postalCode,
            totalWeightKg: 1.0,
          }, store.gstin || "N/A");
          trackingNumber = shipment.trackingNumber;
          carrier = shipment.carrier;
        } catch (shiprocketErr) {
          console.error("Failed to create Shiprocket shipment:", shiprocketErr);
        }
      }

      const updatedItem = {
        ...order,
        status,
        GSI2SK: `ORDER#${status}#${order.createdAt}`,
        updatedAt,
        trackingNumber,
        carrier,
      };

      // Update base order + update status on GSI2 indices
      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: updatedItem,
        })
      );

      // Queue WhatsApp status notification if enabled
      if (store.addOns?.includes("whatsapp") && (status === "shipped" || status === "delivered")) {
        if (SQS_QUEUE_URL) {
          try {
            await sqsClient.send(
              new SendMessageCommand({
                QueueUrl: SQS_QUEUE_URL,
                MessageBody: JSON.stringify({
                  type: "WHATSAPP_NOTIFICATION",
                  tenantId,
                  orderId,
                  recipient: order.customerInfo.phone || "+919876543210",
                  recipientType: "customer",
                  event: status === "shipped" ? "ORDER_SHIPPED" : "ORDER_DELIVERED",
                }),
              })
            );
          } catch (sqsErr) {
            console.error("Failed to push WhatsApp notification to SQS:", sqsErr);
          }
        }
      }

      return reply.send({ message: `Order status updated to ${status}` });
    }
  );

  // --- Storefront Public / Customer Endpoints ---

  /**
   * Validate Cart Totals (Public storefront)
   */
  fastify.post(
    "/store/:subdomain/cart/validate",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { lineItems, discountCode } = req.body as any;

      if (!lineItems || !Array.isArray(lineItems)) {
        return reply.status(400).send({ error: "lineItems array is required" });
      }

      const computation = await computeCartTotal(
        tenantId,
        lineItems,
        discountCode
      );

      if (!computation.valid) {
        return reply.status(400).send({ error: computation.reason });
      }

      return reply.send({
        subtotal: computation.subtotal,
        discountApplied: computation.discountApplied,
        total: computation.total,
        itemsSnapshot: computation.itemsSnapshot,
      });
    }
  );

  /**
   * Checkout (Create order & setup Razorpay order)
   */
  fastify.post(
    "/store/:subdomain/checkout",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      const parseResult = CheckoutSchema.safeParse(req.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Validation failed",
          issues: parseResult.error.format(),
        });
      }

      const checkoutData = parseResult.data;
      const { customerName, customerEmail, shippingAddress, lineItems, discountCode, idempotencyKey } = checkoutData;

      // 1. Idempotency check: reserve this key atomically in database
      try {
        await ddbDocClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              PK: `TENANT#${tenantId}`,
              SK: `IDEMPOTENCY#${idempotencyKey}`,
              status: "PROCESSING",
              createdAt: new Date().toISOString(),
            },
            ConditionExpression: "attribute_not_exists(PK)",
          })
        );
      } catch (err: any) {
        if (err.name === "ConditionalCheckFailedException") {
          // Lock exists, retrieve state
          const existing = await ddbDocClient.send(
            new GetCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `TENANT#${tenantId}`,
                SK: `IDEMPOTENCY#${idempotencyKey}`,
              },
            })
          );
          if (existing.Item) {
            if (existing.Item.status === "COMPLETED") {
              return reply.send(existing.Item.response);
            }
            return reply.status(409).send({ error: "Checkout request is currently being processed" });
          }
        }
        return reply.status(500).send({ error: "Idempotency initialization failed", message: err.message });
      }

      // Process Checkout
      try {
        // 2. Fetch merchant settings for Razorpay credentials
        const storeRes = await ddbDocClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `TENANT#${tenantId}`,
              SK: "METADATA",
            },
          })
        );

        const store = storeRes.Item;
        if (!store) {
          throw new Error("Store details not found");
        }

        const plan = store.plan || "starter";

        // Enforce monthly order limits
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

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthlyOrdersCount = (ordersRes.Items || []).filter(
          (order) => order.createdAt >= startOfMonth
        ).length;

        if (plan === "starter" && monthlyOrdersCount >= 100) {
          throw new Error("Plan limit reached: Starter tier allows a maximum of 100 orders per month. Please upgrade your plan.");
        }
        if (plan === "growth" && monthlyOrdersCount >= 1000) {
          throw new Error("Plan limit reached: Growth tier allows a maximum of 1000 orders per month. Please upgrade your plan.");
        }

        // Check if credentials exist
        if (!store.razorpayKeyId || !store.razorpaySecret) {
          throw new Error("Store checkout is currently unavailable (Razorpay credentials missing)");
        }

        const rpKey = await decrypt(store.razorpayKeyId);
        const rpSecret = await decrypt(store.razorpaySecret);

        // 3. Compute price on server side
        const computation = await computeCartTotal(
          tenantId,
          lineItems,
          discountCode
        );

        if (!computation.valid) {
          throw new Error(computation.reason || "Price validation failed");
        }

        // Calculate transaction fee based on plan
        let platformFeePercent = 0.02; // Starter 2%
        if (plan === "growth") {
          platformFeePercent = 0.01;
        } else if (plan === "pro") {
          platformFeePercent = 0.005;
        }
        const platformFee = Math.round(computation.total * platformFeePercent * 100) / 100;

        // 4. Create Razorpay order (mocked for localStack testing / fallback)
        const orderId = crypto.randomUUID();
        let razorpayOrderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;

        // Try calling Razorpay API if keys aren't mocks
        if (!rpKey.startsWith("mock") && !rpSecret.startsWith("mock")) {
          try {
            const authString = Buffer.from(`${rpKey}:${rpSecret}`).toString("base64");
            const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authString}`,
              },
              body: JSON.stringify({
                amount: computation.total * 100, // paise
                currency: "INR",
                receipt: orderId,
              }),
            });

            if (razorpayRes.ok) {
              const data = (await razorpayRes.json()) as any;
              razorpayOrderId = data.id;
            } else {
              console.error("Razorpay order creation failed, falling back to mock ID");
            }
          } catch (err) {
            console.error("Error communicating with Razorpay, falling back to mock ID", err);
          }
        }

        // 5. Construct order items and create order
        const createdAt = new Date().toISOString();
        const customerId = req.headers["x-customer-id"] as string || "GUEST";

        const orderItem = {
          PK: `TENANT#${tenantId}`,
          SK: `ORDER#${orderId}`,
          GSI2PK: `TENANT#${tenantId}`,
          GSI2SK: `ORDER#pending#${createdAt}`,
          GSI3PK: `TENANT#${tenantId}#CUSTOMER#${customerId}`,
          GSI3SK: `ORDER#${createdAt}`,
          orderId,
          customerId,
          customerInfo: {
            name: customerName,
            email: customerEmail.toLowerCase(),
            shippingAddress,
          },
          lineItems: computation.itemsSnapshot,
          subtotal: computation.subtotal,
          discountApplied: computation.discountApplied,
          total: computation.total,
          platformFee,
          platformFeePercent,
          reconciliationStatus: "pending",
          status: "pending",
          discountCode,
          razorpayOrderId,
          idempotencyKey,
          createdAt,
          updatedAt: createdAt,
        };

        const checkoutResponse = {
          orderId,
          razorpayOrderId,
          amount: computation.total,
          currency: "INR",
          key: rpKey, // Deliver key to storefront for script integration
        };

        // 6. Write order + idempotency cache atomically
        await ddbDocClient.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Put: {
                  TableName: TABLE_NAME,
                  Item: orderItem,
                },
              },
              {
                Put: {
                  TableName: TABLE_NAME,
                  Item: {
                    PK: `TENANT#${tenantId}`,
                    SK: `IDEMPOTENCY#${idempotencyKey}`,
                    status: "COMPLETED",
                    response: checkoutResponse,
                    createdAt,
                  },
                },
              },
            ],
          })
        );

        return reply.send(checkoutResponse);
      } catch (err: any) {
        // Clean up the idempotency lock on failure so the client can retry
        try {
          await ddbDocClient.send(
            new DeleteCommand({
              TableName: TABLE_NAME,
              Key: {
                PK: `TENANT#${tenantId}`,
                SK: `IDEMPOTENCY#${idempotencyKey}`,
              },
            })
          );
        } catch (cleanupErr) {
          console.error("Failed to clean up idempotency key lock:", cleanupErr);
        }

        // Return a clean error message
        const errMsg = err.message || "An error occurred during checkout processing";
        return reply.status(errMsg.includes("missing") || errMsg.includes("failed") ? 400 : 500).send({ error: errMsg });
      }
    }
  );

  /**
   * Razorpay Webhook Handler
   */
  fastify.post(
    "/store/:subdomain/webhooks/razorpay",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequestWithRawBody, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const signature = req.headers["x-razorpay-signature"] as string;

      if (!signature) {
        return reply.status(400).send({ error: "Missing x-razorpay-signature header" });
      }

      // Fetch webhook credentials
      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );

      const store = storeRes.Item;
      if (!store || !store.razorpaySecret) {
        return reply.status(400).send({ error: "Razorpay settings not configured for tenant" });
      }

      const rpSecret = await decrypt(store.razorpaySecret);

      // Verify Webhook signature
      const rawBody = req.rawBody || "";
      const expectedSignature = crypto
        .createHmac("sha256", rpSecret)
        .update(rawBody)
        .digest("hex");

      // Verify signature. If locally mocked testing, allow fallback
      const isSignatureValid = expectedSignature === signature;
      const isMockBypass =
        ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && signature === "mock-signature-bypass");

      if (!isSignatureValid && !isMockBypass) {
        return reply.status(400).send({ error: "Invalid webhook signature verification failed" });
      }

      const payload = req.body as any;
      const event = payload.event;

      // Handle order paid or payment captured
      if (event === "order.paid" || event === "payment.captured") {
        const entity = payload.payload.payment?.entity || payload.payload.order?.entity;
        const razorpayOrderId = entity?.order_id || entity?.id;
        const razorpayPaymentId = entity?.id;

        if (!razorpayOrderId) {
          return reply.status(400).send({ error: "No razorpay order ID found in payload" });
        }

        // Find the pending order for this tenant
        const pendingOrders = await ddbDocClient.send(
          new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "GSI2",
            KeyConditionExpression: "GSI2PK = :gsi2pk AND begins_with(GSI2SK, :gsi2sk)",
            ExpressionAttributeValues: {
              ":gsi2pk": `TENANT#${tenantId}`,
              ":gsi2sk": "ORDER#pending#",
            },
          })
        );

        const targetOrder = pendingOrders.Items?.find(
          (o) => o.razorpayOrderId === razorpayOrderId
        );

        if (!targetOrder) {
          // If not found in pending, check if already paid/processed
          return reply.status(200).send({ message: "Order already processed or not found" });
        }

        const orderId = targetOrder.orderId;
        const updatedAt = new Date().toISOString();

        // Prepare operations: decrement product stock and update status
        const transactItems: any[] = [
          {
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `TENANT#${tenantId}`,
                SK: `ORDER#${orderId}`,
              },
              UpdateExpression:
                "SET #status = :paidStatus, GSI2SK = :gsi2sk, razorpayPaymentId = :paymentId, updatedAt = :updatedAt",
              ExpressionAttributeNames: {
                "#status": "status",
              },
              ExpressionAttributeValues: {
                ":paidStatus": "paid",
                ":gsi2sk": `ORDER#paid#${targetOrder.createdAt}`,
                ":paymentId": razorpayPaymentId,
                ":updatedAt": updatedAt,
              },
            },
          },
        ];

        // 1. Decrement stock levels for each item
        for (const item of targetOrder.lineItems) {
          try {
            const prodRes = await ddbDocClient.send(
              new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                  PK: `TENANT#${tenantId}`,
                  SK: `PRODUCT#${item.productId}`,
                },
              })
            );

            const product = prodRes.Item;
            if (product) {
              let updatedVariants = product.variants;
              if (item.variantId && Array.isArray(product.variants)) {
                updatedVariants = product.variants.map((v: any) => {
                  if (v.id === item.variantId) {
                    return {
                      ...v,
                      stockQuantity: Math.max(0, v.stockQuantity - item.quantity),
                    };
                  }
                  return v;
                });
              }

              transactItems.push({
                Update: {
                  TableName: TABLE_NAME,
                  Key: {
                    PK: `TENANT#${tenantId}`,
                    SK: `PRODUCT#${item.productId}`,
                  },
                  UpdateExpression: "SET stockQuantity = stockQuantity - :qty, variants = :variants",
                  ExpressionAttributeValues: {
                    ":qty": item.quantity,
                    ":variants": updatedVariants || [],
                  },
                },
              });
            } else {
              transactItems.push({
                Update: {
                  TableName: TABLE_NAME,
                  Key: {
                    PK: `TENANT#${tenantId}`,
                    SK: `PRODUCT#${item.productId}`,
                  },
                  UpdateExpression: "SET stockQuantity = stockQuantity - :qty",
                  ExpressionAttributeValues: {
                    ":qty": item.quantity,
                  },
                },
              });
            }
          } catch (err) {
            console.error("Failed fetching product for stock decrement:", err);
            transactItems.push({
              Update: {
                TableName: TABLE_NAME,
                Key: {
                  PK: `TENANT#${tenantId}`,
                  SK: `PRODUCT#${item.productId}`,
                },
                UpdateExpression: "SET stockQuantity = stockQuantity - :qty",
                ExpressionAttributeValues: {
                  ":qty": item.quantity,
                },
              },
            });
          }
        }

        // 2. Increment discount usage count if a code was applied
        if (targetOrder.discountCode) {
          transactItems.push({
            Update: {
              TableName: TABLE_NAME,
              Key: {
                PK: `TENANT#${tenantId}`,
                SK: `DISCOUNT#${targetOrder.discountCode.toUpperCase()}`,
              },
              UpdateExpression: "SET usageCount = usageCount + :one",
              ExpressionAttributeValues: {
                ":one": 1,
              },
            },
          });
        }

        // Execute transactions
        await ddbDocClient.send(
          new TransactWriteCommand({
            TransactItems: transactItems,
          })
        );

        // 3. Queue email confirmation via SQS
        if (SQS_QUEUE_URL) {
          try {
            await sqsClient.send(
              new SendMessageCommand({
                QueueUrl: SQS_QUEUE_URL,
                MessageBody: JSON.stringify({
                  type: "ORDER_CONFIRMATION",
                  tenantId,
                  orderId,
                  email: targetOrder.customerInfo.email,
                  total: targetOrder.total,
                }),
              })
            );

            // Queue WhatsApp notifications if toggled (Add-On 1)
            if (store && store.addOns?.includes("whatsapp")) {
              // Customer notification
              await sqsClient.send(
                new SendMessageCommand({
                  QueueUrl: SQS_QUEUE_URL,
                  MessageBody: JSON.stringify({
                    type: "WHATSAPP_NOTIFICATION",
                    tenantId,
                    orderId,
                    recipient: targetOrder.customerInfo.phone || "+919876543210",
                    recipientType: "customer",
                    event: "ORDER_PLACED",
                  }),
                })
              );

              // Merchant notification
              await sqsClient.send(
                new SendMessageCommand({
                  QueueUrl: SQS_QUEUE_URL,
                  MessageBody: JSON.stringify({
                    type: "WHATSAPP_NOTIFICATION",
                    tenantId,
                    orderId,
                    recipient: "+919999999999", // Merchant alerts contact
                    recipientType: "merchant",
                    event: "NEW_ORDER_RECEIVED",
                  }),
                })
              );
            }
          } catch (sqsErr) {
            console.error("Failed to push message to SQS queue:", sqsErr);
          }
        }
      }

      return reply.status(200).send({ received: true });
    }
  );

  /**
   * List Customer Orders (Storefront public/auth-scoped)
   */
  fastify.get(
    "/store/:subdomain/my-orders",
    { preHandler: [resolveStorefrontTenant, authenticateCustomer] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const customerId = req.user!.userId;

      // Query customer orders via GSI3
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI3",
          KeyConditionExpression: "GSI3PK = :gsi3pk AND begins_with(GSI3SK, :gsi3sk)",
          ExpressionAttributeValues: {
            ":gsi3pk": `TENANT#${tenantId}#CUSTOMER#${customerId}`,
            ":gsi3sk": "ORDER#",
          },
        })
      );

      return reply.send(result.Items || []);
    }
  );

  /**
   * Shiprocket Webhook (Public storefront)
   */
  fastify.post(
    "/store/:subdomain/webhooks/shiprocket",
    { preHandler: [resolveStorefrontTenant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const signature = req.headers["x-shiprocket-signature"] as string;

      // Verify webhook signature (using a pre-shared token or mock key verification)
      const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || "mock-shiprocket-token";
      const isValid = verifyShiprocketSignature(signature, expectedToken);

      // Allow signature bypass in dev
      const isSignatureBypass =
        ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") && signature === "mock-signature-bypass");

      if (!isValid && !isSignatureBypass) {
        return reply.status(400).send({ error: "Invalid Shiprocket webhook signature" });
      }

      const payload = req.body as any;
      const { order_id, current_status, awb } = payload;

      if (!order_id || !current_status) {
        return reply.status(400).send({ error: "order_id and current_status are required" });
      }

      // Fetch the order
      const getResult = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: `ORDER#${order_id}`,
          },
        })
      );

      const order = getResult.Item;
      if (!order) {
        return reply.status(404).send({ error: "Order not found" });
      }

      const newStatus = current_status.toLowerCase() === "delivered" ? "delivered" : "shipped";
      const updatedAt = new Date().toISOString();

      await ddbDocClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            ...order,
            status: newStatus,
            GSI2SK: `ORDER#${newStatus}#${order.createdAt}`,
            updatedAt,
            trackingNumber: awb || order.trackingNumber,
          },
        })
      );

      // Trigger WhatsApp delivery notification if enabled
      const storeRes = await ddbDocClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `TENANT#${tenantId}`,
            SK: "METADATA",
          },
        })
      );
      const store = storeRes.Item || {};

      if (store.addOns?.includes("whatsapp") && SQS_QUEUE_URL) {
        try {
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: SQS_QUEUE_URL,
              MessageBody: JSON.stringify({
                type: "WHATSAPP_NOTIFICATION",
                tenantId,
                orderId: order_id,
                recipient: order.customerInfo.phone || "+919876543210",
                recipientType: "customer",
                event: newStatus === "delivered" ? "ORDER_DELIVERED" : "ORDER_SHIPPED",
              }),
            })
          );
        } catch (sqsErr) {
          console.error("Failed to push WhatsApp notification to SQS:", sqsErr);
        }
      }

      return reply.send({ success: true });
    }
  );
}
