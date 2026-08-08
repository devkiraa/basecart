import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { decrypt } from "../lib/crypto";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * Helper to get Razorpay credentials from Tenant Settings or Environment Variables
 */
async function getRazorpayCredentials(c: any, tenantIdOrSubdomain?: string) {
  let keyId =
    (c.env && c.env.RAZORPAY_KEY_ID) ||
    (typeof process !== "undefined" && process.env ? process.env.RAZORPAY_KEY_ID : "") ||
    "rzp_test_TLiBxJXeX2DrUr";
  let keySecret =
    (c.env && c.env.RAZORPAY_KEY_SECRET) ||
    (typeof process !== "undefined" && process.env ? process.env.RAZORPAY_KEY_SECRET : "") ||
    "QKnF9C6gX1aLi1b6xTlapHWr";

  if (tenantIdOrSubdomain) {
    try {
      const controlDb = getControlDb(c.env);
      const store = await controlDb
        .prepare("SELECT razorpayKeyId, razorpaySecret FROM tenants WHERE tenantId = ? OR subdomain = ?")
        .bind(tenantIdOrSubdomain, tenantIdOrSubdomain.toLowerCase())
        .first<any>();

      if (store && store.razorpayKeyId && store.razorpaySecret) {
        const decKey = await decrypt(store.razorpayKeyId, c.env.ENCRYPTION_SECRET);
        const decSecret = await decrypt(store.razorpaySecret, c.env.ENCRYPTION_SECRET);
        if (decKey && decSecret && !decKey.startsWith("mock")) {
          keyId = decKey;
          keySecret = decSecret;
        }
      }
    } catch (e) {
      console.warn("Tenant Razorpay credentials lookup fallback:", e);
    }
  }

  return { keyId, keySecret };
}

/**
 * HMAC-SHA256 Signature Verification Helper
 */
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const text = `${orderId}|${paymentId}`;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", keyMaterial, encoder.encode(text));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expectedSignature === signature;
  } catch (err) {
    console.error("Signature calculation error:", err);
    return false;
  }
}

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 */
app.post("/create-order", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { amount, currency = "INR", receipt, tenantId, subdomain } = body;

    // Validate minimum amount (minimum 100 paise = ₹1)
    const amountInPaise = Math.floor(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return c.json(
        { error: "Validation Error: Amount must be at least 100 paise (₹1)." },
        400
      );
    }

    const { keyId, keySecret } = await getRazorpayCredentials(c, tenantId || subdomain);
    if (!keyId || !keySecret) {
      return c.json(
        { error: "Authentication Error: Razorpay credentials not configured." },
        401
      );
    }

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const authString = btoa(`${keyId}:${keySecret}`);
    const orderReceipt = receipt || `rcpt_${Date.now()}`;

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
      }),
    });

    if (!razorpayRes.ok) {
      const errText = await razorpayRes.text().catch(() => "");
      console.error(`Razorpay order creation failed: ${razorpayRes.status} ${errText}`);
      
      if (razorpayRes.status === 401) {
        return c.json({ error: "Razorpay authentication failed. Invalid API credentials." }, 401);
      }

      return c.json(
        { error: `Razorpay API Error: Failed to create order (${razorpayRes.status}).` },
        500
      );
    }

    const orderData = (await razorpayRes.json()) as any;

    return c.json({
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      key_id: keyId,
    });
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return c.json(
      { error: err.message || "Internal Server Error: Failed to process order creation." },
      500
    );
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 */
app.post("/verify-payment", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tenantId, subdomain } = body;

    // Check missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return c.json(
        {
          success: false,
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
        },
        400
      );
    }

    const { keySecret } = await getRazorpayCredentials(c, tenantId || subdomain);
    if (!keySecret) {
      return c.json(
        { success: false, error: "Authentication Error: Razorpay KEY_SECRET missing." },
        401
      );
    }

    // Verify HMAC-SHA256 signature
    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.warn(`Signature mismatch for order: ${razorpay_order_id}`);
      return c.json(
        {
          success: false,
          error: "Signature Verification Failed: Invalid payment signature. Payment NOT marked as paid.",
        },
        400
      );
    }

    // If tenant context is provided, update DB status directly
    if (tenantId || subdomain) {
      try {
        const controlDb = getControlDb(c.env);
        const store = await controlDb
          .prepare("SELECT tenantId FROM tenants WHERE tenantId = ? OR subdomain = ?")
          .bind(tenantId || subdomain, (tenantId || subdomain).toLowerCase())
          .first<any>();

        if (store?.tenantId) {
          const tenantDb = await getTenantDb(store.tenantId, c.env);
          const targetOrder = await tenantDb
            .prepare("SELECT * FROM orders WHERE razorpayOrderId = ? OR orderId = ?")
            .bind(razorpay_order_id, razorpay_order_id)
            .first<any>();

          if (targetOrder) {
            const updatedAt = new Date().toISOString();
            await tenantDb
              .prepare("UPDATE orders SET status = ?, paymentId = ?, paymentStatus = ?, updatedAt = ? WHERE orderId = ?")
              .bind("paid", razorpay_payment_id, "captured", updatedAt, targetOrder.orderId)
              .run();

            // Decrement stock
            const orderItemsResult = await tenantDb.prepare("SELECT * FROM order_items WHERE orderId = ?").bind(targetOrder.orderId).all();
            for (const item of (orderItemsResult.results || [])) {
              const product = await tenantDb.prepare("SELECT * FROM products WHERE productId = ?").bind(item.productId).first<any>();
              if (product) {
                const newStock = Math.max(0, (product.stockQuantity || 0) - item.quantity);
                await tenantDb.prepare("UPDATE products SET stockQuantity = ? WHERE productId = ?").bind(newStock, item.productId).run();
              }
            }
          }
        }
      } catch (dbErr) {
        console.error("Failed to update order status in DB upon verification:", dbErr);
      }
    }

    return c.json({
      success: true,
      message: "Payment verified successfully",
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error("Error verifying Razorpay payment:", err);
    return c.json(
      { success: false, error: err.message || "Internal Server Error: Verification failed." },
      500
    );
  }
});

export default app;
