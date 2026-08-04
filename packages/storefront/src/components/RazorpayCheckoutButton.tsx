"use client";

import React, { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount?: number; // Amount in INR (e.g. 100 for ₹100, default ₹10)
  buttonText?: string;
  onSuccess?: (data: { orderId: string; paymentId: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Helper to dynamically load the Razorpay Checkout SDK Script
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckoutButton({
  amount = 10, // Default ₹10 (1000 paise)
  buttonText = "Pay with Razorpay",
  onSuccess,
  onError,
  className = "px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setStatusMessage({ type: "info", text: "Initializing payment..." });

    try {
      // 1. Ensure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // Amount in paise (minimum 100 paise = ₹1)
      const amountInPaise = Math.max(100, Math.round(amount * 100));

      // 2. Call backend to create order (uses Cloudflare Worker backend if NEXT_PUBLIC_API_URL is defined, else local Next.js route)
      const backendBase = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
        : "";
      const apiUrl = `${backendBase}/api/create-order`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.order_id) {
        throw new Error(data.error || "Failed to create payment order on server.");
      }

      const keyId =
        data.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TLiBxJXeX2DrUr";

      // 3. Open Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Basecart Store",
        description: "Standard Web Checkout Payment",
        order_id: data.order_id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setStatusMessage({ type: "info", text: "Verifying payment signature..." });

          try {
            // 4. Call backend to verify payment signature
            const verifyUrl = `${backendBase}/api/verify-payment`;

            const verifyRes = await fetch(verifyUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (verifyRes.ok && verifyData.success) {
              setStatusMessage({
                type: "success",
                text: `Payment Successful! Payment ID: ${response.razorpay_payment_id}`,
              });
              if (onSuccess) {
                onSuccess({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                });
              }
            } else {
              const errMsg =
                verifyData.error || "Payment verification failed. Signature mismatch.";
              setStatusMessage({ type: "error", text: errMsg });
              if (onError) onError(errMsg);
            }
          } catch (verifyErr: any) {
            const errMsg = verifyErr.message || "Network error during payment verification.";
            setStatusMessage({ type: "error", text: errMsg });
            if (onError) onError(errMsg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setStatusMessage({
              type: "error",
              text: "Payment cancelled by user.",
            });
            if (onError) onError("Payment cancelled by user.");
          },
        },
        prefill: {
          name: "John Doe",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#059669",
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment.failed event
      razorpayInstance.on("payment.failed", function (response: any) {
        setLoading(false);
        const failureReason =
          response.error?.description || "Payment failed. Please try again.";
        setStatusMessage({ type: "error", text: `Payment Failed: ${failureReason}` });
        if (onError) onError(failureReason);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.message || "An unexpected error occurred.";
      setStatusMessage({ type: "error", text: errMsg });
      if (onError) onError(errMsg);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
            </svg>
            {buttonText} (₹{amount})
          </>
        )}
      </button>

      {statusMessage && (
        <div
          className={`px-4 py-2 text-sm rounded-lg font-medium text-center transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : statusMessage.type === "error"
              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
          }`}
        >
          {statusMessage.text}
        </div>
      )}
    </div>
  );
}
