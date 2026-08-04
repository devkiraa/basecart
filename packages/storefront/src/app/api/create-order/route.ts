import { NextResponse } from "next/server";

/**
 * Next.js API Route: POST /api/create-order
 * Processes Razorpay order creation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amount, currency = "INR", receipt } = body;

    // Validate minimum amount (minimum 100 paise = ₹1)
    const amountInPaise = Math.floor(Number(amount));
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        { error: "Validation Error: Amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TLhimF8Yzakxwd";

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      "qW8gO2qPqfxbpWl3WbHKlFDL";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Authentication Error: Razorpay credentials not configured." },
        { status: 401 }
      );
    }

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
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
        return NextResponse.json(
          { error: "Razorpay authentication failed. Invalid API credentials." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Razorpay API Error: Failed to create order (${razorpayRes.status}).` },
        { status: 500 }
      );
    }

    const orderData = (await razorpayRes.json()) as any;

    return NextResponse.json({
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      key_id: keyId,
    });
  } catch (err: any) {
    console.error("Error in Next.js /api/create-order:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error: Order creation failed." },
      { status: 500 }
    );
  }
}
