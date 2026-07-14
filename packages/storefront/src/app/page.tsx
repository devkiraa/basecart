"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Tag,
  CreditCard,
  User,
  ArrowLeft,
  Loader2,
  Trash2,
  Calendar,
} from "lucide-react";
import { getOptimizedImageUrl } from "../lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ProductVariant {
  id: string;
  options: Record<string, string>;
  price?: number | null;
  stockQuantity: number;
  sku?: string | null;
  barcode?: string | null;
}

interface Product {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  status: "active" | "draft";
  images: string[];
  description?: string;
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  sku?: string | null;
  barcode?: string | null;
  category: "Clothing" | "Electronics" | "Home & Kitchen" | "Beauty" | "Food" | "Other";
  productType?: string | null;
  vendor?: string | null;
  weight?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  continueSellingOutOfStock?: boolean;
  variants?: ProductVariant[];
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant | null;
}

const MOCK_WATCH_PRODUCTS: Product[] = [
  {
    productId: "watch-1",
    name: "Skagen Connected HALD",
    price: 399,
    stockQuantity: 10,
    status: "active",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80"],
    description: "Elegant minimalist design with premium golden mesh strap.",
    category: "Other",
    compareAtPrice: 450,
  },
  {
    productId: "watch-2",
    name: "Fossil Q VENTURE",
    price: 299,
    stockQuantity: 5,
    status: "active",
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80"],
    description: "Rose gold smartwatch featuring touchscreen and activity tracking.",
    category: "Other",
  },
  {
    productId: "watch-3",
    name: "Skagen Connected HALD Silver",
    price: 399,
    stockQuantity: 12,
    status: "active",
    images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80"],
    description: "Polished silver design with a classic, refined stainless steel band.",
    category: "Other",
  },
  {
    productId: "watch-4",
    name: "Fossil Q VENTURE Black",
    price: 299,
    stockQuantity: 8,
    status: "active",
    images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80"],
    description: "Sleek all-black matte smartwatch with leather band.",
    category: "Other",
  },
  {
    productId: "watch-5",
    name: "Skagen Connected HALD Gold",
    price: 399,
    stockQuantity: 4,
    status: "active",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80"],
    description: "Elegant champagne gold face watch for formal occasions.",
    category: "Other",
  },
  {
    productId: "watch-6",
    name: "Fossil Q VENTURE Tan",
    price: 299,
    stockQuantity: 7,
    status: "active",
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80"],
    description: "Classic design smartwatch with premium tan leather strap.",
    category: "Other",
  },
  {
    productId: "watch-7",
    name: "Skagen Connected HALD Charcoal",
    price: 399,
    stockQuantity: 15,
    status: "active",
    images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80"],
    description: "Modern charcoal mesh band with scratch-resistant mineral glass.",
    category: "Other",
  },
  {
    productId: "watch-8",
    name: "Fossil Q VENTURE Gold",
    price: 299,
    stockQuantity: 3,
    status: "active",
    images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80"],
    description: "Luxurious gold-tone smartwatch with built-in heart rate monitor.",
    category: "Other",
  }
];

export default function Storefront() {
  // Storefront lookup state
  const [subdomain, setSubdomain] = useState("mystore");
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Variant Selection details modal state
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Customer auth/view state
  const [custToken, setCustToken] = useState<string | null>(null);
  const [custName, setCustName] = useState<string | null>(null);
  const [isCustLoginView, setIsCustLoginView] = useState(true);
  const [custEmail, setCustEmail] = useState("");
  const [custPassword, setCustPassword] = useState("");
  const [custNameInput, setCustNameInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<{ title: string; content: string } | null>(null);
  // Customer recovery states
  const [showCustForgotView, setShowCustForgotView] = useState(false);
  const [custForgotEmail, setCustForgotEmail] = useState("");
  const [custForgotSent, setCustForgotSent] = useState(false);
  const [custResetToken, setCustResetToken] = useState("");
  const [custNewPassword, setCustNewPassword] = useState("");
  const [custResetSuccess, setCustResetSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  // Checkout view state
  const [view, setView] = useState<"catalog" | "cart" | "checkout" | "success" | "orders">("catalog");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Dynamic SEO Client-side Update
  useEffect(() => {
    if (storeInfo) {
      document.title = `${storeInfo.storeName} | Online Shop`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        "content",
        `Shop live catalog items on ${storeInfo.storeName}. Secure checkout and fast delivery.`
      );

      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", `${storeInfo.storeName} | Online Shop`);

      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute(
        "content",
        `Explore great collections at ${storeInfo.storeName}.`
      );

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      if (storeInfo.branding?.logoUrl) {
        ogImage.setAttribute("content", storeInfo.branding.logoUrl);
      }
    }
  }, [storeInfo]);

  // Resolve subdomain from window location or query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const parts = host.split(".");
      const params = new URLSearchParams(window.location.search);
      const querySubdomain = params.get("subdomain") || params.get("store");

      if (querySubdomain) {
        setSubdomain(querySubdomain);
      } else if (parts.length >= 2 && parts[0] !== "localhost" && parts[0] !== "www") {
        setSubdomain(parts[0]);
      }

      // Check customer reset password token in query params
      const tokenParam = params.get("token");
      if (tokenParam) {
        setCustResetToken(tokenParam);
        setShowAuthModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Fetch store details & products on subdomain load
  useEffect(() => {
    loadStoreDetails();
  }, [subdomain]);

  // Load customer session (via httpOnly cookie check)
  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/customer/me`, {
          credentials: "include",
          headers: {
            "x-subdomain": subdomain,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCustToken(data.accessToken);
          setCustName(data.name);
        }
      } catch (err) {
        console.error("No customer session found:", err);
      }
    };
    if (subdomain) {
      checkCustomerSession();
    }
  }, [subdomain]);

  const loadStoreDetails = async () => {
    setLoadingStore(true);
    setStoreInfo(null);
    setProducts([]);
    try {
      // 1. Fetch Store Details
      const infoRes = await fetch(`${API_URL}/store/${subdomain}/info`);
      if (!infoRes.ok) throw new Error("Store not found");
      const infoData = await infoRes.json();
      setStoreInfo(infoData);

      // 2. Fetch Active Products
      const prodRes = await fetch(`${API_URL}/store/${subdomain}/products`);
      if (prodRes.ok) {
        setProducts(await prodRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStore(false);
    }
  };

  const addToCart = (product: Product, variant: ProductVariant | null = null) => {
    if (product.variants && product.variants.length > 0 && !variant) {
      setSelectedProductDetails(product);
      setSelectedOptions({});
      setSelectedVariant(null);
      return;
    }

    const stock = variant !== null ? variant.stockQuantity : product.stockQuantity;
    const cartKey = variant ? `${product.productId}-${variant.id}` : product.productId;

    const existingIndex = cart.findIndex((item) => {
      const itemKey = item.selectedVariant ? `${item.product.productId}-${item.selectedVariant.id}` : item.product.productId;
      return itemKey === cartKey;
    });

    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= stock) return;
      const nextCart = [...cart];
      nextCart[existingIndex].quantity += 1;
      setCart(nextCart);
    } else {
      setCart([...cart, { product, quantity: 1, selectedVariant: variant }]);
    }
    
    setSelectedProductDetails(null);
  };

  const updateCartQty = (productId: string, delta: number, variantId?: string | null) => {
    const cartKey = variantId ? `${productId}-${variantId}` : productId;
    
    setCart(
      cart
        .map((item) => {
          const itemKey = item.selectedVariant ? `${item.product.productId}-${item.selectedVariant.id}` : item.product.productId;
          if (itemKey === cartKey) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            const stock = item.selectedVariant ? item.selectedVariant.stockQuantity : item.product.stockQuantity;
            if (nextQty > stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const validateCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    setDiscountAmount(0);

    if (!couponCode) return;

    try {
      const cartTotal = cart.reduce((acc, item) => {
        const price = item.selectedVariant?.price !== undefined && item.selectedVariant?.price !== null ? item.selectedVariant.price : item.product.price;
        return acc + price * item.quantity;
      }, 0);
      const res = await fetch(`${API_URL}/store/${subdomain}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal }),
      });

      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.reason || "Invalid discount code");
      } else {
        setDiscountAmount(data.discountAmount);
        setCouponSuccess(`Coupon "${couponCode.toUpperCase()}" applied successfully!`);
      }
    } catch (err) {
      setCouponError("Failed to validate coupon code.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");
    setLoadingCheckout(true);

    const subtotal = cart.reduce((acc, item) => {
      const price = item.selectedVariant?.price !== undefined && item.selectedVariant?.price !== null ? item.selectedVariant.price : item.product.price;
      return acc + price * item.quantity;
    }, 0);
    const total = Math.max(0, subtotal - discountAmount);

    try {
      // 1. Create order and fetch payment details
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (custToken) {
        // Read customer profile if authenticated
        headers["Authorization"] = `Bearer ${custToken}`;
      }

      const res = await fetch(`${API_URL}/store/${subdomain}/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress: {
            addressLine1,
            city,
            postalCode,
            state: "Karnataka",
            country: "India",
          },
          lineItems: cart.map((item) => ({
            productId: item.product.productId,
            variantId: item.selectedVariant?.id || undefined,
            quantity: item.quantity,
          })),
          discountCode: couponCode || undefined,
          idempotencyKey: `${customerEmail}-${Date.now()}`,
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) throw new Error(checkoutData.error || "Checkout failed");

      // 2. Load and trigger Razorpay checkout modal
      const options = {
        key: checkoutData.key || "rzp_test_mock",
        amount: checkoutData.amount * 100,
        currency: "INR",
        name: storeInfo.storeName,
        description: "Order Checkout",
        order_id: checkoutData.razorpayOrderId,
        handler: async function (response: any) {
          // Simulated signature bypass to trigger successful payment webhook locally in development
          try {
            await fetch(`${API_URL}/store/${subdomain}/webhooks/razorpay`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-razorpay-signature": "mock-signature-bypass",
              },
              body: JSON.stringify({
                event: "order.paid",
                payload: {
                  payment: {
                    entity: {
                      id: response.razorpay_payment_id || "pay_mock_123",
                      order_id: response.razorpay_order_id || checkoutData.razorpayOrderId,
                    },
                  },
                },
              }),
            });

            setCompletedOrder({
              orderId: checkoutData.orderId,
              amount: checkoutData.amount,
            });
            setCart([]);
            setCouponCode("");
            setDiscountAmount(0);
            setView("success");
          } catch (err) {
            console.error("Webhook trigger failed", err);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
        },
        theme: {
          color: storeInfo.branding?.primaryColor || "#2563EB",
        },
      };

      // In local testing, if using mock Razorpay flow, trigger fake handler immediately
      if (options.order_id.startsWith("order_mock_")) {
        console.log("Mock Payment active. Simulating payment success handler...");
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: "pay_mock_test",
            razorpay_order_id: options.order_id,
          });
        }, 1500);
      } else {
        // Load real Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleCustomerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const url = isCustLoginView ? `${API_URL}/auth/customer/login` : `${API_URL}/auth/customer/signup`;
      const bodyPayload = isCustLoginView
        ? { email: custEmail, password: custPassword }
        : { email: custEmail, password: custPassword, name: custNameInput };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": subdomain,
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("basecart_customer_name", data.name);
      setCustToken(data.accessToken);
      setCustName(data.name);
      setShowAuthModal(false);
      setCustEmail("");
      setCustPassword("");
      setCustNameInput("");
      fetchCustomerOrders(data.accessToken);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleCustomerForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/customer/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": subdomain,
        },
        body: JSON.stringify({ email: custForgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setCustForgotSent(true);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleCustomerResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch(`${API_URL}/auth/customer/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": subdomain,
        },
        body: JSON.stringify({ token: custResetToken, newPassword: custNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setCustResetSuccess(true);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const fetchCustomerOrders = async (tokenStr: string) => {
    try {
      const res = await fetch(`${API_URL}/store/${subdomain}/my-orders`, {
        headers: {
          Authorization: `Bearer ${tokenStr}`,
        },
      });
      if (res.ok) {
        setCustomerOrders(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/customer/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "x-subdomain": subdomain,
        },
      });
    } catch (e) {
      console.error("Logout request failed", e);
    }
    localStorage.removeItem("basecart_customer_name");
    setCustToken(null);
    setCustName(null);
    setCustomerOrders([]);
    setView("catalog");
  };

  // Trigger loading orders if session is active
  useEffect(() => {
    if (custToken) {
      fetchCustomerOrders(custToken);
    }
  }, [custToken]);

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  // --- Loading screen ---
  if (loadingStore) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shadow-sm">
          <div className="h-6 w-32 bg-slate-200 rounded animate-shimmer" />
          <div className="flex gap-4">
            <div className="h-6 w-16 bg-slate-200 rounded animate-shimmer" />
            <div className="h-6 w-8 bg-slate-200 rounded animate-shimmer" />
          </div>
        </header>

        {/* Main Skeleton Grid */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded animate-shimmer" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-shimmer" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden flex flex-col space-y-4 p-5">
                <div className="aspect-video w-full bg-slate-200 rounded animate-shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-200 rounded animate-shimmer w-2/3" />
                  <div className="h-3 bg-slate-200 rounded animate-shimmer w-full" />
                  <div className="h-3 bg-slate-200 rounded animate-shimmer w-5/6" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-slate-200 rounded animate-shimmer w-1/4" />
                  <div className="h-8 bg-slate-200 rounded animate-shimmer w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // --- Storefront Not Found ---
  if (!storeInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-card p-8 rounded-card text-center">
          <h1 className="text-2xl font-bold text-slate-800">Store Not Found</h1>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            The store sub-domain <strong>"{subdomain}"</strong> is not registered.
          </p>
          <div className="space-y-4">
            <label className="block text-xs text-left font-bold text-slate-600 uppercase tracking-wider">
              Enter subdomain to preview storefront
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                placeholder="mystore"
              />
              <button
                onClick={loadStoreDetails}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const theme = storeInfo?.theme;
  const templateBase = theme?.templateBase || "Aura";
  const primaryColor = theme?.colors?.primary || storeInfo?.branding?.primaryColor || "#2563EB";
  const logoUrl = theme?.logoUrl || storeInfo?.branding?.logoUrl || "";
  const displayProducts = products.length > 0 ? products : MOCK_WATCH_PRODUCTS;

  const getHeroTitle = () => theme?.pageContent?.home?.heroTitle || "BUILT FOR PERFORMANCE";
  const getHeroSubtext = () => theme?.pageContent?.home?.heroSubtext || "Premium active gear for those who never compromise.";
  const getCtaText = () => theme?.pageContent?.home?.ctaText || "SHOP NOW";

  const getCatalogTitle = () => theme?.pageContent?.catalog?.pageTitle || "Our Products";
  const getCatalogSubtext = () => theme?.pageContent?.catalog?.pageSubtext || "Pick from our premium store items";

  const getCheckoutTitle = () => theme?.pageContent?.checkout?.pageTitle || "Shipping & Checkout";
  const getCheckoutInstructions = () => theme?.pageContent?.checkout?.instructions || "Enter billing details to complete checkout.";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Store Header */}
      <header 
        className={`bg-white border-b sticky top-0 z-20 px-8 flex items-center justify-between shadow-sm h-16 ${
          templateBase === "Origin" 
            ? "border-double border-b-4 border-slate-300 font-serif" 
            : "border-slate-200"
        }`}
        style={{ borderTop: `4px solid ${primaryColor}` }}
      >
        {/* Left Side: Logo/Name */}
        <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => setView("catalog")}>
          {logoUrl ? (
            <img src={getOptimizedImageUrl(logoUrl, "thumbnail")} alt={storeInfo.storeName} className="h-8 max-w-[150px] object-contain" />
          ) : (
            <span className={`text-xl font-bold tracking-tight text-slate-900 uppercase ${
              templateBase === "Pulse" ? "tracking-widest font-black" : templateBase === "Origin" ? "font-serif font-bold italic" : templateBase === "Aura" ? "tracking-widest font-bold text-lg" : ""
            }`}>
              {storeInfo.storeName}
            </span>
          )}
        </div>

        {/* Center: Navigation / Search based on template */}
        {templateBase === "Pulse" ? (
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 w-64">
            <span className="text-xs text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-600"
            />
          </div>
        ) : templateBase === "Origin" ? (
          <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-wider text-slate-600">
            <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setView("catalog")}>Home</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setView("catalog")}>Catalog</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors">About</span>
          </div>
        ) : templateBase === "Stride" ? (
          <div className="hidden md:flex items-center gap-6 text-sm font-extrabold uppercase tracking-wide text-slate-600">
            <span className="cursor-pointer hover:text-slate-950 transition-colors" onClick={() => setView("catalog")}>Home</span>
            <span className="cursor-pointer hover:text-slate-950 transition-colors" onClick={() => setView("catalog")}>Collections</span>
            <span className="cursor-pointer hover:text-slate-950 transition-colors">Shop</span>
          </div>
        ) : (
          /* Aura default center nav */
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setView("catalog")}>her</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setView("catalog")}>him</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setView("catalog")}>brands</span>
          </div>
        )}

        {/* Right Side: Local Subdomain Swapper + Customer Actions */}
        <div className="flex items-center gap-6">
          {/* Local Sandbox Subdomain Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-55 border border-slate-200 rounded-full px-2.5 py-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Subdomain:</span>
            <input
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold text-slate-800 focus:outline-none w-16"
            />
          </div>

          {custName ? (
            <div className="flex items-center gap-4 text-sm font-medium">
              <button
                onClick={() => setView(view === "orders" ? "catalog" : "orders")}
                className="hover:text-slate-900 text-slate-600 flex items-center gap-1.5 transition-colors"
              >
                <User className="h-4 w-4" /> Hi, {custName}
              </button>
              <button
                onClick={handleCustomerLogout}
                className="text-xs text-slate-400 hover:text-red-500 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <User className="h-4 w-4" /> Account
            </button>
          )}

          <button
            onClick={() => setView("cart")}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <span
                style={{ backgroundColor: primaryColor }}
                className="absolute -top-1.5 -right-1.5 text-[10px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center"
              >
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {/* VIEW 1: Catalog */}
        {view === "catalog" && (
          <div className="space-y-6">
            {/* Template Base Hero Banner Layout */}
            {templateBase === "Pulse" ? (
              <div className="bg-slate-950 text-white rounded-2xl p-8 md:p-16 text-center relative overflow-hidden mb-8 border border-slate-800/40 shadow-xl select-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-pink-500/10 opacity-60"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <span className="text-xs tracking-widest font-black uppercase" style={{ color: primaryColor }}>New Season Arrival</span>
                  <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    {getHeroTitle()}
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                    {getHeroSubtext()}
                  </p>
                  <button
                    onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ backgroundColor: primaryColor }}
                    className="px-8 py-3.5 text-white text-xs font-black rounded-full shadow-lg hover:scale-105 transition-transform uppercase tracking-widest"
                  >
                    {getCtaText()}
                  </button>
                </div>
              </div>
            ) : templateBase === "Stride" ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm select-none">
                <div className="space-y-4 text-left max-w-md">
                  <h1 className="text-3xl md:text-5xl font-black text-slate-950 uppercase tracking-tight leading-none">
                    {getHeroTitle()}
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {getHeroSubtext()}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Premium Training", "Active Comfort", "Indoor & Gym", "High-Performance Gear"].map((pill) => (
                      <span key={pill} className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full text-slate-600 bg-slate-50">
                        {pill}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-3 text-white text-xs font-extrabold rounded shadow-md hover:opacity-90 transition-opacity uppercase tracking-wider"
                  >
                    {getCtaText()}
                  </button>
                </div>
                <div className="w-full md:w-72 aspect-video bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-350 text-xs font-black uppercase tracking-wider shadow-inner select-none">
                  [ Performance Gear Preview ]
                </div>
              </div>
            ) : templateBase === "Origin" ? (
              <div className="bg-white border-2 border-double border-slate-300 rounded-2xl p-8 md:p-14 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-sm select-none">
                <div className="space-y-4 text-left font-serif">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                    {getHeroTitle()}
                  </h1>
                  <p className="text-slate-500 text-sm font-sans leading-relaxed">
                    {getHeroSubtext()}
                  </p>
                  <button
                    onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-2.5 text-white text-xs font-bold rounded font-sans shadow-sm hover:opacity-90 transition-opacity uppercase tracking-wider"
                  >
                    {getCtaText()}
                  </button>
                </div>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-center gap-2 select-none h-full font-sans">
                  <div className="text-xs font-serif font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Featured Product</div>
                  <div className="h-24 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    LIMITED EDITION PREMIUM GOODS
                  </div>
                </div>
              </div>
            ) : (
              // Aura Layout
              <div className="bg-[#e0f2fe] rounded-none p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 mb-16 relative overflow-hidden select-none border-b border-slate-100">
                <div className="space-y-6 max-w-lg text-left relative z-10">
                  <h1 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900 leading-tight">
                    {getHeroTitle() === "BUILT FOR PERFORMANCE" ? "40% Autumn sale" : getHeroTitle()}
                  </h1>
                  <div className="border border-slate-350 px-3 py-1 rounded-full text-xs font-semibold text-slate-700 bg-white/60 w-fit">
                    {getHeroSubtext() === "Premium active gear for those who never compromise." ? "code Autumn20" : getHeroSubtext()}
                  </div>
                  <button
                    onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    className="px-8 py-3.5 bg-black text-white text-xs font-semibold tracking-widest hover:bg-slate-900 transition-colors uppercase"
                  >
                    {getCtaText() === "SHOP NOW" ? "Shop products" : getCtaText()}
                  </button>
                  <div className="pt-8">
                    <span 
                      onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-medium flex items-center gap-1"
                    >
                      ↓ Explore collection
                    </span>
                  </div>
                </div>

                {/* Right side Featured Image Offset Card */}
                <div className="relative z-10 mr-4">
                  {/* Gray background offset card */}
                  <div className="absolute -top-4 -left-4 w-full h-full bg-slate-200/50 z-0"></div>
                  
                  <div className="bg-white border border-slate-100 p-6 relative z-10 shadow-lg max-w-[280px] text-left">
                    <img 
                      src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&auto=format&fit=crop&q=80" 
                      alt="Featured Watch" 
                      className="w-full h-56 object-cover mb-4" 
                    />
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Skagen Connected</div>
                    <div className="text-xs font-extrabold text-slate-800 tracking-tight mt-0.5 font-sans">HALD Gold Limited</div>
                  </div>
                </div>
              </div>
            )}

            {templateBase === "Aura" ? (
              <div className="space-y-12">
                <div id="products-grid" className="scroll-mt-20 text-left">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">SHOP</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {displayProducts.map((prod) => (
                    <div key={prod.productId} className="flex flex-col justify-between text-left group cursor-pointer" onClick={() => addToCart(prod)}>
                      {/* Product Image Card */}
                      <div className="aspect-square w-full bg-[#f5f5f4] flex items-center justify-center p-8 overflow-hidden relative">
                        {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                          <span className="absolute top-4 left-4 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                            Bestseller
                          </span>
                        )}
                        {prod.images && prod.images[0] ? (
                          <img 
                            src={prod.images[0].startsWith("http") ? prod.images[0] : getOptimizedImageUrl(prod.images[0], "medium")} 
                            alt={prod.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <Package className="h-16 w-16 text-slate-300" />
                        )}
                      </div>
                      
                      {/* Product details */}
                      <div className="pt-4 space-y-1 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {prod.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-amber-400 text-[10px] mt-1">
                            {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                            <span className="text-[9px] text-slate-450 ml-1 font-semibold font-sans">(132 reviews)</span>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-sm font-bold text-slate-900">₹{prod.price}</span>
                          {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                            <span className="text-xs text-slate-400 line-through font-sans">₹{prod.compareAtPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Show more button */}
                <div className="pt-4 text-center">
                  <button 
                    onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                    className="px-6 py-2.5 border border-slate-950 text-slate-950 text-xs font-semibold tracking-wider uppercase hover:bg-slate-950 hover:text-white transition-colors"
                  >
                    Show more
                  </button>
                </div>

                {/* Sixty Seconds Promo block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-20 pt-10">
                  <div className="relative pl-8 flex justify-center md:justify-start">
                    {/* Blue backing block */}
                    <div className="absolute top-8 left-0 w-3/4 h-[90%] bg-blue-100/70 z-0"></div>
                    <div className="relative z-10 shadow-lg max-w-sm">
                      <img 
                        src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80" 
                        alt="Sixty Seconds" 
                        className="w-full h-80 object-cover" 
                      />
                    </div>
                  </div>
                  <div className="space-y-6 text-left max-w-md">
                    <h2 className="text-2xl md:text-3xl font-light tracking-tight text-slate-800 leading-tight">
                      Sixty seconds make a minute: How much good can I do in it?
                    </h2>
                    <button
                      onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                      className="px-6 py-3 bg-black text-white text-xs font-semibold tracking-wider uppercase hover:bg-slate-900 transition-colors"
                    >
                      Show watches
                    </button>
                  </div>
                </div>

                {/* Blog Section */}
                <div className="my-20 text-left pt-10">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">BLOG</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Blog Post 1 */}
                    <div className="space-y-4 cursor-pointer group">
                      <div className="overflow-hidden bg-slate-100 aspect-video relative">
                        <img 
                          src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=600&auto=format&fit=crop&q=80" 
                          alt="Autumn trends 2020" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <h3 className="font-medium text-slate-900 text-lg group-hover:text-blue-600 transition-colors">Autumn trends 2020</h3>
                      <div className="text-xs text-slate-400 font-medium font-sans">August 2, 2020</div>
                    </div>
                    {/* Blog Post 2 */}
                    <div className="space-y-4 cursor-pointer group">
                      <div className="overflow-hidden bg-slate-100 aspect-video relative">
                        <img 
                          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80" 
                          alt="Watch care tips" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <h3 className="font-medium text-slate-900 text-lg group-hover:text-blue-600 transition-colors">Tips to keep your watch clean and scratch free</h3>
                      <div className="text-xs text-slate-400 font-medium font-sans">July 22, 2020</div>
                    </div>
                  </div>
                </div>

                {/* Newsletter block */}
                <div className="bg-[#bfdbfe] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 my-16 select-none">
                  <div className="text-left col-span-1">
                    <h2 className="text-3xl font-light text-slate-900 leading-tight">10% discount?</h2>
                    <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider font-semibold">Join our newsletter list today</p>
                  </div>
                  <div className="flex w-full md:w-auto max-w-md gap-2">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="px-4 py-3 bg-white text-sm text-slate-900 focus:outline-none flex-1 md:w-64 font-sans"
                    />
                    <button className="px-6 py-3 bg-black text-white text-xs font-semibold tracking-wider uppercase hover:bg-slate-900 transition-colors">
                      Submit
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              // Original non-Aura grid rendering
              <>
                <div id="products-grid" className="scroll-mt-20">
                  <h2 className="text-2xl font-bold tracking-tight">{getCatalogTitle()}</h2>
                  <p className="text-sm text-slate-500">{getCatalogSubtext()}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {displayProducts.map((prod) => (
                    <div key={prod.productId} className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors">
                      <div className="aspect-video w-full border-b border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                        {prod.images && prod.images[0] ? (
                          <img src={prod.images[0].startsWith("http") ? prod.images[0] : getOptimizedImageUrl(prod.images[0], "small")} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-12 w-12 text-slate-300" />
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base mb-1">{prod.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4">{prod.description || "No description provided."}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <span className="text-lg font-extrabold text-slate-900">₹{prod.price}</span>
                            {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                              <span className="text-xs text-slate-400 line-through">₹{prod.compareAtPrice}</span>
                            )}
                          </div>
                          {prod.stockQuantity <= 0 && (!prod.variants || prod.variants.every(v => v.stockQuantity <= 0)) ? (
                            <span className="text-xs text-red-500 font-bold">Out of stock</span>
                          ) : (
                            <button
                              onClick={() => addToCart(prod)}
                              style={{ backgroundColor: primaryColor }}
                              className="px-3.5 py-1.5 text-white rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              {prod.variants && prod.variants.length > 0 ? "Select Options" : "Add to Cart"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: Cart */}
        {view === "cart" && (
          <div className="bg-white border border-slate-200 rounded-card shadow-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setView("catalog")} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold">Your Shopping Cart</h2>
            </div>

            {cart.length > 0 ? (
              <div className="space-y-6">
                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const price = item.selectedVariant?.price !== undefined && item.selectedVariant?.price !== null ? item.selectedVariant.price : item.product.price;
                    const itemKey = item.selectedVariant ? `${item.product.productId}-${item.selectedVariant.id}` : item.product.productId;
                    
                    return (
                      <div key={itemKey} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 border rounded bg-slate-50 overflow-hidden flex items-center justify-center">
                            {item.product.images?.[0] ? (
                              <img src={getOptimizedImageUrl(item.product.images[0], "thumbnail")} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{item.product.name}</h4>
                            {item.selectedVariant && (
                              <div className="text-xs text-slate-500 font-medium">
                                {Object.entries(item.selectedVariant.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                              </div>
                            )}
                            <span className="text-xs text-slate-500">₹{price} each</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-slate-200 rounded">
                            <button onClick={() => updateCartQty(item.product.productId, -1, item.selectedVariant?.id)} className="px-2 py-0.5 text-slate-500 hover:bg-slate-50">-</button>
                            <span className="px-3 py-0.5 text-sm font-semibold text-slate-800">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.productId, 1, item.selectedVariant?.id)} className="px-2 py-0.5 text-slate-500 hover:bg-slate-50">+</button>
                          </div>
                          <button onClick={() => updateCartQty(item.product.productId, -item.quantity, item.selectedVariant?.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupons */}
                <div className="border-t border-slate-100 pt-6">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Promo / Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="px-3 py-1.5 border border-slate-300 rounded text-sm flex-1 text-slate-900 focus:outline-none"
                      placeholder="SAVE10"
                    />
                    <button
                      onClick={validateCoupon}
                      className="px-4 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-sm font-semibold text-slate-700"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-600 text-xs mt-1.5">{couponError}</p>}
                  {couponSuccess && <p className="text-emerald-700 text-xs mt-1.5">{couponSuccess}</p>}
                </div>

                {/* Subtotal */}
                <div className="border-t border-slate-100 pt-6 space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-700 font-medium">
                      <span>Discount Applied</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (custToken) {
                        setCustomerEmail(custEmail || "");
                        setCustomerName(custName || "");
                      }
                      setView("checkout");
                    }}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-2.5 text-white rounded font-medium text-sm hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
                  >
                    Proceed to Shipping <CreditCard className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Cart is empty. Go back and select some items to purchase.
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Checkout Form */}
        {view === "checkout" && (
          <div className="bg-white border border-slate-200 rounded-card shadow-card p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setView("cart")} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold">{getCheckoutTitle()}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{getCheckoutInstructions()}</p>
              </div>
            </div>

            {checkoutError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-700 p-3 rounded text-xs">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                    placeholder="Kiran"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                    placeholder="kiran@test.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none mb-2"
                  placeholder="Address Line 1"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                    placeholder="Pincode (6 digits)"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center text-slate-900 font-bold text-sm mb-4">
                  <span>Payable Total:</span>
                  <span>₹{total}</span>
                </div>
                <button
                  type="submit"
                  disabled={loadingCheckout}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-2.5 text-white rounded font-medium text-sm hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
                >
                  {loadingCheckout ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Pay with Razorpay</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW 4: Success Screen */}
        {view === "success" && completedOrder && (
          <div className="bg-white border border-slate-200 rounded-card shadow-card p-10 max-w-md mx-auto text-center font-sans">
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Order Confirmed!</h2>
            <p className="text-slate-500 text-sm mt-2">
              Thank you for shopping with us. Your payment was processed successfully.
            </p>
            <div className="bg-slate-50 p-4 rounded border border-slate-100 my-6 text-left text-sm space-y-2">
              <div>
                <span className="text-slate-500">Order Reference:</span>
                <span className="float-right font-mono font-bold text-slate-800">
                  #{completedOrder.orderId.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Amount Charged:</span>
                <span className="float-right font-bold text-emerald-700">₹{completedOrder.amount}</span>
              </div>
            </div>
            <button
              onClick={() => setView("catalog")}
              style={{ backgroundColor: primaryColor }}
              className="w-full py-2 text-white font-medium rounded text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* VIEW 5: Customer Order History */}
        {view === "orders" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("catalog")} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold tracking-tight">Your Order History</h2>
            </div>

            <div className="space-y-4">
              {customerOrders.length > 0 ? (
                customerOrders.map((order: any) => (
                  <div key={order.orderId} className="bg-white border border-slate-200 rounded-card p-6 shadow-card space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs text-slate-400 font-bold block uppercase">Order Reference</span>
                        <span className="font-mono font-bold text-sm text-slate-800">
                          #{order.orderId.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        order.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : order.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm space-y-2">
                      {order.lineItems?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-slate-700">
                          <span>
                            {item.name} <span className="text-slate-400 text-xs">x {item.quantity}</span>
                          </span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
                      <span className="flex items-center gap-1 text-slate-400 font-normal text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span>Paid Total: ₹{order.total}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-slate-200 rounded-card p-12 shadow-card text-center flex flex-col items-center justify-center space-y-3">
                  <ShoppingCart className="h-10 w-10 text-slate-300" />
                  <h3 className="font-bold text-slate-800 text-base">No orders found</h3>
                  <p className="text-sm text-slate-400 max-w-sm">You haven't placed any orders with this storefront yet.</p>
                  <button
                    onClick={() => setView("catalog")}
                    style={{ backgroundColor: primaryColor }}
                    className="px-4 py-2 text-white text-xs font-semibold rounded shadow hover:opacity-90 transition-opacity"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Storefront Footer Policies */}
        {templateBase === "Aura" ? (
          <footer className="mt-20 border-t border-slate-200 bg-white py-16 px-8 select-none shrink-0 w-full text-left">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">WATCHROOM</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Curating the finest minimalist and smart watches from across the globe since 2020.
                </p>
              </div>
              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Customer Care</h4>
                {storeInfo.termsOfService && (
                  <div>
                    <button
                      onClick={() => setSelectedPolicy({ title: "Terms of Service", content: storeInfo.termsOfService })}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </div>
                )}
                {storeInfo.privacyPolicy && (
                  <div>
                    <button
                      onClick={() => setSelectedPolicy({ title: "Privacy Policy", content: storeInfo.privacyPolicy })}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </div>
                )}
                {storeInfo.refundPolicy && (
                  <div>
                    <button
                      onClick={() => setSelectedPolicy({ title: "Refund Policy", content: storeInfo.refundPolicy })}
                      className="hover:underline text-left cursor-pointer"
                    >
                      Refund Policy
                    </button>
                  </div>
                )}
                <div><span className="hover:underline cursor-pointer">Gift services</span></div>
                <div><span className="hover:underline cursor-pointer">Track your items</span></div>
              </div>
              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Need help?</h4>
                <div className="text-slate-800 font-sans">123 456 789</div>
                <div><span className="hover:underline cursor-pointer font-sans">watch@room.com</span></div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Join our newsletter</h4>
                <div className="flex border-b border-slate-350 pb-1 gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-sans"
                  />
                  <button className="text-xs text-slate-450 hover:text-slate-950 font-bold">&gt;</button>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-4 text-xs text-slate-400">
              <div>
                &copy; {new Date().getFullYear()} <strong>{storeInfo.storeName}</strong>. Powered by <span className="font-bold text-slate-700">Basecart</span>.
              </div>
              <div className="flex gap-6 font-medium text-slate-500">
                <span className="hover:underline cursor-pointer">Privacy Policy</span>
                <span className="hover:underline cursor-pointer">Terms of Use</span>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-3 py-1 bg-black text-white text-[10px] font-bold tracking-wider uppercase hover:opacity-90 transition-opacity"
                >
                  Back to top ↑
                </button>
              </div>
            </div>
          </footer>
        ) : (
          <footer className="mt-12 border-t border-slate-200 bg-white py-8 px-6 text-center select-none shrink-0 w-full">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <div>
                &copy; {new Date().getFullYear()} <strong>{storeInfo.storeName}</strong>. Powered by <span className="font-bold text-slate-700">Basecart</span>.
              </div>
              <div className="flex gap-4 font-medium text-slate-600">
                {storeInfo.termsOfService && (
                  <button
                    onClick={() => setSelectedPolicy({ title: "Terms of Service", content: storeInfo.termsOfService })}
                    className="hover:underline"
                  >
                    Terms of Service
                  </button>
                )}
                {storeInfo.privacyPolicy && (
                  <button
                    onClick={() => setSelectedPolicy({ title: "Privacy Policy", content: storeInfo.privacyPolicy })}
                    className="hover:underline"
                  >
                    Privacy Policy
                  </button>
                )}
                {storeInfo.refundPolicy && (
                  <button
                    onClick={() => setSelectedPolicy({ title: "Refund Policy", content: storeInfo.refundPolicy })}
                    className="hover:underline"
                  >
                    Refund Policy
                  </button>
                )}
              </div>
            </div>
          </footer>
        )}
      </main>

      {/* CUSTOMER POLICY MODAL */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white max-w-xl w-full p-6 border border-slate-200 rounded-card shadow-lg relative flex flex-col max-h-[80vh]">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4 font-sans text-slate-900 border-b border-slate-100 pb-2">
              {selectedPolicy.title}
            </h3>
            <div className="overflow-y-auto text-sm text-slate-600 leading-relaxed font-sans pr-2 whitespace-pre-wrap">
              {selectedPolicy.content}
            </div>
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedPolicy(null)}
                style={{ backgroundColor: primaryColor }}
                className="px-4 py-1.5 text-white text-xs font-semibold rounded shadow hover:opacity-90 animate-fade-in"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 border border-slate-200 rounded-card shadow-lg relative">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setShowCustForgotView(false);
                setCustResetToken("");
                setCustResetSuccess(false);
                setCustForgotSent(false);
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg"
            >
              &times;
            </button>

            {custResetToken ? (
              <>
                <h3 className="text-lg font-bold mb-4 font-sans text-slate-900">Reset Password</h3>
                {authError && (
                  <div className="mb-4 bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-100">
                    {authError}
                  </div>
                )}
                {custResetSuccess ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded text-xs border border-emerald-100">
                      ✓ Your password has been reset successfully.
                    </div>
                    <button
                      onClick={() => {
                        setCustResetToken("");
                        setCustResetSuccess(false);
                        setShowCustForgotView(false);
                        setIsCustLoginView(true);
                      }}
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-2 text-white font-medium rounded text-sm"
                    >
                      Login Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomerResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={custNewPassword}
                        onChange={(e) => setCustNewPassword(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-2 text-white font-medium rounded text-sm"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </>
            ) : showCustForgotView ? (
              <>
                <h3 className="text-lg font-bold mb-4 font-sans text-slate-900">Recover Account</h3>
                {authError && (
                  <div className="mb-4 bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-100">
                    {authError}
                  </div>
                )}
                {custForgotSent ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded text-xs border border-emerald-100">
                      ✓ If registered, a password reset link has been sent to your email.
                    </div>
                    <button
                      onClick={() => {
                        setShowCustForgotView(false);
                        setCustForgotSent(false);
                        setCustForgotEmail("");
                      }}
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-2 text-white font-medium rounded text-sm"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomerForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={custForgotEmail}
                        onChange={(e) => setCustForgotEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                        placeholder="name@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ backgroundColor: primaryColor }}
                      className="w-full py-2 text-white font-medium rounded text-sm"
                    >
                      Send Reset Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustForgotView(false)}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      Back to Login
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4 font-sans text-slate-900">{isCustLoginView ? "Customer Login" : "Customer Signup"}</h3>

            {authError && (
              <div className="mb-4 bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-100">
                {authError}
              </div>
            )}

            <form onSubmit={handleCustomerAuth} className="space-y-4">
              {!isCustLoginView && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={custNameInput}
                    onChange={(e) => setCustNameInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                  placeholder="name@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
              {isCustLoginView && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustForgotView(true);
                      setAuthError("");
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                className="w-full py-2 text-white font-medium rounded text-sm"
              >
                {isCustLoginView ? "Sign In" : "Register Account"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsCustLoginView(!isCustLoginView);
                  setAuthError("");
                }}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {isCustLoginView ? "Create a store account instead" : "Already have an account? Sign In"}
              </button>
            </div>
          </>
          )}
        </div>
      </div>
    )}

      {/* VARIANT DETAILS SELECTION MODAL */}
      {selectedProductDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 border border-slate-200 rounded-card shadow-lg relative space-y-6">
            <button
              onClick={() => setSelectedProductDetails(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg"
            >
              &times;
            </button>

            <div className="flex gap-4">
              <div className="h-20 w-20 border rounded bg-slate-50 overflow-hidden flex items-center justify-center">
                {selectedProductDetails.images?.[0] ? (
                  <img src={getOptimizedImageUrl(selectedProductDetails.images[0], "large")} alt={selectedProductDetails.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{selectedProductDetails.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-extrabold text-slate-900">
                    ₹{selectedVariant?.price !== undefined && selectedVariant?.price !== null ? selectedVariant.price : selectedProductDetails.price}
                  </span>
                  {selectedProductDetails.compareAtPrice && selectedProductDetails.compareAtPrice > selectedProductDetails.price && (
                    <span className="text-xs text-slate-400 line-through">₹{selectedProductDetails.compareAtPrice}</span>
                  )}
                </div>
              </div>
            </div>

            {selectedProductDetails.description && (
              <p className="text-xs text-slate-500 line-clamp-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                {selectedProductDetails.description}
              </p>
            )}

            {/* Option pickers */}
            <div className="space-y-4">
              {(() => {
                const keys = Object.keys(selectedProductDetails.variants?.[0]?.options || {});
                return keys.map((key) => {
                  const uniqueValues = Array.from(new Set(selectedProductDetails.variants!.map(v => v.options[key]).filter(Boolean)));
                  
                  return (
                    <div key={key} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueValues.map((val) => {
                          const isSelected = selectedOptions[key] === val;
                          
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                const nextOptions = { ...selectedOptions, [key]: val };
                                setSelectedOptions(nextOptions);

                                const match = selectedProductDetails.variants?.find((v) => {
                                  return keys.every(k => v.options[k] === nextOptions[k]);
                                });
                                setSelectedVariant(match || null);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
                                isSelected
                                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Action */}
            <div className="pt-2">
              {(() => {
                const keys = Object.keys(selectedProductDetails.variants?.[0]?.options || {});
                const allSelected = keys.every(k => selectedOptions[k] !== undefined);
                const stock = selectedVariant ? selectedVariant.stockQuantity : 0;
                const isOutOfStock = selectedVariant ? stock <= 0 : true;

                return (
                  <div className="space-y-2">
                    {!allSelected ? (
                      <p className="text-xs text-slate-400 italic">Please select options above to add to cart.</p>
                    ) : isOutOfStock ? (
                      <p className="text-xs text-red-500 font-bold">Selected combination is out of stock.</p>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">In Stock: {stock} units available.</p>
                    )}

                    <button
                      type="button"
                      disabled={!allSelected || isOutOfStock}
                      onClick={() => addToCart(selectedProductDetails, selectedVariant)}
                      className="w-full py-2.5 text-white font-bold text-sm rounded shadow transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
                      style={{ backgroundColor: allSelected && !isOutOfStock ? (storeInfo?.branding?.primaryColor || "#2563EB") : "#cbd5e1" }}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
