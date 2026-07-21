import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { decrypt } from "../lib/crypto";
import { validateDiscountCode } from "./discounts";
import { CheckoutSchema, OrderStatusUpdateSchema } from "@basecart/shared";
import { createShiprocketShipment, verifyShiprocketSignature } from "../services/shiprocket";
import { generateInvoicePdf } from "../lib/pdf";
import { authenticateMerchant, authenticateCustomer, resolveStorefrontTenant } from "../middleware/auth";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * Recalculate cart totals server-side using isolated DB pricing to prevent client-side tampering
 */
export async function computeCartTotal(
  tenantId: string,
  lineItems: Array<{ productId: string; quantity: number; variantId?: string | null }>,
  discountCode: string | undefined,
  env: any
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

  const tenantDb = await getTenantDb(tenantId, env);

  // Fetch unique products from isolated database
  const productIds = Array.from(new Set(lineItems.map(item => item.productId)));
  const placeholders = productIds.map(() => "?").join(",");
  const query = `SELECT * FROM products WHERE productId IN (${placeholders})`;
  const result = await tenantDb.prepare(query).bind(...productIds).all<any>();
  const fetchedItems = result.results || [];

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

    // Parse variants JSON
    let variants: any[] = [];
    if (product.variants) {
      try {
        variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants;
      } catch (e) {}
    }

    if (item.variantId) {
      const variant = variants?.find((v: any) => v.id === item.variantId);
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
      variantNameSuffix = " (" + Object.entries(variant.options || {}).map(([k, v]) => `${k}: ${v}`).join(", ") + ")";
    }

    const continueSelling = product.continueSellingOutOfStock === 1;
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
      images: product.images ? JSON.parse(product.images) : [],
    });
  }

  let discountApplied = 0;
  if (discountCode) {
    const validation = await validateDiscountCode(
      tenantId,
      discountCode,
      subtotal,
      env
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

// -------------------------------------------------------------
// 1. Merchant Admin Endpoints
// -------------------------------------------------------------

/**
 * List Orders (Merchant-only)
 */
app.get("/orders", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const result = await tenantDb.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
  const rows = result.results || [];

  const orders = [];
  for (const row of rows) {
    const items = await tenantDb.prepare("SELECT * FROM order_items WHERE orderId = ?").bind(row.orderId).all();
    let parsedAddress: any = null;
    try {
      parsedAddress = typeof row.shippingAddress === "string" ? JSON.parse(row.shippingAddress) : row.shippingAddress;
    } catch (e) {
      parsedAddress = { street: row.shippingAddress };
    }

    orders.push({
      ...row,
      customerInfo: {
        name: row.customerName || "Guest",
        email: row.customerEmail || "",
        phone: row.customerPhone || "",
        address: parsedAddress,
      },
      paymentMethod: row.paymentId ? "Razorpay" : "COD",
      lineItems: items.results || [],
    });
  }

  return c.json(orders);
});

/**
 * Create Sample / Test Order (Merchant-only)
 */
app.post("/orders/sample", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);
  const now = new Date().toISOString();
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const maxNumRow = await tenantDb.prepare("SELECT MAX(orderNumber) as lastNum FROM orders").first<{ lastNum: number }>();
  const orderNumber = (maxNumRow?.lastNum || 1000) + 1;

  const customerName = "Aarav Sharma";
  const customerEmail = "aarav.sharma@example.com";
  const customerPhone = "+91 98765 43210";
  const shippingAddressObj = {
    street: "42 MG Road, Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    country: "India",
  };
  const shippingAddressStr = JSON.stringify(shippingAddressObj);

  const sampleItems = [
    {
      productId: "prod_sample_1",
      name: "Premium Cotton Oversized T-Shirt",
      sku: "SKU-COT-BLACK-L",
      price: 999,
      quantity: 2,
    },
    {
      productId: "prod_sample_2",
      name: "Classic Denim Jacket",
      sku: "SKU-JKT-BLUE-XL",
      price: 2499,
      quantity: 1,
    },
  ];

  const subtotal = 4497;
  const taxAmount = 225;
  const discountAmount = 321;
  const total = subtotal + taxAmount - discountAmount;

  await tenantDb
    .prepare(
      `INSERT INTO orders (orderId, orderNumber, customerId, customerName, customerEmail, customerPhone, shippingAddress, status, subtotal, taxAmount, total, discountAmount, paymentId, paymentStatus, razorpayOrderId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      orderId,
      orderNumber,
      `cust_${Math.random().toString(36).slice(2, 10)}`,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddressStr,
      "paid",
      subtotal,
      taxAmount,
      total,
      discountAmount,
      `pay_${Math.random().toString(36).slice(2, 12)}`,
      "paid",
      `order_${Math.random().toString(36).slice(2, 12)}`,
      now,
      now
    )
    .run();

  for (const item of sampleItems) {
    const itemId = `item_${Math.random().toString(36).slice(2, 10)}`;
    await tenantDb
      .prepare(
        `INSERT INTO order_items (itemId, orderId, productId, name, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(itemId, orderId, item.productId, item.name, item.price, item.quantity)
      .run();
  }

  return c.json({ message: "Sample order created successfully", orderId }, 201);
});

/**
 * Get Order Details
 */
app.get("/orders/:id", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const orderId = c.req.param("id");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const order = await tenantDb
    .prepare("SELECT * FROM orders WHERE orderId = ?")
    .bind(orderId)
    .first<any>();

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  const items = await tenantDb
    .prepare("SELECT * FROM order_items WHERE orderId = ?")
    .bind(orderId)
    .all();

  return c.json({
    ...order,
    lineItems: items.results || [],
  });
});

/**
 * Update Order Status (Merchant-only)
 */
app.patch("/orders/:id/status", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const orderId = c.req.param("id");

  const body = await c.req.json().catch(() => ({}));
  const parseResult = OrderStatusUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const { status, trackingNumber: reqTracking, carrier: reqCarrier } = parseResult.data;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const order = await tenantDb
    .prepare("SELECT * FROM orders WHERE orderId = ?")
    .bind(orderId)
    .first<any>();

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  // Prevent modifying settled or cancelled orders to preserve order transaction integrity
  if (order.status === "delivered" || order.status === "cancelled") {
    return c.json(
      {
        error: `Order status is locked because it is already '${order.status}'. Modifying settled transactions violates store audit integrity rules.`,
      },
      400
    );
  }

  const updatedAt = new Date().toISOString();

  // Fetch store metadata to check add-ons
  const controlDb = getControlDb(c.env);
  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  const addOns = store?.addOns ? JSON.parse(store.addOns) : [];

  let trackingNumber = reqTracking || order.trackingNumber;
  let carrier = reqCarrier || order.carrier;

  if (status === "shipped" && addOns.includes("shiprocket") && !order.trackingNumber) {
    try {
      const shipment = await createShiprocketShipment({
        orderId,
        customerName: order.customerName,
        customerAddress: order.shippingAddress,
        customerCity: "New Delhi",
        customerState: "Delhi",
        customerPostalCode: "110001",
        totalWeightKg: 1.0,
      }, store?.gstin || "N/A");
      trackingNumber = shipment.trackingNumber;
      carrier = shipment.carrier;
    } catch (shiprocketErr) {
      console.error("Failed to create Shiprocket shipment:", shiprocketErr);
    }
  }

  await tenantDb
    .prepare("UPDATE orders SET status = ?, trackingNumber = ?, carrier = ?, updatedAt = ? WHERE orderId = ?")
    .bind(status, trackingNumber || null, carrier || null, updatedAt, orderId)
    .run();

  // Queue WhatsApp status notification if enabled
  if (addOns.includes("whatsapp") && (status === "shipped" || status === "delivered") && order.customerPhone) {
    if (c.env.JOBS_QUEUE) {
      try {
        await c.env.JOBS_QUEUE.send({
          type: "WHATSAPP_NOTIFICATION",
          tenantId,
          orderId,
          recipient: order.customerPhone,
          recipientType: "customer",
          event: status === "shipped" ? "ORDER_SHIPPED" : "ORDER_DELIVERED",
        });
      } catch (queueErr) {
        console.error("Failed to push WhatsApp notification to Queue:", queueErr);
      }
    }
  }

  // Queue transactional order-shipped email to customer
  if (status === "shipped" && order.customerEmail && c.env.JOBS_QUEUE) {
    try {
      await c.env.JOBS_QUEUE.send({
        type: "TRANSACTIONAL_EMAIL",
        tenantId,
        orderId,
        emailPayload: {
          type: "order-shipped",
          to: order.customerEmail,
          data: {
            orderId,
            customerName: order.customerName,
            trackingNumber: trackingNumber || "N/A",
            carrier: carrier || "Our Delivery Partner",
            trackingUrl: trackingNumber ? `https://shiprocket.co/tracking/${trackingNumber}` : "",
            storeName: store?.storeName || "Basecart",
          },
        },
      });
    } catch (queueErr) {
      console.error("Failed to push order-shipped email to Queue:", queueErr);
    }
  }

  return c.json({ success: true, status, trackingNumber, carrier, message: `Order status updated to ${status}` });
});

/**
 * Download / View GST Invoice PDF (Merchant-only)
 */
app.get("/orders/:id/invoice", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const orderId = c.req.param("id");

  const tenantDb = await getTenantDb(tenantId, c.env);
  const controlDb = getControlDb(c.env);

  const order = await tenantDb
    .prepare("SELECT * FROM orders WHERE orderId = ?")
    .bind(orderId)
    .first<any>();

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  const items = await tenantDb
    .prepare("SELECT * FROM order_items WHERE orderId = ?")
    .bind(orderId)
    .all();

  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<any>();

  const invoiceNumber = order.invoiceNumber || `INV-2026-${order.orderNumber || orderId.substring(0, 6).toUpperCase()}`;

  const pdfBuffer = await generateInvoicePdf({
    invoiceNumber,
    date: new Date(order.createdAt).toISOString().split("T")[0],
    storeName: store?.storeName || "Basecart Store",
    storeGstin: store?.gstin || "29AAAAA0000A1Z5",
    storeAddress: store?.registeredBusinessAddress || "Bangalore, India",
    storeState: store?.registeredState || "Karnataka",
    customerName: order.customerName || "Valued Customer",
    customerEmail: order.customerEmail || "customer@example.com",
    customerAddress: order.shippingAddress || "India",
    customerState: "Karnataka",
    lineItems: (items.results || []).map((item: any) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    taxType: "intrastate",
    subtotal: order.subtotal || order.total,
    taxAmount: order.taxAmount || 0,
    total: order.total,
  });

  return new Response(pdfBuffer as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${invoiceNumber}.pdf"`,
    },
  });
});

// -------------------------------------------------------------
// 2. Storefront / Customer Endpoints
// -------------------------------------------------------------

/**
 * Validate Cart Totals (Public storefront)
 */
app.post("/store/:subdomain/cart/validate", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const { lineItems, discountCode } = body;

  if (!lineItems || !Array.isArray(lineItems)) {
    return c.json({ error: "lineItems array is required" }, 400);
  }

  const computation = await computeCartTotal(tenantId, lineItems, discountCode, c.env);
  if (!computation.valid) {
    return c.json({ error: computation.reason }, 400);
  }

  return c.json({
    subtotal: computation.subtotal,
    discountApplied: computation.discountApplied,
    total: computation.total,
    itemsSnapshot: computation.itemsSnapshot,
  });
});

/**
 * Checkout (Create order & setup Razorpay order)
 */
app.post("/store/:subdomain/checkout", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const body = await c.req.json().catch(() => ({}));
  const parseResult = CheckoutSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({
      error: "Validation failed",
      issues: parseResult.error.format(),
    }, 400);
  }

  const { customerName, customerEmail, customerPhone, shippingAddress, lineItems, discountCode, idempotencyKey } = parseResult.data;

  const tenantDb = await getTenantDb(tenantId, c.env);

  // 1. Idempotency check: reserve this key atomically in isolated DB
  const lockRes = await tenantDb
    .prepare("INSERT OR IGNORE INTO idempotency_keys (key, status, response, createdAt) VALUES (?, ?, ?, ?)")
    .bind(idempotencyKey, "PROCESSING", null, new Date().toISOString())
    .run();

  if (lockRes.meta?.changes === 0) {
    const existing = await tenantDb
      .prepare("SELECT * FROM idempotency_keys WHERE key = ?")
      .bind(idempotencyKey)
      .first<any>();

    if (existing) {
      if (existing.status === "COMPLETED") {
        return c.json(JSON.parse(existing.response));
      }
      return c.json({ error: "Checkout request is currently being processed" }, 409);
    }
    return c.json({ error: "Idempotency reservation conflict occurred" }, 500);
  }

  // Process Checkout
  try {
    const controlDb = getControlDb(c.env);
    const store = await controlDb
      .prepare("SELECT * FROM tenants WHERE tenantId = ?")
      .bind(tenantId)
      .first<any>();

    if (!store) {
      throw new Error("Store details not found");
    }

    const plan = store.plan || "starter";

    // Enforce monthly order limits
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const countRow = await tenantDb
      .prepare("SELECT COUNT(*) as total FROM orders WHERE createdAt >= ?")
      .bind(startOfMonth)
      .first<{ total: number }>();
    
    const monthlyOrdersCount = countRow?.total || 0;

    if (plan === "starter" && monthlyOrdersCount >= 100) {
      throw new Error("Plan limit reached: Starter tier allows a maximum of 100 orders per month. Please upgrade your plan.");
    }
    if (plan === "growth" && monthlyOrdersCount >= 1000) {
      throw new Error("Plan limit reached: Growth tier allows a maximum of 1000 orders per month. Please upgrade your plan.");
    }

    if (!store.razorpayKeyId || !store.razorpaySecret) {
      throw new Error("Store checkout is currently unavailable (Razorpay credentials missing)");
    }

    const rpKey = await decrypt(store.razorpayKeyId, c.env.ENCRYPTION_SECRET);
    const rpSecret = await decrypt(store.razorpaySecret, c.env.ENCRYPTION_SECRET);

    // 2. Compute price server-side
    const computation = await computeCartTotal(tenantId, lineItems, discountCode, c.env);
    if (!computation.valid) {
      throw new Error(computation.reason || "Price validation failed");
    }

    // platform fee %
    let platformFeePercent = 0.02; // Starter 2%
    if (plan === "growth") {
      platformFeePercent = 0.01;
    } else if (plan === "pro") {
      platformFeePercent = 0.005;
    }
    const platformFee = Math.round(computation.total * platformFeePercent * 100) / 100;

    const orderId = crypto.randomUUID();
    let razorpayOrderId = "order_mock_" + Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, "0")).join("");

    // Create Razorpay order if credentials are not mock keys
    if (!rpKey.startsWith("mock") && !rpSecret.startsWith("mock") && process.env.NODE_ENV !== "test") {
      try {
        const authString = btoa(`${rpKey}:${rpSecret}`);
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

    const createdAt = new Date().toISOString();
    const customerId = c.get("user")?.userId || crypto.randomUUID();
    const addressStr = typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress);

    // Generate incremental orderNumber
    const maxNumRow = await tenantDb.prepare("SELECT MAX(orderNumber) as lastNum FROM orders").first<{ lastNum: number }>();
    const orderNumber = (maxNumRow?.lastNum || 1000) + 1;

    // 3. Write base order in tenant DB
    await tenantDb
      .prepare(
        "INSERT INTO orders (orderId, orderNumber, customerId, customerName, customerEmail, customerPhone, shippingAddress, status, subtotal, taxAmount, total, discountCode, discountAmount, paymentId, paymentStatus, razorpayOrderId, idempotencyKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        orderId,
        orderNumber,
        customerId,
        customerName,
        customerEmail.toLowerCase(),
        customerPhone || null,
        addressStr,
        "pending",
        computation.subtotal,
        0, // taxAmount
        computation.total,
        discountCode || null,
        computation.discountApplied,
        null, // paymentId
        "pending",
        razorpayOrderId,
        idempotencyKey,
        createdAt,
        createdAt
      )
      .run();

    // 4. Write line items in tenant DB
    for (const item of computation.itemsSnapshot) {
      await tenantDb
        .prepare(
          "INSERT INTO order_items (itemId, orderId, productId, name, price, quantity, variantId, variantName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          crypto.randomUUID(),
          orderId,
          item.productId,
          item.name,
          item.price,
          item.quantity,
          item.variantId || null,
          null
        )
        .run();
    }

    const checkoutResponse = {
      orderId,
      razorpayOrderId,
      amount: computation.total,
      currency: "INR",
      key: rpKey,
    };

    // 5. Complete the idempotency key lock status
    await tenantDb
      .prepare("UPDATE idempotency_keys SET status = ?, response = ? WHERE key = ?")
      .bind("COMPLETED", JSON.stringify(checkoutResponse), idempotencyKey)
      .run();

    return c.json(checkoutResponse);
  } catch (err: any) {
    // Cleanup the idempotency key lock on failure so the client can retry
    try {
      await tenantDb.prepare("DELETE FROM idempotency_keys WHERE key = ?").bind(idempotencyKey).run();
    } catch (cleanupErr) {
      console.error("Failed to clean up idempotency key lock:", cleanupErr);
    }
    const errMsg = err.message || "An error occurred during checkout processing";
    return c.json(
      { error: errMsg },
      errMsg.includes("missing") || errMsg.includes("failed") ? 400 : 500
    );
  }
});

/**
 * Razorpay Webhook Handler
 */
app.post("/store/:subdomain/webhooks/razorpay", async (c) => {
  const subdomain = c.req.param("subdomain");
  const signature = c.req.header("x-razorpay-signature");

  if (!signature) {
    return c.json({ error: "Missing x-razorpay-signature header" }, 400);
  }

  // Resolve subdomain and secret
  const controlDb = getControlDb(c.env);
  const store = await controlDb
    .prepare("SELECT * FROM tenants WHERE subdomain = ?")
    .bind(subdomain.toLowerCase())
    .first<any>();

  if (!store || !store.razorpaySecret) {
    return c.json({ error: "Razorpay settings not configured for tenant" }, 400);
  }

  const rpSecret = await decrypt(store.razorpaySecret, c.env.ENCRYPTION_SECRET);

  // 1. Capture the raw text body before any parsing
  const rawBody = await c.req.text();
  const payload = JSON.parse(rawBody);

  // 2. Verify Razorpay signature
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(rpSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", keyMaterial, encoder.encode(rawBody));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const isSignatureValid = expectedSignature === signature;

  if (!isSignatureValid) {
    return c.json({ error: "Invalid webhook signature verification failed" }, 400);
  }

  const event = payload.event;
  const tenantId = store.tenantId;

  if (event === "order.paid" || event === "payment.captured") {
    const entity = payload.payload.payment?.entity || payload.payload.order?.entity;
    const razorpayOrderId = entity?.order_id || entity?.id;
    const razorpayPaymentId = entity?.id;

    if (!razorpayOrderId) {
      return c.json({ error: "No razorpay order ID found in payload" }, 400);
    }

    const tenantDb = await getTenantDb(tenantId, c.env);

    // Find the pending order for this tenant
    const targetOrder = await tenantDb
      .prepare("SELECT * FROM orders WHERE razorpayOrderId = ? AND status = 'pending'")
      .bind(razorpayOrderId)
      .first<any>();

    if (!targetOrder) {
      return c.json({ message: "Order already processed or not found" });
    }

    const orderId = targetOrder.orderId;
    const updatedAt = new Date().toISOString();

    // 1. Update order status and payment ID
    await tenantDb
      .prepare("UPDATE orders SET status = ?, paymentId = ?, paymentStatus = ?, updatedAt = ? WHERE orderId = ?")
      .bind("paid", razorpayPaymentId || null, "captured", updatedAt, orderId)
      .run();

    // 2. Fetch order items to decrement product stock levels
    const orderItemsResult = await tenantDb.prepare("SELECT * FROM order_items WHERE orderId = ?").bind(orderId).all();
    const orderItems = orderItemsResult.results || [];

    for (const item of orderItems) {
      const product = await tenantDb.prepare("SELECT * FROM products WHERE productId = ?").bind(item.productId).first<any>();
      if (product) {
        let variants: any[] = [];
        if (product.variants) {
          try {
            variants = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants;
          } catch (e) {}
        }

        if (item.variantId && Array.isArray(variants)) {
          const updatedVariants = variants.map((v: any) => {
            if (v.id === item.variantId) {
              return {
                ...v,
                stockQuantity: Math.max(0, v.stockQuantity - item.quantity),
              };
            }
            return v;
          });

          await tenantDb
            .prepare("UPDATE products SET stockQuantity = MAX(0, stockQuantity - ?), variants = ? WHERE productId = ?")
            .bind(item.quantity, JSON.stringify(updatedVariants), item.productId)
            .run();
        } else {
          await tenantDb
            .prepare("UPDATE products SET stockQuantity = MAX(0, stockQuantity - ?) WHERE productId = ?")
            .bind(item.quantity, item.productId)
            .run();
        }
      }
    }

    // 3. Increment discount usage count
    if (targetOrder.discountCode) {
      await tenantDb
        .prepare("UPDATE discount_codes SET usageCount = usageCount + 1 WHERE code = ?")
        .bind(targetOrder.discountCode.toUpperCase())
        .run();
    }

    // 4. Queue Background Jobs
    if (c.env.JOBS_QUEUE) {
      try {
        await c.env.JOBS_QUEUE.send({
          type: "ORDER_CONFIRMATION",
          tenantId,
          orderId,
          email: targetOrder.customerEmail,
          total: targetOrder.total,
        });

        const addOns = store.addOns ? JSON.parse(store.addOns) : [];
        if (addOns.includes("whatsapp")) {
          // Customer alert
          if (targetOrder.customerPhone) {
            await c.env.JOBS_QUEUE.send({
              type: "WHATSAPP_NOTIFICATION",
              tenantId,
              orderId,
              recipient: targetOrder.customerPhone,
              recipientType: "customer",
              event: "ORDER_PLACED",
            });
          }
          
          // Merchant alert
          await c.env.JOBS_QUEUE.send({
            type: "WHATSAPP_NOTIFICATION",
            tenantId,
            orderId,
            recipient: "+919999999999",
            recipientType: "merchant",
            event: "NEW_ORDER_RECEIVED",
          });
        }
      } catch (queueErr) {
        console.error("Failed to push tasks to JOBS_QUEUE:", queueErr);
      }
    }
  }

  return c.json({ received: true });
});

/**
 * List Customer Orders (Storefront auth-scoped)
 */
app.get("/store/:subdomain/my-orders", resolveStorefrontTenant, authenticateCustomer, async (c) => {
  const tenantId = c.get("tenantId")!;
  const user = c.get("user")!;

  const tenantDb = await getTenantDb(tenantId, c.env);
  const result = await tenantDb
    .prepare("SELECT * FROM orders WHERE customerId = ? ORDER BY createdAt DESC")
    .bind(user.userId)
    .all();

  const rows = result.results || [];
  const orders = [];
  for (const row of rows) {
    const items = await tenantDb.prepare("SELECT * FROM order_items WHERE orderId = ?").bind(row.orderId).all();
    orders.push({
      ...row,
      lineItems: items.results || [],
    });
  }

  return c.json(orders);
});

/**
 * Shiprocket Webhook (Public storefront)
 */
app.post("/store/:subdomain/webhooks/shiprocket", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const signature = c.req.header("x-shiprocket-signature");

  if (!c.env.SHIPROCKET_WEBHOOK_TOKEN) {
    return c.json({ error: "Shiprocket webhook token not configured" }, 500);
  }
  const expectedToken = c.env.SHIPROCKET_WEBHOOK_TOKEN;
  const isValid = verifyShiprocketSignature(signature || "", expectedToken);

  if (!isValid) {
    return c.json({ error: "Invalid Shiprocket webhook signature" }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const { order_id, current_status, awb } = body;

  if (!order_id || !current_status) {
    return c.json({ error: "order_id and current_status are required" }, 400);
  }

  const tenantDb = await getTenantDb(tenantId, c.env);
  const order = await tenantDb
    .prepare("SELECT * FROM orders WHERE orderId = ?")
    .bind(order_id)
    .first<any>();

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  const newStatus = current_status.toLowerCase() === "delivered" ? "delivered" : "shipped";

  // Idempotency: skip if already processed with same AWB and status
  if (order.trackingNumber === awb && order.status === newStatus) {
    return c.json({ success: true, message: "Already processed" });
  }
  const updatedAt = new Date().toISOString();

  await tenantDb
    .prepare("UPDATE orders SET status = ?, trackingNumber = ?, updatedAt = ? WHERE orderId = ?")
    .bind(newStatus, awb || order.trackingNumber, updatedAt, order_id)
    .run();

  // Queue WhatsApp status update
  const controlDb = getControlDb(c.env);
  const storeData = await controlDb
    .prepare("SELECT storeName, addOns FROM tenants WHERE tenantId = ?")
    .bind(tenantId)
    .first<{ storeName: string; addOns: string }>();

  const addOns = storeData?.addOns ? JSON.parse(storeData.addOns) : [];

  if (addOns.includes("whatsapp") && c.env.JOBS_QUEUE && order.customerPhone) {
    try {
      await c.env.JOBS_QUEUE.send({
        type: "WHATSAPP_NOTIFICATION",
        tenantId,
        orderId: order_id,
        recipient: order.customerPhone,
        recipientType: "customer",
        event: newStatus === "delivered" ? "ORDER_DELIVERED" : "ORDER_SHIPPED",
      });
    } catch (queueErr) {
      console.error("Failed to push WhatsApp status update to Queue:", queueErr);
    }
  }

  // Queue transactional order-shipped email to customer
  if (newStatus === "shipped" && order.customerEmail && c.env.JOBS_QUEUE) {
    try {
      await c.env.JOBS_QUEUE.send({
        type: "TRANSACTIONAL_EMAIL",
        tenantId,
        orderId: order_id,
        emailPayload: {
          type: "order-shipped",
          to: order.customerEmail,
          data: {
            orderId: order_id,
            customerName: order.customerName,
            trackingNumber: awb || order.trackingNumber || "N/A",
            carrier: order.carrier || "Our Delivery Partner",
            trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : "",
            storeName: storeData?.storeName || "Basecart",
          },
        },
      });
    } catch (queueErr) {
      console.error("Failed to push order-shipped email to Queue:", queueErr);
    }
  }

  return c.json({ success: true });
});

export default app;
