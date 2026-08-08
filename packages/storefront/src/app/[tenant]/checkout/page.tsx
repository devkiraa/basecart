"use client";

export const runtime = "edge";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "../../../lib/cart";
import { getOptimizedImageUrl } from "../../../lib/image";
import {
  CreditCard,
  Shield,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  Banknote,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export default function CheckoutPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const router = useRouter();
  const { items, loaded, subtotal, clearCart } = useCart(tenant);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const savedAddresses = [
    {
      id: "addr-1",
      label: "Home (Kochi)",
      name: "Kiran Kumar",
      phone: "9876543210",
      email: "kiran@example.com",
      address1: "42 Beach Road, Fort Kochi",
      address2: "Near Clock Tower",
      city: "Kochi",
      state: "Kerala",
      pincode: "682001",
    },
    {
      id: "addr-2",
      label: "Office (Infopark)",
      name: "Kiran Kumar",
      phone: "9876543210",
      email: "kiran@example.com",
      address1: "Suite 402, Infopark Phase 1",
      address2: "Kakkanad",
      city: "Kochi",
      state: "Kerala",
      pincode: "682030",
    },
  ];

  const applySavedAddress = (addr: (typeof savedAddresses)[0]) => {
    setForm({
      name: addr.name,
      email: addr.email,
      phone: addr.phone,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setErrors({});
    setCheckoutError(null);
  };

  const total = subtotal;

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setCheckoutError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email is required";
    if (form.phone.length < 10) errs.phone = "Valid 10-digit phone number is required";
    if (!form.address1.trim()) errs.address1 = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setCheckoutError(null);

    try {
      const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: {
          addressLine1: form.address1,
          addressLine2: form.address2 || "",
          city: form.city,
          state: form.state,
          postalCode: form.pincode,
          country: "India",
        },
        lineItems: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantId: i.variant || null,
        })),
        idempotencyKey,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.basecart.app";
      const checkoutRes = await fetch(`${apiUrl}/store/${tenant}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const checkoutData = await checkoutRes.json().catch(() => ({}));

      if (!checkoutRes.ok) {
        throw new Error(
          checkoutData.error || checkoutData.message || "Failed to initialize order checkout."
        );
      }

      const { orderId, razorpayOrderId, key, amount, currency } = checkoutData;

      if (paymentMethod === "cod") {
        clearCart();
        sessionStorage.setItem(
          `basecart_order_${tenant}`,
          JSON.stringify({ orderId, amount: total, items, paymentMethod: "cod" })
        );
        setSuccess(true);
        setTimeout(() => router.push(`/order-confirmation?orderId=${orderId}`), 1200);
        return;
      }

      // Online Razorpay Payment Modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      const keyId = key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TLiBxJXeX2DrUr";

      const options = {
        key: keyId,
        amount: Math.round((amount || total) * 100),
        currency: currency || "INR",
        name: tenant ? `${tenant.toUpperCase()} Store` : "Basecart Store",
        description: `Order #${orderId ? orderId.slice(0, 8) : "Checkout"}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: "#072654",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // Verify HMAC signature via backend
            const verifyRes = await fetch(`${apiUrl}/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (verifyRes.ok && verifyData.success) {
              clearCart();
              sessionStorage.setItem(
                `basecart_order_${tenant}`,
                JSON.stringify({
                  orderId,
                  paymentId: response.razorpay_payment_id,
                  amount: total,
                  items,
                  paymentMethod: "razorpay",
                })
              );
              setSuccess(true);
              setTimeout(() => router.push(`/order-confirmation?orderId=${orderId}`), 1200);
            } else {
              setCheckoutError(verifyData.error || "Payment verification failed. Signature mismatch.");
              setSubmitting(false);
            }
          } catch (err: any) {
            setCheckoutError(err.message || "Error verifying payment signature.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setCheckoutError("Payment cancelled by user.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        setSubmitting(false);
        setCheckoutError(
          resp.error?.description || "Payment failed. Please try another payment option."
        );
      });
      rzp.open();
    } catch (err: any) {
      setSubmitting(false);
      setCheckoutError(err.message || "An unexpected error occurred during checkout.");
    }
  };

  if (!loaded) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl animate-shimmer" />
          <div className="h-64 bg-white rounded-2xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-500 font-semibold">Redirecting to order confirmation...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-6">
        <p className="text-sm font-semibold text-slate-400">Your cart is empty.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl"
        >
          <ArrowLeft size={14} /> Browse Catalog
        </Link>
      </div>
    );
  }

  const fieldClass = (field: string) =>
    `w-full px-3 py-2.5 text-sm font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-colors ${
      errors[field] ? "border-red-300 bg-red-50/50" : "border-slate-200 bg-white"
    }`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <Link href="/cart" className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Cart
        </Link>
      </div>

      {checkoutError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold rounded-xl flex items-center justify-between shadow-xs">
          <span>{checkoutError}</span>
          <button onClick={() => setCheckoutError(null)} className="text-rose-600 font-extrabold text-base cursor-pointer">×</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping Form & Payment Selection */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin size={13} /> Shipping Details
              </h2>
            </div>

            {/* Saved Address Book Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                📖 Saved Address Book
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applySavedAddress(addr)}
                    className="p-3 text-left bg-white rounded-lg border border-slate-200 hover:border-blue-500 transition-all text-xs font-semibold space-y-0.5 group cursor-pointer"
                  >
                    <div className="font-extrabold text-slate-900 group-hover:text-blue-600">
                      {addr.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{addr.address1}, {addr.city}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={`${fieldClass("name")} pl-9`}
                  />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={`${fieldClass("email")} pl-9`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={`${fieldClass("phone")} pl-9`}
                  />
                </div>
                {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Address Line 1</label>
                <input
                  type="text"
                  placeholder="Street address, house number"
                  value={form.address1}
                  onChange={(e) => update("address1", e.target.value)}
                  className={fieldClass("address1")}
                />
                {errors.address1 && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.address1}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, suite, landmark"
                  value={form.address2}
                  onChange={(e) => update("address2", e.target.value)}
                  className={fieldClass("address2")}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">City</label>
                  <input
                    type="text"
                    placeholder="Kochi"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className={fieldClass("city")}
                  />
                  {errors.city && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                  <input
                    type="text"
                    placeholder="Kerala"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className={fieldClass("state")}
                  />
                  {errors.state && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Pincode</label>
                  <input
                    type="text"
                    placeholder="682001"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={fieldClass("pincode")}
                  />
                  {errors.pincode && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard size={13} /> Select Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("razorpay")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                  paymentMethod === "razorpay"
                    ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-600/30"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <span className="font-extrabold text-xs">Razorpay Online</span>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  UPI (GPay / PhonePe), Credit / Debit Cards, Netbanking & Wallets
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                  paymentMethod === "cod"
                    ? "border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-600/30"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-600" />
                    <span className="font-extrabold text-xs">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Pay on Delivery
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Pay with cash when order is delivered to your address
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 shrink-0 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="flex gap-3 items-center">
                  <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                    <Image
                      src={getOptimizedImageUrl(item.image, "thumbnail")}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-contain max-h-10 w-auto"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-black text-slate-950">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-950 text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-[#072654] hover:bg-[#0a1d42] text-white text-sm font-extrabold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : paymentMethod === "razorpay" ? (
                <>
                  <CreditCard size={15} />
                  Pay ₹{total.toLocaleString("en-IN")} with Razorpay
                </>
              ) : (
                <>
                  <Banknote size={15} />
                  Place Order (COD ₹{total.toLocaleString("en-IN")})
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
              <Shield size={11} /> 100% Encrypted & Secured Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
