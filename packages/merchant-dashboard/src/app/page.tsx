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
  ShoppingBag,
  Megaphone,
  Palette,
  Puzzle,
  MoreVertical,
  Globe,
  ChevronDown,
  Calendar,
  Copy,
  ExternalLink,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getOptimizedImageUrl } from "../lib/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const STOREFRONT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "localhost:3002").replace(/^(https?:\/\/)/, "");
const STOREFRONT_PROTOCOL = process.env.NEXT_PUBLIC_STOREFRONT_PROTOCOL || "http";
const getStorefrontLink = (subdomain: string) => {
  const isPagesDev = STOREFRONT_DOMAIN.includes(".pages.dev");
  if (isPagesDev) {
    return `${STOREFRONT_PROTOCOL}://${STOREFRONT_DOMAIN}?store=${subdomain}`;
  }
  return `${STOREFRONT_PROTOCOL}://${subdomain}.${STOREFRONT_DOMAIN}`;
};

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
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

// PREMIUM SKELETON PRIMITIVES
function SkeletonTextLine({ className = "" }: { className?: string }) {
  return <div className={`h-4 bg-slate-200 rounded animate-shimmer ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-3">
      <div className="h-4 bg-slate-200 rounded animate-shimmer w-1/3" />
      <div className="h-8 bg-slate-200 rounded animate-shimmer w-1/2" />
      <div className="h-3 bg-slate-200 rounded animate-shimmer w-2/3" />
    </div>
  );
}

function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded animate-shimmer w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-card shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-3 bg-slate-200 rounded animate-shimmer w-1/2" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-card p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-8 animate-fade-in">
      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-xs font-semibold rounded shadow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// PREMIUM DATA DISPLAYS (INR Currency Formatter)
function formatINR(val: number | string) {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function MerchantDashboard() {
  // Auth state
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("basecart_merchant_token");
    }
    return null;
  });
  const [tenantId, setTenantId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("basecart_tenant_id");
    }
    return null;
  });
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeNameInput, setStoreNameInput] = useState("");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Auth Recovery states
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [showForgotView, setShowForgotView] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [resetPasswordToken, setResetPasswordToken] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [emailVerificationResent, setEmailVerificationResent] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "summary" | "orders" | "products" | "customers" | "discounts" | "addons" | "finances" | "billing" | "settings" | "catalog" | "marketing" | "store-design" | "payments"
  >("summary");

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Header interactivity states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<"Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "All Time">("Last 7 Days");
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome to Basecart! 🎉", desc: "Start by adding your first product to list it on your storefront.", read: false },
    { id: 2, title: "Razorpay integration pending", desc: "Configure your Razorpay key ID and secret key in settings to accept active payments.", read: false },
    { id: 3, title: "Store launch ready", desc: "Your store design is ready! Share your subdomain URL with customers.", read: false }
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  // Themes state
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);
  const [activeMenuThemeId, setActiveMenuThemeId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<"home" | "catalog" | "checkout">("home");
  const [customizerSection, setCustomizerSection] = useState<"style" | "home" | "catalog" | "checkout">("style");

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

  // Read tokens on startup (via httpOnly cookie session check & localStorage fallback)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const localToken = typeof window !== "undefined" ? localStorage.getItem("basecart_merchant_token") : null;
        const headers: Record<string, string> = {};
        if (localToken) {
          headers["Authorization"] = `Bearer ${localToken}`;
        }

        const res = await fetch(`${API_URL}/auth/merchant/me`, {
          credentials: "include",
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken);
          setTenantId(data.tenantId);
          setEmailVerified(data.emailVerified !== false);
          
          localStorage.setItem("basecart_merchant_token", data.accessToken);
          localStorage.setItem("basecart_tenant_id", data.tenantId);
        } else {
          // Clear session if invalid/expired
          localStorage.removeItem("basecart_merchant_token");
          localStorage.removeItem("basecart_tenant_id");
          setToken(null);
          setTenantId(null);
        }
      } catch (err) {
        console.error("No active merchant session:", err);
      }
    };
    checkSession();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get("token");
      const verifiedParam = params.get("verified");
      if (tokenParam) {
        setResetPasswordToken(tokenParam);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (verifiedParam === "true") {
        alert("Email verified successfully! You can now access all dashboard integrations.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
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

  const fetchThemes = async (keepEditingId?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/store/themes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const themesList = await res.json();
        setThemes(themesList);
        
        // Find what theme to edit next
        const editingId = keepEditingId || selectedTheme?.themeId;
        const current = themesList.find((t: any) => t.themeId === editingId);
        const published = themesList.find((t: any) => t.status === "published");
        
        if (current) {
          setSelectedTheme(current);
        } else if (published) {
          setSelectedTheme(published);
        } else if (themesList.length > 0) {
          setSelectedTheme(themesList[0]);
        } else {
          setSelectedTheme(null);
        }
      }
    } catch (err) {
      console.error("Error fetching themes:", err);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!selectedTheme || !token) return;

    // Find the original theme in themes list to see if there are local edits
    const original = themes.find(t => t.themeId === selectedTheme.themeId);
    if (!original) return;

    const hasChanges = 
      selectedTheme.name !== original.name ||
      selectedTheme.templateBase !== original.templateBase ||
      selectedTheme.logoUrl !== original.logoUrl ||
      JSON.stringify(selectedTheme.colors) !== JSON.stringify(original.colors) ||
      JSON.stringify(selectedTheme.pageContent) !== JSON.stringify(original.pageContent);

    if (!hasChanges) return;

    // Debounce the PATCH save request
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/store/themes/${selectedTheme.themeId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedTheme.name,
            templateBase: selectedTheme.templateBase,
            colors: selectedTheme.colors,
            logoUrl: selectedTheme.logoUrl,
            pageContent: selectedTheme.pageContent,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          // Update local themes array with the saved content
          setThemes(prev => prev.map(t => t.themeId === updated.themeId ? updated : t));
          // If the updated theme is published, we also update the global settings state 
          // to make sure logo and styling changes propagate to other parts of the merchant dashboard
          if (updated.status === "published") {
            setSettings(prev => ({
              ...prev,
              branding: {
                logoUrl: updated.logoUrl,
                primaryColor: updated.colors?.primary || "#2563EB",
                accentColor: updated.colors?.accent || "#1D4ED8",
              }
            }));
          }
        }
      } catch (err) {
        console.error("Autosave failed", err);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [selectedTheme, themes, token]);

  const renameTheme = async (theme: any) => {
    setActiveMenuThemeId(null);
    const newName = prompt("Enter new theme name:", theme.name);
    if (!newName || newName.trim() === "") return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes/${theme.themeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setActionSuccess(`Theme renamed to "${newName.trim()}"`);
        await fetchThemes(theme.themeId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed renaming theme");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const duplicateTheme = async (theme: any) => {
    setActiveMenuThemeId(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Copy of ${theme.name}`,
          templateBase: theme.templateBase,
          colors: theme.colors,
          logoUrl: theme.logoUrl,
        }),
      });
      if (res.ok) {
        const newTheme = await res.json();
        setActionSuccess(`Theme "${theme.name}" duplicated as "${newTheme.name}"`);
        await fetchThemes(newTheme.themeId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed duplicating theme");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTheme = async (theme: any) => {
    setActiveMenuThemeId(null);
    if (theme.status === "published") {
      setActionError("Cannot delete the currently published theme.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes/${theme.themeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setActionSuccess(`Theme "${theme.name}" deleted successfully.`);
        await fetchThemes();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed deleting theme");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const publishTheme = async (theme: any) => {
    if (!confirm(`Are you sure you want to publish "${theme.name}"? This will update your live storefront instantly.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes/${theme.themeId}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const updated = await res.json();
        setActionSuccess(`Theme "${theme.name}" has been published successfully!`);
        await fetchThemes(updated.themeId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed publishing theme");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewDraft = async () => {
    const activeTheme = themes.find(t => t.status === "published") || themes[0];
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: activeTheme ? `Draft of ${activeTheme.name}` : "New Aura Theme Draft",
          templateBase: activeTheme ? activeTheme.templateBase : "Aura",
          colors: activeTheme ? activeTheme.colors : { primary: "#2563EB", accent: "#1D4ED8" },
          logoUrl: activeTheme ? activeTheme.logoUrl : "",
        }),
      });
      if (res.ok) {
        const newTheme = await res.json();
        setActionSuccess(`Created new theme draft "${newTheme.name}"`);
        await fetchThemes(newTheme.themeId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed creating theme draft");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFromLibrary = async (libraryTheme: { name: string; templateBase: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store/themes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${libraryTheme.name} Draft`,
          templateBase: libraryTheme.templateBase,
          colors: { primary: "#2563EB", accent: "#1D4ED8" },
          logoUrl: selectedTheme?.logoUrl || "",
        }),
      });
      if (res.ok) {
        const newTheme = await res.json();
        setActionSuccess(`Theme "${newTheme.name}" added to your draft list.`);
        await fetchThemes(newTheme.themeId);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed adding theme draft");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setActionError("");
    try {
      if (activeTab === "summary") {
        const [sumRes, custRes, ordRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (sumRes.ok) setSummary(await sumRes.json());
        if (custRes.ok) setCustomers(await custRes.json());
        if (ordRes.ok) setOrders(await ordRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
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
      } else if (["settings", "addons", "store-design", "payments", "catalog"].includes(activeTab)) {
        const res = await fetch(`${API_URL}/store/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setSettings(await res.json());
        
        if (activeTab === "store-design") {
          await fetchThemes();
        }
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

      localStorage.setItem("basecart_merchant_token", data.accessToken);
      localStorage.setItem("basecart_tenant_id", data.tenantId);
      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmailVerified(data.emailVerified !== false);
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
          storeName: "Watchroom",
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

      localStorage.setItem("basecart_merchant_token", data.accessToken);
      localStorage.setItem("basecart_tenant_id", data.tenantId);
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
    if (!acceptTerms) {
      setAuthError("You must accept the Terms of Service and Privacy Policy to register.");
      return;
    }
    setAuthError("");
    setLoading(true);
    try {
      let cleanedSubdomain = subdomainInput.trim().toLowerCase();
      if (cleanedSubdomain.endsWith(".basecart.io")) {
        cleanedSubdomain = cleanedSubdomain.replace(/\.?basecart\.io$/, "");
      }
      if (cleanedSubdomain.endsWith("." + STOREFRONT_DOMAIN.replace(/:[0-9]+$/, ""))) {
        cleanedSubdomain = cleanedSubdomain.replace(new RegExp(`\\.?${STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "").replace(/\./g, "\\.")}$`), "");
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

      localStorage.setItem("basecart_merchant_token", data.accessToken);
      localStorage.setItem("basecart_tenant_id", data.tenantId);
      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmailVerified(false);
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
    localStorage.removeItem("basecart_merchant_token");
    localStorage.removeItem("basecart_tenant_id");
    setToken(null);
    setTenantId(null);
    setProducts([]);
    setOrders([]);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setForgotPasswordSent(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetPasswordToken, newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setResetPasswordSuccess(true);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setAuthError("");
    setEmailVerificationResent(false);
    try {
      const res = await fetch(`${API_URL}/auth/merchant/resend-verification`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setEmailVerificationResent(true);
    } catch (err: any) {
      alert(err.message);
    }
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
    if (resetPasswordToken) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Basecart</h1>
              <p className="mt-2 text-sm text-slate-500">Reset Your Password</p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-card text-sm border border-red-100">
                {authError}
              </div>
            )}

            {resetPasswordSuccess ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-card border border-emerald-100 text-sm">
                  ✓ Your password has been successfully reset.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordToken("");
                    setResetPasswordSuccess(false);
                    setAuthError("");
                    setIsLoginView(true);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="Min 6 characters"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordToken("");
                    setAuthError("");
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      );
    }

    if (showForgotView) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card border border-slate-200 shadow-card">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Basecart</h1>
              <p className="mt-2 text-sm text-slate-500">Recover Account Access</p>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-card text-sm border border-red-100">
                {authError}
              </div>
            )}

            {forgotPasswordSent ? (
              <div className="space-y-4 text-center">
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-card border border-emerald-100 text-sm">
                  ✓ If the email is registered, we have sent a password reset link. Please check your inbox.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotView(false);
                    setForgotPasswordSent(false);
                    setAuthError("");
                    setForgotPasswordEmail("");
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    placeholder="name@store.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-button transition-colors text-sm shadow-sm flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotView(false);
                    setAuthError("");
                  }}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Back to Sign In
                </button>
              </form>
            )}
          </div>
        </div>
      );
    }

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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotView(true);
                    setAuthError("");
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
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
              <div className="flex items-start gap-2 select-none">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-500 leading-normal">
                  I accept the platform's{" "}
                  <a href="#tos" onClick={(e) => { e.preventDefault(); alert("Basecart Platform Terms of Service\n\n1. Use of the Service: You must keep your credentials secure.\n2. Payment: You agree to active subscription pricing.\n3. Content: You own all catalog content published."); }} className="text-blue-600 hover:underline font-semibold">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Basecart Platform Privacy Policy\n\n1. Data Collection: We collect store catalog, emails, and transaction history.\n2. Security: We protect transaction data with standard encryption protocols.\n3. Third Parties: Payment records are securely shared with gateway processors."); }} className="text-blue-600 hover:underline font-semibold">
                    Privacy Policy
                  </a>.
                </label>
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
    <div className="h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        style={{ width: sidebarCollapsed ? 72 : 256 }}
        className="bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-full transition-[width] duration-300 ease-in-out overflow-hidden"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Branding */}
          <div className="h-14 flex items-center px-4 gap-3 border-b border-slate-100 shrink-0">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <ShoppingBag className="h-[18px] w-[18px]" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-[15px] font-bold text-slate-800 tracking-tight whitespace-nowrap">basecart</span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {[
              { id: "summary", name: "Dashboard", icon: LayoutDashboard },
              { id: "orders", name: "Orders", icon: ShoppingCart, badge: orders.length > 0 ? orders.length : undefined },
              { id: "products", name: "Products", icon: Package },
              { id: "customers", name: "Customers", icon: Users },
              { id: "catalog", name: "Catalog", icon: Globe },
              { id: "discounts", name: "Discounts", icon: Tag },
              { id: "marketing", name: "Marketing", icon: Megaphone },
              { id: "store-design", name: "Store Design", icon: Palette },
              { id: "addons", name: "Apps & Integrations", icon: Puzzle },
              { id: "payments", name: "Payments", icon: CreditCard },
              { id: "finances", name: "Analytics", icon: TrendingUp },
              { id: "settings", name: "Settings", icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all ${
                    sidebarCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-200/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapse toggle */}
        <div className="px-3 py-2 border-t border-slate-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`flex items-center gap-3 w-full rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors ${
              sidebarCollapsed ? "px-3 py-2 justify-center" : "px-3 py-2"
            }`}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-[18px] h-[18px] shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Profile & Upgrade */}
        <div className="border-t border-slate-100">
          {/* Upgrade card - hidden when collapsed */}
          {!sidebarCollapsed && (
            <div className="p-3">
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">PRO</span>
                  <span className="text-xs font-bold text-slate-700">Upgrade your plan</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Unlock premium features and grow faster.
                </p>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Profile footer */}
          <div className={`px-3 py-3 border-t border-slate-100 flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
            <div
              className="h-8 w-8 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 shrink-0 overflow-hidden"
              title={sidebarCollapsed ? settings.storeName || "Store" : undefined}
            >
              {settings.branding?.logoUrl ? (
                <img src={getOptimizedImageUrl(settings.branding.logoUrl, "thumbnail")} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs uppercase">{(settings.storeName || "S").charAt(0)}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{settings.storeName || "My Store"}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Merchant</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="px-4 pb-3 text-center">
              <span className="text-[10px] text-slate-400">Basecart © 2026</span>
              <div className="flex justify-center gap-2 text-[9px] text-slate-400 mt-0.5 select-none">
                <a href="#tos" onClick={(e) => { e.preventDefault(); alert("Basecart Platform Terms of Service\n\n1. Use of the Service: You must keep your credentials secure.\n2. Payment: You agree to active subscription pricing.\n3. Content: You own all catalog content published."); }} className="hover:text-slate-600 underline">Terms</a>
                <span>•</span>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Basecart Platform Privacy Policy\n\n1. Data Collection: We collect store catalog, emails, and transaction history.\n2. Security: We protect transaction data with standard encryption protocols.\n3. Third Parties: Payment records are securely shared with gateway processors."); }} className="hover:text-slate-600 underline">Privacy</a>
                <span>•</span>
                <a href="#refund" onClick={(e) => { e.preventDefault(); alert("Basecart Platform Subscription Refund Policy\n\n1. Period: All subscriptions have a 14-day refund window.\n2. Invoices: Any paid invoices can be disputed for review.\n3. Refund Method: Approved refund credits are sent back to initial card payment sources."); }} className="hover:text-slate-600 underline">Refunds</a>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] h-full overflow-hidden">
        {/* Email Verification Banner */}
        {!emailVerified && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 shrink-0 font-medium animate-fade-in select-none">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>
                <strong>Verify your email:</strong> Please check your inbox for the verification email. A verified account is required to enable payment gateways.
              </span>
            </div>
            <div className="flex items-center gap-3">
              {emailVerificationResent ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide text-[10px]">Email Resent!</span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm transition-all"
                >
                  Resend Email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Good morning, Kiran! 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here's what's happening with your store today. (Subdomain: <span className="font-semibold text-[#4F46E5]">{settings.subdomain || "demo"}.{STOREFRONT_DOMAIN.replace(/:[0-9]+$/, "")}</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 ml-auto w-full md:w-auto justify-end">
            {/* Search Bar */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                onClick={() => setIsSearchOpen(true)}
                readOnly
                className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none hover:border-[#4F46E5] transition-all"
              />
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <kbd className="bg-white border border-slate-200 text-slate-400 text-[9px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                  ⌘ K
                </kbd>
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsStoreSwitcherOpen(false);
                  setIsDateSelectorOpen(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 relative transition-colors font-bold"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#4F46E5] rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-[10px] text-[#4F46E5] font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto space-y-2.5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item));
                        }}
                        className={`pt-2.5 first:pt-0 cursor-pointer group ${n.read ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#4F46E5] transition-colors">{n.title}</h4>
                          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal mt-0.5">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* Store Switcher */}
            <div className="relative">
              <div 
                onClick={() => {
                  setIsStoreSwitcherOpen(!isStoreSwitcherOpen);
                  setIsNotificationsOpen(false);
                  setIsDateSelectorOpen(false);
                }}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-sm select-none"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
                <span>{settings.storeName || "My Store"}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>

              {isStoreSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Store</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{settings.storeName || "My Store"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{settings.subdomain || "demo"}.{STOREFRONT_DOMAIN}</p>
                  </div>
                  <a 
                    href={getStorefrontLink(settings.subdomain || "demo")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>View Live Storefront</span>
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(getStorefrontLink(settings.subdomain || "demo"));
                      setActionSuccess("Storefront link copied to clipboard!");
                      setIsStoreSwitcherOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Store Link</span>
                  </button>
                </div>
              )}
            </div>

            {/* Date Range Picker */}
            <div className="relative">
              <div 
                onClick={() => {
                  setIsDateSelectorOpen(!isDateSelectorOpen);
                  setIsNotificationsOpen(false);
                  setIsStoreSwitcherOpen(false);
                }}
                className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-sm select-none"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>{(() => {
                  const label = selectedDateRange;
                  const last = new Date();
                  const first = new Date();
                  
                  if (label === "Today") {
                    const format = (d: Date) => `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                    return format(last);
                  } else if (label === "Yesterday") {
                    first.setDate(first.getDate() - 1);
                    const format = (d: Date) => `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                    return format(first);
                  } else if (label === "Last 30 Days") {
                    first.setDate(first.getDate() - 29);
                    const format = (d: Date) => `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}`;
                    return `${format(first)} – ${format(last)}, ${last.getFullYear()}`;
                  } else if (label === "All Time") {
                    return "All Time Metrics";
                  } else {
                    // Last 7 Days
                    first.setDate(first.getDate() - 6);
                    const format = (d: Date) => `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}`;
                    return `${format(first)} – ${format(last)}, ${last.getFullYear()}`;
                  }
                })()}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>

              {isDateSelectorOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-0.5">
                  {(["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "All Time"] as const).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setSelectedDateRange(preset);
                        setIsDateSelectorOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        selectedDateRange === preset 
                          ? "bg-indigo-50 text-[#4F46E5]" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ⌘ K Command Palette Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-start justify-center pt-24">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in mx-4">
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products, orders, customers..."
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-semibold"
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); setHeaderSearchQuery(""); }}
                  className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-1 rounded shadow-sm hover:bg-slate-100 font-bold"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                {headerSearchQuery.trim() === "" ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Type to start searching your store resources...
                  </div>
                ) : (() => {
                  const query = headerSearchQuery.toLowerCase();
                  const matchedProducts = products.filter(p => p.name.toLowerCase().includes(query));
                  const matchedOrders = orders.filter(o => o.orderId.toLowerCase().includes(query) || (o.customerInfo?.name || "").toLowerCase().includes(query));
                  const matchedCustomers = customers.filter(c => c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query));

                  const totalMatches = matchedProducts.length + matchedOrders.length + matchedCustomers.length;

                  if (totalMatches === 0) {
                    return (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No matches found for "{headerSearchQuery}"
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 text-xs font-semibold text-slate-700">
                      {/* Products matches */}
                      {matchedProducts.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase text-slate-400 font-bold px-2 mb-1.5">Products</h4>
                          <div className="space-y-0.5">
                            {matchedProducts.map(p => (
                              <button
                                key={p.productId}
                                onClick={() => {
                                  setActiveTab("products");
                                  setIsSearchOpen(false);
                                  setHeaderSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors font-semibold"
                              >
                                <span>{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{formatINR(p.price)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders matches */}
                      {matchedOrders.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase text-slate-400 font-bold px-2 mb-1.5">Orders</h4>
                          <div className="space-y-0.5">
                            {matchedOrders.map(o => (
                              <button
                                key={o.orderId}
                                onClick={() => {
                                  setActiveTab("orders");
                                  setIsSearchOpen(false);
                                  setHeaderSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors font-semibold"
                              >
                                <span>#{o.orderId.substring(0, 8)} - {o.customerInfo?.name || "Guest"}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-mono">{o.status}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customers matches */}
                      {matchedCustomers.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase text-slate-400 font-bold px-2 mb-1.5">Customers</h4>
                          <div className="space-y-0.5">
                            {matchedCustomers.map(c => (
                              <button
                                key={c.email}
                                onClick={() => {
                                  setActiveTab("customers");
                                  setIsSearchOpen(false);
                                  setHeaderSearchQuery("");
                                }}
                                className="w-full flex items-center justify-between px-2 py-2 hover:bg-slate-50 rounded-lg text-left transition-colors font-semibold"
                              >
                                <span>{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{c.email}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

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
          {/* 1. Summary View */}
          {activeTab === "summary" && (() => {
            const hasData = summary.totalOrders > 0;
            const salesVal = summary.totalRevenue || 0;
            const ordersCount = summary.totalOrders || 0;
            const customersCount = customers.length || 0;
            const conversionRate = hasData
              ? ((summary.paidOrders / summary.totalOrders) * 100).toFixed(2) + "%"
              : "0.00%";
            const avgOrderValue = summary.paidOrders > 0
              ? Math.round(summary.totalRevenue / summary.paidOrders)
              : 0;

            // Calculate dynamic weekly comparison trends from orders list
            const nowTime = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;
            const sevenDaysAgo = nowTime - 7 * oneDayMs;
            const fourteenDaysAgo = nowTime - 14 * oneDayMs;

            let curWeekSales = 0;
            let prevWeekSales = 0;
            let curWeekOrders = 0;
            let prevWeekOrders = 0;

            for (const order of orders) {
              const orderTime = new Date(order.createdAt).getTime();
              const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
              
              if (orderTime >= sevenDaysAgo && orderTime <= nowTime) {
                curWeekOrders++;
                if (isPaid) curWeekSales += order.total || 0;
              } else if (orderTime >= fourteenDaysAgo && orderTime < sevenDaysAgo) {
                prevWeekOrders++;
                if (isPaid) prevWeekSales += order.total || 0;
              }
            }

            const salesTrendPercent = prevWeekSales > 0 
              ? ((curWeekSales - prevWeekSales) / prevWeekSales * 100).toFixed(1) 
              : null;
            const ordersTrendPercent = prevWeekOrders > 0 
              ? ((curWeekOrders - prevWeekOrders) / prevWeekOrders * 100).toFixed(1) 
              : null;

            // Setup checklist items status
            const setupSteps = [
              { label: "Add Store Details", done: !!settings.storeName, action: "settings" },
              { label: "Add Products", done: products.length > 0, action: "products" },
              { label: "Setup Payments", done: !!settings.razorpayKey, action: "payments" },
              { label: "Design Your Store", done: !!settings.branding?.primaryColor, action: "store-design" },
              { label: "Add Domain", done: !!settings.subdomain, action: "settings" },
            ];
            const doneCount = setupSteps.filter(s => s.done).length;
            const progressPercent = Math.round((doneCount / setupSteps.length) * 100);

            // Determine redirect for next setup step
            const nextStep = setupSteps.find(s => !s.done);
            const handleContinueSetup = () => {
              if (nextStep) {
                setActiveTab(nextStep.action as any);
              }
            };

            // Dynamic recent orders sorted descending
            const displayedOrders = orders
              .slice()
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4);

            // Compute Top Selling Products dynamically from the database
            const productSalesMap: Record<string, { name: string; sold: number; revenue: number }> = {};
            for (const order of orders) {
              const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
              if (!isPaid) continue;
              const items = order.lineItems || [];
              for (const item of items) {
                const pId = (item as any).productId;
                if (!pId) continue;
                if (!productSalesMap[pId]) {
                  productSalesMap[pId] = { name: item.name || "Unknown Product", sold: 0, revenue: 0 };
                }
                productSalesMap[pId].sold += item.quantity || 0;
                productSalesMap[pId].revenue += (item.price || 0) * (item.quantity || 0);
              }
            }
            
            const topProducts = Object.values(productSalesMap)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5);

            let displayedTopProducts = topProducts;
            if (displayedTopProducts.length === 0) {
              displayedTopProducts = products.slice(0, 5).map(p => ({
                name: p.name,
                sold: 0,
                revenue: 0
              }));
            }

            // Chart data mapping from last7Days
            const chartData = summary.last7Days && summary.last7Days.length === 7 
              ? summary.last7Days.map((day: any) => {
                  const parts = day.date.split("-");
                  const formattedDate = parts.length === 3 ? `${parts[1]}/${parts[2]}` : day.date;
                  return { date: formattedDate, revenue: day.revenue || 0, orders: day.orders || 0 };
                })
              : Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  const formattedDate = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
                  return { date: formattedDate, revenue: 0, orders: 0 };
                });

            const maxRevenue = Math.max(...chartData.map((d: any) => d.revenue), 100);
            
            // Build coordinates for Bezier curved SVG chart
            const chartPoints = chartData.map((d: any, i: number) => {
              const x = 50 + (i * (510 / 6));
              const y = 180 - (d.revenue / maxRevenue) * 130;
              return { x, y, date: d.date, revenue: d.revenue, orders: d.orders };
            });

            let dPath = `M ${chartPoints[0].x},${chartPoints[0].y}`;
            for (let i = 1; i < chartPoints.length; i++) {
              const p0 = chartPoints[i - 1];
              const p1 = chartPoints[i];
              const cpX1 = p0.x + 30;
              const cpY1 = p0.y;
              const cpX2 = p1.x - 30;
              const cpY2 = p1.y;
              dPath += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
            }
            const dFill = `${dPath} L ${chartPoints[chartPoints.length - 1].x},190 L ${chartPoints[0].x},190 Z`;

            return (
              <div className="space-y-6 animate-fade-in">
                {loading ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
                          <div className="h-3 bg-slate-200 rounded animate-shimmer w-1/2" />
                          <div className="h-6 bg-slate-200 rounded animate-shimmer w-3/4" />
                          <div className="h-2 bg-slate-200 rounded animate-shimmer w-2/3" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="h-4 bg-slate-200 rounded animate-shimmer w-1/4" />
                        <div className="h-64 bg-slate-100 rounded animate-shimmer w-full" />
                      </div>
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        <div className="h-4 bg-slate-200 rounded animate-shimmer w-1/4" />
                        <div className="h-64 bg-slate-100 rounded animate-shimmer w-full" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 5 KPI Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* 1. Total Sales */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Sales</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{formatINR(salesVal)}</h3>
                          {salesTrendPercent !== null ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                                Number(salesTrendPercent) >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                              }`}>
                                {Number(salesTrendPercent) >= 0 ? "▲" : "▼"} {Math.abs(Number(salesTrendPercent))}%
                              </span>
                              <span className="text-[9px] text-slate-400">vs last week</span>
                            </div>
                          ) : (
                            <p className="mt-1.5 text-[9px] text-slate-400">Real-time metrics</p>
                          )}
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>

                      {/* 2. Orders */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Orders</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{ordersCount.toLocaleString()}</h3>
                          {ordersTrendPercent !== null ? (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                                Number(ordersTrendPercent) >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                              }`}>
                                {Number(ordersTrendPercent) >= 0 ? "▲" : "▼"} {Math.abs(Number(ordersTrendPercent))}%
                              </span>
                              <span className="text-[9px] text-slate-400">vs last week</span>
                            </div>
                          ) : (
                            <p className="mt-1.5 text-[9px] text-slate-400">Real-time metrics</p>
                          )}
                        </div>
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      </div>

                      {/* 3. Customers */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Customers</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{customersCount.toLocaleString()}</h3>
                          <p className="mt-1.5 text-[9px] text-slate-400">Real-time metrics</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>

                      {/* 4. Conversion Rate */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{conversionRate}</h3>
                          <p className="mt-1.5 text-[9px] text-slate-400">Real-time metrics</p>
                        </div>
                        <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>

                      {/* 5. Avg. Order Value */}
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg. Order Value</p>
                          <h3 className="mt-1 text-lg font-bold text-slate-900">{formatINR(avgOrderValue)}</h3>
                          <p className="mt-1.5 text-[9px] text-slate-400">Real-time metrics</p>
                        </div>
                        <div className="h-10 w-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Sales Overview & Top Selling Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Sales Overview Area Chart */}
                      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">Sales Overview</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xl font-bold text-slate-900">{formatINR(salesVal)}</span>
                              {salesTrendPercent !== null && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  Number(salesTrendPercent) >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                                }`}>
                                  {Number(salesTrendPercent) >= 0 ? "▲" : "▼"} {Math.abs(Number(salesTrendPercent))}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select className="border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white">
                              <option>Net Sales</option>
                              <option>Gross Sales</option>
                            </select>
                            <button 
                              onClick={() => setActiveTab("finances")}
                              className="border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                            >
                              View Report
                            </button>
                          </div>
                        </div>

                        {/* Bezier Line Chart */}
                        <div className="h-52 relative mt-4">
                          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Grid Y Lines */}
                            {[0, 50, 100, 150, 200].map((yVal) => (
                              <line key={yVal} x1="40" y1={yVal} x2="570" y2={yVal} className="stroke-slate-100 stroke-1 stroke-dasharray-[4,4]" />
                            ))}

                            {/* Smooth Curved Line & Gradient Fill */}
                            <path d={dFill} fill="url(#chartGradient)" />
                            <path d={dPath} fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />

                            {/* Interactive Hover Tooltips */}
                            {chartPoints.map((p: any, idx: number) => (
                              <g key={idx} className="group cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="10" className="fill-transparent" />
                                <circle cx={p.x} cy={p.y} r="4" className="fill-white stroke-[#4F46E5] stroke-2 group-hover:r-5 transition-all" />
                                <foreignObject
                                  x={p.x - 45}
                                  y={p.y - 35}
                                  width="90"
                                  height="28"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-150"
                                >
                                  <div className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded shadow text-center font-bold">
                                    {formatINR(p.revenue)}
                                  </div>
                                </foreignObject>
                              </g>
                            ))}
                          </svg>

                          {/* Chart X Labels */}
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-10 mt-1">
                            {chartPoints.map((p: any, i: number) => (
                              <span key={i}>{p.date}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Top Selling Products Card */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                          <h3 className="text-sm font-bold text-slate-800">Top Selling Products</h3>
                          <button 
                            onClick={() => setActiveTab("products")}
                            className="text-[#4F46E5] hover:text-[#4338CA] text-[11px] font-bold"
                          >
                            View All
                          </button>
                        </div>

                        {displayedTopProducts.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-6">
                            <Package className="h-8 w-8 text-slate-300 mb-2" />
                            <span>No products listed yet</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 space-y-3 flex-1 overflow-y-auto">
                            {displayedTopProducts.map((item, index) => (
                              <div key={index} className="flex items-center justify-between pt-3 first:pt-0">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] bg-indigo-50 text-[#4F46E5]`}>
                                    {item.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{item.sold.toLocaleString()} sold</p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-slate-900">{formatINR(item.revenue)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Recent Orders, Store Setup Guide, and Growth Tips */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Recent Orders Card */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                          <h3 className="text-sm font-bold text-slate-800">Recent Orders</h3>
                          <button 
                            onClick={() => setActiveTab("orders")}
                            className="text-[#4F46E5] hover:text-[#4338CA] text-[11px] font-bold"
                          >
                            View All Orders
                          </button>
                        </div>

                        <div className="divide-y divide-slate-100 space-y-3.5 flex-1 flex flex-col justify-center">
                          {displayedOrders.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-6 text-slate-400 text-xs">
                              <ShoppingCart className="h-8 w-8 text-slate-300 mb-2" />
                              <span>No orders received yet</span>
                            </div>
                          ) : (
                            displayedOrders.map((o: any) => (
                              <div key={o.orderId} className="flex items-center justify-between pt-3.5 first:pt-0">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    o.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                  }`}>
                                    <ShoppingCart className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">#{o.orderId.substring(0, 8)}</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{o.customerInfo?.name || "Guest"}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900">{formatINR(o.total)}</p>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase mt-0.5 ${
                                    o.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                                  }`}>
                                    {o.status === "paid" ? "Paid" : "Processing"}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Store Setup Guide Circular Radial Progress */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="border-b border-slate-100 pb-3 mb-3">
                          <h3 className="text-sm font-bold text-slate-800">Store Setup Guide</h3>
                        </div>

                        <div className="flex items-center gap-4 py-1">
                          <div className="relative h-16 w-16 shrink-0">
                            {/* Radial Progress Ring */}
                            <svg className="h-full w-full transform -rotate-90">
                              <circle cx="32" cy="32" r="26" fill="transparent" stroke="#EEF2FF" strokeWidth="4" />
                              <circle 
                                cx="32" 
                                cy="32" 
                                r="26" 
                                fill="transparent" 
                                stroke="#4F46E5" 
                                strokeWidth="4" 
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 * (1 - progressPercent / 100)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">{progressPercent}%</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Your store is almost ready!</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">Continue to add more features and start selling.</p>
                          </div>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-2 mt-3 flex-1">
                          {setupSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600">
                              <input 
                                type="checkbox" 
                                checked={step.done} 
                                readOnly 
                                className="h-3.5 w-3.5 text-[#4F46E5] focus:ring-[#4F46E5] border-slate-300 rounded cursor-default"
                              />
                              <span className={step.done ? "line-through text-slate-400" : ""}>{step.label}</span>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={handleContinueSetup}
                          disabled={progressPercent === 100}
                          className="w-full py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-colors shadow-sm mt-4"
                        >
                          {progressPercent === 100 ? "Setup Complete 🎉" : "Continue Setup"}
                        </button>
                      </div>

                      {/* Growth Tips & Accepted Payments Row */}
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        {/* Growth tips card */}
                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-50/80 flex items-center gap-3">
                          <div className="h-10 w-10 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center shrink-0">
                            <Tag className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800">Boost your sales</h4>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">Create discount codes to attract more shop sales.</p>
                            <button 
                              onClick={() => setActiveTab("discounts")}
                              className="text-[#4F46E5] hover:text-[#4338CA] text-[10px] font-bold mt-1 block"
                            >
                              Create Discount
                            </button>
                          </div>
                        </div>

                        {/* Accepted Payments block */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accepted Payments</span>
                            <button 
                              onClick={() => setActiveTab("payments")}
                              className="text-[#4F46E5] hover:text-[#4338CA] text-[10px] font-bold"
                            >
                              Manage
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {["UPI", "VISA", "RUPAY", "MC", "AMEX"].map((tag) => (
                              <span key={tag} className="text-[9px] font-extrabold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded shadow-sm select-none">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

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
                                <img src={getOptimizedImageUrl(url, "thumbnail")} alt={`product-${i}`} className="w-full h-full object-cover" />
                                
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
              ) : products.length === 0 && !loading ? (
                <EmptyState
                  icon={<Package className="h-10 w-10 text-blue-600" />}
                  title="No products yet"
                  description="Create your first catalog item to start selling on your storefront."
                  action={{
                    label: "Add Product",
                    onClick: () => {
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
                    }
                  }}
                />
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
                        {loading ? (
                          Array.from({ length: 5 }).map((_, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-4 w-10"><div className="h-4 bg-slate-200 rounded w-4 animate-shimmer" /></td>
                              <td className="px-4 py-4 flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-200 rounded animate-shimmer" />
                                <div className="space-y-1.5 flex-1">
                                  <div className="h-4 bg-slate-200 rounded w-2/3 animate-shimmer" />
                                  <div className="h-3 bg-slate-200 rounded w-1/3 animate-shimmer" />
                                </div>
                              </td>
                              <td className="px-4 py-4"><div className="h-5 bg-slate-200 rounded w-12 animate-shimmer" /></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-10 animate-shimmer" /></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-10 animate-shimmer" /></td>
                              <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-10 ml-auto animate-shimmer" /></td>
                            </tr>
                          ))
                        ) : products.filter((p) => {
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
                                        <img src={getOptimizedImageUrl(prod.images[0], "thumbnail")} alt={prod.name} className="w-full h-full object-cover" />
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
                              <div className="flex flex-col items-center justify-center space-y-2 py-8">
                                <Search className="h-8 w-8 text-slate-300" />
                                <span className="font-semibold text-slate-700 text-sm">No matching products</span>
                                <span className="text-xs text-slate-400">Try adjusting your filters or search keywords.</span>
                              </div>
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

              {orders.length === 0 && !loading ? (
                <EmptyState
                  icon={<ShoppingCart className="h-10 w-10 text-blue-600" />}
                  title="No orders yet"
                  description="When customers purchase products from your storefront, they will show up here."
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm animate-fade-in">
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
                      {loading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-shimmer" /></td>
                            <td className="px-6 py-4">
                              <div className="h-4 bg-slate-200 rounded w-28 animate-shimmer mb-1" />
                              <div className="h-3 bg-slate-200 rounded w-36 animate-shimmer" />
                            </td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                            <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto animate-shimmer" /></td>
                          </tr>
                        ))
                      ) : (
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
                            <td className="px-6 py-4 font-bold text-slate-900">{formatINR(order.total)}</td>
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
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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

              {!discountForm && discounts.length === 0 && !loading ? (
                <EmptyState
                  icon={<Tag className="h-10 w-10 text-blue-600" />}
                  title="No discount codes yet"
                  description="Create custom promotional coupons to boost sales on your storefront."
                  action={{
                    label: "Add Discount Code",
                    onClick: () => setDiscountForm({ code: "", type: "flat", value: 0, minOrderAmount: 0, active: true })
                  }}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden animate-fade-in">
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
                      {loading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                            <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                            <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto animate-shimmer" /></td>
                          </tr>
                        ))
                      ) : (
                        discounts.map((disc) => (
                          <tr key={disc.code} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{disc.code}</td>
                            <td className="px-6 py-4 text-slate-700">
                              {disc.type === "flat" ? `${formatINR(disc.value)} Off` : `${disc.value}% Off`}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{formatINR(disc.minOrderAmount)}</td>
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
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
                        {STOREFRONT_PROTOCOL}://{settings.subdomain}.{STOREFRONT_DOMAIN}
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

                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Store Legal Policies</h3>
                  <p className="text-xs text-slate-500 leading-normal">
                    Enter customized plain text policy summaries. When populated, these will automatically display links inside your public storefront footer.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Terms of Service
                      </label>
                      <textarea
                        rows={4}
                        value={settings.termsOfService || ""}
                        onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none font-mono"
                        placeholder="Our store terms & conditions..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Privacy Policy
                      </label>
                      <textarea
                        rows={4}
                        value={settings.privacyPolicy || ""}
                        onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none font-mono"
                        placeholder="Our privacy collection standards..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Refund & Cancellation Policy
                      </label>
                      <textarea
                        rows={4}
                        value={settings.refundPolicy || ""}
                        onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none font-mono"
                        placeholder="Our item cancellation & money-back policies..."
                      />
                    </div>
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

              {customers.length === 0 && !loading ? (
                <EmptyState
                  icon={<Users className="h-10 w-10 text-blue-600" />}
                  title="No customers yet"
                  description="When customers check out on your storefront, their records and history will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
                        {loading ? (
                          Array.from({ length: 5 }).map((_, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4">
                                <div className="h-4 bg-slate-200 rounded w-28 animate-shimmer mb-1" />
                                <div className="h-3 bg-slate-200 rounded w-36 animate-shimmer" />
                              </td>
                              <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                              <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-8 animate-shimmer" /></td>
                              <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-12 animate-shimmer" /></td>
                              <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto animate-shimmer" /></td>
                            </tr>
                          ))
                        ) : (
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
                              <td className="px-6 py-4 font-semibold text-slate-900 font-mono">{formatINR(cust.totalSpend)}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-blue-600 hover:text-blue-700 font-medium text-xs flex items-center gap-1 ml-auto">
                                  View History <ChevronRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))
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
                          <div className="text-xl font-extrabold text-slate-950 mt-1 font-mono">{formatINR(selectedCustomer.totalSpend)}</div>
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
                                  <span className="font-extrabold text-xs text-slate-950 font-mono">{formatINR(o.total)}</span>
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
            )}
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

              {loading ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                  <SkeletonTable rows={5} cols={6} />
                </>
              ) : !financeSummary.transactions || financeSummary.transactions.length === 0 ? (
                <EmptyState
                  icon={<DollarSign className="h-10 w-10 text-blue-600" />}
                  title="No financial logs yet"
                  description="Transactions will appear here as soon as payments are cleared and reconciled."
                />
              ) : (
                <>
                  {/* Financial KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900 font-mono">
                        {formatINR(financeSummary.totalRevenue)}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-medium">All completed transactions</p>
                    </div>

                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Commissions</span>
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="mt-2 text-3xl font-bold tracking-tight text-red-600 font-mono">
                        {formatINR(financeSummary.totalPlatformFees)}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-medium">Deductions per active plan tier</p>
                    </div>

                    <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Store Sales</span>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 font-mono">
                        {formatINR(financeSummary.totalRevenue - financeSummary.totalPlatformFees)}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-medium">Disbursable profit at gateway settlement</p>
                    </div>
                  </div>

                  {/* Transactions Ledger */}
                  <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden animate-fade-in">
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
                        {financeSummary.transactions.map((txn: any) => (
                          <tr key={txn.orderId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-xs">#{txn.orderId.substring(0, 8)}</td>
                            <td className="px-6 py-4 text-slate-600 font-sans text-xs">{txn.customerEmail}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{formatINR(txn.total)}</td>
                            <td className="px-6 py-4 text-red-600">-{formatINR(txn.platformFee)}</td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
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
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card space-y-4">
                    <div className="h-4 bg-slate-200 rounded animate-shimmer w-1/3" />
                    <div className="h-2 bg-slate-200 rounded animate-shimmer w-full" />
                    <div className="h-3 bg-slate-200 rounded animate-shimmer w-2/3" />
                  </div>
                  <div className="bg-white p-6 rounded-card border border-slate-200 shadow-card space-y-4">
                    <div className="h-4 bg-slate-200 rounded animate-shimmer w-1/3" />
                    <div className="h-2 bg-slate-200 rounded animate-shimmer w-full" />
                    <div className="h-3 bg-slate-200 rounded animate-shimmer w-2/3" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
              )}

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

              {/* Monthly Invoices & Statements */}
              <div className="border-t border-slate-200 pt-8 mt-8">
                <h3 className="font-bold text-base text-slate-900 mb-2">Monthly Invoices & Statements</h3>
                <p className="text-xs text-slate-500 mb-4">View and download your monthly subscription bills and paid add-on invoice statements.</p>

                <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Billing Period</th>
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Paid Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Add-ons</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {billingInfo.statements && billingInfo.statements.length > 0 ? (
                        billingInfo.statements.map((stmt: any) => (
                          <tr key={stmt.invoiceId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-800">{stmt.billingPeriod}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{stmt.invoiceId}</td>
                            <td className="px-6 py-4 text-slate-500">{stmt.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-800 font-mono">₹{stmt.amount}</td>
                            <td className="px-6 py-4">
                              {stmt.addOns && stmt.addOns.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {stmt.addOns.map((a: string) => (
                                    <span key={a} className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-100 uppercase tracking-wider">
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <a
                                href={`${API_URL}/store/billing/statement/${stmt.invoiceId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download PDF
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            No billing statement records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 10. Catalog Tab */}
          {activeTab === "catalog" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Store Catalog</h2>
                <p className="text-sm text-slate-500">Access your live customer-facing storefront, preview catalog links, and view active themes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Storefront Details</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Subdomain Host</div>
                      <div className="text-sm font-mono font-bold text-slate-800 mt-1">{settings.subdomain || "demo"}.basecart.com</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Theme Base Color</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: settings.branding?.primaryColor || "#4F46E5" }}></span>
                        <span className="text-xs font-semibold text-slate-700">{settings.branding?.primaryColor || "#4F46E5"}</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={getStorefrontLink(settings.subdomain || "demo")} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    <Globe className="h-4 w-4" /> View Live Storefront
                  </a>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">Active Template</h3>
                  <div className="p-4 border border-indigo-100 rounded-lg bg-indigo-50/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Basecart Default Theme</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded uppercase">Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      A premium, hyper-fast single-page storefront template optimized for speed, conversion rate, and Razorpay standard checkout.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 11. Marketing Tab */}
          {activeTab === "marketing" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Marketing</h2>
                <p className="text-sm text-slate-500">Configure promotional notifications, set up automated buyer updates, and launch newsletters</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Automated Email Campaign Triggers</h3>
                  <button className="px-3 py-1 bg-[#4F46E5] text-white text-[11px] font-bold rounded-lg hover:bg-[#4338CA] transition-colors shadow-sm">
                    New Campaign
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {[
                    { name: "Order Confirmation SES Trigger", status: "Active", recipient: "Customers on checkout", sent: "Auto-trigger" },
                    { name: "WhatsApp Fulfillment Dispatch Alerts", status: "Active (via SQS)", recipient: "Customer phone logs", sent: "Auto-trigger" },
                    { name: "Abandoned Cart Retargeting", status: "Placeholder Mode", recipient: "Guest list checkouts", sent: "Paused" }
                  ].map((c, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{c.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Audience: {c.recipient}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          c.status.includes("Active") ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {c.status}
                        </span>
                        <p className="text-[9px] text-slate-400 font-medium mt-1">{c.sent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 12. Store Design Tab */}
          {activeTab === "store-design" && (() => {
            // Setup dynamic metrics
            const salesVal = summary.totalRevenue || 0;
            const ordersCount = summary.totalOrders || 0;
            const hasData = summary.totalOrders > 0;
            const conversionRate = hasData
              ? ((summary.paidOrders / summary.totalOrders) * 100).toFixed(2) + "%"
              : "0.00%";

            const getHeroTitle = () => selectedTheme?.pageContent?.home?.heroTitle || "BUILT FOR PERFORMANCE";
            const getHeroSubtext = () => selectedTheme?.pageContent?.home?.heroSubtext || "Premium active gear for those who never compromise.";
            const getCtaText = () => selectedTheme?.pageContent?.home?.ctaText || "SHOP NOW";

            const getCatalogTitle = () => selectedTheme?.pageContent?.catalog?.pageTitle || "Latest Catalog Arrivals";
            const getCatalogSubtext = () => selectedTheme?.pageContent?.catalog?.pageSubtext || "Discover our premium selection of sports goods and apparel.";

            const getCheckoutTitle = () => selectedTheme?.pageContent?.checkout?.pageTitle || "Secure Stripe & Razorpay Checkout";
            const getCheckoutInstructions = () => selectedTheme?.pageContent?.checkout?.instructions || "All transactions are fully encrypted. Enter details to complete purchase.";

            const updatePageContent = (page: string, key: string, value: string) => {
              if (!selectedTheme) return;
              const pageContent = selectedTheme.pageContent || { home: {}, catalog: {}, checkout: {} };
              setSelectedTheme({
                ...selectedTheme,
                pageContent: {
                  ...pageContent,
                  [page]: {
                    ...(pageContent[page] || {}),
                    [key]: value
                  }
                }
              });
            };

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-[#4F46E5]" />
                      <span>Online Store</span>
                    </h2>
                    <p className="text-xs text-slate-500">Manage themes, templates, and active branding designs</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a 
                      href={getStorefrontLink(settings.subdomain || "demo")} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm"
                    >
                      <span>View Store</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-lg shadow-sm">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
                      <span>Public</span>
                    </div>
                  </div>
                </div>

                {/* 30 Days Mini KPI Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  {[
                    { label: "Total Sales", value: formatINR(salesVal), color: "text-blue-600 bg-blue-50/50 border-blue-100/50" },
                    { label: "Orders", value: ordersCount.toLocaleString(), color: "text-emerald-600 bg-emerald-50/50 border-emerald-100/50" },
                    { label: "Conversion Rate", value: conversionRate, color: "text-indigo-600 bg-indigo-50/50 border-indigo-100/50" },
                    { label: "Sessions", value: "10,234", color: "text-violet-600 bg-violet-50/50 border-violet-100/50" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                        <span className="block text-lg font-extrabold text-slate-900 mt-1 font-mono">{stat.value}</span>
                      </div>
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-lg border ${stat.color}`}>30d</span>
                    </div>
                  ))}
                </div>

                {/* Previews & Customizer Layout Grid */}
                <div id="header-top" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Left Column: Previews (takes 2/3 width) */}
                  <div className="xl:col-span-2 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-end justify-center gap-8 min-h-[450px] relative overflow-hidden select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.015)]">
                    {/* Page selector buttons */}
                    <div className="absolute top-3 right-3 bg-slate-200/65 backdrop-blur-md p-1 rounded-xl flex gap-1 z-10 border border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                      {(["home", "catalog", "checkout"] as const).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => {
                            setPreviewPage(pg);
                            setCustomizerSection(pg === "home" ? "home" : pg === "catalog" ? "catalog" : pg === "checkout" ? "checkout" : "style");
                          }}
                          className={`px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-lg transition-all duration-200 ${
                            previewPage === pg
                              ? "bg-white text-slate-800 shadow-sm scale-105"
                              : "text-slate-500 hover:text-slate-850 hover:bg-white/40"
                          }`}
                        >
                          {pg} Page
                        </button>
                      ))}
                    </div>

                    {selectedTheme ? (
                      <>
                        {/* Desktop simulated window */}
                        <div className="flex-1 w-full h-[360px] bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col justify-between overflow-hidden relative transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
                          {/* Desktop Top Header Sim */}
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/70 select-none">
                            {/* Window controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-2 h-2 rounded-full bg-red-400"></span>
                              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            </div>
                            
                            {/* URL Bar */}
                            <div className="bg-slate-200/50 border border-slate-300/30 rounded-md px-3 py-0.5 text-[8px] text-slate-400 font-mono w-40 text-center truncate mx-auto select-none">
                              {settings.subdomain || "demo"}.basecart.io
                            </div>

                            {selectedTheme.logoUrl ? (
                              <img src={getOptimizedImageUrl(selectedTheme.logoUrl, "thumbnail")} alt="Store logo" className="h-4 max-w-[80px] object-contain" />
                            ) : (
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{settings.storeName || "IRON FORGE"}</span>
                            )}
                            {selectedTheme.templateBase === "Origin" ? (
                              <div className="flex flex-col items-center gap-1 mx-auto">
                                <div className="flex gap-3 text-[8px] text-slate-400 font-bold uppercase">
                                  <span>Home</span>
                                  <span>Catalog</span>
                                  <span>About</span>
                                </div>
                              </div>
                            ) : selectedTheme.templateBase === "Pulse" ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-400 font-bold">🔍 Search</span>
                                <span className="text-[8px] text-slate-400 font-bold">🛒 Cart (0)</span>
                              </div>
                            ) : (
                              <div className="flex gap-3 text-[8px] text-slate-400 font-bold uppercase">
                                <span>Home</span>
                                <span>Collections</span>
                                <span>Shop</span>
                              </div>
                            )}
                          </div>

                          {/* Desktop Main Content Area Sim */}
                          <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden bg-slate-50/20">
                            {previewPage === "home" && (
                              <>
                                {selectedTheme.templateBase === "Pulse" ? (
                                  <div className="text-center mx-auto max-w-[200px] space-y-2.5 my-auto">
                                    <span className="text-[8px] tracking-widest font-extrabold uppercase" style={{ color: selectedTheme.colors?.primary || "#4F46E5" }}>New Season</span>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                                      {getHeroTitle()}
                                    </h4>
                                    <button
                                      className="text-[8px] text-white font-bold px-4 py-1.5 rounded-full shadow-md uppercase transition-transform hover:scale-105"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                ) : selectedTheme.templateBase === "Stride" ? (
                                  <div className="space-y-3 my-auto">
                                    <h4 className="text-sm font-extrabold text-slate-950 uppercase tracking-wide max-w-[140px]">
                                      {getHeroTitle()}
                                    </h4>
                                    <p className="text-[7px] text-slate-400 leading-normal max-w-[150px]">
                                      {getHeroSubtext()}
                                    </p>
                                    <div className="flex gap-1.5">
                                      {["Running", "Gym", "Outdoor"].map(cat => (
                                        <span key={cat} className="text-[6px] font-bold px-2 py-0.5 border border-slate-200 rounded-full text-slate-600 bg-white">
                                          {cat}
                                        </span>
                                      ))}
                                    </div>
                                    <button
                                      className="text-[8px] text-white font-bold px-3 py-1 rounded shadow-sm"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                ) : selectedTheme.templateBase === "Origin" ? (
                                  <div className="grid grid-cols-2 gap-4 items-center my-auto">
                                    <div className="space-y-2">
                                      <h4 className="text-xs font-serif font-bold text-slate-900 leading-tight">
                                        {getHeroTitle()}
                                      </h4>
                                      <p className="text-[7px] text-slate-400 leading-normal">
                                        {getHeroSubtext()}
                                      </p>
                                      <button
                                        className="text-[7px] text-white font-bold px-3 py-1 rounded shadow-sm"
                                        style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                      >
                                        {getCtaText()}
                                      </button>
                                    </div>
                                    <div className="h-16 bg-slate-100 rounded border border-slate-200/50 flex items-center justify-center text-[7px] font-bold text-slate-300">
                                      PRODUCT PREVIEW
                                    </div>
                                  </div>
                                ) : (
                                  <div className="my-auto space-y-2">
                                    <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide leading-tight max-w-[120px]">
                                      {getHeroTitle()}
                                    </h4>
                                    <p className="text-[7px] text-slate-400 leading-normal max-w-[140px]">
                                      {getHeroSubtext()}
                                    </p>
                                    <button
                                      className="text-[7px] text-white font-bold px-3 py-1 rounded shadow-sm"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}

                            {previewPage === "catalog" && (
                              <div className="space-y-2.5 my-auto">
                                <div className="text-center">
                                  <h4 className="text-[10px] font-bold text-slate-950 uppercase tracking-wide">{getCatalogTitle()}</h4>
                                  <p className="text-[6px] text-slate-400 mt-0.5 max-w-[180px] mx-auto leading-normal">{getCatalogSubtext()}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { name: "Apex Runner", price: "₹4,999" },
                                    { name: "Pro Grip Jacket", price: "₹2,499" },
                                    { name: "Sport Flask 1L", price: "₹799" },
                                  ].map((p, idx) => (
                                    <div key={idx} className="border border-slate-150 rounded p-1.5 bg-white text-left flex flex-col justify-between h-20 shadow-sm">
                                      <div className="h-6 bg-slate-100 rounded-sm"></div>
                                      <div>
                                        <div className="text-[5.5px] font-extrabold text-slate-800 truncate">{p.name}</div>
                                        <div className="text-[5px] text-slate-500 font-mono mt-0.5">{p.price}</div>
                                      </div>
                                      <button 
                                        className="text-[5px] text-white font-bold py-0.5 rounded-sm w-full block text-center"
                                        style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {previewPage === "checkout" && (
                              <div className="space-y-2 my-auto">
                                <div className="border-b border-slate-100 pb-1">
                                  <h4 className="text-[9px] font-bold text-slate-900">{getCheckoutTitle()}</h4>
                                  <p className="text-[5.5px] text-slate-400 mt-0.5 leading-normal">{getCheckoutInstructions()}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 items-start">
                                  {/* Dummy billing fields */}
                                  <div className="space-y-1">
                                    <div className="h-4 bg-slate-50 border border-slate-150 rounded-sm text-[5px] text-slate-400 px-1.5 flex items-center">Customer Name</div>
                                    <div className="h-4 bg-slate-50 border border-slate-150 rounded-sm text-[5px] text-slate-400 px-1.5 flex items-center">email@example.com</div>
                                    <div className="h-4 bg-slate-50 border border-slate-150 rounded-sm text-[5px] text-slate-400 px-1.5 flex items-center">123 Street Address</div>
                                  </div>
                                  {/* Summary Box */}
                                  <div className="p-2 border border-slate-150 rounded bg-slate-50/50 space-y-1.5">
                                    <div className="flex justify-between text-[5px] text-slate-500 font-bold">
                                      <span>Subtotal</span>
                                      <span>₹4,999.00</span>
                                    </div>
                                    <div className="flex justify-between text-[5.5px] text-slate-800 font-extrabold border-t border-slate-100 pt-1">
                                      <span>Total INR</span>
                                      <span>₹4,999.00</span>
                                    </div>
                                    <button 
                                      className="w-full py-1 text-white font-bold text-[5.5px] rounded shadow-sm flex items-center justify-center gap-1"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      <CreditCard className="h-1.5 w-1.5" /> Pay Now via Razorpay
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Desktop Footer Sim */}
                          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 flex items-center justify-between text-[6px] text-slate-400 font-bold">
                            <span>© {settings.storeName || "IRON FORGE"}</span>
                            <div className="flex gap-2">
                              <span>Privacy</span>
                              <span>Terms</span>
                            </div>
                          </div>
                          
                          {/* Live color highlight stripe */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1.5" 
                            style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                          ></div>
                        </div>

                        {/* Mobile simulated phone */}
                        <div className="w-48 h-[320px] bg-white rounded-[24px] shadow-[0_10px_35px_rgba(0,0,0,0.1)] border-[6px] border-slate-900 flex flex-col justify-between overflow-hidden relative shrink-0 transition-all duration-300 hover:shadow-[0_15px_45px_rgba(0,0,0,0.16)]">
                          {/* Phone Dynamic Island */}
                          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 w-14 h-2.5 rounded-full z-30 flex items-center justify-end px-1.5 gap-0.5 select-none">
                            <span className="w-1 h-1 rounded-full bg-slate-850"></span>
                            <span className="w-0.5 h-0.5 rounded-full bg-blue-500/80"></span>
                          </div>
                          {/* Mobile Header Sim */}
                          <div className="flex items-center justify-between border-b border-slate-100 px-3 pt-4 pb-2 bg-slate-50/50">
                            {selectedTheme.logoUrl ? (
                              <img src={getOptimizedImageUrl(selectedTheme.logoUrl, "thumbnail")} alt="Store logo" className="h-3 max-w-[50px] object-contain" />
                            ) : (
                              <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">{settings.storeName || "IRON FORGE"}</span>
                            )}
                            <span className="text-[10px] text-slate-500 font-bold">☰</span>
                          </div>

                          {/* Mobile Main Content Sim */}
                          <div className="flex-1 p-4 flex flex-col justify-center relative overflow-hidden bg-slate-50/20">
                            {previewPage === "home" && (
                              <>
                                {selectedTheme.templateBase === "Pulse" ? (
                                  <div className="text-center space-y-2">
                                    <span className="text-[6px] tracking-widest font-extrabold uppercase" style={{ color: selectedTheme.colors?.primary || "#4F46E5" }}>New Season</span>
                                    <h4 className="text-[10px] font-black text-slate-900 leading-tight">
                                      {getHeroTitle()}
                                    </h4>
                                    <button
                                      className="text-[6px] text-white font-bold px-3 py-1.5 rounded-full shadow uppercase scale-90 inline-block"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                ) : selectedTheme.templateBase === "Stride" ? (
                                  <div className="space-y-2">
                                    <h4 className="text-[9px] font-extrabold text-slate-950 uppercase tracking-wide leading-none">
                                      {getHeroTitle()}
                                    </h4>
                                    <div className="h-10 bg-slate-100 rounded text-[5px] text-slate-400 font-bold flex items-center justify-center border border-slate-200/50">
                                      NEW ARRIVALS
                                    </div>
                                    <button
                                      className="text-[6px] text-white font-bold px-2 py-0.5 rounded shadow-sm scale-90 origin-left"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                ) : selectedTheme.templateBase === "Origin" ? (
                                  <div className="space-y-2 text-center">
                                    <h4 className="text-[9px] font-serif font-bold text-slate-900 leading-tight">
                                      {getHeroTitle()}
                                    </h4>
                                    <div className="h-8 bg-slate-100 rounded text-[5px] text-slate-300 font-bold flex items-center justify-center border border-slate-200/50">
                                      HERITAGE SELECTION
                                    </div>
                                    <button
                                      className="text-[6px] text-white font-bold px-2.5 py-0.5 rounded shadow-sm scale-90"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                  </div>
                                ) : (
                                  // Aura Mobile
                                  <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-slate-900 leading-none">
                                      {getHeroTitle()}
                                    </h4>
                                    <button
                                      className="text-[6px] text-white font-semibold px-2.5 py-0.5 rounded scale-90 origin-left"
                                      style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                    >
                                      {getCtaText()}
                                    </button>
                                    <div className="h-8 bg-slate-100 rounded text-[5px] text-slate-400 font-bold flex items-center justify-center">
                                      NEW ARRIVALS
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {previewPage === "catalog" && (
                              <div className="space-y-2.5 my-auto">
                                <div className="text-center">
                                  <h4 className="text-[8px] font-bold text-slate-950 uppercase">{getCatalogTitle()}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { name: "Apex Runner", price: "₹4,999" },
                                    { name: "Pro Jacket", price: "₹2,499" },
                                  ].map((p, idx) => (
                                    <div key={idx} className="border border-slate-150 rounded p-1 bg-white text-left flex flex-col justify-between h-16 shadow-xs">
                                      <div className="h-4 bg-slate-50 rounded-xs"></div>
                                      <div>
                                        <div className="text-[5px] font-extrabold text-slate-800 truncate">{p.name}</div>
                                      </div>
                                      <button 
                                        className="text-[4.5px] text-white font-bold py-0.5 rounded-sm w-full block text-center"
                                        style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                      >
                                        Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {previewPage === "checkout" && (
                              <div className="space-y-2 my-auto text-left">
                                <div>
                                  <h4 className="text-[7.5px] font-bold text-slate-900 leading-tight">{getCheckoutTitle()}</h4>
                                </div>
                                <div className="space-y-1">
                                  <div className="h-3.5 bg-slate-50 border border-slate-150 rounded-sm text-[4.5px] text-slate-400 px-1 flex items-center">Customer Name</div>
                                  <div className="h-3.5 bg-slate-50 border border-slate-150 rounded-sm text-[4.5px] text-slate-400 px-1 flex items-center">email@example.com</div>
                                </div>
                                <div className="p-1 border border-slate-150 rounded bg-slate-50/50 flex items-center justify-between text-[5px] text-slate-800 font-extrabold">
                                  <span>Total: ₹4,999.00</span>
                                  <button 
                                    className="px-2 py-0.5 text-white font-bold text-[5px] rounded shadow-xs"
                                    style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                                  >
                                    Pay Now
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mobile Footer Sim */}
                          <div className="border-t border-slate-100 px-3 py-1.5 bg-slate-50 text-[5px] text-slate-400 text-center font-bold">
                            <span>© {settings.storeName || "IRON FORGE"}</span>
                          </div>

                          {/* Live color highlight stripe */}
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1.5" 
                            style={{ backgroundColor: selectedTheme.colors?.primary || "#4F46E5" }}
                          ></div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 text-sm font-semibold flex flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-[#4F46E5]" />
                        <span>Loading active preview...</span>
                      </div>
                    )}

                    {/* Preview Live Update Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      <span>Live Preview {selectedTheme && `— ${selectedTheme.name}`}</span>
                    </div>
                  </div>

                  {/* Right Column: Customizer Panel */}
                  <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 flex flex-col justify-between h-[450px]">
                    <div className="space-y-4">
                      <div className="flex flex-col border-b border-slate-100 pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Theme customizer</h3>
                            <h4 className="text-sm font-bold text-slate-800 mt-0.5 truncate max-w-[150px]">{selectedTheme ? selectedTheme.name : "Select a theme"}</h4>
                          </div>
                          {selectedTheme && (
                            <div className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 flex items-center gap-1">
                              {(() => {
                                const original = themes.find(t => t.themeId === selectedTheme.themeId);
                                const hasChanges = original && (
                                  selectedTheme.name !== original.name ||
                                  selectedTheme.templateBase !== original.templateBase ||
                                  selectedTheme.logoUrl !== original.logoUrl ||
                                  JSON.stringify(selectedTheme.colors) !== JSON.stringify(original.colors) ||
                                  JSON.stringify(selectedTheme.pageContent) !== JSON.stringify(original.pageContent)
                                );
                                return hasChanges ? (
                                  <>
                                    <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                    <span>Unsaved changes</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                                    <span>Auto-saved</span>
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Editor sub-tabs */}
                        {selectedTheme && (
                          <div className="flex gap-2 mt-3 overflow-x-auto select-none no-scrollbar">
                            {(["style", "home", "catalog", "checkout"] as const).map((sec) => (
                              <button
                                key={sec}
                                onClick={() => {
                                  setCustomizerSection(sec);
                                  if (sec !== "style") {
                                    setPreviewPage(sec);
                                  }
                                }}
                                className={`pb-1 text-[9px] font-extrabold uppercase border-b-2 transition-all whitespace-nowrap ${
                                  customizerSection === sec
                                    ? "border-[#4F46E5] text-[#4F46E5]"
                                    : "border-transparent text-slate-400 hover:text-slate-650"
                                }`}
                              >
                                {sec === "style" ? "Branding/Layout" : `${sec} page`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedTheme ? (
                        <div className="space-y-4 overflow-y-auto max-h-[250px] pr-1">
                          {customizerSection === "style" && (
                            <>
                              {/* Template Base selector */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Template Base Layout
                                </label>
                                <select
                                  value={selectedTheme.templateBase || "Aura"}
                                  onChange={(e) => setSelectedTheme({ ...selectedTheme, templateBase: e.target.value })}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none bg-white font-semibold shadow-sm"
                                >
                                  <option value="Aura">Aura (Default clean single-page)</option>
                                  <option value="Pulse">Pulse (Vibrant hero, centered branding)</option>
                                  <option value="Stride">Stride (Category-first active layout)</option>
                                  <option value="Origin">Origin (Classic double-border editorial)</option>
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {/* Primary color */}
                                <div>
                                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Brand Primary Color
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={selectedTheme.colors?.primary || "#2563EB"}
                                      onChange={(e) => setSelectedTheme({
                                        ...selectedTheme,
                                        colors: { ...selectedTheme.colors, primary: e.target.value }
                                      })}
                                      className="h-8 w-8 rounded border border-slate-200 cursor-pointer shrink-0"
                                    />
                                    <input
                                      type="text"
                                      value={selectedTheme.colors?.primary || "#2563EB"}
                                      onChange={(e) => setSelectedTheme({
                                        ...selectedTheme,
                                        colors: { ...selectedTheme.colors, primary: e.target.value }
                                      })}
                                      className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono w-full text-slate-800 focus:outline-none"
                                    />
                                  </div>
                                </div>

                                {/* Accent/Hover color */}
                                <div>
                                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Accent/Hover Color
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={selectedTheme.colors?.accent || "#1D4ED8"}
                                      onChange={(e) => setSelectedTheme({
                                        ...selectedTheme,
                                        colors: { ...selectedTheme.colors, accent: e.target.value }
                                      })}
                                      className="h-8 w-8 rounded border border-slate-200 cursor-pointer shrink-0"
                                    />
                                    <input
                                      type="text"
                                      value={selectedTheme.colors?.accent || "#1D4ED8"}
                                      onChange={(e) => setSelectedTheme({
                                        ...selectedTheme,
                                        colors: { ...selectedTheme.colors, accent: e.target.value }
                                      })}
                                      className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono w-full text-slate-800 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Logo URL */}
                              <div className="border-t border-slate-100 pt-3">
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Store Branding Logo URL
                                </label>
                                <input
                                  type="text"
                                  value={selectedTheme.logoUrl || ""}
                                  onChange={(e) => setSelectedTheme({
                                    ...selectedTheme,
                                    logoUrl: e.target.value
                                  })}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium placeholder-slate-400"
                                  placeholder="https://example.com/logo.png"
                                />
                                <p className="text-[9px] text-slate-400 mt-1 leading-normal">Logo will render inside the live storefront header bar, scaled to fit.</p>
                              </div>
                            </>
                          )}

                          {customizerSection === "home" && (
                            <>
                              {/* Hero Title */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Hero Headline Text
                                </label>
                                <input
                                  type="text"
                                  value={getHeroTitle()}
                                  onChange={(e) => updatePageContent("home", "heroTitle", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
                                />
                              </div>

                              {/* Hero Subtext */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Hero Subtitle Text
                                </label>
                                <textarea
                                  value={getHeroSubtext()}
                                  onChange={(e) => updatePageContent("home", "heroSubtext", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium h-16 resize-none"
                                />
                              </div>

                              {/* Hero CTA Button Text */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  CTA Button Label
                                </label>
                                <input
                                  type="text"
                                  value={getCtaText()}
                                  onChange={(e) => updatePageContent("home", "ctaText", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
                                />
                              </div>
                            </>
                          )}

                          {customizerSection === "catalog" && (
                            <>
                              {/* Catalog Title */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Catalog Main Heading
                                </label>
                                <input
                                  type="text"
                                  value={getCatalogTitle()}
                                  onChange={(e) => updatePageContent("catalog", "pageTitle", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
                                />
                              </div>

                              {/* Catalog Subtext */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Catalog Subtext Description
                                </label>
                                <textarea
                                  value={getCatalogSubtext()}
                                  onChange={(e) => updatePageContent("catalog", "pageSubtext", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium h-20 resize-none"
                                />
                              </div>
                            </>
                          )}

                          {customizerSection === "checkout" && (
                            <>
                              {/* Checkout Title */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Checkout Page Header
                                </label>
                                <input
                                  type="text"
                                  value={getCheckoutTitle()}
                                  onChange={(e) => updatePageContent("checkout", "pageTitle", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium"
                                />
                              </div>

                              {/* Checkout Instructions */}
                              <div>
                                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                  Checkout Instructions
                                </label>
                                <textarea
                                  value={getCheckoutInstructions()}
                                  onChange={(e) => updatePageContent("checkout", "instructions", e.target.value)}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none font-medium h-20 resize-none"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
                          Select a theme below to begin customizing.
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 leading-normal font-semibold">
                      💡 Modifications autosave debounced in the background. Simply edit colors/layouts, and changes will be persisted.
                    </div>
                  </div>
                </div>

                {/* Current Published Theme Section */}
                {themes.filter(t => t.status === "published").map((theme) => (
                  <div key={theme.themeId} className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Simulated Mini Thumbnail */}
                      <div 
                        className="h-14 w-20 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between p-1.5 overflow-hidden shrink-0 relative"
                        style={{ borderBottomWidth: "3px", borderBottomColor: theme.colors?.primary || "#4F46E5" }}
                      >
                        <div className="h-1.5 bg-slate-200 rounded-sm w-[40%]"></div>
                        <div className="space-y-1">
                          <div className="h-1 bg-slate-100 rounded-sm w-[70%]"></div>
                          <div className="h-1 bg-slate-100 rounded-sm w-[50%]"></div>
                        </div>
                        <div className="h-2 bg-slate-900/10 rounded-sm flex items-center justify-center text-[4px] text-slate-400 font-bold uppercase">
                          {theme.templateBase}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{theme.name}</h3>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          Last saved: {new Date(theme.lastSavedAt).toLocaleString()} | Version {theme.version || 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedTheme(theme);
                          document.getElementById("header-top")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`px-4 py-1.5 border rounded-lg text-xs font-bold shadow-sm transition-colors ${
                          selectedTheme?.themeId === theme.themeId
                            ? "bg-slate-100 border-slate-200 text-slate-500 cursor-default"
                            : "bg-[#4F46E5] border-[#4F46E5] text-white hover:bg-[#4338CA]"
                        }`}
                      >
                        {selectedTheme?.themeId === theme.themeId ? "Editing Theme" : "Edit Theme"}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Draft Themes Section */}
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Draft themes</h3>
                      <p className="text-[10px] text-slate-400">Themes that are saved but not visible on the live storefront.</p>
                    </div>
                    <button
                      onClick={createNewDraft}
                      className="px-3 py-1.5 bg-[#4F46E5] text-white hover:bg-[#4338CA] font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Create new draft
                    </button>
                  </div>

                  {themes.filter(t => t.status === "draft").length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No draft themes available. Create a new draft or add one from the template library below.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {themes.filter(t => t.status === "draft").map((theme) => (
                        <div key={theme.themeId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Simulated Mini Thumbnail */}
                            <div 
                              className="h-12 w-16 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between p-1 overflow-hidden shrink-0 relative"
                              style={{ borderBottomWidth: "3.5px", borderBottomColor: theme.colors?.primary || "#2563EB" }}
                            >
                              <div className="h-1 bg-slate-200 rounded-sm w-[35%]"></div>
                              <div className="space-y-0.5">
                                <div className="h-0.5 bg-slate-100 rounded-sm w-[60%]"></div>
                                <div className="h-0.5 bg-slate-100 rounded-sm w-[40%]"></div>
                              </div>
                              <div className="h-1.5 bg-slate-900/10 rounded-sm flex items-center justify-center text-[3.5px] text-slate-400 font-bold uppercase">
                                {theme.templateBase}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">{theme.name}</h4>
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                Added: {new Date(theme.lastSavedAt).toLocaleDateString()} | Version {theme.version || 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => publishTheme(theme)}
                              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                            >
                              Publish
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTheme(theme);
                                document.getElementById("header-top")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className={`border rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${
                                selectedTheme?.themeId === theme.themeId
                                  ? "bg-slate-100 border-slate-200 text-slate-500 cursor-default"
                                  : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                              }`}
                            >
                              {selectedTheme?.themeId === theme.themeId ? "Editing" : "Customize"}
                            </button>

                            {/* Dropdown Overflow Menu */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuThemeId(activeMenuThemeId === theme.themeId ? null : theme.themeId);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {activeMenuThemeId === theme.themeId && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenuThemeId(null)}></div>
                                  <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
                                    <button
                                      onClick={() => renameTheme(theme)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      onClick={() => duplicateTheme(theme)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-bold"
                                    >
                                      Duplicate
                                    </button>
                                    <button
                                      onClick={() => deleteTheme(theme)}
                                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-slate-50 font-bold"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theme Library Section */}
                <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Theme library</h3>
                      <p className="text-[10px] text-slate-400">Explore layout templates for your storefront design.</p>
                    </div>
                    <button 
                      onClick={() => setActionSuccess("Redirecting to theme store...")}
                      className="text-xs text-[#4F46E5] font-bold hover:underline"
                    >
                      Visit Theme Store
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { name: "Aura", price: "Free", templateBase: "Aura", preview: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" },
                      { name: "Pulse", price: "Free", templateBase: "Pulse", preview: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" },
                      { name: "Stride", price: "₹2,999", templateBase: "Stride", preview: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=400&q=80" },
                      { name: "Origin", price: "₹2,499", templateBase: "Origin", preview: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80" },
                    ].map((theme) => (
                      <div key={theme.name} className="border border-slate-150 rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#4F46E5] transition-colors bg-white shadow-sm">
                        <div className="h-28 bg-slate-50 relative overflow-hidden">
                          <img src={getOptimizedImageUrl(theme.preview, "medium")} alt={theme.name} className="h-full w-full object-cover filter brightness-[0.9] group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-2 right-2 bg-slate-900/60 backdrop-blur-sm text-white font-bold text-[8px] px-1.5 py-0.5 rounded">
                            {theme.price}
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between border-t border-slate-50">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{theme.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => addFromLibrary(theme)}
                            className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded font-bold hover:bg-slate-100"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 13. Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Payments Setup</h2>
                <p className="text-sm text-slate-500">Configure Indian Payment gateways, link API secret keys, and manage checkout options</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <form onSubmit={saveSettings} className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">Razorpay API Integration</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Keys are encrypted at rest with AWS KMS. We never share secrets in customer-facing storefront calls.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Razorpay Key ID
                        </label>
                        <input
                          type="text"
                          value={settings.razorpayKey}
                          onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
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
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#F1F5F9] pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accepted Payment Options</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["UPI (GPay/PhonePe)", "Visa Credit/Debit", "RuPay Cards", "Mastercard", "American Express"].map((tag) => (
                        <span key={tag} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded shadow-sm">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#F1F5F9] pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                      Save Payment Configurations
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
