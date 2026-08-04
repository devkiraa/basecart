import { describe, it, expect } from "vitest";
import { buildApp } from "../app";

describe("Razorpay Standard Web Checkout API Suite", () => {
  const app = buildApp();
  const testSecret = "qW8gO2qPqfxbpWl3WbHKlFDL";

  async function calculateSignature(orderId: string, paymentId: string, secret: string) {
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
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  it("should reject order creation if amount < 100 paise", async () => {
    const res = await app.request("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50, currency: "INR" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("at least 100 paise");
  });

  it("should reject verification if required fields are missing", async () => {
    const res = await app.request("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razorpay_order_id: "order_123" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Missing required fields");
  });

  it("should reject verification when HMAC-SHA256 signature is invalid", async () => {
    const res = await app.request(
      "/api/verify-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_test_12345",
          razorpay_payment_id: "pay_test_67890",
          razorpay_signature: "invalid_signature_hash",
        }),
      },
      {
        RAZORPAY_KEY_ID: "rzp_test_TLhimF8Yzakxwd",
        RAZORPAY_KEY_SECRET: testSecret,
      }
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Signature Verification Failed");
  });

  it("should verify payment successfully when HMAC-SHA256 signature matches", async () => {
    const orderId = "order_test_99999";
    const paymentId = "pay_test_88888";
    const validSig = await calculateSignature(orderId, paymentId, testSecret);

    const res = await app.request(
      "/api/verify-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSig,
        }),
      },
      {
        RAZORPAY_KEY_ID: "rzp_test_TLhimF8Yzakxwd",
        RAZORPAY_KEY_SECRET: testSecret,
      }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Payment verified successfully");
    expect(body.order_id).toBe(orderId);
    expect(body.payment_id).toBe(paymentId);
  });
});
