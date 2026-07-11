"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Upload,
  CheckCircle,
  Tag,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Grid,
  Bell,
  Info,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";

const API_URL = "http://localhost:3001";

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

interface Order {
  orderId: string;
  createdAt: string;
  customerInfo: {
    name: string;
    email: string;
    shippingAddress: {
      addressLine1: string;
      city: string;
      postalCode: string;
    };
  };
  lineItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}

interface StoreSettings {
  storeName: string;
  subdomain: string;
  razorpayKey: string;
  razorpaySecret: string;
  addOns?: string[];
  plan?: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
}

export default function MerchantDashboard() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeNameInput, setStoreNameInput] = useState("");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "summary" | "orders" | "products" | "customers" | "discounts" | "addons" | "finances" | "billing" | "settings"
  >("summary");

  // App data state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "",
    subdomain: "",
    razorpayKey: "",
    razorpaySecret: "",
    addOns: [],
    plan: "starter",
    branding: { logoUrl: "", primaryColor: "#2563EB", accentColor: "#1D4ED8" },
  });
  const [summary, setSummary] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    last7Days: [],
  });

  // Discount Codes
  const [discounts, setDiscounts] = useState<any[]>([]);

  // Advanced screens state
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>({
    totalRevenue: 0,
    totalPlatformFees: 0,
    transactions: [],
  });
  const [billingInfo, setBillingInfo] = useState<any>({
    plan: "starter",
    productsUsed: 0,
    productsLimit: 50,
    ordersUsed: 0,
    ordersLimit: 100,
  });

  // UI status
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product> | null>(null);
  const [discountForm, setDiscountForm] = useState<any | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Products filters & bulk actions
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Product variant generator options state
  const [optionInputs, setOptionInputs] = useState<Array<{ name: string; values: string[] }>>([
    { name: "", values: [] },
    { name: "", values: [] }
  ]);

  // Read tokens on startup (via httpOnly cookie session check)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/merchant/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken);
          setTenantId(data.tenantId);
        }
      } catch (err) {
        console.error("No active merchant session:", err);
      }
    };
    checkSession();
  }, []);

  // Fetch settings on login
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/store/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setSettings(data);
        })
        .catch(console.error);
    }
  }, [token]);

  // Fetch data when token is loaded
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, activeTab]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setActionError("");
    try {
      if (activeTab === "summary") {
        const res = await fetch(`${API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setSummary(await res.json());
      } else if (activeTab === "products") {
        const res = await fetch(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProducts(await res.json());
      } else if (activeTab === "orders") {
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setOrders(await res.json());
      } else if (activeTab === "settings" || activeTab === "addons") {
        const res = await fetch(`${API_URL}/store/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setSettings(await res.json());
      } else if (activeTab === "discounts") {
        const res = await fetch(`${API_URL}/discounts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setDiscounts(await res.json());
      } else if (activeTab === "customers") {
        const res = await fetch(`${API_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setCustomers(await res.json());
      } else if (activeTab === "finances") {
        const res = await fetch(`${API_URL}/finances/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setFinanceSummary(await res.json());
      } else if (activeTab === "billing") {
        const res = await fetch(`${API_URL}/store/billing`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setBillingInfo(await res.json());
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to connect to backend API server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setAuthError("");
    setLoading(true);
    try {
      // 1. Try signing up a demo merchant (ignores failure if already registered)
      await fetch(`${API_URL}/auth/merchant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: "Demo Store",
          subdomain: "demo",
          email: "merchant@basecart.io",
          password: "password123",
        }),
      }).catch(() => {});

      // 2. Perform login
      const res = await fetch(`${API_URL}/auth/merchant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "merchant@basecart.io",
          password: "password123",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");

      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in to demo store.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      let cleanedSubdomain = subdomainInput.trim().toLowerCase();
      if (cleanedSubdomain.endsWith(".basecart.io")) {
        cleanedSubdomain = cleanedSubdomain.replace(/\.?basecart\.io$/, "");
      }
      if (cleanedSubdomain.endsWith(".localhost")) {
        cleanedSubdomain = cleanedSubdomain.replace(/\.?localhost$/, "");
      }
      cleanedSubdomain = cleanedSubdomain.replace(/[^a-z0-9-]/g, "");

      const res = await fetch(`${API_URL}/auth/merchant/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          storeName: storeNameInput,
          subdomain: cleanedSubdomain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmail("");
      setPassword("");
      setStoreNameInput("");
      setSubdomainInput("");
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/merchant/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed", e);
    }
    setToken(null);
    setTenantId(null);
    setProducts([]);
    setOrders([]);
  };

  // S3 Presigned Direct Image Upload implementation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, prodId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setActionError("");
    setActionSuccess("");

    // 1. Read first 262 bytes for Magic Bytes signature check
    const blobSlice = file.slice(0, 262);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        if (!evt.target?.result) throw new Error("Failed to read file segment.");

        const arrayBuffer = evt.target.result as ArrayBuffer;
        const uint8 = new Uint8Array(arrayBuffer);
        let headerHex = "";
        for (let i = 0; i < uint8.length; i++) {
          headerHex += uint8[i].toString(16).padStart(2, "0");
        }

        // 2. Query presigned URL from backend
        const uploadRes = await fetch(`${API_URL}/products/${prodId}/upload-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            headerHex,
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to generate presigned S3 url");

        // 3. Upload file directly to LocalStack S3 Bucket
        const s3PutRes = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!s3PutRes.ok) throw new Error("Direct S3 bucket upload failed.");

        // 4. Update product images locally in form & notify success
        if (productForm) {
          const currentImages = productForm.images || [];
          setProductForm({
            ...productForm,
            images: [...currentImages, uploadData.imageUrl],
          });
        }
        setActionSuccess("Image uploaded successfully direct to S3 bucket!");
      } catch (err: any) {
        setActionError(err.message || "Failed uploading file.");
      } finally {
        setUploadingImage(false);
      }
    };

    reader.readAsArrayBuffer(blobSlice);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm?.name || productForm.price === undefined) return;
    setLoading(true);
    setActionError("");
    setActionSuccess("");

    const isEdit = !!productForm.productId;
    const url = isEdit ? `${API_URL}/products/${productForm.productId}` : `${API_URL}/products`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description || "",
          price: Number(productForm.price),
          stockQuantity: Number(productForm.stockQuantity || 0),
          status: productForm.status || "active",
          images: productForm.images || [],
          compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : null,
          costPerItem: productForm.costPerItem ? Number(productForm.costPerItem) : null,
          sku: productForm.sku || null,
          barcode: productForm.barcode || null,
          category: productForm.category || "Other",
          productType: productForm.productType || null,
          vendor: productForm.vendor || null,
          weight: productForm.weight ? Number(productForm.weight) : null,
          seoTitle: productForm.seoTitle || null,
          seoDescription: productForm.seoDescription || null,
          continueSellingOutOfStock: !!productForm.continueSellingOutOfStock,
          variants: productForm.variants || [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed saving product");
      }

      setProductForm(null);
      setActionSuccess("Product saved successfully!");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionSuccess("Product deleted successfully.");
        fetchDashboardData();
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to delete product");
      }
    } catch (err) {
      setActionError("Network error deleting product.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (prod: Product) => {
    setProductForm(prod);
    setSelectedProducts([]);
    if (prod.variants && prod.variants.length > 0) {
      const keys = Object.keys(prod.variants[0].options || {});
      const opts = keys.map((key) => {
        const uniqueVals = Array.from(new Set(prod.variants!.map(v => v.options[key]).filter(Boolean)));
        return { name: key, values: uniqueVals };
      });
      while (opts.length < 2) {
        opts.push({ name: "", values: [] });
      }
      setOptionInputs(opts);
    } else {
      setOptionInputs([
        { name: "", values: [] },
        { name: "", values: [] }
      ]);
    }
  };

  const handleGenerateVariants = (opts: typeof optionInputs) => {
    const validOpts = opts.filter(o => o.name.trim() !== "" && o.values.length > 0);
    if (validOpts.length === 0) {
      setProductForm({ ...productForm, variants: [] });
      return;
    }

    const keys = validOpts.map(o => o.name.trim());
    const valuesArrays = validOpts.map(o => o.values);
    
    const cartesian = (arr: any[][]) => {
      return arr.reduce<any[][]>(
        (a, b) => a.flatMap((d) => b.map((e) => [...d, e])),
        [[]]
      );
    };

    const combos = cartesian(valuesArrays);

    const newVariants = combos.map((combo) => {
      const optionsObj: Record<string, string> = {};
      combo.forEach((val, index) => {
        optionsObj[keys[index]] = val;
      });

      const existing = productForm?.variants?.find((v: any) => {
        return keys.every(k => v.options[k] === optionsObj[k]);
      });

      return {
        id: existing?.id || `var-${Math.random().toString(36).substring(2, 9)}`,
        options: optionsObj,
        price: existing?.price !== undefined && existing.price !== null ? existing.price : (productForm?.price || null),
        stockQuantity: existing?.stockQuantity !== undefined ? existing.stockQuantity : 0,
        sku: existing?.sku || "",
        barcode: existing?.barcode || "",
      };
    });

    setProductForm({ ...productForm, variants: newVariants });
  };

  const bulkDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedProducts.length} selected products?`)) return;
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      let succeeded = 0;
      for (const id of selectedProducts) {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) succeeded++;
      }
      setActionSuccess(`Successfully deleted ${succeeded} products.`);
      setSelectedProducts([]);
      fetchDashboardData();
    } catch (err) {
      setActionError("Error during bulk delete operation.");
    } finally {
      setLoading(false);
    }
  };

  const bulkChangeStatus = async (status: "active" | "draft") => {
    if (selectedProducts.length === 0) return;
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      let succeeded = 0;
      for (const id of selectedProducts) {
        const prodRes = await fetch(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (prodRes.ok) {
          const prod = await prodRes.json();
          const res = await fetch(`${API_URL}/products/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...prod,
              status,
            }),
          });
          if (res.ok) succeeded++;
        }
      }
      setActionSuccess(`Successfully updated status to ${status} for ${succeeded} products.`);
      setSelectedProducts([]);
      fetchDashboardData();
    } catch (err) {
      setActionError("Error during bulk status update operation.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setActionSuccess("Store settings updated successfully.");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed updating settings");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionSuccess(`Order status updated to ${newStatus}`);
        fetchDashboardData();
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountForm?.code || discountForm.value === undefined) return;
    setLoading(true);
    setActionError("");
    setActionSuccess("");

    const isEdit = !!discountForm.isEdit;
    const url = isEdit ? `${API_URL}/discounts/${discountForm.code}` : `${API_URL}/discounts`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: discountForm.code,
          type: discountForm.type,
          value: Number(discountForm.value),
          minOrderAmount: Number(discountForm.minOrderAmount || 0),
          usageLimit: discountForm.usageLimit ? Number(discountForm.usageLimit) : undefined,
          expiry: discountForm.expiry ? new Date(discountForm.expiry).toISOString() : undefined,
          active: discountForm.active ?? true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed saving discount code");
      }

      setDiscountForm(null);
      setActionSuccess("Discount code saved successfully!");
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteDiscount = async (code: string) => {
    if (!confirm(`Are you sure you want to delete code ${code}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/discounts/${code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionSuccess("Discount code deleted.");
        fetchDashboardData();
      } else {
        const d = await res.json();
        setActionError(d.error);
      }
    } catch (err) {
      setActionError("Error deleting discount.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (email: string) => {
    setLoading(true);
    setActionError("");
    try {
      const res = await fetch(`${API_URL}/customers/${encodeURIComponent(email)}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCustomerOrders(await res.json());
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to load customer order details");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (newPlan: string) => {
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const res = await fetch(`${API_URL}/store/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: newPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update subscription tier.");
      }
      setActionSuccess(`Plan updated to ${newPlan} successfully!`);
      // Update local settings & billing usage
      setSettings((prev) => ({ ...prev, plan: newPlan }));
      const billingRes = await fetch(`${API_URL}/store/billing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (billingRes.ok) setBillingInfo(await billingRes.ok ? billingRes.json() : null);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = async (addonKey: string) => {
    setLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const currentAddons = settings.addOns || [];
      let nextAddons = [...currentAddons];
      if (nextAddons.includes(addonKey)) {
        nextAddons = nextAddons.filter((k) => k !== addonKey);
      } else {
        nextAddons.push(addonKey);
      }

      const res = await fetch(`${API_URL}/store/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          addOns: nextAddons,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to toggle add-on.");
      }

      setSettings((prev) => ({ ...prev, addOns: nextAddons }));
      setActionSuccess(`Add-on updated successfully!`);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Auth View Layout ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Basecart</h1>
            <p className="mt-2 text-sm text-slate-500">
              Indian Merchants Headless E-commerce Console
            </p>
          </div>

          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setIsLoginView(true); setAuthError(""); }}
              className={`w-1/2 py-2 text-center font-medium border-b-2 text-sm transition-all duration-150 ${
                isLoginView
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginView(false); setAuthError(""); }}
              className={`w-1/2 py-2 text-center font-medium border-b-2 text-sm transition-all duration-150 ${
                !isLoginView
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Register Store
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-card text-sm border border-red-100">
              {authError}
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="name@store.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Access Dashboard"}
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">Or</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-button transition-colors text-sm border border-slate-200 flex justify-center items-center gap-2"
              >
                Access as Demo Merchant
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="My Organic Shop"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Subdomain Prefix (.basecart.io)
                </label>
                <input
                  type="text"
                  required
                  value={subdomainInput}
                  onChange={(e) => setSubdomainInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="e.g. test"
                />
                <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                  Enter only the prefix. Suffixes (like .basecart.io) and periods will be stripped automatically.
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Owner Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="owner@store.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="Min 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Store & Admin Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          <div className="h-16 flex flex-col justify-center px-6 border-b border-slate-200">
            <span className="text-base font-bold text-slate-900 tracking-tight truncate">
              {settings.storeName || "My Store"}
            </span>
            <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-0.5">
              {settings.plan || "starter"} PLAN
            </span>
          </div>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("summary")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "summary"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Home
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "orders"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ShoppingCart className="h-4 w-4" /> Orders
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "products"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Package className="h-4 w-4" /> Products
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "customers"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" /> Customers
            </button>
            <button
              onClick={() => setActiveTab("discounts")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "discounts"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Tag className="h-4 w-4" /> Discounts
            </button>
            <button
              onClick={() => setActiveTab("addons")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "addons"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Grid className="h-4 w-4" /> Add-ons
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "finances"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <DollarSign className="h-4 w-4" /> Finances
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "billing"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-4 w-4" /> Billing & Plan
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-button transition-all duration-150"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
              Store Subdomain: {settings.subdomain || "demo"}.localhost:3002
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <button 
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 relative group transition-colors"
              title="No new alerts"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div>
              Active Tenant ID: <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs">{tenantId}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {actionError && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-card text-sm">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-card text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> {actionSuccess}
            </div>
          )}

          {/* 1. Summary View */}
          {activeTab === "summary" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    ₹{summary.totalRevenue}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">From successful payments</p>
                </div>

                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid Orders</span>
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {summary.paidOrders}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Out of {summary.totalOrders} total orders</p>
                </div>

                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion rate</span>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {summary.totalOrders > 0 ? ((summary.paidOrders / summary.totalOrders) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Order to Payment conversion</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-6">Sales - Last 7 Days</h3>
                {summary.last7Days && summary.last7Days.length > 0 ? (
                  <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-l border-slate-200 px-4">
                    {summary.last7Days.map((day: any, idx: number) => {
                      const maxRevenue = Math.max(...summary.last7Days.map((d: any) => d.revenue), 100);
                      const heightPercent = Math.max(10, Math.min(100, (day.revenue / maxRevenue) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap shadow z-10">
                            ₹{day.revenue} ({day.orders} orders)
                          </div>
                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-all duration-200"
                          ></div>
                          <span className="mt-2 text-xs font-medium text-slate-500 truncate max-w-[80px]">
                            {day.date.split("-")[2]}/{day.date.split("-")[1]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                    No order data available for metrics.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Products</h2>
                  <p className="text-sm text-slate-500">Manage your catalog, stock details, pricing, and variants</p>
                </div>
                {!productForm && (
                  <button
                    onClick={() => {
                      setProductForm({
                        name: "",
                        price: 0,
                        stockQuantity: 0,
                        status: "active",
                        category: "Other",
                        images: [],
                        variants: [],
                        compareAtPrice: null,
                        costPerItem: null,
                        sku: "",
                        barcode: "",
                        productType: "",
                        vendor: "",
                        weight: null,
                        seoTitle: "",
                        seoDescription: "",
                        continueSellingOutOfStock: false,
                      });
                      setOptionInputs([
                        { name: "Size", values: [] },
                        { name: "Color", values: [] },
                      ]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-button shadow-sm transition-colors animate-fade-in"
                  >
                    <Plus className="h-4 w-4" /> Add Product
                  </button>
                )}
              </div>

              {/* Product Form (Two-Column Layout) */}
              {productForm ? (
                <div className="animate-fade-in">
                  <form onSubmit={saveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area (Left 2 Columns) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Card 1: Title & Description */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Premium Cotton Polo T-Shirt"
                            value={productForm.name || ""}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Description
                          </label>
                          <textarea
                            placeholder="Describe your product details..."
                            value={productForm.description || ""}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 h-32"
                          />
                        </div>
                      </div>

                      {/* Card 2: Media Uploads */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 mb-1">Product Media</h3>
                          <p className="text-xs text-slate-500 mb-3">Upload S3-hosted images for your storefront. The first image is automatically designated as primary.</p>
                        </div>

                        {productForm.images && productForm.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {productForm.images.map((url, i) => (
                              <div key={i} className="relative group border rounded bg-slate-50 overflow-hidden aspect-square flex flex-col justify-between">
                                <img src={url} alt={`product-${i}`} className="w-full h-full object-cover" />
                                
                                {/* Badge for Primary */}
                                {i === 0 && (
                                  <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded shadow-sm">
                                    PRIMARY
                                  </span>
                                )}

                                {/* Hover actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  {i > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImgs = [...(productForm.images || [])];
                                        const target = newImgs.splice(i, 1)[0];
                                        newImgs.unshift(target);
                                        setProductForm({ ...productForm, images: newImgs });
                                      }}
                                      className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded text-xs font-semibold shadow"
                                      title="Make Primary"
                                    >
                                      Primary
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImgs = [...(productForm.images || [])];
                                      newImgs.splice(i, 1);
                                      setProductForm({ ...productForm, images: newImgs });
                                    }}
                                    className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded shadow"
                                    title="Delete Image"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {productForm.productId ? (
                          <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-button text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors shadow-sm bg-white">
                              {uploadingImage ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              {uploadingImage ? "Uploading to S3..." : "Upload Image"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingImage}
                                onChange={(e) => handleImageUpload(e, productForm.productId!)}
                                className="hidden"
                              />
                            </label>
                            <span className="text-xs text-slate-400">
                              Supports JPG, PNG, WEBP.
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded border border-amber-100 font-medium">
                            ⚠️ Please save the product first to enable S3 direct file uploading.
                          </p>
                        )}
                      </div>

                      {/* Card 3: Pricing */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="499"
                              value={productForm.price || ""}
                              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Compare-at price (₹)
                            </label>
                            <input
                              type="number"
                              placeholder="999"
                              value={productForm.compareAtPrice || ""}
                              onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value ? Number(e.target.value) : null })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Cost per item (₹)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="200"
                                value={productForm.costPerItem || ""}
                                onChange={(e) => setProductForm({ ...productForm, costPerItem: e.target.value ? Number(e.target.value) : null })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                              {productForm.price && productForm.costPerItem ? (
                                <span className="absolute right-2 top-2.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {(((productForm.price - productForm.costPerItem) / productForm.price) * 100).toFixed(0)}% margin
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 4: Inventory */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              required
                              disabled={productForm.variants && productForm.variants.length > 0}
                              value={productForm.variants && productForm.variants.length > 0
                                ? productForm.variants.reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0)
                                : (productForm.stockQuantity ?? 0)}
                              onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500"
                            />
                            {productForm.variants && productForm.variants.length > 0 && (
                              <span className="text-[10px] text-slate-500 font-medium">Computed from variants</span>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              placeholder="SKU-POLO-M"
                              value={productForm.sku || ""}
                              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Barcode
                            </label>
                            <input
                              type="text"
                              placeholder="8901234567"
                              value={productForm.barcode || ""}
                              onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="continueSelling"
                            checked={!!productForm.continueSellingOutOfStock}
                            onChange={(e) => setProductForm({ ...productForm, continueSellingOutOfStock: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="continueSelling" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
                            Continue selling when out of stock
                          </label>
                        </div>
                      </div>

                      {/* Card 5: Shipping */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Shipping</h3>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.25"
                            value={productForm.weight || ""}
                            onChange={(e) => setProductForm({ ...productForm, weight: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 max-w-xs"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Used for Shiprocket automated shipping calculations</p>
                        </div>
                      </div>

                      {/* Card 6: Variants Matrix Builder */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-sm font-semibold text-slate-900">Product Options (Variants)</h3>
                          <span className="text-xs text-slate-400">Up to 2 option dimensions</span>
                        </div>

                        {/* Options Input Block */}
                        <div className="space-y-4">
                          {optionInputs.map((opt, i) => (
                            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-b pb-3 border-slate-50">
                              <div className="sm:col-span-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Option Name</label>
                                <input
                                  type="text"
                                  placeholder={i === 0 ? "e.g. Size" : "e.g. Color"}
                                  value={opt.name}
                                  onChange={(e) => {
                                    const next = [...optionInputs];
                                    next[i].name = e.target.value;
                                    setOptionInputs(next);
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Option Values (Comma separated)</label>
                                <input
                                  type="text"
                                  placeholder={i === 0 ? "M, L, XL" : "Red, Blue"}
                                  value={opt.values.join(", ")}
                                  onChange={(e) => {
                                    const next = [...optionInputs];
                                    next[i].values = e.target.value.split(",").map(v => v.trim()).filter(Boolean);
                                    setOptionInputs(next);
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGenerateVariants(optionInputs)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded shadow-sm flex items-center gap-2"
                        >
                          Generate Variant Matrix
                        </button>

                        {/* Variants Matrix Table */}
                        {productForm.variants && productForm.variants.length > 0 && (
                          <div className="border border-slate-200 rounded overflow-hidden mt-4">
                            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                                <tr>
                                  <th className="px-4 py-2">Variant</th>
                                  <th className="px-4 py-2">Price (₹)</th>
                                  <th className="px-4 py-2">Stock</th>
                                  <th className="px-4 py-2">SKU</th>
                                  <th className="px-4 py-2">Barcode</th>
                                  <th className="px-4 py-2 text-right">Delete</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {productForm.variants.map((v, i) => (
                                  <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 font-medium text-slate-800">
                                      {Object.entries(v.options).map(([k, val]) => `${k}: ${val}`).join(" / ")}
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="number"
                                        placeholder={String(productForm.price)}
                                        value={v.price !== null && v.price !== undefined ? v.price : ""}
                                        onChange={(e) => {
                                          const nextVar = [...(productForm.variants || [])];
                                          nextVar[i].price = e.target.value ? Number(e.target.value) : null;
                                          setProductForm({ ...productForm, variants: nextVar });
                                        }}
                                        className="w-16 px-1 py-0.5 border border-slate-300 rounded text-xs text-slate-900"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="number"
                                        min="0"
                                        required
                                        value={v.stockQuantity}
                                        onChange={(e) => {
                                          const nextVar = [...(productForm.variants || [])];
                                          nextVar[i].stockQuantity = Number(e.target.value);
                                          setProductForm({ ...productForm, variants: nextVar });
                                        }}
                                        className="w-14 px-1 py-0.5 border border-slate-300 rounded text-xs text-slate-900"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        placeholder="SKU"
                                        value={v.sku || ""}
                                        onChange={(e) => {
                                          const nextVar = [...(productForm.variants || [])];
                                          nextVar[i].sku = e.target.value;
                                          setProductForm({ ...productForm, variants: nextVar });
                                        }}
                                        className="w-24 px-1 py-0.5 border border-slate-300 rounded text-xs text-slate-900"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        placeholder="Barcode"
                                        value={v.barcode || ""}
                                        onChange={(e) => {
                                          const nextVar = [...(productForm.variants || [])];
                                          nextVar[i].barcode = e.target.value;
                                          setProductForm({ ...productForm, variants: nextVar });
                                        }}
                                        className="w-24 px-1 py-0.5 border border-slate-300 rounded text-xs text-slate-900"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextVar = productForm.variants?.filter((_, idx) => idx !== i) || [];
                                          setProductForm({ ...productForm, variants: nextVar });
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 inline" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Card 7: Search Engine Listing Preview */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Search Engine Listing Preview</h3>
                          <p className="text-xs text-slate-500">Configure page meta tags showing on Google search queries.</p>
                        </div>

                        {/* Google Result Preview Mockup */}
                        <div className="p-4 border border-slate-100 rounded-card bg-slate-50 space-y-1">
                          <div className="text-xs text-slate-500 truncate">
                            https://{settings.subdomain || "demo"}.basecart.io/products/{(productForm.name || "slug").toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                          </div>
                          <div className="text-md text-blue-800 hover:underline cursor-pointer truncate font-medium">
                            {productForm.seoTitle || productForm.name || "Product Name Display"}
                          </div>
                          <div className="text-xs text-slate-600 line-clamp-2">
                            {productForm.seoDescription || productForm.description || "Describe your product attributes to improve listing clicks."}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">SEO Title</label>
                            <input
                              type="text"
                              maxLength={70}
                              placeholder={productForm.name || "Fall back to product title"}
                              value={productForm.seoTitle || ""}
                              onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                            <span className="text-[10px] text-slate-400">Max 70 chars</span>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">SEO Description</label>
                            <textarea
                              maxLength={160}
                              placeholder={productForm.description || "Fall back to product description"}
                              value={productForm.seoDescription || ""}
                              onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 h-16"
                            />
                            <span className="text-[10px] text-slate-400">Max 160 chars</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Sidebar Panel - 1 Column) */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Status Card */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product Status</h3>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                          <select
                            value={productForm.status || "active"}
                            onChange={(e: any) => setProductForm({ ...productForm, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1">Draft products are hidden from search engines and storefronts.</p>
                        </div>
                      </div>

                      {/* Organization Card */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900">Product Organization</h3>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                          <select
                            value={productForm.category || "Other"}
                            onChange={(e: any) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="Clothing">Clothing</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home & Kitchen">Home & Kitchen</option>
                            <option value="Beauty">Beauty</option>
                            <option value="Food">Food</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Product Type</label>
                          <input
                            type="text"
                            placeholder="e.g. Jacket"
                            value={productForm.productType || ""}
                            onChange={(e) => setProductForm({ ...productForm, productType: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor / Brand</label>
                          <input
                            type="text"
                            placeholder="e.g. Nike"
                            value={productForm.vendor || ""}
                            onChange={(e) => setProductForm({ ...productForm, vendor: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      {/* Actions Card */}
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow transition-colors flex items-center justify-center"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductForm(null)}
                          className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded shadow-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* Products Table & Listing view */
                <div className="space-y-4 animate-fade-in">
                  {/* Search and Filters Bar */}
                  <div className="bg-white p-4 border border-slate-200 rounded-card shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3 items-center flex-1 max-w-xl">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search product name, description, or SKU..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-button text-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-slate-300 rounded-button text-slate-950 text-xs px-2 py-2 bg-white"
                      >
                        <option value="all">All Categories</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Food">Food</option>
                        <option value="Other">Other</option>
                      </select>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-300 rounded-button text-slate-950 text-xs px-2 py-2 bg-white"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    {/* Bulk Actions display */}
                    {selectedProducts.length > 0 && (
                      <div className="flex items-center gap-2 p-1 px-3 bg-blue-50 border border-blue-100 rounded-button animate-fade-in text-xs text-blue-800 font-semibold">
                        <span>{selectedProducts.length} selected</span>
                        <div className="h-4 w-px bg-blue-200 mx-1"></div>
                        <button
                          onClick={() => bulkChangeStatus("active")}
                          className="hover:underline text-blue-700"
                        >
                          Make Active
                        </button>
                        <span className="text-blue-300">•</span>
                        <button
                          onClick={() => bulkChangeStatus("draft")}
                          className="hover:underline text-blue-700"
                        >
                          Make Draft
                        </button>
                        <span className="text-blue-300">•</span>
                        <button
                          onClick={bulkDeleteProducts}
                          className="hover:underline text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* List Table */}
                  <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={
                                products.length > 0 &&
                                products
                                  .filter((p) => {
                                    const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
                                    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
                                    const matchStat = statusFilter === "all" || p.status === statusFilter;
                                    return matchQ && matchCat && matchStat;
                                  })
                                  .every((p) => selectedProducts.includes(p.productId))
                              }
                              onChange={(e) => {
                                const visible = products.filter((p) => {
                                  const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
                                  const matchCat = categoryFilter === "all" || p.category === categoryFilter;
                                  const matchStat = statusFilter === "all" || p.status === statusFilter;
                                  return matchQ && matchCat && matchStat;
                                });
                                if (e.target.checked) {
                                  setSelectedProducts(Array.from(new Set([...selectedProducts, ...visible.map((p) => p.productId)])));
                                } else {
                                  setSelectedProducts(selectedProducts.filter((id) => !visible.some((v) => v.productId === id)));
                                }
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Inventory</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Vendor</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {products.filter((p) => {
                          const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
                          const matchCat = categoryFilter === "all" || p.category === categoryFilter;
                          const matchStat = statusFilter === "all" || p.status === statusFilter;
                          return matchQ && matchCat && matchStat;
                        }).length > 0 ? (
                          products
                            .filter((p) => {
                              const matchQ = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());
                              const matchCat = categoryFilter === "all" || p.category === categoryFilter;
                              const matchStat = statusFilter === "all" || p.status === statusFilter;
                              return matchQ && matchCat && matchStat;
                            })
                            .map((prod) => {
                              const isSelected = selectedProducts.includes(prod.productId);
                              const hasVariants = prod.variants && prod.variants.length > 0;
                              const totalStock = hasVariants
                                ? prod.variants!.reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0)
                                : prod.stockQuantity;

                              return (
                                <tr key={prod.productId} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50/20" : ""}`}>
                                  <td className="px-4 py-4">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedProducts([...selectedProducts, prod.productId]);
                                        } else {
                                          setSelectedProducts(selectedProducts.filter((id) => id !== prod.productId));
                                        }
                                      }}
                                      className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-4 py-4 flex items-center gap-3">
                                    <div className="h-10 w-10 border rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                                      {prod.images && prod.images[0] ? (
                                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <Package className="h-5 w-5 text-slate-400" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-slate-900">{prod.name}</div>
                                      {prod.sku && <div className="text-[10px] text-slate-400 font-medium font-mono">{prod.sku}</div>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      prod.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}>
                                      {prod.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-slate-600 text-xs font-medium">
                                    {totalStock <= 0 ? (
                                      <span className="text-red-600 font-bold">Out of Stock</span>
                                    ) : hasVariants ? (
                                      <span>{totalStock} in stock for {prod.variants!.length} variants</span>
                                    ) : (
                                      <span>{totalStock} in stock</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-slate-500 text-xs font-semibold">{prod.category || "Other"}</td>
                                  <td className="px-4 py-4 text-slate-500 text-xs">{prod.productType || "—"}</td>
                                  <td className="px-4 py-4 text-slate-500 text-xs font-semibold">{prod.vendor || "—"}</td>
                                  <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => handleEditProduct(prod)}
                                        className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => deleteProduct(prod.productId)}
                                        className="p-1 hover:text-red-600 text-slate-400 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                              No products match the search query or filter tags.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Orders</h2>
                <p className="text-sm text-slate-500">Manage client orders, review payments, and track status</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600">
                            #{order.orderId.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{order.customerInfo.name}</div>
                            <div className="text-xs text-slate-500">{order.customerInfo.email}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{order.total}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              order.status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : order.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No orders received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Discount Codes Tab */}
          {activeTab === "discounts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Discount Codes</h2>
                  <p className="text-sm text-slate-500">Create discount coupons and track campaign usage</p>
                </div>
                <button
                  onClick={() => setDiscountForm({ code: "", type: "flat", value: 0, minOrderAmount: 0, active: true })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-button shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Discount Code
                </button>
              </div>

              {discountForm && (
                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <h3 className="text-md font-bold mb-4">{discountForm.isEdit ? "Edit Code" : "New Discount Code"}</h3>
                  <form onSubmit={saveDiscount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Code (e.g. SAVE10)
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!!discountForm.isEdit}
                          value={discountForm.code || ""}
                          onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Discount Type
                        </label>
                        <select
                          value={discountForm.type || "flat"}
                          onChange={(e: any) => setDiscountForm({ ...discountForm, type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                        >
                          <option value="flat">Flat Cash (₹)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Value
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={discountForm.value || ""}
                          onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Minimum Order Amount Required (₹)
                        </label>
                        <input
                          type="number"
                          value={discountForm.minOrderAmount || 0}
                          onChange={(e) => setDiscountForm({ ...discountForm, minOrderAmount: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Usage Limit (Optional)
                        </label>
                        <input
                          type="number"
                          value={discountForm.usageLimit || ""}
                          onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm"
                          placeholder="No limit"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Active Campaign
                        </label>
                        <select
                          value={discountForm.active === false ? "false" : "true"}
                          onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.value === "true" })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-button shadow-sm"
                      >
                        Save Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountForm(null)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Code</th>
                      <th className="px-6 py-3">Discount Details</th>
                      <th className="px-6 py-3">Min Order</th>
                      <th className="px-6 py-3">Usage Count</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {discounts.length > 0 ? (
                      discounts.map((disc) => (
                        <tr key={disc.code} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">{disc.code}</td>
                          <td className="px-6 py-4 text-slate-700">
                            {disc.type === "flat" ? `₹${disc.value} Off` : `${disc.value}% Off`}
                          </td>
                          <td className="px-6 py-4 text-slate-500">₹{disc.minOrderAmount}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono">
                            {disc.usageCount} {disc.usageLimit ? `/ ${disc.usageLimit}` : ""}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              disc.active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {disc.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setDiscountForm({ ...disc, isEdit: true })}
                                className="p-1 hover:text-blue-600 text-slate-400 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteDiscount(disc.code)}
                                className="p-1 hover:text-red-600 text-slate-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                          No discount codes created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white p-8 border border-slate-200 rounded-card shadow-card max-w-2xl">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Store Settings</h2>
                <p className="text-sm text-slate-500 mb-6">Configure domain, Razorpay API credentials, and store branding</p>
              </div>

              <form onSubmit={saveSettings} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Live Storefront Link
                    </label>
                    <div className="mt-1 text-sm font-semibold text-blue-600 flex items-center gap-1">
                      <span className="underline cursor-pointer">
                        http://{settings.subdomain}.localhost:3002
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Razorpay Merchant Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Razorpay Key ID
                        </label>
                        <input
                          type="text"
                          value={settings.razorpayKey}
                          onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                          placeholder="rzp_test_..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Razorpay Secret Key
                        </label>
                        <input
                          type="password"
                          value={settings.razorpaySecret}
                          onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Keys are encrypted at rest using AES-256-GCM. We never share secrets with public storefront requests.
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-button shadow-sm"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Configuration"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 6. Customers Tab */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Customers</h2>
                <p className="text-sm text-slate-500">Analyze buyer activity, lifetime order metrics, and individual order history ledger</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customers List */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Customer Details</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Orders</th>
                        <th className="px-6 py-3">Total Spend</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {customers.length > 0 ? (
                        customers.map((cust) => (
                          <tr key={cust.email} className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedCustomer?.email === cust.email ? "bg-blue-50/40" : ""}`} onClick={() => { setSelectedCustomer(cust); fetchCustomerOrders(cust.email); }}>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{cust.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{cust.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                cust.registered
                                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {cust.registered ? "Registered" : "Guest"}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700 font-mono">{cust.totalOrders}</td>
                            <td className="px-6 py-4 font-semibold text-slate-900 font-mono">₹{cust.totalSpend}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1 ml-auto">
                                View History <ChevronRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                            No customers found. Make a test sale first!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Customer Detail Drawer */}
                <div className="bg-white border border-slate-200 rounded-card shadow-card p-6 h-fit">
                  {selectedCustomer ? (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg mb-3">
                          {selectedCustomer.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{selectedCustomer.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCustomer.email}</p>
                        <span className="mt-2 inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                          {selectedCustomer.registered ? "Registered Account" : "Guest Checkout"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Total Orders</div>
                          <div className="text-xl font-extrabold text-slate-800 mt-1 font-mono">{selectedCustomer.totalOrders}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-100">
                          <div className="text-[10px] uppercase font-semibold text-slate-400">Total Spend</div>
                          <div className="text-xl font-extrabold text-slate-950 mt-1 font-mono">₹{selectedCustomer.totalSpend}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3">Order History Ledger</h4>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {customerOrders.length > 0 ? (
                            customerOrders.map((o) => (
                              <div key={o.orderId} className="p-3 border border-slate-100 rounded hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-slate-800 font-mono">#{o.orderId.substring(0, 8)}</span>
                                  <span className="font-extrabold text-xs text-slate-950 font-mono">₹{o.total}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                                  <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                  <span className={`px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                    o.status === "delivered"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : o.status === "shipped"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}>
                                    {o.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic">No orders fetched for this customer.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-medium">Select a customer from the list to view their purchase history and aggregate lifecycle metrics</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. Add-ons Tab */}
          {activeTab === "addons" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Platform Add-ons</h2>
                <p className="text-sm text-slate-500">Toggle direct third-party business integrations to enhance client messaging and delivery flows</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* WhatsApp Notification Addon */}
                <div className="bg-white border border-slate-200 rounded-card shadow-card p-6 flex flex-col justify-between hover:border-blue-400 transition-colors">
                  <div>
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-4">
                      WA
                    </div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      WhatsApp Notifications
                      {settings.addOns?.includes("whatsapp") && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">₹199 / month</p>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                      Instantly trigger automated WhatsApp updates to customers when orders are placed, shipped, or delivered, and notify store owners of new purchases.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Status: {settings.addOns?.includes("whatsapp") ? "Enabled" : "Disabled"}</span>
                    <button
                      onClick={() => toggleAddon("whatsapp")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-button transition-colors ${
                        settings.addOns?.includes("whatsapp")
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {settings.addOns?.includes("whatsapp") ? "Disable Add-on" : "Enable Add-on"}
                    </button>
                  </div>
                </div>

                {/* Shiprocket Delivery Integration */}
                <div className="bg-white border border-slate-200 rounded-card shadow-card p-6 flex flex-col justify-between hover:border-blue-400 transition-colors">
                  <div>
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-4">
                      SR
                    </div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      Shiprocket Shipments
                      {settings.addOns?.includes("shiprocket") && (
                        <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">₹299 / month</p>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                      Automatically book shipping slots on Shiprocket when you mark orders as Shipped. Keep track of dynamic status webhooks directly inside Basecart.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Status: {settings.addOns?.includes("shiprocket") ? "Enabled" : "Disabled"}</span>
                    <button
                      onClick={() => toggleAddon("shiprocket")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-button transition-colors ${
                        settings.addOns?.includes("shiprocket")
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {settings.addOns?.includes("shiprocket") ? "Disable Add-on" : "Enable Add-on"}
                    </button>
                  </div>
                </div>

                {/* GST Invoicing Auto-Creator */}
                <div className="bg-white border border-slate-200 rounded-card shadow-card p-6 flex flex-col justify-between hover:border-blue-400 transition-colors">
                  <div>
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mb-4">
                      TX
                    </div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      GST Tax Invoicing
                      {settings.addOns?.includes("gst_invoice") && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">Active</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">₹149 / month</p>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                      Generate legal GST invoices for each transaction, auto-compile tax calculations, upload PDFs direct to S3, and attach receipts to buyer emails.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Status: {settings.addOns?.includes("gst_invoice") ? "Enabled" : "Disabled"}</span>
                    <button
                      onClick={() => toggleAddon("gst_invoice")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-button transition-colors ${
                        settings.addOns?.includes("gst_invoice")
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {settings.addOns?.includes("gst_invoice") ? "Disable Add-on" : "Enable Add-on"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Finances Tab */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Finances</h2>
                <p className="text-sm text-slate-500">Monitor revenue flows, platform transaction commission statements, and transaction reconciliation status</p>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900 font-mono">
                    ₹{financeSummary.totalRevenue}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-medium">All completed transactions</p>
                </div>

                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Commissions</span>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-red-600 font-mono">
                    ₹{financeSummary.totalPlatformFees.toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-medium">Deductions per active plan tier</p>
                </div>

                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Store Sales</span>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 font-mono">
                    ₹{(financeSummary.totalRevenue - financeSummary.totalPlatformFees).toFixed(2)}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 font-medium">Disbursable profit at gateway settlement</p>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">Transactional Orders Ledger</h3>
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Customer Email</th>
                      <th className="px-6 py-3">Gross Amount</th>
                      <th className="px-6 py-3">Platform Fee Deduction</th>
                      <th className="px-6 py-3">Payment Status</th>
                      <th className="px-6 py-3">Reconciliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {financeSummary.transactions?.length > 0 ? (
                      financeSummary.transactions.map((txn: any) => (
                        <tr key={txn.orderId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 text-xs">#{txn.orderId.substring(0, 8)}</td>
                          <td className="px-6 py-4 text-slate-600 font-sans text-xs">{txn.customerEmail}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{txn.total}</td>
                          <td className="px-6 py-4 text-red-600">-₹{txn.platformFee.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-sans ${
                              ["paid", "shipped", "delivered"].includes(txn.status)
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold font-sans ${
                              txn.reconciliationStatus === "settled"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {txn.reconciliationStatus || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-sans">
                          No financial transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. Billing & Plan Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Billing & Limits</h2>
                <p className="text-sm text-slate-500">Monitor resource consumption benchmarks, active tier caps, and process subscription upgrades</p>
              </div>

              {/* Progress Usage Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Limit Gauge */}
                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-800">Products Catalog Count</span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {billingInfo.productsUsed} / {billingInfo.productsLimit === 999999 ? "Unlimited" : billingInfo.productsLimit} Used
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (billingInfo.productsUsed / (billingInfo.productsLimit || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Total active products registered in store inventory.</p>
                </div>

                {/* Orders Monthly Limit Gauge */}
                <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-800">Orders Limit (Current Month)</span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {billingInfo.ordersUsed} / {billingInfo.ordersLimit === 999999 ? "Unlimited" : billingInfo.ordersLimit} Used
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (billingInfo.ordersUsed / (billingInfo.ordersLimit || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Monthly order quota resetting on the first day of next calendar month.</p>
                </div>
              </div>

              {/* Plans Selection Matrix */}
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-4">Subscription Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Tier */}
                  <div className={`bg-white border rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative ${billingInfo.plan === "starter" ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}`}>
                    {billingInfo.plan === "starter" && (
                      <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Starter Plan</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹0 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2">✓ Up to 50 Products</li>
                        <li className="flex items-center gap-2">✓ Up to 100 Orders / mo</li>
                        <li className="flex items-center gap-2 text-blue-600 font-semibold">✓ 3% platform commission markup</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "starter"}
                      onClick={() => changePlan("starter")}
                      className={`w-full py-2 text-xs font-bold rounded-button mt-8 border transition-all ${
                        billingInfo.plan === "starter"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-blue-600 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {billingInfo.plan === "starter" ? "Current Subscription" : "Downgrade to Starter"}
                    </button>
                  </div>

                  {/* Growth Tier */}
                  <div className={`bg-white border rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative ${billingInfo.plan === "growth" ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}`}>
                    {billingInfo.plan === "growth" && (
                      <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Growth Plan</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹999 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2">✓ Up to 500 Products</li>
                        <li className="flex items-center gap-2">✓ Up to 1000 Orders / mo</li>
                        <li className="flex items-center gap-2 text-blue-600 font-semibold">✓ 1% platform commission markup</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "growth"}
                      onClick={() => changePlan("growth")}
                      className={`w-full py-2 text-xs font-bold rounded-button mt-8 border transition-all ${
                        billingInfo.plan === "growth"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {billingInfo.plan === "growth" ? "Current Subscription" : "Switch to Growth"}
                    </button>
                  </div>

                  {/* Pro Tier */}
                  <div className={`bg-white border rounded-card shadow-card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative ${billingInfo.plan === "pro" ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}`}>
                    {billingInfo.plan === "pro" && (
                      <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Pro Plan</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹4,999 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-sm text-slate-600">
                        <li className="flex items-center gap-2">✓ Unlimited Products</li>
                        <li className="flex items-center gap-2">✓ Unlimited Orders</li>
                        <li className="flex items-center gap-2">✓ Custom Domains unlocked</li>
                        <li className="flex items-center gap-2 text-blue-600 font-semibold">✓ 0.5% platform commission markup</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "pro"}
                      onClick={() => changePlan("pro")}
                      className={`w-full py-2 text-xs font-bold rounded-button mt-8 border transition-all ${
                        billingInfo.plan === "pro"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {billingInfo.plan === "pro" ? "Current Subscription" : "Upgrade to Pro"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
