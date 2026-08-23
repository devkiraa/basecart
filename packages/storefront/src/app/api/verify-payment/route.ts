import { NextResponse } from "next/server";

export const runtime = "edge";

async function verifyHmacSha256(secret: string, data: string, signature: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    const expectedHex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return expectedHex.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    return false;
  }
}

/**
 * Next.js API Route: POST /api/verify-payment
 * Verifies Razorpay HMAC-SHA256 signature
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Check missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
        },
        { status: 400 }
      );
    }

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      "QKnF9C6gX1aLi1b6xTlapHWr";

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Authentication Error: Razorpay KEY_SECRET missing." },
        { status: 401 }
      );
    }

    // Verify HMAC-SHA256 signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const isValid = await verifyHmacSha256(keySecret, text, razorpay_signature);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Signature Verification Failed: Invalid payment signature. Payment NOT marked as paid.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error("Error in Next.js /api/verify-payment:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error: Verification failed." },
      { status: 500 }
    );
  }
}
