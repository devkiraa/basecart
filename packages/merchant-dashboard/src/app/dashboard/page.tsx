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
  User,
  MoreHorizontal,
  CreditCard,
  Grid,
  Bell,
  Info,
  AlertCircle,
  Mail,
  Lock,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
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
  HelpCircle,
  Copy,
  ExternalLink,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Smartphone,
  Eye,
  SlidersHorizontal,
  X,
  Menu,
  Send,
  Sparkles,
  Zap,
  Save,
  Building,
  Landmark,
  ShieldCheck,
  Layers,
  Warehouse,
  Truck,
  ArrowRightLeft,
  Gift,
  ChevronsUpDown,
  Edit3,
  Folder,
  Home,
  Store,
  Bot,
  Code,
  Scale,
  MapPin,
  Sun,
  Crown,
  Database,
  History,
  Clock,
} from "lucide-react";
import { getOptimizedImageUrl } from "../../lib/image";
import StepAccount from "../../components/StepAccount";
import StepStore from "../../components/StepStore";
import StepBusiness from "../../components/StepBusiness";
import StepPlan from "../../components/StepPlan";
import StepVerification from "../../components/StepVerification";
import { THEME_LIBRARY, THEME_SETTINGS_SCHEMA } from "../../themes/registry";
import EmailsTab from "../../components/EmailsTab";
import BrandIdentityTab from "../../components/BrandIdentityTab";
import { UsersTeamTab } from "../../components/UsersTeamTab";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
const STOREFRONT_DOMAIN = (process.env.NEXT_PUBLIC_STOREFRONT_DOMAIN || "basecart.app").replace(/^(https?:\/\/)/, "");
const STOREFRONT_PROTOCOL = process.env.NEXT_PUBLIC_STOREFRONT_PROTOCOL || "https";

const isLocalDev = typeof window !== "undefined" 
  ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  : process.env.NODE_ENV !== "production";

const STOREFRONT_PORT = process.env.NEXT_PUBLIC_STOREFRONT_PORT || "3002";

const SETTINGS_SUBTAB_TO_SLUG: Record<string, string> = {
  general: "profile",
  billing: "billing",
  plan: "plan",
  users: "team",
  payments: "payments",
  brand: "brand",
  domains: "domains",
  shipping: "shipping",
  checkout: "checkout",
  taxes: "taxes",
  locations: "locations",
  notifications: "notifications",
  policies: "policies",
  apps: "apps",
  privacy: "privacy",
  gst: "taxes",
  bank: "payments",
  invoices: "billing",
};

const SLUG_TO_SETTINGS_SUBTAB: Record<string, string> = {
  "": "general",
  general: "general",
  profile: "general",
  billing: "billing",
  plan: "plan",
  team: "users",
  users: "users",
  members: "users",
  staff: "users",
  payments: "payments",
  brand: "brand",
  domains: "domains",
  shipping: "shipping",
  checkout: "checkout",
  taxes: "taxes",
  locations: "locations",
  notifications: "notifications",
  policies: "policies",
  apps: "apps",
  privacy: "privacy",
  gst: "gst",
  bank: "bank",
  invoices: "invoices",
};

const getStorefrontLink = (subdomain: string) => {
  const targetSub = subdomain || "pixcelart";
  if (process.env.NEXT_PUBLIC_STOREFRONT_URL) {
    const url = process.env.NEXT_PUBLIC_STOREFRONT_URL;
    return url.includes("?") ? `${url}&subdomain=${targetSub}` : `${url}?subdomain=${targetSub}`;
  }
  if (isLocalDev) {
    return `http://localhost:${STOREFRONT_PORT}?subdomain=${targetSub}`;
  }
  const isPagesDev = STOREFRONT_DOMAIN.includes(".pages.dev");
  if (isPagesDev) {
    return `${STOREFRONT_PROTOCOL}://${STOREFRONT_DOMAIN}?store=${targetSub}`;
  }
  return `${STOREFRONT_PROTOCOL}://${targetSub}.${STOREFRONT_DOMAIN}`;
};

const getStorefrontDisplayUrl = (subdomain: string) => {
  const targetSub = subdomain || "pixcelart";
  if (isLocalDev) {
    return `localhost:${STOREFRONT_PORT}?subdomain=${targetSub}`;
  }
  return `${targetSub}.${STOREFRONT_DOMAIN}`;
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
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    shippingAddress?: {
      addressLine1: string;
      city: string;
      postalCode: string;
    };
  };
  lineItems: Array<{
    name: string;
    price: number;
    quantity: number;
    sku?: string;
  }>;
  subtotal?: number;
  tax?: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  paymentId?: string;
  carrier?: string;
  trackingNumber?: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}

interface StoreSettings {
  storeName: string;
  subdomain: string;
  customDomain?: string;
  razorpayKey: string;
  razorpaySecret: string;
  razorpayConfigured?: boolean;
  addOns?: string[];
  plan?: string;
  createdAt?: string;
  gstin?: string;
  panNumber?: string;
  cinNumber?: string;
  tanNumber?: string;
  registeredBusinessName?: string;
  registeredBusinessAddress?: string;
  registeredState?: string;
  placeOfSupply?: string;
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankBranch?: string;
  };
  invoiceConfig?: {
    invoiceHeaderDisclaimer?: string;
    invoiceTerms?: string;
    invoiceNotes?: string;
    authorizedSignatoryName?: string;
    authorizedSignatoryTitle?: string;
    signatureStampUrl?: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
  weightUnit?: string;
  timezone?: string;
  backupRegion?: string;
  codEnabled?: boolean;
  codMinAmount?: number;
  upiVpa?: string;
  shippingFee?: number;
  freeShippingMinOrder?: number;
  handlingDays?: string;
  customerAccountPolicy?: string;
  phoneRequired?: boolean;
  address2Required?: boolean;
  taxRate?: number;
  pricesIncludeTax?: boolean;
  orderIdPrefix?: string;
  orderIdSuffix?: string;
  autoFulfill?: string;
  autoArchive?: boolean;
}

function calculateTrialDaysRemaining(createdAtStr?: string) {
  if (!createdAtStr) return 60;
  try {
    const createdDate = new Date(createdAtStr).getTime();
    if (isNaN(createdDate)) return 60;
    const now = new Date().getTime();
    const elapsedMs = now - createdDate;
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const remainingDays = 60 - elapsedDays;
    return Math.max(0, Math.min(60, remainingDays));
  } catch (e) {
    return 60;
  }
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
  // Auth state (in-memory only, no localStorage)
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authActive, setAuthActive] = useState(false);

  const handleGoToLogin = () => {
    setIsLoginView(true);
    setAuthActive(true);
    if (typeof window !== "undefined") {
      window.location.hash = "#login";
    }
  };

  const handleGoToSignup = () => {
    setIsLoginView(false);
    setAuthActive(true);
    setWizardStep(1);
    if (typeof window !== "undefined") {
      window.location.hash = "#signup";
    }
  };

  const handleGoHome = () => {
    setAuthActive(false);
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  };

  const [email, setEmail] = useState("");
  const [merchantOwnerName, setMerchantOwnerName] = useState("");
  const [isTrialBannerDismissed, setIsTrialBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastDismissedDate = localStorage.getItem("basecart_trial_banner_dismissed_date");
      if (lastDismissedDate === todayStr) {
        setIsTrialBannerDismissed(true);
      }
    }
  }, []);

  const handleDismissTrialBanner = () => {
    if (typeof window !== "undefined") {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem("basecart_trial_banner_dismissed_date", todayStr);
    }
    setIsTrialBannerDismissed(true);
  };
  const [password, setPassword] = useState("");
  const [storeNameInput, setStoreNameInput] = useState("");
  const [subdomainInput, setSubdomainInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receiveUpdates: false,
    storeName: "",
    subdomain: "",
    businessCategory: "",
    businessType: "",
    country: "India",
    state: "",
    ownerName: "",
    phone: "",
    teamSize: "1",
    monthlyOrders: "0-50",
    currentPlatform: "None",
    hearAboutUs: "Google Search",
    selectedPlan: "free",
    otpCode: "",
  });

  const handleUpdateOnboarding = (fields: Partial<any>) => {
    setOnboardingData((prev) => ({ ...prev, ...fields }));
  };

  // Auth Recovery & Email Verification states
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [showForgotView, setShowForgotView] = useState<boolean>(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [resetPasswordToken, setResetPasswordToken] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [emailVerificationResent, setEmailVerificationResent] = useState(false);

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "summary" | "orders" | "products" | "customers" | "content" | "discounts" | "addons" | "finances" | "billing" | "settings" | "marketing" | "brand" | "agentic" | "store-design" | "payments" | "emails" | "headless" | "terms-of-service" | "privacy-policy"
  >("summary");

  // Marketing / Newsletter campaign states
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterHeadline, setNewsletterHeadline] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [newsletterCtaText, setNewsletterCtaText] = useState("Shop Collection");
  const [newsletterCtaUrl, setNewsletterCtaUrl] = useState("");
  const [newsletterSending, setNewsletterSending] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [campaignsList, setCampaignsList] = useState<any[]>([
    { id: 1, subject: "Grand Opening Promotion! 🛍️", date: "July 18, 2026", recipients: 24, status: "Sent" },
    { id: 2, subject: "Check out our new stock arrivals", date: "July 15, 2026", recipients: 18, status: "Sent" }
  ]);
  const [emailCampaignActive, setEmailCampaignActive] = useState(true);
  const [whatsappCampaignActive, setWhatsappCampaignActive] = useState(true);
  const [abandonedCartActive, setAbandonedCartActive] = useState(false);
  const [targetAudience, setTargetAudience] = useState("all");
  const [spendRange, setSpendRange] = useState("all");

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Header interactivity states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [merchantStores, setMerchantStores] = useState<{ tenantId: string; storeName: string; subdomain: string }[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<"Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "All Time">("Last 7 Days");
  const [selectedCategory, setSelectedCategory] = useState("All Themes");
  const [visibleThemeCount, setVisibleThemeCount] = useState(6);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewThemeModalOpen, setPreviewThemeModalOpen] = useState(false);
  const [themeToPreview, setThemeToPreview] = useState<any>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const [notifications, setNotifications] = useState<any[]>([
    { id: "sys-welcome", title: "Welcome to Basecart! 🛍️", desc: "Your store design and isolated SQLite database are fully provisioned and ready.", read: true, type: "system", actionUrl: "#summary" },
  ]);

  const [isHydrated, setIsHydrated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const parseUrlRoute = () => {
      if (typeof window === "undefined") return;

      const path = window.location.pathname;
      const parts = path.split("/").filter(Boolean);

      let routeSlug = "";
      let settingsSectionSlug = "";

      if (parts[0] === "store" && parts.length >= 2) {
        if (parts.length >= 3) {
          routeSlug = parts[2];
          if (parts.length >= 4) {
            settingsSectionSlug = parts[3];
          }
        }
      } else if (parts[0] === "dashboard" && parts.length >= 2) {
        routeSlug = parts[1];
        if (parts.length >= 3) {
          settingsSectionSlug = parts[2];
        }
      } else {
        routeSlug = window.location.hash.replace("#", "");
      }

      if (routeSlug === "signup" || routeSlug === "register") {
        setIsLoginView(false);
        setAuthActive(true);
        setWizardStep(1);
        return;
      } else if (routeSlug === "login" || routeSlug === "signin") {
        setIsLoginView(true);
        setAuthActive(true);
        return;
      } else if (routeSlug === "" || routeSlug.startsWith("features") || routeSlug.startsWith("pricing") || routeSlug.startsWith("testimonials")) {
        if (!token) {
          setAuthActive(false);
        }
        return;
      }

      if (routeSlug === "settings") {
        setActiveTab("settings");
        setIsSettingsPortalOpen(true);
        const mappedSubTab = SLUG_TO_SETTINGS_SUBTAB[settingsSectionSlug.toLowerCase()] || (settingsSectionSlug ? settingsSectionSlug : "general");
        setSettingsSubTab(mappedSubTab);
        return;
      } else {
        setIsSettingsPortalOpen(false);
      }

      const TAB_SLUG_MAP: Record<string, { tab: string; subTab?: string }> = {
        "": { tab: "summary" },
        "summary": { tab: "summary" },
        "orders": { tab: "orders" },
        "products": { tab: "products", subTab: "catalog" },
        "collections": { tab: "products", subTab: "collections" },
        "inventory": { tab: "products", subTab: "inventory" },
        "purchase-orders": { tab: "products", subTab: "purchase-orders" },
        "purchase_orders": { tab: "products", subTab: "purchase-orders" },
        "transfers": { tab: "products", subTab: "transfers" },
        "gift-cards": { tab: "products", subTab: "gift-cards" },
        "gift_cards": { tab: "products", subTab: "gift-cards" },
        "customers": { tab: "customers" },
        "discounts": { tab: "discounts" },
        "content": { tab: "content", subTab: "metaobjects" },
        "metaobjects": { tab: "content", subTab: "metaobjects" },
        "files": { tab: "content", subTab: "files" },
        "menus": { tab: "content", subTab: "menus" },
        "blog-posts": { tab: "content", subTab: "blog-posts" },
        "blog_posts": { tab: "content", subTab: "blog-posts" },
        "marketing": { tab: "marketing" },
        "agentic": { tab: "agentic" },
        "agentic-store": { tab: "agentic" },
        "ai": { tab: "agentic" },
        "brand": { tab: "agentic" },
        "store-design": { tab: "store-design" },
        "themes": { tab: "store-design" },
        "emails": { tab: "emails" },
        "email": { tab: "emails" },
        "headless": { tab: "headless" },
        "addons": { tab: "addons" },
        "apps": { tab: "addons" },
        "payments": { tab: "payments" },
        "finances": { tab: "finances" },
        "analytics": { tab: "finances" },
        "settings": { tab: "settings" },
      };

      const match = TAB_SLUG_MAP[routeSlug.toLowerCase()] || { tab: "summary" };
      setActiveTab(match.tab.split(" ")[0] as any);
      if (match.subTab) {
        if (match.tab === "products") setProductsSubTab(match.subTab as any);
        if (match.tab === "customers") setCustomersSubTab(match.subTab as any);
        if (match.tab === "content") setContentSubTab(match.subTab as any);
      } else {
        if (match.tab === "products") setProductsSubTab("catalog");
        if (match.tab === "customers") setCustomersSubTab("list");
        if (match.tab === "content") setContentSubTab("metaobjects");
      }
    };

    parseUrlRoute();
    window.addEventListener("popstate", parseUrlRoute);
    window.addEventListener("hashchange", parseUrlRoute);
    return () => {
      window.removeEventListener("popstate", parseUrlRoute);
      window.removeEventListener("hashchange", parseUrlRoute);
    };
  }, [token]);

  const changeSettingsSubTab = (subTabId: string) => {
    const storeSubdomain = settings.subdomain || "my-store";
    const sectionSlug = SETTINGS_SUBTAB_TO_SLUG[subTabId] || subTabId;
    const newPath = `/store/${storeSubdomain}/settings/${sectionSlug}`;

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newPath);
    }
    setActiveTab("settings");
    setSettingsSubTab(subTabId);
    setIsSettingsPortalOpen(true);
  };

  const closeSettingsPortal = () => {
    setIsSettingsPortalOpen(false);
    setActiveTab("summary");
    const storeSubdomain = settings.subdomain || "my-store";
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/store/${storeSubdomain}`);
    }
  };

  const changeTab = (tabId: string, subTabId?: string) => {
    if (tabId === "settings") {
      changeSettingsSubTab(subTabId || settingsSubTab || "general");
      return;
    }

    const targetKey = subTabId || tabId;
    const storeSubdomain = settings.subdomain || "my-store";

    let slug = targetKey;
    if (targetKey === "catalog") slug = "products";
    if (targetKey === "list") slug = "customers";

    const newPath = `/store/${storeSubdomain}/${slug === "summary" ? "" : slug}`.replace(/\/$/, "");

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newPath);
    }

    if (["collections", "inventory", "purchase-orders", "transfers", "gift-cards"].includes(targetKey)) {
      setActiveTab("products");
      setProductsSubTab(targetKey as any);
    } else if (["segments", "companies"].includes(targetKey)) {
      setActiveTab("customers");
      setCustomersSubTab(targetKey as any);
    } else if (["metaobjects", "files", "menus", "blog-posts"].includes(targetKey)) {
      setActiveTab("content");
      setContentSubTab(targetKey as any);
    } else {
      setActiveTab(tabId as any);
      if (tabId === "products") setProductsSubTab("catalog");
      if (tabId === "customers") setCustomersSubTab("list");
      if (tabId === "content") setContentSubTab("metaobjects");
    }
  };

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

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"unfulfilled" | "all" | "pending" | "paid" | "shipped" | "delivered" | "cancelled">("unfulfilled");
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any | null>(null);
  const [fulfillingOrder, setFulfillingOrder] = useState<any | null>(null);
  const [fulfillmentCarrier, setFulfillmentCarrier] = useState<string>("Shiprocket");
  const [fulfillmentTracking, setFulfillmentTracking] = useState<string>("");
  const [fulfillmentNotify, setFulfillmentNotify] = useState<boolean>(true);
  const [creatingSampleOrder, setCreatingSampleOrder] = useState(false);

  const handleCreateSampleOrder = async () => {
    if (!token) return;
    setCreatingSampleOrder(true);
    try {
      const res = await fetch(`${API_URL}/orders/sample`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create sample order");
      setActionSuccess(`Sample order #${data.orderId.substring(0, 8).toUpperCase()} created successfully!`);
      fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setCreatingSampleOrder(false);
    }
  };

  const handleExportOrdersCSV = () => {
    if (!orders || orders.length === 0) return;
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Customer Phone", "Payment Method", "Status", "Subtotal (INR)", "Tax (INR)", "Shipping (INR)", "Discount (INR)", "Total (INR)"];
    const rows = orders.map((o) => [
      o.orderId,
      new Date(o.createdAt).toISOString(),
      `"${(o.customerInfo?.name || "").replace(/"/g, '""')}"`,
      `"${(o.customerInfo?.email || "").replace(/"/g, '""')}"`,
      `"${(o.customerInfo?.phone || "").replace(/"/g, '""')}"`,
      o.paymentMethod || "COD",
      o.status,
      o.subtotal || 0,
      o.tax || 0,
      o.shippingFee || 0,
      o.discount || 0,
      o.total || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `basecart-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProductsCSV = () => {
    if (!products || products.length === 0) return;
    const headers = ["Product ID", "Name", "SKU", "Category", "Product Type", "Vendor", "Price (INR)", "Compare At Price (INR)", "Cost (INR)", "Stock Quantity", "Status"];
    const rows = products.map((p) => [
      p.productId,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.sku || "").replace(/"/g, '""')}"`,
      `"${(p.category || "Other").replace(/"/g, '""')}"`,
      `"${(p.productType || "").replace(/"/g, '""')}"`,
      `"${(p.vendor || "").replace(/"/g, '""')}"`,
      p.price || 0,
      p.compareAtPrice || "",
      p.costPerItem || "",
      p.stockQuantity || 0,
      p.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `basecart-products-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVToProducts = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseCSVRow = (rowStr: string) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"' && (i === 0 || rowStr[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return result;
    };

    const headers = parseCSVRow(lines[0]).map((h) => h.toLowerCase().trim());

    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVRow(lines[i]);
      if (values.length === 0 || (values.length === 1 && !values[0])) continue;

      const item: any = {};
      headers.forEach((h, idx) => {
        const val = values[idx] || "";
        if (h.includes("title") || h.includes("name") || h === "product") {
          item.name = val;
        } else if (h.includes("price") && !h.includes("compare") && !h.includes("cost")) {
          item.price = parseFloat(val) || 0;
        } else if (h.includes("compare") || h.includes("compareatprice")) {
          item.compareAtPrice = parseFloat(val) || null;
        } else if (h.includes("cost")) {
          item.costPerItem = parseFloat(val) || null;
        } else if (h.includes("stock") || h.includes("quantity") || h === "qty") {
          item.stockQuantity = parseInt(val, 10) || 0;
        } else if (h.includes("sku")) {
          item.sku = val;
        } else if (h.includes("category")) {
          item.category = val || "Other";
        } else if (h.includes("type") || h.includes("producttype")) {
          item.productType = val;
        } else if (h.includes("vendor") || h.includes("brand")) {
          item.vendor = val;
        } else if (h.includes("status")) {
          item.status = val.toLowerCase() === "draft" ? "draft" : "active";
        } else if (h.includes("desc") || h.includes("details")) {
          item.description = val;
        } else if (h.includes("image") || h.includes("img") || h.includes("photo")) {
          item.images = val ? val.split(";").map((img) => img.trim()).filter(Boolean) : [];
        }
      });

      if (!item.name && values[1]) item.name = values[1];
      if (item.name) {
        parsed.push({
          name: item.name,
          description: item.description || "",
          price: Number(item.price || 0),
          stockQuantity: Number(item.stockQuantity || 0),
          sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          category: item.category || "Other",
          status: item.status || "active",
          vendor: item.vendor || "",
          productType: item.productType || "",
          compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
          costPerItem: item.costPerItem ? Number(item.costPerItem) : null,
          images: item.images || [],
        });
      }
    }
    return parsed;
  };

  const parseJSONToProducts = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      const items = Array.isArray(data) ? data : data.products || [data];
      return items
        .filter((item: any) => item && (item.name || item.title))
        .map((item: any) => ({
          name: item.name || item.title || "Untitled Product",
          description: item.description || "",
          price: Number(item.price || item.amount || 0),
          stockQuantity: Number(item.stockQuantity || item.stock || item.quantity || 0),
          sku: item.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          category: item.category || "Other",
          status: (item.status || "active").toLowerCase() === "draft" ? "draft" : "active",
          vendor: item.vendor || item.brand || "",
          productType: item.productType || item.type || "",
          compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
          costPerItem: item.costPerItem ? Number(item.costPerItem) : null,
          images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
        }));
    } catch (e) {
      return [];
    }
  };

  const handleProcessImportContent = (content: string, format: "csv" | "json") => {
    setImportError("");
    let parsed: any[] = [];
    if (format === "csv") {
      parsed = parseCSVToProducts(content);
    } else {
      parsed = parseJSONToProducts(content);
    }

    if (parsed.length === 0) {
      setImportError(`Failed to parse valid products. Please check your ${format.toUpperCase()} formatting.`);
      setImportParsedProducts([]);
    } else {
      setImportParsedProducts(parsed);
    }
  };

  const handleImportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const isJson = file.name.endsWith(".json");
    const detectedFormat = isJson ? "json" : "csv";
    setImportFormat(detectedFormat);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setImportRawText(text);
        handleProcessImportContent(text, detectedFormat);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleTemplate = (format: "csv" | "json") => {
    if (format === "csv") {
      const sampleCsv = `Name,Price,StockQuantity,SKU,Category,Status,Description,Vendor,ProductType\n"Minimalist Canvas Sneakers",1899,25,"SKU-SNEAKER-01","Footwear","active","Handcrafted canvas sneakers with ergonomic sole","UrbanSole","Footwear"\n"Organic Cotton Hoodie",2499,15,"SKU-HOODIE-02","Apparel","active","100% organic heavy fleece hoodie","EcoWear","Apparel"`;
      const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "basecart_products_sample.csv";
      link.click();
    } else {
      const sampleJson = [
        {
          name: "Minimalist Canvas Sneakers",
          price: 1899,
          stockQuantity: 25,
          sku: "SKU-SNEAKER-01",
          category: "Footwear",
          status: "active",
          description: "Handcrafted canvas sneakers with ergonomic sole",
          vendor: "UrbanSole",
          productType: "Footwear"
        },
        {
          name: "Organic Cotton Hoodie",
          price: 2499,
          stockQuantity: 15,
          sku: "SKU-HOODIE-02",
          category: "Apparel",
          status: "active",
          description: "100% organic heavy fleece hoodie",
          vendor: "EcoWear",
          productType: "Apparel"
        }
      ];
      const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "basecart_products_sample.json";
      link.click();
    }
  };

  const handleExecuteBatchImport = async () => {
    if (importParsedProducts.length === 0) return;
    setImportingBatch(true);
    setImportError("");

    try {
      let successCount = 0;
      for (const prod of importParsedProducts) {
        const res = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(prod),
        });
        if (res.ok) {
          successCount++;
        }
      }

      setActionSuccess(`Successfully imported ${successCount} product(s) into your store catalog!`);
      setIsImportModalOpen(false);
      setImportParsedProducts([]);
      setImportRawText("");
      setImportFileName("");
      fetchDashboardData();
    } catch (err: any) {
      setImportError(err.message || "Failed importing products.");
    } finally {
      setImportingBatch(false);
    }
  };
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

  // Products sub-tab & Collections state
  const [productsSubTab, setProductsSubTab] = useState<"catalog" | "collections" | "inventory" | "purchase-orders" | "transfers" | "gift-cards">("catalog");
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionForm, setCollectionForm] = useState<{ id?: string; name: string; description: string; status: string; isAutomated?: boolean; productIds: string[] } | null>(null);
  const [collectionProductSearch, setCollectionProductSearch] = useState("");
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  const [collectionTypeFilter, setCollectionTypeFilter] = useState<"all" | "active" | "automated" | "manual">("all");
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);

  // Product CSV & JSON Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importInputMethod, setImportInputMethod] = useState<"file" | "paste">("file");
  const [importRawText, setImportRawText] = useState("");
  const [importParsedProducts, setImportParsedProducts] = useState<any[]>([]);
  const [importError, setImportError] = useState("");
  const [importingBatch, setImportingBatch] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  // Customers sub-tab & CSV Import/Export state
  const [customersSubTab, setCustomersSubTab] = useState<"list" | "segments" | "companies">("list");
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [segmentSearchQuery, setSegmentSearchQuery] = useState("");
  const [customerForm, setCustomerForm] = useState<any | null>(null);
  const [isImportCustomerModalOpen, setIsImportCustomerModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState("");
  const [importingCsvLoading, setImportingCsvLoading] = useState(false);
  const [customerSegments, setCustomerSegments] = useState<any[]>([
    { id: "seg-1", name: "Customers who have purchased at least once", lastActivity: "Created on May 27, 2026", createdBy: "System" },
    { id: "seg-2", name: "Email subscribers", lastActivity: "Created on May 27, 2026", createdBy: "System" },
    { id: "seg-3", name: "Abandoned checkouts in the last 30 days", lastActivity: "Created on May 27, 2026", createdBy: "System" },
    { id: "seg-4", name: "Customers who have purchased more than once", lastActivity: "Created on May 27, 2026", createdBy: "System" },
    { id: "seg-5", name: "Customers who haven't purchased", lastActivity: "Created on May 27, 2026", createdBy: "System" },
  ]);

  // Content sub-tab state (Metaobjects, Files, Menus, Blog posts)
  const [contentSubTab, setContentSubTab] = useState<"metaobjects" | "files" | "menus" | "blog-posts">("metaobjects");
  const [menus, setMenus] = useState<any[]>([
    { id: "menu-main", name: "Main menu", items: ["Home", "Catalog", "Contact"] },
    { id: "menu-footer", name: "Footer menu", items: ["Search"] },
    { id: "menu-account", name: "Customer account main menu", items: ["Orders", "Profile"] },
  ]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [metaobjects, setMetaobjects] = useState<any[]>([]);
  const [storeFiles, setStoreFiles] = useState<any[]>([]);
  const [menuForm, setMenuForm] = useState<{ id?: string; name: string; items: string } | null>(null);
  const [blogForm, setBlogForm] = useState<{ id?: string; title: string; content: string; author?: string } | null>(null);

  // Settings portal sub-tab state (Matching Screenshot 2)
  const [settingsSearchQuery, setSettingsSearchQuery] = useState("");
  const [isSettingsPortalOpen, setIsSettingsPortalOpen] = useState(false);

  const handleExportCustomersCSV = () => {
    const headers = [
      "First Name", "Last Name", "Email", "Accepts Email Marketing",
      "Default Address Company", "Default Address Address1", "Default Address Address2",
      "Default Address City", "Default Address Province Code", "Default Address Country Code",
      "Default Address Zip", "Default Address Phone", "Phone",
      "Accepts SMS Marketing", "Accepts WhatsApp Marketing", "Tags", "Note", "Tax Exempt"
    ];
    const rows = customers.map((c) => [
      `"${(c.firstName || "").replace(/"/g, '""')}"`,
      `"${(c.lastName || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      c.acceptsEmailMarketing ? "yes" : "no",
      `"${(c.company || "").replace(/"/g, '""')}"`,
      `"${(c.address1 || "").replace(/"/g, '""')}"`,
      `"${(c.address2 || "").replace(/"/g, '""')}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      `"${(c.provinceCode || "").replace(/"/g, '""')}"`,
      `"${(c.countryCode || "IN").replace(/"/g, '""')}"`,
      `"${(c.zip || "").replace(/"/g, '""')}"`,
      `"${(c.addressPhone || c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      c.acceptsSmsMarketing ? "yes" : "no",
      c.acceptsWhatsAppMarketing ? "yes" : "no",
      `"${(c.tags || "").replace(/"/g, '""')}"`,
      `"${(c.note || "").replace(/"/g, '""')}"`,
      c.taxExempt ? "yes" : "no"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopify_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;
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
        credentials: "include",
        body: JSON.stringify({
          storeName: settings.storeName,
          registeredBusinessName: settings.registeredBusinessName,
          registeredBusinessAddress: settings.registeredBusinessAddress,
          registeredState: settings.registeredState,
          gstin: settings.gstin,
          panNumber: settings.panNumber,
          cinNumber: settings.cinNumber,
          tanNumber: settings.tanNumber,
          placeOfSupply: settings.placeOfSupply,
          supportEmail: settings.supportEmail,
          supportPhone: settings.supportPhone,
          currency: settings.currency,
          weightUnit: settings.weightUnit,
          timezone: settings.timezone,
          backupRegion: settings.backupRegion,
          razorpayKey: settings.razorpayKey,
          razorpaySecret: settings.razorpaySecret,
          codEnabled: settings.codEnabled,
          codMinAmount: settings.codMinAmount,
          upiVpa: settings.upiVpa,
          shippingFee: settings.shippingFee,
          freeShippingMinOrder: settings.freeShippingMinOrder,
          handlingDays: settings.handlingDays,
          customerAccountPolicy: settings.customerAccountPolicy,
          phoneRequired: settings.phoneRequired,
          address2Required: settings.address2Required,
          taxRate: settings.taxRate,
          pricesIncludeTax: settings.pricesIncludeTax,
          customDomain: settings.customDomain,
          termsOfService: settings.termsOfService,
          privacyPolicy: settings.privacyPolicy,
          refundPolicy: settings.refundPolicy,
          shippingPolicy: settings.shippingPolicy,
          orderIdPrefix: settings.orderIdPrefix,
          orderIdSuffix: settings.orderIdSuffix,
          autoFulfill: settings.autoFulfill,
          autoArchive: settings.autoArchive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save store settings to database");
      setActionSuccess("All store settings saved to database successfully!");
    } catch (err: any) {
      setActionError(err.message || "Error saving store settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleCsvTemplate = () => {
    const headers = [
      "First Name", "Last Name", "Email", "Accepts Email Marketing",
      "Default Address Company", "Default Address Address1", "Default Address Address2",
      "Default Address City", "Default Address Province Code", "Default Address Country Code",
      "Default Address Zip", "Default Address Phone", "Phone",
      "Accepts SMS Marketing", "Accepts WhatsApp Marketing", "Tags", "Note", "Tax Exempt"
    ];
    const sampleRows = [
      ["John", "Doe", "john.doe@example.com", "yes", "Acme Corp", "123 Main St", "Suite 400", "Mumbai", "MH", "IN", "400001", "+919876543210", "+919876543210", "yes", "yes", "VIP, Wholesale", "Preferred buyer", "no"],
      ["Priya", "Sharma", "priya.sharma@example.com", "no", "", "45 Park Street", "", "Bengaluru", "KA", "IN", "560001", "", "+919876543211", "no", "no", "Retail", "New signup", "no"]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopify_customers_sample_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Settings sub-tab navigation state
  const [settingsSubTab, setSettingsSubTab] = useState<string>("general");
  const [showRazorpaySecret, setShowRazorpaySecret] = useState<boolean>(false);
  const [confirmBankAccNumber, setConfirmBankAccNumber] = useState<string>("");
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [discountFilter, setDiscountFilter] = useState<string>("all");
  const [discountSearchQuery, setDiscountSearchQuery] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    plan: "growth",
    price: 699,
    productsUsed: 0,
    productsLimit: 2000,
    ordersUsed: 0,
    ordersLimit: 5000,
    storageUsed: 2.4,
    storageLimit: 20,
    staffUsed: 1,
    staffLimit: 10,
    nextBillingDate: "15 Aug 2026",
    paymentGateway: "Razorpay",
    status: "Active",
    statements: [],
  });
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState("growth");

  // Email template settings
  const [emailSettings, setEmailSettings] = useState<any>({
    email_color_primary: "",
    email_logo_url: "",
    email_signature: "",
  });

  // UI status
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product> | null>(null);
  const [discountForm, setDiscountForm] = useState<any | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-dismiss action feedback banners after 4 seconds
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => {
        setActionSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => {
        setActionError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

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

  // Read tokens on startup (via httpOnly cookie session check, with localStorage fallback for local dev)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First try cookie-based session (production)
        const res = await fetch(`${API_URL}/auth/merchant/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.accessToken);
          setTenantId(data.tenantId);
          if (data.email) setEmail(data.email);
          if (data.ownerName) setMerchantOwnerName(data.ownerName);
          setEmailVerified(data.emailVerified !== false);
        } else {
          // Fallback: try localStorage token (local dev cross-origin)
          const storedToken = typeof window !== "undefined" ? localStorage.getItem("basecart_token") : null;
          if (storedToken) {
            const meRes = await fetch(`${API_URL}/auth/merchant/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              setToken(storedToken);
              setTenantId(meData.tenantId);
              if (meData.email) setEmail(meData.email);
              if (meData.ownerName) setMerchantOwnerName(meData.ownerName);
              setEmailVerified(meData.emailVerified !== false);
            } else {
              // Token expired or invalid — clear it
              localStorage.removeItem("basecart_token");
              localStorage.removeItem("basecart_refresh_token");
              localStorage.removeItem("basecart_tenant_id");
              setToken(null);
              setTenantId(null);
            }
          } else {
            setToken(null);
            setTenantId(null);
          }
        }
      } catch (err) {
        // Network error — try localStorage fallback
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("basecart_token") : null;
        if (storedToken) {
          try {
            const meRes = await fetch(`${API_URL}/auth/merchant/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              setToken(storedToken);
              setTenantId(meData.tenantId);
              if (meData.email) setEmail(meData.email);
              if (meData.ownerName) setMerchantOwnerName(meData.ownerName);
              setEmailVerified(meData.emailVerified !== false);
            }
          } catch (innerErr) {
            console.error("No active merchant session:", innerErr);
          }
        }
      } finally {
        setSessionChecked(true);
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

  // Redirect to login if token is missing or expired
  useEffect(() => {
    if (isHydrated && sessionChecked && !token) {
      window.location.href = "/login";
    }
  }, [isHydrated, sessionChecked, token]);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBillingData = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/store/billing`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBillingInfo((prev: any) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to fetch store billing data:", err);
    }
  };

  const handleSelectPlanTier = async (targetPlan: string) => {
    if (!token) return;
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
        credentials: "include",
        body: JSON.stringify({ plan: targetPlan.toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription plan");
      setActionSuccess(`Plan successfully changed to ${targetPlan.toUpperCase()} tier!`);
      await fetchBillingData();
      setSettings((prev) => ({ ...prev, plan: targetPlan.toLowerCase() }));
    } catch (err: any) {
      setActionError(err.message || "Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupRazorpayPaymentMethod = async (planOverride?: string) => {
    if (!token) return;
    setLoading(true);
    setActionError("");
    setActionSuccess("");

    const targetPlan = (planOverride || selectedPaymentPlan || billingInfo.plan || settings.plan || "growth").toLowerCase();

    const PLAN_PRICE_MAP: Record<string, number> = {
      starter: 299,
      growth: 699,
      pro: 1499,
      agency: 4999,
      free: 0,
    };

    const monthlyPriceINR = PLAN_PRICE_MAP[targetPlan] ?? 699;
    const amountPaise = monthlyPriceINR * 100;

    try {
      // Step 1: Load Razorpay Checkout SDK if not already loaded
      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Razorpay Checkout SDK"));
          document.body.appendChild(script);
        });
      }

      // Step 2: Create Razorpay Order on backend (required for Standard Checkout)
      const orderRes = await fetch(`${API_URL}/api/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          amount: amountPaise > 0 ? amountPaise : 100,
          currency: "INR",
          receipt: `sub_${targetPlan}_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json() as any;
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create Razorpay order. Check your Razorpay API keys in .dev.vars.");
      }

      const { order_id, key_id } = orderData;

      // Step 3: Open Razorpay Checkout with the order_id
      const options = {
        key: key_id,
        amount: amountPaise > 0 ? amountPaise : 100,
        currency: "INR",
        order_id,
        name: settings.storeName || "Basecart Platform",
        description: `Basecart ${targetPlan.toUpperCase()} Plan — ₹${monthlyPriceINR}/mo`,
        image: "https://basecart.app/logo.png",
        prefill: {
          name: settings.storeName || merchantOwnerName || "Store Owner",
          email: email || "merchant@basecart.app",
          contact: settings.supportPhone || "",
        },
        theme: {
          color: "#4F46E5",
        },
        handler: async function (response: any) {
          try {
            // Step 4: Verify signature on backend
            const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json() as any;
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment signature verification failed");
            }

            // Step 5: Update plan & record invoice on backend
            const pmRes = await fetch(`${API_URL}/store/payment-method`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                plan: targetPlan,
                amountPaid: monthlyPriceINR,
                paymentMethodType: `Razorpay (${targetPlan.toUpperCase()} Plan — ₹${monthlyPriceINR}/mo)`,
              }),
            });
            const pmData = await pmRes.json() as any;
            if (pmRes.ok) {
              setActionSuccess(`⚡ Payment of ${formatINR(monthlyPriceINR)} confirmed! ${targetPlan.toUpperCase()} plan is now active.`);
              await fetchBillingData();
              setSettings((prev) => ({ ...prev, plan: targetPlan }));
            } else {
              throw new Error(pmData.error || "Failed to activate plan");
            }
          } catch (e: any) {
            setActionError(e.message || "Payment verification failed");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: any) => {
        setActionError(`Payment failed: ${resp.error?.description || "Unknown error"}`);
      });
      rzp.open();
    } catch (err: any) {
      setActionError(err.message || "Failed to launch Razorpay Checkout");
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on login
  useEffect(() => {
    if (token) {
      fetchBillingData();

      fetch(`${API_URL}/store/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setSettings(data);
        })
        .catch(console.error);

      // Fetch all stores linked to this merchant account
      fetch(`${API_URL}/auth/merchant/stores`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data)) setMerchantStores(data);
        })
        .catch(console.error);

      // Fetch persistent & smart system merchant notifications
      fetch(`${API_URL}/merchant/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.notifications && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
        })
        .catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (token && settingsSubTab === "plan") {
      fetchBillingData();
    }
  }, [token, settingsSubTab]);

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!token) return;
    try {
      await fetch(`${API_URL}/merchant/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (id: string | number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!token) return;
    try {
      await fetch(`${API_URL}/merchant/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    }
  };

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
        credentials: "include",
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
          credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
        credentials: "include",
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
        const [prodRes, colRes, poRes, gcRes] = await Promise.all([
          fetch(`${API_URL}/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/collections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/purchase-orders`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/gift-cards`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (prodRes.ok) setProducts(await prodRes.json());
        if (colRes.ok) setCollections(await colRes.json());
        if (poRes.ok) setPurchaseOrders(await poRes.json());
        if (gcRes.ok) setGiftCards(await gcRes.json());
      } else if (activeTab === "orders") {
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setOrders(await res.json());
      } else if (["settings", "addons", "store-design", "payments", "brand"].includes(activeTab)) {
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
      } else if (activeTab === "content") {
        const [menuRes, blogRes, fileRes] = await Promise.all([
          fetch(`${API_URL}/store/menus`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/store/blog-posts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/store/files`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (menuRes.ok) setMenus(await menuRes.json());
        if (blogRes.ok) setBlogPosts(await blogRes.json());
        if (fileRes.ok) setStoreFiles(await fileRes.json());
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
      } else if (activeTab === "emails") {
        const res = await fetch(`${API_URL}/store/email-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setEmailSettings(await res.json());
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
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

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

  const handleWizardSubmit = async () => {
    setAuthError("");
    setLoading(true);
    try {
      let cleanedSubdomain = onboardingData.subdomain.trim().toLowerCase();
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
          email: onboardingData.email,
          password: onboardingData.password,
          storeName: onboardingData.storeName,
          subdomain: cleanedSubdomain,
          businessCategory: onboardingData.businessCategory,
          businessType: onboardingData.businessType,
          country: onboardingData.country,
          state: onboardingData.state,
          ownerName: onboardingData.ownerName,
          phone: onboardingData.phone,
          teamSize: onboardingData.teamSize,
          monthlyOrders: onboardingData.monthlyOrders,
          currentPlatform: onboardingData.currentPlatform,
          hearAboutUs: onboardingData.hearAboutUs,
          selectedPlan: onboardingData.selectedPlan,
          receiveUpdates: onboardingData.receiveUpdates,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      setToken(data.accessToken);
      setTenantId(data.tenantId);
      setEmailVerified(false); // Account unverified until 6-digit OTP code or link verification
      
      // Reset wizard fields
      setOnboardingData({
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
        receiveUpdates: false,
        storeName: "",
        subdomain: "",
        businessCategory: "",
        businessType: "",
        country: "India",
        state: "",
        ownerName: "",
        phone: "",
        teamSize: "1",
        monthlyOrders: "0-50",
        currentPlatform: "None",
        hearAboutUs: "Google Search",
        selectedPlan: "free",
        otpCode: "",
      });
      setWizardStep(1);
    } catch (err: any) {
      setAuthError(err.message || "Failed to create merchant store.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/merchant/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("basecart_token");
      localStorage.removeItem("basecart_refresh_token");
      localStorage.removeItem("basecart_tenant_id");
    }
    setToken(null);
    setTenantId(null);
    setProducts([]);
    setOrders([]);
    window.location.href = "/login";
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

  const handleVerifyOtpSubmit = async () => {
    if (inputOtp.length !== 6) return;
    setVerifyingOtp(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/merchant/verify-email?token=${inputOtp}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid verification code");

      setEmailVerified(true);
      setOtpSuccess("Email verified successfully! Store is now active and online.");
      setTimeout(() => {
        setShowOtpModal(false);
        setInputOtp("");
        setOtpSuccess("");
      }, 1500);
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify OTP code.");
    } finally {
      setVerifyingOtp(false);
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

  // Helper to auto-generate SKU based on product title or random string
  const handleAutoGenerateSku = () => {
    if (!productForm) return;
    const namePart = (productForm.name || "ITEM")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newSku = `SKU-${namePart || "PROD"}-${randomNum}`;
    setProductForm((prev: any) => ({ ...prev, sku: newSku }));
  };

  // Helper to auto-generate 13-digit EAN-13 barcode with valid check digit
  const handleAutoGenerateBarcode = () => {
    if (!productForm) return;
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const raw12 = `890${randomDigits}`;
    let sumEven = 0;
    let sumOdd = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(raw12[i], 10);
      if (i % 2 === 0) {
        sumOdd += digit;
      } else {
        sumEven += digit;
      }
    }
    const total = sumOdd + sumEven * 3;
    const checkDigit = (10 - (total % 10)) % 10;
    const newBarcode = `${raw12}${checkDigit}`;

    setProductForm((prev: any) => ({ ...prev, barcode: newBarcode }));
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

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    trackingNumber?: string,
    carrier?: string
  ) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (targetOrder && (targetOrder.status === "delivered" || targetOrder.status === "cancelled")) {
      setActionError(`Order #${orderId.substring(0, 8).toUpperCase()} status is locked because it is already '${targetOrder.status}'. Altering completed/cancelled orders violates user transaction integrity.`);
      return;
    }

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
        body: JSON.stringify({
          status: newStatus,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(carrier ? { carrier } : {}),
        }),
      });
      if (res.ok) {
        setActionSuccess(`Order status updated to ${newStatus}${carrier ? ` via ${carrier}` : ""}`);
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

  const handleDownloadOrderInvoice = async (order: any) => {
    if (!token || !order) return;
    try {
      setActionSuccess("Generating GST Tax Invoice PDF...");
      const res = await fetch(`${API_URL}/orders/${order.orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed generating invoice PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const invNo = order.invoiceNumber || `INV-2026-${order.orderNumber || order.orderId.substring(0, 6).toUpperCase()}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setActionSuccess(`Invoice ${invNo} downloaded successfully!`);
    } catch (err: any) {
      console.error("PDF Download error, opening printable invoice window fallback:", err);
      openPrintableInvoiceWindow(order);
    }
  };

  function numberToWordsINR(amount: number): string {
    const a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function inWords(num: number): string {
      if (num === 0) return "";
      const strNum = ("000000000" + num).slice(-9);
      const n = strNum.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return "";
      let str = "";
      str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
      str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
      str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
      str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
      str += Number(n[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])]) : "";
      return str.trim();
    }

    const num = Math.floor(amount);
    const paise = Math.round((amount - num) * 100);

    let result = "Rupees " + (inWords(num) || "Zero");
    if (paise > 0) {
      result += " and " + (inWords(paise) || "Zero") + " Paise";
    }
    return result + " Only";
  }

  const openPrintableInvoiceWindow = (order: any) => {
    const invNo = order.invoiceNumber || `INV-2026-${order.orderNumber || order.orderId.substring(0, 6).toUpperCase()}`;
    const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const dueDateObj = new Date(new Date(order.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000);
    const dueDateStr = dueDateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    // Store & Tax Metadata
    const storeName = settings.registeredBusinessName || settings.storeName || "Basecart Merchant Store";
    const logoUrl = settings.branding?.logoUrl || "";
    const gstin = settings.gstin || "33AAACZ4322M2Z9";
    const panNumber = settings.panNumber || "AAACZ4322M";
    const cinNumber = settings.cinNumber || "U40100TN2010PTC075961";
    const tanNumber = settings.tanNumber || "CHEZ03229C";
    const regAddress = settings.registeredBusinessAddress || "Krisp IT Park, Kelambakkam Road, Chennai, Tamil Nadu, Pin: 600127";
    const regState = settings.registeredState || settings.placeOfSupply || "Tamil Nadu (33)";

    // Customer & Addresses
    const customerName = order.customerInfo?.name || "Valued Customer";
    const customerEmail = order.customerInfo?.email || "customer@example.com";
    const customerPhone = order.customerInfo?.phone || "";
    const customerAddress = order.customerInfo?.address;
    const addressLine1 = customerAddress ? `${customerAddress.street}` : "Standard Shipping Address";
    const addressCityState = customerAddress ? `${customerAddress.city}, ${customerAddress.state} ${customerAddress.pincode}` : "India";

    // Amounts & Tax calculations
    const items = order.lineItems || [];
    const subtotal = order.subtotal || order.total;
    const taxRatePercent = 18; // Default GST 18%
    const taxAmount = order.tax || Math.round((subtotal * taxRatePercent) / 100);
    const totalAmount = order.total || subtotal + taxAmount;
    const isPaid = order.status === "paid" || order.status === "shipped" || order.status === "delivered";
    const paymentMade = isPaid ? totalAmount : 0;
    const balanceDue = totalAmount - paymentMade;
    const totalInWords = numberToWordsINR(totalAmount);

    // Bank Details & Config
    const bank = settings.bankDetails || {};
    const bankName = bank.bankName || "HDFC Bank Limited";
    const accountName = bank.accountName || storeName;
    const accountNumber = bank.accountNumber || "50200026430541";
    const ifscCode = bank.ifscCode || "HDFC0001225";
    const bankBranch = bank.bankBranch || "AC Old No.56, New No.16/1, Ground Floor, Anna Nagar West, Chennai 600 040";

    const invConfig = settings.invoiceConfig || {};
    const disclaimer = invConfig.invoiceHeaderDisclaimer || "*This is a computer generated invoice and does not require a physical copy";
    const terms = invConfig.invoiceTerms || "Net 15";
    const notes = invConfig.invoiceNotes || "Thanks for your business. For GST queries, please contact your store support.";
    const signatoryName = invConfig.authorizedSignatoryName || storeName;
    const signatoryTitle = invConfig.authorizedSignatoryTitle || "Authorized Signatory";

    const qrData = encodeURIComponent(`https://${settings.subdomain || "store"}.basecart.app/invoice-verify?id=${invNo}&amount=${totalAmount}`);

    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please allow popups to view & print the Tax Invoice.");
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TAX INVOICE - ${invNo}</title>
        <style>
          @page { size: A4; margin: 8mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 10.5px;
            line-height: 1.35;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 10px;
          }
          .disclaimer-top {
            text-align: center;
            font-size: 9px;
            font-style: italic;
            color: #333;
            margin-bottom: 6px;
          }
          .invoice-card {
            border: 1px solid #555;
            width: 100%;
            box-sizing: border-box;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 12px;
            border-bottom: 1px solid #555;
          }
          .seller-left {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .seller-logo {
            max-height: 50px;
            max-width: 110px;
            object-fit: contain;
          }
          .seller-info h2 {
            margin: 0 0 3px 0;
            font-size: 15px;
            font-weight: 800;
            color: #000;
          }
          .seller-info p {
            margin: 1px 0;
            font-size: 10px;
            color: #222;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: 900;
            color: #000;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            text-align: right;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1px solid #555;
          }
          .meta-table td {
            width: 50%;
            padding: 4px 8px;
            vertical-align: top;
            border-right: 1px solid #555;
          }
          .meta-table td:last-child { border-right: none; }
          .meta-row {
            display: flex;
            font-size: 10px;
            margin-bottom: 2px;
          }
          .meta-label { font-weight: bold; color: #444; width: 115px; }
          .meta-val { font-weight: bold; color: #000; flex: 1; }

          .address-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1px solid #555;
          }
          .address-table th {
            background: #f1f5f9;
            border-bottom: 1px solid #555;
            border-right: 1px solid #555;
            padding: 3px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10.5px;
            color: #0f172a;
          }
          .address-table th:last-child { border-right: none; }
          .address-table td {
            width: 50%;
            padding: 6px 8px;
            vertical-align: top;
            border-right: 1px solid #555;
          }
          .address-table td:last-child { border-right: none; }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1px solid #555;
          }
          .items-table th {
            border-bottom: 1px solid #555;
            border-right: 1px solid #555;
            padding: 5px 6px;
            font-weight: bold;
            font-size: 10px;
            background: #fff;
            text-transform: uppercase;
          }
          .items-table th:last-child { border-right: none; }
          .items-table td {
            padding: 5px 6px;
            border-right: 1px solid #555;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 10px;
          }
          .items-table td:last-child { border-right: none; }

          .bottom-grid {
            display: flex;
            width: 100%;
          }
          .bottom-left {
            width: 58%;
            padding: 8px 10px;
            border-right: 1px solid #555;
            box-sizing: border-box;
          }
          .bottom-right {
            width: 42%;
            box-sizing: border-box;
          }
          .totals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
          }
          .totals-table td {
            padding: 3.5px 8px;
            text-align: right;
          }
          .totals-table tr.grand-total td {
            font-weight: 900;
            font-size: 12px;
            border-top: 1px solid #555;
            border-bottom: 1px solid #555;
          }

          .signatory-box {
            border-top: 1px solid #555;
            padding: 10px 8px 6px 8px;
            text-align: center;
            min-height: 90px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 8px 16px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 12px;
          }
          @media print { .btn-print { display: none; } }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save Official PDF Invoice</button>
        <div class="disclaimer-top">${disclaimer}</div>

        <div class="invoice-card">
          <!-- Seller Header -->
          <div class="header-box">
            <div class="seller-left">
              ${logoUrl ? `<img src="${logoUrl}" class="seller-logo" alt="Store Logo"/>` : ""}
              <div class="seller-info">
                <h2>${storeName}</h2>
                <p>${regAddress}</p>
                <p>Phone: +91 9876543210</p>
                <p>Pan No: <strong>${panNumber}</strong> | CIN: <strong>${cinNumber}</strong></p>
                <p>Tan No: <strong>${tanNumber}</strong> | GSTIN: <strong>${gstin}</strong></p>
              </div>
            </div>
            <div>
              <div class="invoice-title">TAX INVOICE</div>
            </div>
          </div>

          <!-- Metadata Grid -->
          <table class="meta-table">
            <tr>
              <td>
                <div class="meta-row"><span class="meta-label">INVOICE#</span><span class="meta-val">: ${invNo}</span></div>
                <div class="meta-row"><span class="meta-label">DATE</span><span class="meta-val">: ${dateStr}</span></div>
                <div class="meta-row"><span class="meta-label">TERMS</span><span class="meta-val">: ${terms}</span></div>
                <div class="meta-row"><span class="meta-label">DUE DATE</span><span class="meta-val">: ${dueDateStr}</span></div>
                <div class="meta-row"><span class="meta-label">P.O.#</span><span class="meta-val">: ${order.orderId.substring(0, 15).toUpperCase()}</span></div>
              </td>
              <td>
                <div class="meta-row"><span class="meta-label">Name Of State</span><span class="meta-val">: ${regState}</span></div>
                <div class="meta-row"><span class="meta-label">License Order No</span><span class="meta-val">: RPWIN${order.orderId.substring(0, 12).toUpperCase()}</span></div>
                <div class="meta-row"><span class="meta-label">License Sent to</span><span class="meta-val">: ${customerName}</span></div>
                <div class="meta-row"><span class="meta-label">UserMail</span><span class="meta-val">: ${customerEmail}</span></div>
                <div class="meta-row"><span class="meta-label">Place Of Supply</span><span class="meta-val">: ${customerAddress?.city || "Kerala (32)"}</span></div>
              </td>
            </tr>
          </table>

          <!-- Bill To / Ship To Grid -->
          <table class="address-table">
            <thead>
              <tr>
                <th>Bill To</th>
                <th>Ship To</th>
              </tr>
            </thead>
            <tr>
              <td>
                <strong>${customerName}</strong><br/>
                Attn: ${customerEmail}<br/>
                ${addressLine1}<br/>
                ${addressCityState}<br/>
                Phone: ${customerPhone || "N/A"}
              </td>
              <td>
                <strong>${customerName}</strong><br/>
                ${addressLine1}<br/>
                ${addressCityState}
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 45%;">Item & Description</th>
                <th style="text-align: center; width: 8%;">Qty</th>
                <th style="text-align: right; width: 14%;">Rate</th>
                <th style="text-align: center; width: 9%;">IGST %</th>
                <th style="text-align: right; width: 11%;">Amt</th>
                <th style="text-align: right; width: 13%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it: any) => {
                const qty = it.quantity || 1;
                const rate = it.price || 0;
                const itemSubtotal = rate * qty;
                const itemIgst = Math.round((itemSubtotal * taxRatePercent) / 100);
                return `
                  <tr>
                    <td>
                      <strong>${it.name}</strong><br/>
                      ${it.sku ? `<span style="color:#555;">SKU: ${it.sku}</span><br/>` : ""}
                      <span style="color:#666; font-size:9px;">SAC/HSN: 997331</span>
                    </td>
                    <td style="text-align: center; font-weight: bold;">${qty.toFixed(2)}</td>
                    <td style="text-align: right;">${rate.toFixed(2)}</td>
                    <td style="text-align: center;">${taxRatePercent}%</td>
                    <td style="text-align: right;">${itemIgst.toFixed(2)}</td>
                    <td style="text-align: right; font-weight: bold;">${itemSubtotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <!-- Bottom Grid: Words, Bank Details, QR & Totals -->
          <div class="bottom-grid">
            <div class="bottom-left">
              <div style="margin-bottom: 8px;">
                <span style="font-size: 10px; font-weight: bold;">Total In Words</span><br/>
                <strong style="font-style: italic; font-size: 11px;">${totalInWords}</strong>
              </div>

              <div style="margin-bottom: 8px; font-size: 9.5px; color: #333;">
                <strong>Notes</strong><br/>
                ${notes}
              </div>

              <div style="margin-bottom: 8px; font-size: 9.5px;">
                <strong style="font-size: 10px;">Details for Transferring the Funds</strong><br/>
                <strong>${bankName}</strong><br/>
                Account Name : <strong>${accountName}</strong><br/>
                Account Number : <strong>${accountNumber}</strong><br/>
                IFSC Code : <strong>${ifscCode}</strong><br/>
                Bank Address : ${bankBranch}<br/>
                <strong style="font-size: 9.5px; display: block; margin-top: 2px;">Please Quote our Invoice No in all your correspondence</strong>
              </div>

              <div style="display: flex; items-center; gap: 8px; margin-top: 6px; pt: 4px; border-top: 1px solid #ddd;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${qrData}" style="width: 55px; height: 55px;" alt="QR Code" />
                <div style="font-size: 9px; color: #444; font-weight: 500;">
                  Scan the QR code to view the configured information & verification.
                </div>
              </div>
            </div>

            <div class="bottom-right">
              <table class="totals-table">
                <tr>
                  <td>Sub Total</td>
                  <td style="font-weight: bold; width: 80px;">${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>IGST18 (${taxRatePercent}%)</td>
                  <td style="font-weight: bold;">${taxAmount.toFixed(2)}</td>
                </tr>
                <tr class="grand-total">
                  <td>Total</td>
                  <td>₹${totalAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Payment Made</td>
                  <td style="color: #dc2626; font-weight: bold;">(-) ${paymentMade.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 1px solid #555; font-size: 12px; font-weight: 900;">
                  <td>Balance Due</td>
                  <td>₹${balanceDue.toFixed(2)}</td>
                </tr>
              </table>

              <div class="signatory-box">
                <div style="font-weight: bold; font-size: 10px;">${storeName}</div>
                <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 18px; color: #1e3a8a; font-weight: bold; transform: rotate(-3deg);">
                  ${signatoryName}
                </div>
                <div style="font-[10px]; font-weight: bold; color: #444; border-top: 1px solid #999; width: 80%; pt: 2px; margin-top: 4px;">
                  ${signatoryTitle}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: right; font-size: 9px; color: #555; margin-top: 4px;">1</div>
      </body>
      </html>
    `);
    printWin.document.close();
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

  const toggleDiscountActive = async (disc: any) => {
    setLoading(true);
    setActionError("");
    try {
      const newActiveState = !disc.active;
      const res = await fetch(`${API_URL}/discounts/${disc.code}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: disc.code,
          type: disc.type,
          value: Number(disc.value),
          minOrderAmount: Number(disc.minOrderAmount || 0),
          usageLimit: disc.usageLimit ? Number(disc.usageLimit) : undefined,
          expiry: disc.expiry ? new Date(disc.expiry).toISOString() : undefined,
          active: newActiveState,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Discount code ${disc.code} is now ${newActiveState ? "active" : "inactive"}.`);
        fetchDashboardData();
      } else {
        const d = await res.json();
        setActionError(d.error || "Failed updating status");
      }
    } catch (err) {
      setActionError("Error updating discount status.");
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
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
      if (billingRes.ok) setBillingInfo(await billingRes.json());
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

  // ESC Key listener to close active popups & modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedOrderForDetail) setSelectedOrderForDetail(null);
        if (fulfillingOrder) setFulfillingOrder(null);
        if (discountForm) setDiscountForm(null);
        if (showOtpModal) setShowOtpModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrderForDetail, fulfillingOrder, discountForm, showOtpModal]);

  // --- Loading / Hydration Splash ---
  if (!isHydrated || !sessionChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Loading Console...</span>
        </div>
      </div>
    );
  }

  // --- Auth Redirect ---
  if (!token) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-xs text-slate-500 font-semibold">Redirecting to login...</span>
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
        className="hidden lg:flex bg-white border-r border-slate-200/80 flex-col shrink-0 h-full transition-[width] duration-300 ease-in-out overflow-hidden"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Branding */}
          <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0">
            <img src="/logo.svg" alt="Basecart Logo" className="h-[34px] w-auto object-contain shrink-0" />
          </div>

          {/* Navigation Links (Matching Screenshot 1) */}
          <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
            {/* Core Operations */}
            <div className="space-y-0.5">
              {[
                { id: "summary", name: "Overview", icon: Home },
                { id: "orders", name: "Orders & Sales", icon: ShoppingCart, badge: orders.length > 0 ? orders.length : undefined },
                { id: "products", name: "Catalog & Items", icon: Package },
                { id: "customers", name: "Customers & Contacts", icon: Users },
                { id: "marketing", name: "Growth & Campaigns", icon: TrendingUp },
                { id: "discounts", name: "Coupons & Offers", icon: Tag },
                { id: "content", name: "Content & Media", icon: FileText },
                { id: "finances", name: "Analytics & Performance", icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      onClick={() => changeTab(item.id)}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all ${
                        sidebarCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2"
                      } ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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

                    {/* Sub-items for Products */}
                    {item.id === "products" && isActive && !sidebarCollapsed && (
                      <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                        {[
                          { id: "collections", label: "Collections" },
                          { id: "inventory", label: "Inventory" },
                          { id: "purchase-orders", label: "Purchase orders" },
                          { id: "transfers", label: "Transfers" },
                          { id: "gift-cards", label: "Gift cards" },
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              changeTab("products", sub.id);
                              setProductForm(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              productsSubTab === sub.id
                                ? "bg-slate-100 text-slate-900 font-bold"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Sub-items for Customers */}
                    {item.id === "customers" && isActive && !sidebarCollapsed && (
                      <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                        {[
                          { id: "segments", label: "Segments" },
                          { id: "companies", label: "Companies" },
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              changeTab("customers", sub.id);
                              setCustomerForm(null);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              customersSubTab === sub.id
                                ? "bg-slate-100 text-slate-900 font-bold"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Sub-items for Content (Matching Screenshot 1) */}
                    {item.id === "content" && isActive && !sidebarCollapsed && (
                      <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                        {[
                          { id: "metaobjects", label: "Metaobjects" },
                          { id: "files", label: "Files" },
                          { id: "menus", label: "Menus" },
                          { id: "blog-posts", label: "Blog posts" },
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => changeTab("content", sub.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              contentSubTab === sub.id
                                ? "bg-slate-100 text-slate-900 font-bold"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Sales channels section */}
            <div className="pt-2 border-t border-slate-100 space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Store Channels</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
              )}
              {[
                { id: "store-design", name: "Storefront Studio", icon: Store },
                { id: "agentic", name: "Agentic Store & AI", icon: Bot },
                { id: "headless", name: "Headless Store", icon: Code, badge: "Soon" },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => changeTab(item.id)}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all ${
                      sidebarCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2"
                    } ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    {!sidebarCollapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span className="ml-auto bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-200 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Apps section (Matching Screenshot 1) */}
            <div className="pt-2 border-t border-slate-100 space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Apps</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => changeTab("addons")}
                title={sidebarCollapsed ? "Apps & Integrations" : undefined}
                className={`w-full flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all ${
                  sidebarCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2"
                } ${
                  activeTab === "addons"
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Puzzle className={`h-[18px] w-[18px] shrink-0 ${activeTab === "addons" ? "text-indigo-600" : "text-slate-400"}`} />
                {!sidebarCollapsed && <span>Apps & Integrations</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Pinned Bottom Settings Link (Matching Screenshot 1 & 2) */}
        <div className="px-3 py-2 border-t border-slate-100">
          <a
            href={`/store/${settings.subdomain || "my-store"}/settings/profile`}
            onClick={(e) => {
              e.preventDefault();
              changeSettingsSubTab("general");
            }}
            title={sidebarCollapsed ? "Settings" : undefined}
            className={`w-full flex items-center gap-3 rounded-xl text-[13px] font-semibold transition-all ${
              sidebarCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2"
            } ${
              activeTab === "settings" || isSettingsPortalOpen
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <SettingsIcon className={`h-[18px] w-[18px] shrink-0 ${activeTab === "settings" || isSettingsPortalOpen ? "text-indigo-600" : "text-slate-400"}`} />
            {!sidebarCollapsed && <span>Settings</span>}
          </a>
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
          {/* Upgrade & Free Trial Card - hidden when collapsed or dismissed for the day */}
          {!sidebarCollapsed && !isTrialBannerDismissed && (
            <div className="p-3">
              {(() => {
                const daysRemaining = calculateTrialDaysRemaining(settings.createdAt);
                return (
                  <div className="relative p-3 bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-violet-50/90 rounded-xl border border-indigo-100/90 space-y-2.5 shadow-xs group">
                    {/* Close button - dismisses banner once per day */}
                    <button
                      onClick={handleDismissTrialBanner}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="Dismiss for today"
                      aria-label="Dismiss trial banner for today"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center justify-between pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          FREE TRIAL
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">Acquisition Trial Active ⚡</p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Full Growth-tier features unlocked for first 100 orders or ₹25,000 GMV!
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, (daysRemaining / 60) * 100))}%`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => changeSettingsSubTab("plan")}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 mt-1"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })()}
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
                <button onClick={() => setActiveTab("terms-of-service")} className="hover:text-slate-650 hover:text-slate-600 underline">Terms</button>
                <span>•</span>
                <button onClick={() => setActiveTab("privacy-policy")} className="hover:text-slate-650 hover:text-slate-600 underline">Privacy</button>
                <span>•</span>
                <button onClick={() => alert("Basecart Platform Subscription Refund Policy\n\n1. Period: All subscriptions have a 14-day refund window.\n2. Invoices: Any paid invoices can be disputed for review.\n3. Refund Method: Approved refund credits are sent back to initial card payment sources.")} className="hover:text-slate-650 hover:text-slate-600 underline">Refunds</button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] h-full overflow-hidden">
        {/* Email Verification Banner */}
        {!emailVerified && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shrink-0 font-medium animate-fade-in select-none">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>
                <strong>Store Sandbox Mode (Offline):</strong> Check your email for your 6-digit OTP code. Verify your email to activate live storefront access.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setShowOtpModal(true);
                  setOtpError("");
                  setOtpSuccess("");
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm transition-all text-xs flex items-center gap-1 cursor-pointer"
              >
                Enter OTP Code
              </button>
              {emailVerificationResent ? (
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide text-[10px]">Email Resent!</span>
              ) : (
                <button
                  onClick={handleResendVerification}
                  className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 font-bold rounded shadow-sm transition-all text-xs cursor-pointer"
                >
                  Resend Email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-3 py-2 md:px-5 md:py-3 flex items-center gap-2 shrink-0 min-h-0">
          {/* Hamburger - mobile only */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
            title="Open menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Greeting */}
          <div className="min-w-0 mr-auto">
            <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
              {(() => {
                const h = new Date().getHours();
                const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
                return `${g}, ${settings.storeName?.split(" ")[0] || "Kiran"}! 👋`;
              })()}
            </h1>
            <p className="hidden md:block text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
              <span className="font-semibold text-[#4F46E5]">{getStorefrontDisplayUrl(settings.subdomain || "demo")}</span>
              <span className="mx-1">·</span>Here's what's happening today
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search — icon on mobile, full bar on md+ */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="hidden md:flex relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                onClick={() => setIsSearchOpen(true)}
                readOnly
                className="w-44 pl-8 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-none hover:border-[#4F46E5] transition-all"
              />
              <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <kbd className="bg-white border border-slate-200 text-slate-400 text-[9px] px-1 py-0.5 rounded font-mono shadow-sm">⌘K</kbd>
              </span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsStoreSwitcherOpen(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 relative transition-colors"
              >
                <Bell className="h-4 w-4" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#4F46E5] rounded-full" />
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    onClick={() => setIsNotificationsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/10 sm:hidden"
                  />
                  <div className="fixed inset-x-4 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fade-in select-none">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleMarkNotificationRead(n.id);
                            if (n.actionUrl === "#verify") {
                              setShowOtpModal(true);
                              setIsNotificationsOpen(false);
                            } else if (n.actionUrl && n.actionUrl.startsWith("#")) {
                              setActiveTab(n.actionUrl.replace("#", "") as any);
                              setIsNotificationsOpen(false);
                            }
                          }}
                          className={`pt-2.5 first:pt-0 cursor-pointer group ${n.read ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{n.title}</h4>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-slate-200 mx-0.5" />

            {/* Store Switcher */}
            <div className="relative">
              <div
                onClick={() => {
                  setIsStoreSwitcherOpen(!isStoreSwitcherOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-sm select-none max-w-[140px] md:max-w-none"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{settings.storeName || "My Store"}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
              </div>

              {isStoreSwitcherOpen && (
                <>
                  <div
                    onClick={() => setIsStoreSwitcherOpen(false)}
                    className="fixed inset-0 z-40 bg-black/10 sm:hidden"
                  />
                  <div className="fixed inset-x-4 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 p-3 space-y-1 animate-fade-in select-none">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Active Store</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{settings.storeName || "My Store"}</p>
                    <p className="text-[9px] text-slate-400 truncate">{getStorefrontDisplayUrl(settings.subdomain || "demo")}</p>
                  </div>

                  {merchantStores.length > 1 && (
                    <div className="pb-1">
                      <p className="px-3 text-[9px] uppercase tracking-wider text-slate-400 font-bold pt-1 pb-1">Switch Store</p>
                      {merchantStores.map((store) => (
                        <button
                          key={store.tenantId}
                          onClick={() => {
                            window.open(getStorefrontLink(store.subdomain), "_blank");
                            setIsStoreSwitcherOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors text-left ${
                            store.subdomain === settings.subdomain
                              ? "bg-indigo-50 text-[#4F46E5] font-bold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                          }`}
                        >
                          <ShoppingBag className="h-3 w-3 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{store.storeName}</div>
                            <div className="text-[9px] text-slate-400 truncate">{store.subdomain}.{STOREFRONT_DOMAIN}</div>
                          </div>
                          {store.subdomain === settings.subdomain && (
                            <span className="text-[9px] font-bold text-[#4F46E5] shrink-0">Active</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1" />
                    </div>
                  )}

                  <a
                    href={getStorefrontLink(settings.subdomain || "demo")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
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
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors text-left"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Store Link</span>
                  </button>
                </div>
              </>
            )}
            </div>

            {/* Date & Time — desktop only */}
            <div className="hidden md:flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white shadow-sm select-none">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap">
                {currentTime.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs font-semibold text-slate-500 tabular-nums whitespace-nowrap">
                {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </span>
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

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {actionError && (
            <div className="mb-6 bg-red-50 border border-red-200/80 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionError("")}
                className="text-red-400 hover:text-red-700 p-1 rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {actionSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200/80 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccess("")}
                className="text-emerald-400 hover:text-emerald-800 p-1 rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* 1. Summary View */}
          {/* 1. Summary View */}
          {activeTab === "summary" && (() => {
            const hasData = summary.totalOrders > 0;

            // --- Date range filtering ---
            const nowTime = Date.now();
            const oneDayMs = 24 * 60 * 60 * 1000;

            const rangeStart = (() => {
              const d = new Date();
              if (selectedDateRange === "Today") {
                d.setHours(0, 0, 0, 0);
                return d.getTime();
              } else if (selectedDateRange === "Yesterday") {
                d.setDate(d.getDate() - 1);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
              } else if (selectedDateRange === "Last 7 Days") {
                return nowTime - 7 * oneDayMs;
              } else if (selectedDateRange === "Last 30 Days") {
                return nowTime - 30 * oneDayMs;
              }
              return 0; // All Time
            })();

            const rangeEnd = (() => {
              if (selectedDateRange === "Yesterday") {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                return d.getTime() - 1;
              }
              return nowTime;
            })();

            const filteredOrders = orders.filter(order => {
              const t = new Date(order.createdAt).getTime();
              return t >= rangeStart && t <= rangeEnd;
            });

            // Previous period for trend comparison
            const rangeLen = rangeEnd - rangeStart || oneDayMs;
            const prevStart = rangeStart - rangeLen;
            const prevEnd = rangeStart - 1;
            const prevOrders = orders.filter(order => {
              const t = new Date(order.createdAt).getTime();
              return t >= prevStart && t <= prevEnd;
            });

            // KPI aggregates
            const isPaidStatus = (s: string) => ["paid", "shipped", "delivered"].includes(s);
            const curPaid = filteredOrders.filter(o => isPaidStatus(o.status));
            const prevPaid = prevOrders.filter(o => isPaidStatus(o.status));

            let curWeekSales = curPaid.reduce((s, o) => s + (o.total || 0), 0);
            let prevWeekSales = prevPaid.reduce((s, o) => s + (o.total || 0), 0);
            let curWeekOrders = filteredOrders.length;
            let prevWeekOrders = prevOrders.length;

            const salesVal = curWeekSales || summary.totalRevenue || 0;
            const ordersCount = curWeekOrders || summary.totalOrders || 0;
            const customersCount = customers.length || 0;
            const conversionRate = filteredOrders.length > 0
              ? ((curPaid.length / filteredOrders.length) * 100).toFixed(2) + "%"
              : hasData ? ((summary.paidOrders / summary.totalOrders) * 100).toFixed(2) + "%" : "0.00%";
            const avgOrderValue = curPaid.length > 0
              ? Math.round(curWeekSales / curPaid.length)
              : summary.paidOrders > 0 ? Math.round(summary.totalRevenue / summary.paidOrders) : 0;

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

            // Chart data — respect selected range
            const chartDays = selectedDateRange === "Today" || selectedDateRange === "Yesterday" ? 1
              : selectedDateRange === "Last 30 Days" ? 30 : 7;
            const chartData = Array.from({ length: chartDays === 1 ? 24 : chartDays }).map((_, i) => {
              if (chartDays === 1) {
                // hourly buckets for Today / Yesterday
                const hour = i;
                const base = new Date(rangeStart);
                const bucketStart = base.getTime() + hour * 60 * 60 * 1000;
                const bucketEnd = bucketStart + 60 * 60 * 1000 - 1;
                const bucketOrders = filteredOrders.filter(o => {
                  const t = new Date(o.createdAt).getTime();
                  return t >= bucketStart && t <= bucketEnd;
                });
                const paid = bucketOrders.filter(o => isPaidStatus(o.status));
                return {
                  date: `${String(hour).padStart(2, "0")}:00`,
                  revenue: paid.reduce((s, o) => s + (o.total || 0), 0),
                  orders: bucketOrders.length
                };
              } else {
                const d = new Date();
                d.setDate(d.getDate() - (chartDays - 1 - i));
                const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
                const dayOrders = filteredOrders.filter(o => {
                  const t = new Date(o.createdAt).getTime();
                  return t >= dayStart.getTime() && t <= dayEnd.getTime();
                });
                const paid = dayOrders.filter(o => isPaidStatus(o.status));
                return {
                  date: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
                  revenue: paid.reduce((s, o) => s + (o.total || 0), 0),
                  orders: dayOrders.length
                };
              }
            });



            return (
              <div className="space-y-5 animate-fade-in">

                {/* ── Date Range Timeline ── */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    {(["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "All Time"] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setSelectedDateRange(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDateRange === preset
                            ? "bg-white text-[#4F46E5] shadow-sm border border-slate-200"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {selectedDateRange === "Today" && `${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}`}
                    {selectedDateRange === "Yesterday" && (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }); })()}
                    {selectedDateRange === "Last 7 Days" && (() => { const d = new Date(); d.setDate(d.getDate()-6); return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`; })()}
                    {selectedDateRange === "Last 30 Days" && (() => { const d = new Date(); d.setDate(d.getDate()-29); return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`; })()}
                    {selectedDateRange === "All Time" && "All historical data"}
                  </p>
                </div>
                {loading ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      {/* Sales Overview — Recharts AreaChart */}
                      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                        {/* Card header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sales Overview</p>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-2xl font-bold text-slate-900">{formatINR(salesVal)}</span>
                              {salesTrendPercent !== null && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  Number(salesTrendPercent) >= 0
                                    ? "text-emerald-700 bg-emerald-50"
                                    : "text-rose-700 bg-rose-50"
                                }`}>
                                  {Number(salesTrendPercent) >= 0 ? "▲" : "▼"} {Math.abs(Number(salesTrendPercent))}%
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{selectedDateRange}</p>
                          </div>
                          <button
                            onClick={() => setActiveTab("finances")}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                          >
                            View Report
                          </button>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" />
                            <span className="text-[10px] font-semibold text-slate-500">Revenue</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" />
                            <span className="text-[10px] font-semibold text-slate-500">Orders</span>
                          </div>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 min-h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={chartData}
                              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.18} />
                                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                              />
                              <YAxis
                                yAxisId="revenue"
                                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => v === 0 ? "₹0" : `₹${(v / 1000).toFixed(0)}k`}
                              />
                              <YAxis
                                yAxisId="orders"
                                orientation="right"
                                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${v}`}
                                width={28}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  background: "#0f172a",
                                  border: "none",
                                  borderRadius: "10px",
                                  padding: "8px 12px",
                                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                                }}
                                labelStyle={{ color: "#94a3b8", fontSize: 9, fontWeight: 700, marginBottom: 4 }}
                                itemStyle={{ color: "#fff", fontSize: 10, fontWeight: 700 }}
                                formatter={(value: any, name: any) =>
                                  name === "revenue" ? [formatINR(Number(value || 0)), "Revenue"] : [value, "Orders"]
                                }
                              />
                              <Area
                                yAxisId="revenue"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4F46E5"
                                strokeWidth={2}
                                fill="url(#revenueGrad)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#4F46E5" }}
                              />
                              <Area
                                yAxisId="orders"
                                type="monotone"
                                dataKey="orders"
                                stroke="#06b6d4"
                                strokeWidth={2}
                                fill="url(#ordersGrad)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#06b6d4" }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
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
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {productsSubTab === "catalog" && "Products"}
                      {productsSubTab === "collections" && "Collections"}
                      {productsSubTab === "inventory" && "Inventory"}
                      {productsSubTab === "purchase-orders" && "Purchase Orders"}
                      {productsSubTab === "transfers" && "Transfers"}
                      {productsSubTab === "gift-cards" && "Gift Cards"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                      {productsSubTab === "catalog" && "Catalog Engine"}
                      {productsSubTab === "collections" && "Grouping Engine"}
                      {productsSubTab === "inventory" && "Stock Tracker"}
                      {productsSubTab === "purchase-orders" && "Supplier Orders"}
                      {productsSubTab === "transfers" && "Stock Moves"}
                      {productsSubTab === "gift-cards" && "Store Credit"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {productsSubTab === "catalog" && "Manage your store products, pricing margins, stock inventory, variants, and SEO listing previews"}
                    {productsSubTab === "collections" && "Group products into manual or automated collections to feature on your storefront"}
                    {productsSubTab === "inventory" && "Track real-time stock levels, update SKU quantities, and manage low-stock thresholds"}
                    {productsSubTab === "purchase-orders" && "Create supplier purchase orders, track incoming shipments, and manage receiving logs"}
                    {productsSubTab === "transfers" && "Track stock transfers between central warehouses and store fulfillment points"}
                    {productsSubTab === "gift-cards" && "Issue digital gift cards, manage customer balances, and track voucher redemptions"}
                  </p>
                </div>

                {productsSubTab === "catalog" && !productForm && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setImportError("");
                        setImportParsedProducts([]);
                        setImportRawText("");
                        setImportFileName("");
                        setIsImportModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span>Import</span>
                    </button>
                    <button
                      onClick={handleExportProductsCSV}
                      disabled={products.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>Export CSV</span>
                    </button>
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
                      className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Product
                    </button>
                  </div>
                )}

                {productsSubTab === "collections" && !collectionForm && (
                  <button
                    onClick={() => {
                      setCollectionProductSearch("");
                      setCollectionForm({ name: "", description: "", status: "Active", productIds: [] });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create Collection
                  </button>
                )}
                {productsSubTab === "collections" && collectionForm && (
                  <button
                    onClick={() => setCollectionForm(null)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Collections
                  </button>
                )}
              </div>

              {/* Product Catalog Section */}
              {productsSubTab === "catalog" && (
                <>
                  {/* Product Catalog Metrics Bar */}
                  {!productForm && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>TOTAL CATALOG</span>
                      <Package className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{products.length}</div>
                    <p className="text-[11px] text-slate-400 font-medium">All products in store</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                      <span>ACTIVE LIVE</span>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {products.filter((p) => p.status === "active").length}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Published on storefront</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                      <span>DRAFT CATALOG</span>
                      <Tag className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {products.filter((p) => p.status === "draft").length}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Hidden from search</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-red-600">
                      <span>OUT OF STOCK</span>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {products.filter((p) => (p.stockQuantity || 0) <= 0).length}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Items requiring restock</p>
                  </div>
                </div>
              )}

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
                              onChange={(e) => handleImageUpload(e, productForm.productId || "new")}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-slate-400">
                            Supports JPG, PNG, WEBP.
                          </span>
                        </div>
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
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-600">
                                SKU
                              </label>
                              <button
                                type="button"
                                onClick={handleAutoGenerateSku}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" /> Auto-generate
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="SKU-POLO-M"
                              value={productForm.sku || ""}
                              onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-600">
                                Barcode
                              </label>
                              <button
                                type="button"
                                onClick={handleAutoGenerateBarcode}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" /> Auto-generate
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="8901234567890"
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
                          <div className="border border-slate-200 rounded overflow-x-auto mt-4">
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
                      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">Search Engine Listing Preview</h3>
                            <p className="text-xs text-slate-500">Configure page meta tags showing on Google search queries.</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-wider">
                            Google SERP Preview
                          </span>
                        </div>

                        {/* Pixel-perfect Google Result Preview Mockup */}
                        <div className="p-5 border border-slate-200/80 rounded-xl bg-slate-50/50 space-y-2 select-none">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-[11px] font-bold shrink-0 border border-slate-300">
                                {(settings.storeName || "B").charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-medium text-slate-900 truncate leading-none">
                                  {settings.storeName || "Basecart Store"}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate leading-normal">
                                  https://{settings.subdomain || "demo"}.{STOREFRONT_DOMAIN} › products › {(productForm.name || "product-slug").toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                                </span>
                              </div>
                            </div>
                            <div className="text-slate-400 p-1 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </div>
                          </div>

                          <h4 className="text-[18px] font-normal text-[#1a0dab] hover:underline cursor-pointer truncate tracking-tight pt-1 leading-snug">
                            {productForm.seoTitle || productForm.name || "Product Name Display - Buy Online"}
                          </h4>

                          <p className="text-[13px] text-[#4d5156] line-clamp-2 leading-relaxed font-normal">
                            {productForm.seoDescription || (productForm.description ? productForm.description.replace(/<[^>]*>?/gm, "").trim() : "Describe your product attributes to improve search engine listing clicks and drive organic storefront traffic.")}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-600">SEO Title</label>
                              <span className={`text-[10px] font-medium ${(productForm.seoTitle?.length || 0) > 70 ? 'text-red-500 font-bold' : (productForm.seoTitle?.length || 0) > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {productForm.seoTitle?.length || 0} / 70 chars
                              </span>
                            </div>
                            <input
                              type="text"
                              maxLength={70}
                              placeholder={productForm.name || "Fall back to product title"}
                              value={productForm.seoTitle || ""}
                              onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-600">SEO Description</label>
                              <span className={`text-[10px] font-medium ${(productForm.seoDescription?.length || 0) > 160 ? 'text-red-500 font-bold' : (productForm.seoDescription?.length || 0) > 150 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {productForm.seoDescription?.length || 0} / 160 chars
                              </span>
                            </div>
                            <textarea
                              maxLength={160}
                              placeholder={productForm.description ? productForm.description.replace(/<[^>]*>?/gm, "").trim() : "Fall back to product description"}
                              value={productForm.seoDescription || ""}
                              onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-button text-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 h-20"
                            />
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

                  {/* List Table - Desktop View */}
                  <div className="hidden md:block bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
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

                  {/* List Cards - Mobile View */}
                  <div className="md:hidden space-y-4 mt-4">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="bg-white p-4 border border-slate-200 rounded-card shadow-sm space-y-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 rounded" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-2/3" />
                              <div className="h-3 bg-slate-200 rounded w-1/3" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <div className="h-5 bg-slate-200 rounded w-16" />
                            <div className="h-5 bg-slate-200 rounded w-12" />
                          </div>
                        </div>
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
                            <div key={prod.productId} className={`bg-white p-4 border rounded-card shadow-sm space-y-3 transition-colors ${isSelected ? "border-indigo-400 bg-indigo-50/10" : "border-slate-200"}`}>
                              <div className="flex items-start gap-3">
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
                                  className="rounded text-blue-600 focus:ring-blue-500 mt-1"
                                />
                                <div className="h-12 w-12 border rounded bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {prod.images && prod.images[0] ? (
                                    <img src={getOptimizedImageUrl(prod.images[0], "thumbnail")} alt={prod.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="h-6 w-6 text-slate-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 text-sm truncate">{prod.name}</h4>
                                  {prod.sku && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.sku}</p>}
                                  <p className="text-xs font-bold text-slate-800 mt-1">{formatINR(prod.price)}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold uppercase ${
                                  prod.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}>
                                  {prod.status}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded border ${totalStock <= 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                  {totalStock <= 0 ? "Out of stock" : `${totalStock} in stock`}
                                </span>
                                {prod.category && (
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-medium">
                                    {prod.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => handleEditProduct(prod)}
                                  className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteProduct(prod.productId)}
                                  className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-md hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-card p-8 text-center text-slate-400 text-xs shadow-sm">
                        No products found matching filters.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRODUCT IMPORT MODAL (CSV / JSON) */}
              {isImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Import Catalog Products</h3>
                          <p className="text-xs text-slate-400 font-medium">Batch upload products into your store catalog via CSV or JSON file</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsImportModalOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                      {/* Format & Mode Selection Tabs */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setImportFormat("csv");
                              if (importRawText) handleProcessImportContent(importRawText, "csv");
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              importFormat === "csv" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            CSV Format
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImportFormat("json");
                              if (importRawText) handleProcessImportContent(importRawText, "json");
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              importFormat === "json" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            JSON Format
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setImportInputMethod("file")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              importInputMethod === "file" ? "bg-slate-200 text-slate-800 font-bold" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportInputMethod("paste")}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              importInputMethod === "paste" ? "bg-slate-200 text-slate-800 font-bold" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Paste Raw Code
                          </button>
                        </div>
                      </div>

                      {/* Upload or Paste Input Area */}
                      {importInputMethod === "file" ? (
                        <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 text-center space-y-3 transition-colors">
                          <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {importFileName ? `Selected: ${importFileName}` : `Click to browse or drop your ${importFormat.toUpperCase()} file here`}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Supports .csv or .json files containing product title, price, stock, sku & details
                            </p>
                          </div>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer">
                            <span>Choose File</span>
                            <input
                              type="file"
                              accept={importFormat === "csv" ? ".csv,text/csv" : ".json,application/json"}
                              onChange={handleImportFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Paste Raw {importFormat.toUpperCase()} Code
                            </label>
                            <button
                              type="button"
                              onClick={() => handleDownloadSampleTemplate(importFormat)}
                              className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" /> Sample Template
                            </button>
                          </div>
                          <textarea
                            rows={6}
                            placeholder={
                              importFormat === "csv"
                                ? 'Name,Price,StockQuantity,SKU,Category,Status\n"Canvas Sneakers",1899,25,"SKU-001","Footwear","active"'
                                : '[\n  {\n    "name": "Canvas Sneakers",\n    "price": 1899,\n    "stockQuantity": 25,\n    "sku": "SKU-001"\n  }\n]'
                            }
                            value={importRawText}
                            onChange={(e) => {
                              const text = e.target.value;
                              setImportRawText(text);
                              if (text.trim()) {
                                handleProcessImportContent(text, importFormat);
                              } else {
                                setImportParsedProducts([]);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Download Sample Link Bar */}
                      {importInputMethod === "file" && (
                        <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs">
                          <span className="text-slate-600 font-medium">Need a sample file structure to get started?</span>
                          <button
                            type="button"
                            onClick={() => handleDownloadSampleTemplate(importFormat)}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <Download className="h-3.5 w-3.5 text-indigo-600" />
                            Download Sample {importFormat.toUpperCase()}
                          </button>
                        </div>
                      )}

                      {/* Error Message */}
                      {importError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>{importError}</span>
                        </div>
                      )}

                      {/* Parsed Preview Table */}
                      {importParsedProducts.length > 0 && (
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Preview Parsed Items ({importParsedProducts.length})
                            </span>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Ready for Import
                            </span>
                          </div>

                          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                  <th className="px-3 py-2">Product Name</th>
                                  <th className="px-3 py-2">Price</th>
                                  <th className="px-3 py-2">Stock</th>
                                  <th className="px-3 py-2">SKU</th>
                                  <th className="px-3 py-2">Category</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {importParsedProducts.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-white">
                                    <td className="px-3 py-2 font-bold text-slate-900">{p.name}</td>
                                    <td className="px-3 py-2 font-semibold text-slate-800">₹{p.price}</td>
                                    <td className="px-3 py-2">{p.stockQuantity}</td>
                                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{p.sku}</td>
                                    <td className="px-3 py-2 text-slate-600">{p.category}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(false)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={importingBatch || importParsedProducts.length === 0}
                        onClick={handleExecuteBatchImport}
                        className="flex items-center gap-2 px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {importingBatch && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>{importingBatch ? "Importing..." : `Import ${importParsedProducts.length} Product(s)`}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

              {/* 2. COLLECTIONS SUB-PAGE */}
              {productsSubTab === "collections" && (
                <div className="animate-fade-in select-none">
                  {collectionForm ? (
                    /* FULL-PAGE INLINE COLLECTION EDITOR FORM (Matching Product Adding View) */
                    <div className="space-y-6">
                      {/* Top Action Header Bar */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCollectionForm(null)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                              {collectionForm.id ? `Edit Collection: ${collectionForm.name}` : "Create Storefront Collection"}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                              Define collection details, set storefront status, and assign store items
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCollectionForm(null)}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!collectionForm.name) return;
                              try {
                                const payload = {
                                  ...collectionForm,
                                  productCount: (collectionForm.productIds || []).length,
                                };
                                const res = await fetch(`${API_URL}/collections`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  credentials: "include",
                                  body: JSON.stringify(payload),
                                });
                                if (res.ok) {
                                  setActionSuccess("Collection saved to database successfully!");
                                  fetchDashboardData();
                                }
                              } catch (err: any) {
                                setActionError(err.message);
                              }
                              setCollectionForm(null);
                            }}
                            className="flex items-center gap-2 px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Save className="h-4 w-4" /> Save Collection
                          </button>
                        </div>
                      </div>

                      {/* Main Two-Column Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Columns: General Info & Product Selector */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Card 1: Collection Title & Description */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                              <h4 className="text-sm font-extrabold text-slate-900">General Information</h4>
                              <p className="text-xs text-slate-400 font-medium">Title and description used on your storefront navigation</p>
                            </div>

                            <div>
                              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                Collection Title *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Summer Footwear Drops"
                                value={collectionForm.name}
                                onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                Description
                              </label>
                              <textarea
                                rows={4}
                                placeholder="Add collection description for storefront SEO, category hero text, and buyer guidance..."
                                value={collectionForm.description}
                                onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Card 2: Store Items / Product Selector */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900">Assign Store Items</h4>
                                <p className="text-xs text-slate-400 font-medium">Select products to include in this storefront collection</p>
                              </div>
                              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                {(collectionForm.productIds || []).length} Selected
                              </span>
                            </div>

                            {/* Search & Bulk Select Controls */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search store items by title or category..."
                                  value={collectionProductSearch}
                                  onChange={(e) => setCollectionProductSearch(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allIds = products.map((p) => p.productId);
                                    setCollectionForm({ ...collectionForm, productIds: allIds });
                                  }}
                                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                >
                                  Select All ({products.length})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCollectionForm({ ...collectionForm, productIds: [] });
                                  }}
                                  className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                                >
                                  Clear Selection
                                </button>
                              </div>
                            </div>

                            {/* Products Scrollable List */}
                            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50 p-2">
                              {products.filter((p) =>
                                p.name.toLowerCase().includes(collectionProductSearch.toLowerCase()) ||
                                (p.category && p.category.toLowerCase().includes(collectionProductSearch.toLowerCase()))
                              ).length === 0 ? (
                                <div className="py-10 text-center text-xs text-slate-400 font-semibold">
                                  No store items matching search query.
                                </div>
                              ) : (
                                products.filter((p) =>
                                  p.name.toLowerCase().includes(collectionProductSearch.toLowerCase()) ||
                                  (p.category && p.category.toLowerCase().includes(collectionProductSearch.toLowerCase()))
                                ).map((prod) => {
                                  const isSelected = (collectionForm.productIds || []).includes(prod.productId);
                                  return (
                                    <label
                                      key={prod.productId}
                                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                                        isSelected ? "bg-indigo-50/90 border border-indigo-200" : "hover:bg-white"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const currentIds = collectionForm.productIds || [];
                                            const nextIds = e.target.checked
                                              ? [...currentIds, prod.productId]
                                              : currentIds.filter((id: string) => id !== prod.productId);
                                            setCollectionForm({ ...collectionForm, productIds: nextIds });
                                          }}
                                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                          {prod.images?.[0] ? (
                                            <img src={getOptimizedImageUrl(prod.images[0], "thumbnail")} alt={prod.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <Package className="h-5 w-5 text-slate-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-extrabold text-slate-900 truncate">{prod.name}</p>
                                          <p className="text-[11px] text-slate-400 font-medium">
                                            {prod.category || "General"} · Stock: {prod.stockQuantity}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-xs font-black text-slate-900 shrink-0 ml-2">
                                        ₹{prod.price}
                                      </span>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right 1 Column: Status & Type Settings */}
                        <div className="space-y-6">
                          {/* Card 1: Status & Visibility */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Status & Visibility</h4>
                            <div>
                              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                                Publishing Status
                              </label>
                              <select
                                value={collectionForm.status}
                                onChange={(e) => setCollectionForm({ ...collectionForm, status: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                              >
                                <option value="Active">Active (Published Live)</option>
                                <option value="Draft">Draft (Hidden from Navigation)</option>
                              </select>
                            </div>
                          </div>

                          {/* Card 2: Collection Rule Type */}
                          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h4 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Collection Rule Type</h4>
                            <div className="space-y-3">
                              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <input
                                  type="radio"
                                  name="collectionType"
                                  checked={!collectionForm.isAutomated}
                                  onChange={() => setCollectionForm({ ...collectionForm, isAutomated: false })}
                                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <span className="text-xs font-bold text-slate-900 block">Manual Selection</span>
                                  <span className="text-[11px] text-slate-400 block">Add products to this collection item by item</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                <input
                                  type="radio"
                                  name="collectionType"
                                  checked={!!collectionForm.isAutomated}
                                  onChange={() => setCollectionForm({ ...collectionForm, isAutomated: true })}
                                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div>
                                  <span className="text-xs font-bold text-slate-900 block">Automated Rule</span>
                                  <span className="text-[11px] text-slate-400 block">Auto-match products matching title or category tags</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LIST VIEW OF COLLECTIONS */
                    <div className="space-y-6">
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Collections</span>
                            <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Layers className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-slate-900 tracking-tight">{collections.length}</div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Storefront Categories</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active Live</span>
                            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-slate-900 tracking-tight">
                              {collections.filter((c) => c.status === "Active").length}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Published</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Automated Rules</span>
                            <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Sparkles className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-slate-900 tracking-tight">
                              {collections.filter((c) => c.isAutomated).length}
                            </div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Auto-Tagged</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Manual Selections</span>
                            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                              <Tag className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-black text-slate-900 tracking-tight">
                              {collections.filter((c) => !c.isAutomated).length}
                            </div>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Custom Lists</span>
                          </div>
                        </div>
                      </div>

                      {/* Search & Category Type Filter Toolbar */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-1 items-center gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search collection title or description..."
                              value={collectionSearchQuery}
                              onChange={(e) => setCollectionSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                            />
                          </div>
                          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 shrink-0">
                            <button
                              onClick={() => setCollectionTypeFilter("all")}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                collectionTypeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              All ({collections.length})
                            </button>
                            <button
                              onClick={() => setCollectionTypeFilter("active")}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                collectionTypeFilter === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Active
                            </button>
                            <button
                              onClick={() => setCollectionTypeFilter("automated")}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                collectionTypeFilter === "automated" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Automated
                            </button>
                            <button
                              onClick={() => setCollectionTypeFilter("manual")}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                collectionTypeFilter === "manual" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              Manual
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Collections List Table / Empty State */}
                      {(() => {
                        const filteredCollections = collections.filter((c) => {
                          const matchesSearch =
                            c.name.toLowerCase().includes(collectionSearchQuery.toLowerCase()) ||
                            (c.description && c.description.toLowerCase().includes(collectionSearchQuery.toLowerCase()));
                          if (!matchesSearch) return false;
                          if (collectionTypeFilter === "active") return c.status === "Active";
                          if (collectionTypeFilter === "automated") return c.isAutomated;
                          if (collectionTypeFilter === "manual") return !c.isAutomated;
                          return true;
                        });

                        if (filteredCollections.length === 0) {
                          return (
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-4">
                              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                                <Layers className="h-6 w-6" />
                              </div>
                              <div className="max-w-md mx-auto space-y-1">
                                <h3 className="text-base font-extrabold text-slate-900">No Storefront Collections Found</h3>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                  Group products into manual or automated collections to feature on your storefront navigation and home page.
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setCollectionProductSearch("");
                                  setCollectionForm({ name: "", description: "", status: "Active", productIds: [] });
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                              >
                                <Plus className="h-4 w-4" /> Create First Collection
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                              <thead className="bg-slate-50/80 font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">
                                <tr>
                                  <th className="px-6 py-3.5">Collection Title</th>
                                  <th className="px-6 py-3.5">Condition Type</th>
                                  <th className="px-6 py-3.5">Assigned Items</th>
                                  <th className="px-6 py-3.5">Status</th>
                                  <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {filteredCollections.map((col) => (
                                  <tr key={col.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
                                          <Layers className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                          <div className="font-extrabold text-slate-900 text-sm truncate">{col.name}</div>
                                          <div className="text-xs text-slate-400 truncate max-w-xs">{col.description || "No description set"}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      {col.isAutomated ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-lg text-[11px] font-extrabold">
                                          <Sparkles className="h-3 w-3 text-indigo-600" /> Automated
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg text-[11px] font-extrabold">
                                          <Tag className="h-3 w-3 text-amber-600" /> Manual Group
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 text-slate-800 rounded-lg text-xs font-bold border border-slate-200/70">
                                        <Package className="h-3.5 w-3.5 text-slate-500" />
                                        <span>{col.productCount || 0} Products</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        col.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${col.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                                        {col.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                      <button
                                        onClick={() => {
                                          setCollectionProductSearch("");
                                          setCollectionForm({ ...col, productIds: col.productIds || [] });
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            await fetch(`${API_URL}/collections/${col.id}`, {
                                              method: "DELETE",
                                              headers: { Authorization: `Bearer ${token}` },
                                              credentials: "include",
                                            });
                                          } catch (e) {}
                                          setCollections(collections.filter((c) => c.id !== col.id));
                                        }}
                                        className="px-3 py-1.5 text-xs font-bold border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* 3. INVENTORY SUB-PAGE */}
              {productsSubTab === "inventory" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>TOTAL SKUs</span>
                        <Warehouse className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{products.length}</div>
                      <p className="text-[11px] text-slate-400 font-medium">Tracked catalog products</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                        <span>IN STOCK UNITS</span>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {products.reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0)}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Available in warehouse</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-600">
                        <span>LOW STOCK ALERT</span>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {products.filter((p) => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5).length}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">≤ 5 units remaining</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-600">
                        <span>OUT OF STOCK</span>
                        <X className="h-4 w-4 text-rose-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {products.filter((p) => (p.stockQuantity || 0) <= 0).length}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Needs reordering</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">Product Item</th>
                          <th className="px-6 py-3.5">SKU / Code</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5 text-center">Available Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {products.map((prod) => {
                          const stock = prod.stockQuantity || 0;
                          return (
                            <tr key={prod.productId} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={getOptimizedImageUrl(prod.images?.[0] || "", "thumbnail")}
                                    alt={prod.name}
                                    className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{prod.name}</div>
                                    <div className="text-xs text-slate-500">{prod.category || "Uncategorized"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-slate-700 text-xs">
                                {prod.sku || "NO-SKU"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                  stock <= 0
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : stock <= 5
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}>
                                  {stock <= 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      const updated = Math.max(0, stock - 1);
                                      setProducts(products.map((p) => (p.productId === prod.productId ? { ...p, stockQuantity: updated } : p)));
                                    }}
                                    className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setProducts(products.map((p) => (p.productId === prod.productId ? { ...p, stockQuantity: val } : p)));
                                    }}
                                    className="w-16 text-center py-1 border border-slate-300 rounded-lg text-sm font-bold font-mono text-slate-900"
                                  />
                                  <button
                                    onClick={() => {
                                      setProducts(products.map((p) => (p.productId === prod.productId ? { ...p, stockQuantity: stock + 1 } : p)));
                                    }}
                                    className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. PURCHASE ORDERS SUB-PAGE */}
              {productsSubTab === "purchase-orders" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">PO Reference</th>
                          <th className="px-6 py-3.5">Supplier / Vendor</th>
                          <th className="px-6 py-3.5">Expected Date</th>
                          <th className="px-6 py-3.5">Total Value</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {purchaseOrders.map((po) => (
                          <tr key={po.poNumber} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">{po.poNumber}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{po.vendor}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-600">{po.expectedDate}</td>
                            <td className="px-6 py-4 font-black text-slate-900">{formatINR(po.totalAmount)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                po.status === "Ordered" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-600"
                              }`}>
                                {po.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. TRANSFERS SUB-PAGE */}
              {productsSubTab === "transfers" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-8 border border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
                    <ArrowRightLeft className="h-10 w-10 text-indigo-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">Multi-Warehouse Inventory Transfers</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Move product stock between central fulfillment centers, retail store branches, and online store inventories.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. GIFT CARDS SUB-PAGE */}
              {productsSubTab === "gift-cards" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50 font-bold text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5">Voucher Code</th>
                          <th className="px-6 py-3.5">Recipient Email</th>
                          <th className="px-6 py-3.5">Initial Value</th>
                          <th className="px-6 py-3.5">Remaining Balance</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {giftCards.map((gc) => (
                          <tr key={gc.code} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-black text-slate-900">{gc.code}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{gc.customerEmail}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{formatINR(gc.initialValue)}</td>
                            <td className="px-6 py-4 font-black text-emerald-700">{formatINR(gc.balance)}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {gc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab (Shopify Standard Layout) */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-fade-in">
              {/* NEW CUSTOMER FORM (MATCHING SCREENSHOT 3) */}
              {customerForm ? (
                <div className="space-y-6">
                  {/* Top Breadcrumb & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                      <button
                        onClick={() => setCustomerForm(null)}
                        className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>Customers</span>
                      </button>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-bold text-slate-900">
                        {customerForm.customerId ? `${customerForm.firstName || ""} ${customerForm.lastName || ""}`.trim() || customerForm.email : "New customer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomerForm(null)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!customerForm.email && !customerForm.firstName) return;
                          try {
                            const res = await fetch(`${API_URL}/customers`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              credentials: "include",
                              body: JSON.stringify(customerForm),
                            });
                            if (res.ok) {
                              setActionSuccess("Customer saved to database successfully!");
                              fetchDashboardData();
                            } else {
                              const errData = await res.json();
                              setActionError(errData.error || "Failed to save customer");
                            }
                          } catch (err: any) {
                            setActionError(err.message);
                          }
                          setCustomerForm(null);
                        }}
                        className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Main Column (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Card 1: Customer Overview */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Customer overview</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">First name</label>
                            <input
                              type="text"
                              value={customerForm.firstName || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Last name</label>
                            <input
                              type="text"
                              value={customerForm.lastName || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Language</label>
                          <select
                            value={customerForm.language || "English [Default]"}
                            onChange={(e) => setCustomerForm({ ...customerForm, language: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          >
                            <option value="English [Default]">English [Default]</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                          </select>
                          <p className="text-[11px] text-slate-400 mt-1 font-medium">This customer will receive notifications in this language.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={customerForm.email || ""}
                            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Phone number</label>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs font-bold shrink-0">
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </div>
                            <input
                              type="tel"
                              placeholder="98765 43210"
                              value={customerForm.phone || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customerForm.acceptsEmailMarketing || false}
                              onChange={(e) => setCustomerForm({ ...customerForm, acceptsEmailMarketing: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>Customer agreed to receive marketing emails.</span>
                          </label>

                          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customerForm.acceptsSmsMarketing || false}
                              onChange={(e) => setCustomerForm({ ...customerForm, acceptsSmsMarketing: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>Customer agreed to receive SMS marketing text messages.</span>
                          </label>

                          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customerForm.acceptsWhatsAppMarketing || false}
                              onChange={(e) => setCustomerForm({ ...customerForm, acceptsWhatsAppMarketing: e.target.checked })}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>Customer agreed to receive WhatsApp marketing messages.</span>
                          </label>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 font-medium leading-relaxed">
                          You should ask your customers for permission before you subscribe them to your marketing emails or SMS.
                        </div>
                      </div>

                      {/* Card 2: Default Address */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Default address</h3>
                          <p className="text-xs text-slate-400 mt-0.5">The primary address of this customer</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                            <input
                              type="text"
                              value={customerForm.company || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Address 1</label>
                            <input
                              type="text"
                              value={customerForm.address1 || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, address1: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Address 2</label>
                            <input
                              type="text"
                              value={customerForm.address2 || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, address2: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                            <input
                              type="text"
                              value={customerForm.city || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Province / State Code</label>
                            <input
                              type="text"
                              placeholder="e.g. MH, KA, DL"
                              value={customerForm.provinceCode || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, provinceCode: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">ZIP / Postal Code</label>
                            <input
                              type="text"
                              value={customerForm.zip || ""}
                              onChange={(e) => setCustomerForm({ ...customerForm, zip: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Tax Details */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Tax details</h3>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tax settings</label>
                          <select
                            value={customerForm.taxSettings || "Collect tax"}
                            onChange={(e) => setCustomerForm({ ...customerForm, taxSettings: e.target.value, taxExempt: e.target.value === "Exempt from tax" })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          >
                            <option value="Collect tax">Collect tax</option>
                            <option value="Exempt from tax">Exempt from tax</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar Column (1 Col) */}
                    <div className="space-y-6">
                      {/* Notes Card */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notes</h4>
                          <Edit className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Notes are private and won't be shared with the customer."
                          value={customerForm.note || ""}
                          onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>

                      {/* Tags Card */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tags</h4>
                          <Edit className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="VIP, Wholesale, Retail"
                          value={customerForm.tags || ""}
                          onChange={(e) => setCustomerForm({ ...customerForm, tags: e.target.value })}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* MAIN CUSTOMERS SUB-VIEWS */
                <div className="space-y-6">
                  {/* 1. CUSTOMERS LIST SUB-VIEW (MATCHING SCREENSHOT 1) */}
                  {customersSubTab === "list" && (
                    <div className="space-y-4">
                      {/* Top Action Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-slate-700" />
                          <h2 className="text-xl font-bold tracking-tight text-slate-900">Customers</h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleExportCustomersCSV}
                            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => setIsImportCustomerModalOpen(true)}
                            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                          >
                            Import
                          </button>
                          <button
                            onClick={() =>
                              setCustomerForm({
                                firstName: "",
                                lastName: "",
                                email: "",
                                phone: "",
                                language: "English [Default]",
                                acceptsEmailMarketing: false,
                                acceptsSmsMarketing: false,
                                acceptsWhatsAppMarketing: false,
                                company: "",
                                address1: "",
                                address2: "",
                                city: "",
                                provinceCode: "",
                                countryCode: "IN",
                                zip: "",
                                addressPhone: "",
                                tags: "",
                                note: "",
                                taxExempt: false,
                                taxSettings: "Collect tax",
                              })
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                          >
                            Add customer
                          </button>
                        </div>
                      </div>

                      {/* Active Segment Filter Banner */}
                      {activeSegmentId && (
                        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fade-in">
                          <div className="flex items-center gap-2 text-indigo-900 font-bold">
                            <Tag className="h-4 w-4 text-indigo-600" />
                            <span>Active Segment Filter: {customerSegments.find((s) => s.id === activeSegmentId)?.name || "Segment"}</span>
                            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                              {customers.filter((c) => {
                                if (activeSegmentId === "seg-1") return (c.ordersCount || 0) > 0;
                                if (activeSegmentId === "seg-2") return Boolean(c.acceptsEmailMarketing);
                                if (activeSegmentId === "seg-3") return (c.ordersCount || 0) === 0;
                                if (activeSegmentId === "seg-4") return (c.ordersCount || 0) > 1;
                                if (activeSegmentId === "seg-5") return (c.ordersCount || 0) === 0;
                                return true;
                              }).length} customers
                            </span>
                          </div>
                          <button
                            onClick={() => setActiveSegmentId(null)}
                            className="text-indigo-700 hover:text-indigo-950 font-bold underline flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Clear Filter</span>
                          </button>
                        </div>
                      )}

                      {/* Search Customers Bar */}
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search customers"
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border-none text-slate-900 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Customers Table */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50/80 font-bold text-slate-600 text-xs tracking-wider">
                            <tr>
                              <th className="px-4 py-3.5 w-10">
                                <input type="checkbox" className="rounded border-slate-300 text-slate-900 h-4 w-4" />
                              </th>
                              <th className="px-6 py-3.5">Customer name</th>
                              <th className="px-6 py-3.5 text-center">Email subscription</th>
                              <th className="px-6 py-3.5">Location</th>
                              <th className="px-6 py-3.5 text-center">Orders</th>
                              <th className="px-6 py-3.5 text-right">Amount spent</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {customers
                              .filter((c) => {
                                const q = customerSearchQuery.toLowerCase();
                                const matchesSearch =
                                  c.email?.toLowerCase().includes(q) ||
                                  c.name?.toLowerCase().includes(q) ||
                                  c.firstName?.toLowerCase().includes(q) ||
                                  c.lastName?.toLowerCase().includes(q);

                                if (!matchesSearch) return false;

                                if (activeSegmentId === "seg-1") return (c.ordersCount || 0) > 0;
                                if (activeSegmentId === "seg-2") return Boolean(c.acceptsEmailMarketing);
                                if (activeSegmentId === "seg-3") return (c.ordersCount || 0) === 0;
                                if (activeSegmentId === "seg-4") return (c.ordersCount || 0) > 1;
                                if (activeSegmentId === "seg-5") return (c.ordersCount || 0) === 0;

                                return true;
                              })
                              .map((cust) => (
                                <tr key={cust.customerId} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-4">
                                    <input type="checkbox" className="rounded border-slate-300 text-slate-900 h-4 w-4" />
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => setCustomerForm({ ...cust })}
                                      className="font-bold text-slate-900 text-sm hover:underline cursor-pointer text-left"
                                    >
                                      {cust.email || cust.name || `${cust.firstName} ${cust.lastName}`}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        cust.acceptsEmailMarketing
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                      }`}
                                    >
                                      {cust.acceptsEmailMarketing ? "Subscribed" : "Not subscribed"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                    {cust.location || "-"}
                                  </td>
                                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-800">
                                    {cust.ordersCount || 0}
                                  </td>
                                  <td className="px-6 py-4 text-right font-mono font-black text-slate-900">
                                    {formatINR(cust.totalSpent || 0)}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-center pt-4">
                        <a href="#learn-customers" className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline">
                          Learn more about customers
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 2. SEGMENTS SUB-VIEW (MATCHING SCREENSHOT 2) */}
                  {customersSubTab === "segments" && (
                    <div className="space-y-4">
                      {/* Top Action Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-slate-700" />
                          <h2 className="text-xl font-bold tracking-tight text-slate-900">Segments</h2>
                        </div>

                        <button
                          onClick={() => setCustomerSegments([...customerSegments, { id: `seg-${Date.now()}`, name: "New Custom Segment", lastActivity: "Created today", createdBy: "Merchant" }])}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                          Create segment
                        </button>
                      </div>

                      {/* Search Segments Bar */}
                      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search segments"
                            value={segmentSearchQuery}
                            onChange={(e) => setSegmentSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 border-none text-slate-900 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Segments Table */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50/80 font-bold text-slate-600 text-xs tracking-wider">
                            <tr>
                              <th className="px-4 py-3.5 w-10">
                                <input type="checkbox" className="rounded border-slate-300 text-slate-900 h-4 w-4" />
                              </th>
                              <th className="px-6 py-3.5">Name</th>
                              <th className="px-6 py-3.5 text-right">% of customers</th>
                              <th className="px-6 py-3.5">Last activity</th>
                              <th className="px-6 py-3.5">Created by</th>
                              <th className="px-4 py-3.5 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {customerSegments
                              .filter((s) => s.name.toLowerCase().includes(segmentSearchQuery.toLowerCase()))
                              .map((seg) => {
                                const total = customers.length;
                                let percent = "0%";
                                if (total > 0) {
                                  if (seg.id === "seg-1") {
                                    percent = `${Math.round((customers.filter((c) => (c.ordersCount || 0) > 0).length / total) * 100)}%`;
                                  } else if (seg.id === "seg-2") {
                                    percent = `${Math.round((customers.filter((c) => c.acceptsEmailMarketing).length / total) * 100)}%`;
                                  } else if (seg.id === "seg-3") {
                                    percent = `${Math.round((customers.filter((c) => (c.ordersCount || 0) === 0).length / total) * 100)}%`;
                                  } else if (seg.id === "seg-4") {
                                    percent = `${Math.round((customers.filter((c) => (c.ordersCount || 0) > 1).length / total) * 100)}%`;
                                  } else if (seg.id === "seg-5") {
                                    percent = `${Math.round((customers.filter((c) => (c.ordersCount || 0) === 0).length / total) * 100)}%`;
                                  } else {
                                    percent = seg.percent || "0%";
                                  }
                                }

                                return (
                                  <tr
                                    key={seg.id}
                                    onClick={() => {
                                      setActiveSegmentId(seg.id);
                                      setCustomersSubTab("list");
                                    }}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                      <input type="checkbox" className="rounded border-slate-300 text-slate-900 h-4 w-4" />
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                      {seg.name}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                                      {percent}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                                      {seg.lastActivity}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-600">
                                        {seg.createdBy || "System"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-center pt-4">
                        <a href="#learn-segments" className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline">
                          Learn more about segments
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 3. COMPANIES SUB-VIEW */}
                  {customersSubTab === "companies" && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Companies</h2>
                      </div>

                      <div className="bg-white p-12 border border-slate-200 rounded-2xl text-center space-y-4 shadow-2xs">
                        <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                          <Building className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-900">B2B Companies & Wholesale Accounts</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                            This feature will be added soon. You will be able to manage corporate accounts, custom pricing lists, and wholesale business catalogs.
                          </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                          ● Feature will be added soon
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IMPORT CUSTOMERS CSV MODAL */}
              {isImportCustomerModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-5 border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Import Customers by CSV</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Upload a CSV file formatted with Shopify customer headers.</p>
                      </div>
                      <button onClick={() => setIsImportCustomerModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
                        <div className="font-bold text-slate-900 font-sans">Supported Header Columns:</div>
                        <div className="text-[11px] text-slate-500 leading-normal">
                          First Name, Last Name, Email, Accepts Email Marketing, Default Address Company, Default Address Address1, Default Address Address2, Default Address City, Default Address Province Code, Default Address Country Code, Default Address Zip, Default Address Phone, Phone, Accepts SMS Marketing, Accepts WhatsApp Marketing, Tags, Note, Tax Exempt
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Upload CSV File or Paste Raw CSV
                        </label>
                        <textarea
                          rows={6}
                          placeholder={`First Name,Last Name,Email,Accepts Email Marketing,Phone\nJohn,Doe,john@example.com,yes,+919876543210`}
                          value={importCsvText}
                          onChange={(e) => setImportCsvText(e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsvTemplate}
                        className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-bold cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Sample CSV Template</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsImportCustomerModalOpen(false)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!importCsvText.trim() || importingCsvLoading}
                          onClick={async () => {
                            if (!importCsvText.trim()) return;
                            setImportingCsvLoading(true);
                            try {
                              const parseCustomerCsv = (csvText: string) => {
                                const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
                                if (lines.length <= 1) return [];
                                const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
                                const parsedCustomers = [];
                                for (let i = 1; i < lines.length; i++) {
                                  const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
                                  const matches: string[] = [];
                                  let match: RegExpExecArray | null;
                                  while ((match = regex.exec(lines[i])) !== null) {
                                    let val = match[1] ? match[1].replace(/^"|"$/g, "").replace(/""/g, '"') : "";
                                    matches.push(val);
                                    if (regex.lastIndex === lines[i].length) break;
                                  }
                                  if (matches.length < 3) continue;
                                  const row: Record<string, string> = {};
                                  headers.forEach((h, idx) => {
                                    row[h] = matches[idx] || "";
                                  });
                                  const firstName = row["First Name"] || "";
                                  const lastName = row["Last Name"] || "";
                                  const email = row["Email"] || "";
                                  const phone = row["Phone"] || row["Default Address Phone"] || "";
                                  const acceptsEmail = (row["Accepts Email Marketing"] || "").toLowerCase() === "yes" || (row["Accepts Email Marketing"] || "").toLowerCase() === "true";
                                  const acceptsSms = (row["Accepts SMS Marketing"] || "").toLowerCase() === "yes" || (row["Accepts SMS Marketing"] || "").toLowerCase() === "true";
                                  const acceptsWhatsApp = (row["Accepts WhatsApp Marketing"] || "").toLowerCase() === "yes" || (row["Accepts WhatsApp Marketing"] || "").toLowerCase() === "true";
                                  const taxExempt = (row["Tax Exempt"] || "").toLowerCase() === "yes" || (row["Tax Exempt"] || "").toLowerCase() === "true";
                                  if (email || firstName || lastName) {
                                    parsedCustomers.push({
                                      customerId: `cust-csv-${Date.now()}-${i}`,
                                      name: `${firstName} ${lastName}`.trim() || email,
                                      firstName,
                                      lastName,
                                      email,
                                      phone,
                                      acceptsEmailMarketing: acceptsEmail,
                                      acceptsSmsMarketing: acceptsSms,
                                      acceptsWhatsAppMarketing: acceptsWhatsApp,
                                      company: row["Default Address Company"] || "",
                                      address1: row["Default Address Address1"] || "",
                                      address2: row["Default Address Address2"] || "",
                                      city: row["Default Address City"] || "",
                                      provinceCode: row["Default Address Province Code"] || "",
                                      countryCode: row["Default Address Country Code"] || "IN",
                                      zip: row["Default Address Zip"] || "",
                                      addressPhone: row["Default Address Phone"] || "",
                                      tags: row["Tags"] || "",
                                      note: row["Note"] || "",
                                      taxExempt,
                                      taxSettings: taxExempt ? "Exempt from tax" : "Collect tax",
                                      totalSpent: 0,
                                      ordersCount: 0,
                                      createdAt: new Date().toISOString(),
                                    });
                                  }
                                }
                                return parsedCustomers;
                              };
                              const parsed = parseCustomerCsv(importCsvText);
                              if (parsed.length > 0) {
                                const res = await fetch(`${API_URL}/customers/bulk`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  credentials: "include",
                                  body: JSON.stringify({ customers: parsed }),
                                });
                                if (res.ok) {
                                  const resData = await res.json();
                                  setActionSuccess(`Successfully imported ${resData.count || parsed.length} customers to database!`);
                                  fetchDashboardData();
                                } else {
                                  const errData = await res.json();
                                  setActionError(errData.error || "Failed importing CSV to database");
                                }
                              }
                            } catch (err: any) {
                              setActionError(err.message);
                            } finally {
                              setImportingCsvLoading(false);
                              setIsImportCustomerModalOpen(false);
                              setImportCsvText("");
                            }
                          }}
                          className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          {importingCsvLoading ? "Importing..." : "Import Customers"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTENT TAB (REDESIGNED FULL-PAGE EDITORS) */}
          {activeTab === "content" && (
            <div className="space-y-6 animate-fade-in">
              {/* 1. MENUS SUB-VIEW */}
              {contentSubTab === "menus" && !menuForm && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Menu className="h-5 w-5 text-slate-700" />
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Menus</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActionSuccess("URL Redirects manager opened")}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
                      >
                        URL redirects
                      </button>
                      <button
                        onClick={() => setMenuForm({ name: "", items: "Home, Catalog, Contact" })}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Create menu
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50/80 font-bold text-slate-600 text-xs tracking-wider">
                        <tr>
                          <th className="px-6 py-3.5 flex items-center gap-1.5">
                            <span>Menu</span>
                            <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400" />
                          </th>
                          <th className="px-6 py-3.5">Menu items</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {menus.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                              <button
                                onClick={() => setMenuForm({ ...m, items: Array.isArray(m.items) ? m.items.join(", ") : m.items })}
                                className="hover:underline text-indigo-600 font-bold text-left cursor-pointer"
                              >
                                {m.name}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                              {Array.isArray(m.items) ? m.items.join(", ") : m.items}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MENU EDITOR FULL-PAGE VIEW */}
              {contentSubTab === "menus" && menuForm && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setMenuForm(null)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                      </button>
                      <h2 className="text-lg font-bold text-slate-900">
                        {menuForm.id ? `Edit Menu: ${menuForm.name}` : "Create Navigation Menu"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setMenuForm(null)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!menuForm.name) return;
                          try {
                            const itemsArr = menuForm.items.split(",").map((s) => s.trim()).filter(Boolean);
                            const res = await fetch(`${API_URL}/store/menus`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              credentials: "include",
                              body: JSON.stringify({ ...menuForm, items: itemsArr }),
                            });
                            if (res.ok) {
                              setActionSuccess("Navigation menu saved to storefront database!");
                              fetchDashboardData();
                            }
                          } catch (err: any) {
                            setActionError(err.message);
                          }
                          setMenuForm(null);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                      >
                        Save Menu
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Menu Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Main menu"
                          value={menuForm.name}
                          onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-sm font-bold text-slate-900">Menu items</h3>
                          <span className="text-xs font-semibold text-slate-500">Live Storefront Links</span>
                        </div>

                        <div className="space-y-3">
                          {menuForm.items.split(",").map((itemStr, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                              <div className="flex items-center gap-3">
                                <div className="p-1 text-slate-400">
                                  <MoreVertical className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">{itemStr.trim() || `Item ${idx + 1}`}</div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    /{itemStr.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const itemsArr = menuForm.items.split(",").map(s => s.trim()).filter((_, i) => i !== idx);
                                  setMenuForm({ ...menuForm, items: itemsArr.join(", ") });
                                }}
                                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Add New Item (Comma Separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Collections, About Us, Special Offers"
                            value={menuForm.items}
                            onChange={(e) => setMenuForm({ ...menuForm, items: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">Storefront Display</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          This menu will automatically update the navigation header and footer across all storefront theme templates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. BLOG POSTS SUB-VIEW */}
              {contentSubTab === "blog-posts" && !blogForm && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-slate-700" />
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Blog posts</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActionSuccess("Manage blogs settings opened")}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/80 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                        <span>Manage blogs</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlogForm({ title: "", content: "", author: "Store Admin" })}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Create blog post
                      </button>
                    </div>
                  </div>

                  {blogPosts.length === 0 ? (
                    /* Matching Screenshot 3 Empty State Card */
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-card max-w-2xl mx-auto my-6 space-y-5 animate-fade-in">
                      <div className="relative mx-auto h-24 w-24 flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-slate-100/90 flex items-center justify-center">
                          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm flex flex-col items-center space-y-1 w-14">
                            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-0.5 text-[9px] font-bold font-mono text-slate-700">
                              <span>B</span>
                              <span className="italic">I</span>
                              <span className="underline">U</span>
                            </div>
                            <div className="h-4 w-4 bg-teal-50 border border-teal-200 rounded flex items-center justify-center text-teal-600">
                              <FileText className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-slate-900">Write a blog post</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                          Blog posts are a great way to build a community around your products and your brand.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActionSuccess("Blog documentation opened")}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Learn more
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogForm({ title: "", content: "", author: "Store Admin" })}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                        >
                          Create blog post
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50/80 font-bold text-slate-600 text-xs tracking-wider">
                          <tr>
                            <th className="px-6 py-3.5">Blog post title</th>
                            <th className="px-6 py-3.5">Author</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Published date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {blogPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                {post.title}
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                {post.author || "Store Admin"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {post.status || "published"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-xs font-semibold text-slate-500">
                                {new Date(post.createdAt).toLocaleDateString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* FULL-PAGE BLOG POST EDITOR (REDESIGNED MATCHING SHOPIFY STANDARDS) */}
              {contentSubTab === "blog-posts" && blogForm && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBlogForm(null)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                      </button>
                      <h2 className="text-lg font-bold text-slate-900">
                        {blogForm.id ? "Edit blog post" : "Create blog post"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBlogForm(null)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!blogForm.title || !blogForm.content) return;
                          try {
                            const res = await fetch(`${API_URL}/store/blog-posts`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              credentials: "include",
                              body: JSON.stringify(blogForm),
                            });
                            if (res.ok) {
                              setActionSuccess("Blog post published to database successfully!");
                              fetchDashboardData();
                            }
                          } catch (err: any) {
                            setActionError(err.message);
                          }
                          setBlogForm(null);
                        }}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                      >
                        Publish Post
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Summer Collection Lookbook & Styling Guide"
                            value={blogForm.title}
                            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Content
                          </label>
                          {/* Formatting Toolbar Header */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-600">
                            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 text-xs font-bold text-slate-700">
                              <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-pointer">B</span>
                              <span className="px-2 py-0.5 hover:bg-slate-200 rounded italic cursor-pointer">I</span>
                              <span className="px-2 py-0.5 hover:bg-slate-200 rounded underline cursor-pointer">U</span>
                              <div className="h-4 w-px bg-slate-300 mx-1" />
                              <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-pointer">🔗 Link</span>
                              <span className="px-2 py-0.5 hover:bg-slate-200 rounded cursor-pointer">🖼️ Image</span>
                            </div>
                            <textarea
                              rows={8}
                              required
                              placeholder="Write your blog post content here..."
                              value={blogForm.content}
                              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              className="w-full p-4 text-xs font-medium text-slate-900 border-none focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Excerpt Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2">
                        <h3 className="text-sm font-bold text-slate-900">Excerpt</h3>
                        <p className="text-xs text-slate-500">Add a summary of the post to show on your store homepage or blog list page.</p>
                        <textarea
                          rows={3}
                          placeholder="Brief blog post summary..."
                          className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        />
                      </div>

                      {/* SEO Search Engine Listing Preview */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-sm font-bold text-slate-900">Search engine listing preview</h3>
                          <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Edit SEO</span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-blue-700">{blogForm.title || "Blog Post Title"}</div>
                          <div className="text-xs text-emerald-700 font-mono">https://{settings.subdomain || "store"}.basecart.app/blogs/news/post</div>
                          <div className="text-xs text-slate-500">{blogForm.content ? blogForm.content.slice(0, 140) + "..." : "Add a blog post summary to preview search results."}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (1/3 width) */}
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">Visibility</h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                            <input type="radio" name="visibility" defaultChecked className="text-indigo-600 focus:ring-indigo-500" />
                            <span>Visible</span>
                          </label>
                          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                            <input type="radio" name="visibility" className="text-indigo-600 focus:ring-indigo-500" />
                            <span>Hidden</span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-slate-900">Organization</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Author</label>
                            <input
                              type="text"
                              value={blogForm.author || "Store Admin"}
                              onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Blog Category</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white">
                              <option>News</option>
                              <option>Updates</option>
                              <option>Style Guide</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FILES SUB-VIEW (REDESIGNED SYSTEM ASSETS MANAGER) */}
              {contentSubTab === "files" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-slate-700" />
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">Files</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActionSuccess("File uploader opened. Select product or branding image.")}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload files</span>
                      </button>
                    </div>
                  </div>

                  {storeFiles.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
                      <Folder className="h-10 w-10 text-indigo-600 mx-auto" />
                      <h3 className="text-base font-bold text-slate-900">Store Media & Uploaded Assets</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                        Upload product images, promotional banners, and branding logos to manage across your system.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50/80 font-bold text-slate-600 text-xs tracking-wider">
                          <tr>
                            <th className="px-6 py-3.5">Preview</th>
                            <th className="px-6 py-3.5">File Name</th>
                            <th className="px-6 py-3.5">Used In</th>
                            <th className="px-6 py-3.5">Size & Type</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {storeFiles.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                                  {f.url ? (
                                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                                {f.name}
                              </td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                                  {f.usedIn}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                {f.size} · {f.type}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    if (f.url) {
                                      navigator.clipboard.writeText(f.url);
                                      setActionSuccess(`CDN link for "${f.name}" copied to clipboard!`);
                                    }
                                  }}
                                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                >
                                  Copy link
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 4. METAOBJECTS SUB-VIEW */}
              {contentSubTab === "metaobjects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Metaobjects</h2>
                    <button
                      onClick={() => setActionSuccess("Metaobject definition builder opened")}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                    >
                      Create definition
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
                    <Layers className="h-10 w-10 text-indigo-600 mx-auto" />
                    <h3 className="text-base font-bold text-slate-900">Custom Content Data Types</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                      Define custom structured content (Size Guides, Designer Spotlights, Specifications) to embed anywhere on store pages.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Order Fulfillment & Logistics</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                      Fulfillment Mode
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Manage incoming orders, generate shipping labels, dispatch items, and track delivery status</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportOrdersCSV}
                    disabled={orders.length === 0}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handleCreateSampleOrder}
                    disabled={creatingSampleOrder}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{creatingSampleOrder ? "Creating..." : "Create Test Order"}</span>
                  </button>
                </div>
              </div>

              {/* Fulfillment Metrics Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. To Ship / Unfulfilled */}
                {(() => {
                  const unfulfilledCount = orders.filter((o) => o.status === "paid" || o.status === "pending").length;
                  return (
                    <button
                      onClick={() => setOrderStatusFilter("unfulfilled")}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        orderStatusFilter === "unfulfilled"
                          ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-sm"
                          : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/50 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-blue-600 mb-1">
                        <span>TO SHIP (UNFULFILLED)</span>
                        <Package className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{unfulfilledCount}</div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Orders requiring dispatch</p>
                    </button>
                  );
                })()}

                {/* 2. Shipped / In Transit */}
                {(() => {
                  const shippedCount = orders.filter((o) => o.status === "shipped").length;
                  return (
                    <button
                      onClick={() => setOrderStatusFilter("shipped")}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        orderStatusFilter === "shipped"
                          ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-sm"
                          : "bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/50 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-purple-600 mb-1">
                        <span>IN TRANSIT</span>
                        <Tag className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{shippedCount}</div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Shipped & on the way</p>
                    </button>
                  );
                })()}

                {/* 3. Delivered */}
                {(() => {
                  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
                  return (
                    <button
                      onClick={() => setOrderStatusFilter("delivered")}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        orderStatusFilter === "delivered"
                          ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm"
                          : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mb-1">
                        <span>DELIVERED</span>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{deliveredCount}</div>
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Successfully completed</p>
                    </button>
                  );
                })()}

                {/* 4. Total Orders */}
                <button
                  onClick={() => setOrderStatusFilter("all")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    orderStatusFilter === "all"
                      ? "bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>ALL ORDERS</span>
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{orders.length}</div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">Total lifetime orders</p>
                </button>
              </div>

              {/* Controls: Search & Status Filter Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, customer name, email, phone, or courier..."
                    className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-semibold select-none">
                  {[
                    { id: "unfulfilled", label: "To Ship", count: orders.filter((o) => o.status === "paid" || o.status === "pending").length },
                    { id: "all", label: "All Orders", count: orders.length },
                    { id: "paid", label: "Paid", count: orders.filter((o) => o.status === "paid").length },
                    { id: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
                    { id: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length },
                    { id: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
                    { id: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        orderStatusFilter === tab.id
                          ? "bg-slate-900 text-white font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        orderStatusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Orders List */}
              {(() => {
                const filtered = orders.filter((o) => {
                  const matchesStatus =
                    orderStatusFilter === "all"
                      ? true
                      : orderStatusFilter === "unfulfilled"
                      ? o.status === "paid" || o.status === "pending"
                      : o.status === orderStatusFilter;

                  const query = orderSearchQuery.toLowerCase().trim();
                  const matchesQuery =
                    !query ||
                    o.orderId.toLowerCase().includes(query) ||
                    (o.customerInfo?.name || "").toLowerCase().includes(query) ||
                    (o.customerInfo?.email || "").toLowerCase().includes(query) ||
                    (o.customerInfo?.phone || "").toLowerCase().includes(query) ||
                    (o.carrier || "").toLowerCase().includes(query) ||
                    (o.trackingNumber || "").toLowerCase().includes(query);

                  return matchesStatus && matchesQuery;
                });

                if (orders.length === 0 && !loading) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
                      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingCart className="h-8 w-8" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h3 className="text-base font-bold text-slate-900">No orders received yet</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          When customers purchase products from your online storefront, orders will appear here automatically with customer delivery address and payment details ready for fulfillment.
                        </p>
                      </div>
                      <button
                        onClick={handleCreateSampleOrder}
                        disabled={creatingSampleOrder}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Sample Test Order</span>
                      </button>
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-sm space-y-2">
                      <p className="font-semibold text-slate-700">No orders matching current filter ({orderStatusFilter}).</p>
                      <button
                        onClick={() => setOrderStatusFilter("all")}
                        className="text-blue-600 hover:underline font-bold text-xs"
                      >
                        View all orders ({orders.length})
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3.5">Order ID</th>
                            <th className="px-4 py-3.5">Date</th>
                            <th className="px-4 py-3.5">Customer & Shipping Address</th>
                            <th className="px-4 py-3.5">Items</th>
                            <th className="px-4 py-3.5">Total</th>
                            <th className="px-4 py-3.5">Fulfillment & Tracking</th>
                            <th className="px-4 py-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {filtered.map((order) => {
                            const itemCount = (order.lineItems || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
                            const isUnfulfilled = order.status === "paid" || order.status === "pending";
                            const isShipped = order.status === "shipped";
                            return (
                              <tr key={order.orderId} className={`hover:bg-slate-50/80 transition-colors ${isUnfulfilled ? "bg-blue-50/10" : ""}`}>
                                <td className="px-4 py-4">
                                  <button
                                    onClick={() => setSelectedOrderForDetail(order)}
                                    className="font-mono text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                                  >
                                    #{order.orderId.substring(0, 10).toUpperCase()}
                                  </button>
                                  <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                                    {order.paymentMethod || "Razorpay"}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-500 text-[11px]">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                                <td className="px-4 py-4 max-w-[220px]">
                                  <div className="font-bold text-slate-900 truncate">{order.customerInfo?.name || "Guest Customer"}</div>
                                  <div className="text-[11px] text-slate-500 font-mono truncate">{order.customerInfo?.phone || order.customerInfo?.email || "No contact"}</div>
                                  {order.customerInfo?.address && (
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5" title={`${order.customerInfo.address.street}, ${order.customerInfo.address.city}`}>
                                      📍 {order.customerInfo.address.city}, {order.customerInfo.address.pincode}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-slate-600">
                                  <span className="font-bold text-slate-800">{itemCount} items</span>
                                  {order.lineItems?.[0] && (
                                    <span className="block text-[10px] text-slate-400 truncate max-w-[130px]">
                                      {order.lineItems[0].name}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 font-black text-slate-900">
                                  {formatINR(order.total)}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      order.status === "paid"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : order.status === "shipped"
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : order.status === "delivered"
                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                        : order.status === "pending"
                                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                                        : "bg-rose-50 text-rose-700 border border-rose-200"
                                    }`}>
                                      {order.status === "paid" || order.status === "pending" ? "unfulfilled" : order.status}
                                    </span>

                                    {order.trackingNumber && (
                                      <div className="text-[10px] font-mono text-slate-500">
                                        <span className="font-bold text-slate-700">{order.carrier || "Courier"}:</span> {order.trackingNumber}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isUnfulfilled && (
                                      <button
                                        onClick={() => {
                                          setFulfillingOrder(order);
                                          setFulfillmentCarrier("Shiprocket");
                                          setFulfillmentTracking("");
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <Package className="h-3 w-3" />
                                        <span>Fulfill Order</span>
                                      </button>
                                    )}

                                    {isShipped && (
                                      <button
                                        onClick={() => updateOrderStatus(order.orderId, "delivered")}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Mark Delivered</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDownloadOrderInvoice(order)}
                                      title="Download GST Invoice"
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() => setSelectedOrderForDetail(order)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                                    >
                                      Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="md:hidden space-y-3">
                      {filtered.map((order) => {
                        const isUnfulfilled = order.status === "paid" || order.status === "pending";
                        const isShipped = order.status === "shipped";
                        return (
                          <div key={order.orderId} className={`bg-white p-4 border rounded-xl shadow-sm space-y-3 text-xs ${isUnfulfilled ? "border-blue-200 bg-blue-50/10" : "border-slate-200"}`}>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <button
                                onClick={() => setSelectedOrderForDetail(order)}
                                className="font-mono font-bold text-blue-600 text-xs hover:underline"
                              >
                                #{order.orderId.substring(0, 10).toUpperCase()}
                              </button>
                              <span className="text-slate-400 text-[10px] font-semibold">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </span>
                            </div>

                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{order.customerInfo?.name || "Guest Customer"}</div>
                                <div className="text-[11px] text-slate-500 font-mono">{order.customerInfo?.phone || order.customerInfo?.email || "No contact"}</div>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                order.status === "paid"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : order.status === "shipped"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : order.status === "delivered"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {order.status === "paid" || order.status === "pending" ? "unfulfilled" : order.status}
                              </span>
                            </div>

                            {order.trackingNumber && (
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                                <span className="font-bold text-slate-700">{order.carrier || "Carrier"}:</span> {order.trackingNumber}
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-700">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                                <div className="font-black text-slate-900 text-sm">{formatINR(order.total)}</div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isUnfulfilled && (
                                  <button
                                    onClick={() => {
                                      setFulfillingOrder(order);
                                      setFulfillmentCarrier("Shiprocket");
                                      setFulfillmentTracking("");
                                    }}
                                    className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs"
                                  >
                                    Fulfill
                                  </button>
                                )}
                                {isShipped && (
                                  <button
                                    onClick={() => updateOrderStatus(order.orderId, "delivered")}
                                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                                  >
                                    Delivered
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedOrderForDetail(order)}
                                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 4. Discount Codes Tab */}
          {activeTab === "discounts" && (
            <div className="space-y-6">
              {/* Header & Primary Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Discount Codes & Coupons</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Promotions Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Create discount coupons, set minimum spend rules, manage usage limits, and track redemption metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDiscountForm({ code: "", type: "flat", value: 100, minOrderAmount: 499, active: true })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Discount Code</span>
                  </button>
                </div>
              </div>

              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Total Campaigns */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-left shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Campaigns</span>
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{discounts.length}</div>
                  <p className="text-[10px] text-slate-500 font-medium">Configured coupons</p>
                </div>

                {/* 2. Active Offers */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 text-left shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-700">Active Offers</span>
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-900">
                    {discounts.filter((d) => d.active && (!d.expiry || new Date(d.expiry).getTime() >= Date.now())).length}
                  </div>
                  <p className="text-[10px] text-emerald-700 font-medium">Ready for checkout</p>
                </div>

                {/* 3. Total Redemptions */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-left shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-700">Total Redemptions</span>
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-900">
                    {discounts.reduce((acc, curr) => acc + (curr.usageCount || 0), 0)}
                  </div>
                  <p className="text-[10px] text-indigo-700 font-medium">Used by storefront buyers</p>
                </div>

                {/* 4. Expired / Reached Limit */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-left shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Expired / Inactive</span>
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-700">
                    {discounts.filter((d) => !d.active || (d.expiry && new Date(d.expiry).getTime() < Date.now())).length}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Ended or disabled</p>
                </div>
              </div>

              {/* Preset Templates Banner */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Quick Preset Templates ⚡</span>
                  <p className="text-xs text-slate-700 font-medium">Launch popular high-converting coupon templates with 1-click</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setDiscountForm({ code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 0, active: true })}
                    className="px-3 py-1.5 bg-white border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    🎉 WELCOME10 (10% Off)
                  </button>
                  <button
                    onClick={() => setDiscountForm({ code: "FLAT100", type: "flat", value: 100, minOrderAmount: 499, active: true })}
                    className="px-3.5 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    🏷️ FLAT100 (₹100 Off)
                  </button>
                  <button
                    onClick={() => setDiscountForm({ code: "VIP20", type: "percentage", value: 20, minOrderAmount: 999, active: true })}
                    className="px-3.5 py-1.5 bg-white border border-purple-200 hover:bg-purple-600 hover:text-white text-purple-700 font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    👑 VIP20 (20% Off)
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search coupon code..."
                    value={discountSearchQuery}
                    onChange={(e) => setDiscountSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  {[
                    { id: "all", label: "All Codes" },
                    { id: "active", label: "Active" },
                    { id: "inactive", label: "Inactive" },
                    { id: "flat", label: "Flat Cash" },
                    { id: "percentage", label: "Percentage" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setDiscountFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        discountFilter === tab.id
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupons List / Table */}
              {(() => {
                const filteredDiscounts = discounts.filter((d) => {
                  const q = discountSearchQuery.trim().toUpperCase();
                  const matchesQuery = !q || d.code.toUpperCase().includes(q);
                  const isExpired = d.expiry && new Date(d.expiry).getTime() < Date.now();
                  
                  let matchesFilter = true;
                  if (discountFilter === "active") matchesFilter = d.active && !isExpired;
                  else if (discountFilter === "inactive") matchesFilter = !d.active || isExpired;
                  else if (discountFilter === "flat") matchesFilter = d.type === "flat";
                  else if (discountFilter === "percentage") matchesFilter = d.type === "percentage";

                  return matchesQuery && matchesFilter;
                });

                if (discounts.length === 0 && !loading) {
                  return (
                    <EmptyState
                      icon={<Tag className="h-10 w-10 text-blue-600" />}
                      title="No discount codes yet"
                      description="Create custom promotional coupons to boost sales on your storefront."
                      action={{
                        label: "Create Discount Code",
                        onClick: () => setDiscountForm({ code: "", type: "flat", value: 100, minOrderAmount: 0, active: true })
                      }}
                    />
                  );
                }

                if (filteredDiscounts.length === 0 && !loading) {
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                      <Tag className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No matching discount codes found</p>
                      <p className="text-xs text-slate-400">Try clearing search filters or changing the status filter.</p>
                      <button
                        onClick={() => { setDiscountFilter("all"); setDiscountSearchQuery(""); }}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden animate-fade-in">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-6 py-3.5">Coupon Code</th>
                            <th className="px-6 py-3.5">Discount Offer</th>
                            <th className="px-6 py-3.5">Min Spend</th>
                            <th className="px-6 py-3.5">Usage / Limit</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {loading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                              <tr key={idx}>
                                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 animate-shimmer" /></td>
                                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24 animate-shimmer" /></td>
                                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded w-16 animate-shimmer" /></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-20 ml-auto animate-shimmer" /></td>
                              </tr>
                            ))
                          ) : (
                            filteredDiscounts.map((disc) => {
                              const isExpired = disc.expiry && new Date(disc.expiry).getTime() < Date.now();
                              const isLimitReached = disc.usageLimit && (disc.usageCount || 0) >= disc.usageLimit;
                              const isCopied = copiedCode === disc.code;

                              return (
                                <tr key={disc.code} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                                        {disc.code}
                                      </span>
                                      <button
                                        onClick={() => copyCouponCode(disc.code)}
                                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                        title="Copy code"
                                      >
                                        {isCopied ? <span className="text-[10px] font-bold text-emerald-600">✓ Copied</span> : <Copy className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {disc.type === "flat" ? `${formatINR(disc.value)} Off` : `${disc.value}% Off`}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-semibold text-slate-600">
                                    {disc.minOrderAmount > 0 ? formatINR(disc.minOrderAmount) : <span className="text-slate-400 font-normal">No Minimum</span>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1">
                                      <span className="font-mono font-bold text-slate-800">
                                        {disc.usageCount || 0} {disc.usageLimit ? `/ ${disc.usageLimit}` : "uses"}
                                      </span>
                                      {disc.usageLimit && (
                                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${isLimitReached ? "bg-red-500" : "bg-blue-600"}`}
                                            style={{ width: `${Math.min(100, ((disc.usageCount || 0) / disc.usageLimit) * 100)}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => toggleDiscountActive(disc)}
                                      className="cursor-pointer group flex items-center gap-1.5"
                                      title="Click to toggle status"
                                    >
                                      {isExpired ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                          Expired
                                        </span>
                                      ) : isLimitReached ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                          Limit Reached
                                        </span>
                                      ) : disc.active ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100">
                                          ● Active
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-slate-200">
                                          ○ Inactive
                                        </span>
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setDiscountForm({ ...disc, isEdit: true })}
                                        className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-md font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={() => deleteDiscount(disc.code)}
                                        className="p-1 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                                        title="Delete code"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View */}
                    <div className="md:hidden space-y-3">
                      {filteredDiscounts.map((disc) => {
                        const isExpired = disc.expiry && new Date(disc.expiry).getTime() < Date.now();
                        const isLimitReached = disc.usageLimit && (disc.usageCount || 0) >= disc.usageLimit;

                        return (
                          <div key={disc.code} className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-mono font-black text-slate-900 text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {disc.code}
                                </span>
                                <p className="text-xs font-bold text-slate-800 mt-1.5">
                                  {disc.type === "flat" ? `${formatINR(disc.value)} Off` : `${disc.value}% Off`}
                                </p>
                              </div>
                              <button
                                onClick={() => toggleDiscountActive(disc)}
                                className="cursor-pointer"
                              >
                                {disc.active && !isExpired ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                    ● Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold">
                                    ○ Inactive
                                  </span>
                                )}
                              </button>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Spend</span>
                                <span className="font-semibold text-slate-700">{disc.minOrderAmount > 0 ? formatINR(disc.minOrderAmount) : "None"}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Usage</span>
                                <span className="font-mono font-bold text-slate-800">{disc.usageCount || 0} {disc.usageLimit ? `/ ${disc.usageLimit}` : ""}</span>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                              <button
                                onClick={() => setDiscountForm({ ...disc, isEdit: true })}
                                className="px-3 py-1 text-xs font-bold border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteDiscount(disc.code)}
                                className="px-3 py-1 text-xs font-bold border border-red-200 text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 5. Settings Tab - Shopify-Class Professional Architecture */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Store Settings & Configuration</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Shopify-Class Console
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Manage store profile, payment gateways, GST tax compliance, bank payout details, invoice templates, and legal terms</p>
                </div>
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>{loading ? "Saving Settings..." : "Save All Changes"}</span>
                </button>
              </div>

              {/* Main 2-Column Shopify Settings Layout */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Left Sub-Sidebar Menu */}
                <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-2 shadow-card space-y-1 shrink-0">
                  {[
                    { id: "general", label: "General Store", icon: Building, desc: "Profile & domain" },
                    { id: "payments", label: "Payments & Gateway", icon: CreditCard, desc: "Razorpay & COD" },
                    { id: "gst", label: "GST & Tax Identifiers", icon: FileText, desc: "B2B Tax & PAN" },
                    { id: "bank", label: "Bank Payout Account", icon: Landmark, desc: "Bank wire details" },
                    { id: "invoices", label: "Invoices & Receipts", icon: FileText, desc: "Terms & signatory" },
                    { id: "policies", label: "Store Legal Policies", icon: ShieldCheck, desc: "Terms & privacy" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = settingsSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSettingsSubTab(tab.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-blue-50/80 border border-blue-200/80 text-blue-900 shadow-2xs font-bold"
                            : "hover:bg-slate-50 text-slate-600 font-medium"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{tab.label}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-normal">{tab.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Settings Content Form Card */}
                <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-6">
                  <form onSubmit={saveSettings} className="space-y-6">
                    {/* 1. GENERAL STORE */}
                    {settingsSubTab === "general" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">General Store Profile</h3>
                          <p className="text-xs text-slate-500">Configure public storefront identity and system domains</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Store Display Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={settings.storeName || ""}
                              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Acme Organic Store"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Store Subdomain Prefix
                            </label>
                            <div className="flex items-center">
                              <input
                                type="text"
                                disabled
                                value={settings.subdomain || ""}
                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-l-xl text-slate-500 font-mono text-xs bg-slate-50"
                              />
                              <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl text-xs font-semibold text-slate-500 font-mono">
                                .{STOREFRONT_DOMAIN}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Live Storefront URL
                            </label>
                            <a
                              href={`${STOREFRONT_PROTOCOL}://${settings.subdomain}.${STOREFRONT_DOMAIN}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-3.5 py-2.5 border border-blue-200 rounded-xl text-blue-600 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <span className="truncate">{STOREFRONT_PROTOCOL}://{settings.subdomain}.{STOREFRONT_DOMAIN}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-1" />
                            </a>
                          </div>

                          <div className="md:col-span-2 pt-2 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Custom Domain (Pro Tier)
                            </label>
                            <input
                              type="text"
                              disabled={settings.plan !== "pro"}
                              value={settings.customDomain || ""}
                              onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs disabled:bg-slate-50 disabled:text-slate-400"
                              placeholder="e.g. store.mybrand.com"
                            />
                            {settings.plan !== "pro" && (
                              <p className="text-[11px] text-amber-600 font-medium mt-1">
                                🔒 Custom domains require the <strong>Pro Plan</strong> tier. Upgrade in the Billing section to link custom SSL domain names.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. PAYMENTS & GATEWAY */}
                    {settingsSubTab === "payments" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">Payment Gateways & Checkout Rules</h3>
                            <p className="text-xs text-slate-500">Configure Razorpay merchant keys and Cash on Delivery (COD) settings</p>
                          </div>
                          {settings.razorpayConfigured ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Razorpay Live
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold">
                              ⚠️ Keys Pending
                            </span>
                          )}
                        </div>

                        {!emailVerified && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5 font-medium">
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                              <p className="font-bold">Email Verification Required</p>
                              <p className="text-[11px] text-amber-700 mt-0.5">
                                Your merchant account email must be verified with the 6-digit OTP code before live payment gateway credentials can be activated.
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowOtpModal(true)}
                                className="mt-1 text-[11px] font-bold text-amber-900 underline hover:text-black cursor-pointer"
                              >
                                Enter OTP Verification Code →
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Razorpay Key ID
                            </label>
                            <input
                              type="text"
                              value={settings.razorpayKey || ""}
                              onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                settings.razorpayKey && !settings.razorpayKey.startsWith("rzp_")
                                  ? "border-red-300 bg-red-50/40"
                                  : "border-slate-300"
                              }`}
                              placeholder="rzp_live_... or rzp_test_..."
                            />
                            {settings.razorpayKey && !settings.razorpayKey.startsWith("rzp_") && (
                              <p className="text-[10px] text-red-600 font-bold mt-1">
                                ⚠️ Invalid format: Razorpay Key ID should start with "rzp_live_" or "rzp_test_"
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Razorpay Key Secret
                            </label>
                            <div className="relative">
                              <input
                                type={showRazorpaySecret ? "text" : "password"}
                                value={settings.razorpaySecret || ""}
                                onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                placeholder="••••••••••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                              >
                                {showRazorpaySecret ? "Hide" : "Show"}
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          🔒 <strong>Security Guarantee:</strong> API keys are encrypted at rest using Cloudflare AES-256-GCM hardware security modules. Plaintext secrets are never exposed in public API responses or client storefront JavaScript.
                        </p>
                      </div>
                    )}

                    {/* 3. GST & TAX IDENTIFIERS */}
                    {settingsSubTab === "gst" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">GST, Tax & Corporate Identifiers</h3>
                          <p className="text-xs text-slate-500">Enter your official business tax numbers for compliant B2B tax invoice generation</p>
                        </div>

                        {/* Format validation status */}
                        {(() => {
                          const gstinValid = !settings.gstin || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settings.gstin.toUpperCase());
                          const panValid = !settings.panNumber || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(settings.panNumber.toUpperCase());
                          const hasError = !gstinValid || !panValid;

                          if (hasError) {
                            return (
                              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                                <span>Please check the highlighted tax identifier formats below before saving.</span>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Registered Legal Entity Name
                            </label>
                            <input
                              type="text"
                              value={settings.registeredBusinessName || ""}
                              onChange={(e) => setSettings({ ...settings, registeredBusinessName: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Acme Retail Private Limited"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                GSTIN Number (15-Digit)
                              </label>
                              {settings.gstin && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settings.gstin.toUpperCase()) && (
                                <span className="text-[10px] font-bold text-emerald-600">✓ Valid GSTIN</span>
                              )}
                            </div>
                            <input
                              type="text"
                              maxLength={15}
                              value={settings.gstin || ""}
                              onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                settings.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settings.gstin.toUpperCase())
                                  ? "border-red-300 bg-red-50/40"
                                  : "border-slate-300"
                              }`}
                              placeholder="e.g. 33AAAAA0000A1Z5"
                            />
                            {settings.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(settings.gstin.toUpperCase()) && (
                              <p className="text-[10px] text-red-600 font-bold mt-1">
                                ⚠️ Format check: 15 alphanumeric characters (e.g., 33AAAAA0000A1Z5)
                              </p>
                            )}
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Permanent Account Number (PAN)
                              </label>
                              {settings.panNumber && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(settings.panNumber.toUpperCase()) && (
                                <span className="text-[10px] font-bold text-emerald-600">✓ Valid PAN</span>
                              )}
                            </div>
                            <input
                              type="text"
                              maxLength={10}
                              value={settings.panNumber || ""}
                              onChange={(e) => setSettings({ ...settings, panNumber: e.target.value.toUpperCase() })}
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                settings.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(settings.panNumber.toUpperCase())
                                  ? "border-red-300 bg-red-50/40"
                                  : "border-slate-300"
                              }`}
                              placeholder="e.g. ABCDE1234F"
                            />
                            {settings.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(settings.panNumber.toUpperCase()) && (
                              <p className="text-[10px] text-red-600 font-bold mt-1">
                                ⚠️ Format check: 10 characters (e.g., ABCDE1234F)
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Corporate Identity Number (CIN)
                            </label>
                            <input
                              type="text"
                              value={settings.cinNumber || ""}
                              onChange={(e) => setSettings({ ...settings, cinNumber: e.target.value.toUpperCase() })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. U40100TN2010PTC075961"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Place of Supply / State
                            </label>
                            <input
                              type="text"
                              value={settings.placeOfSupply || settings.registeredState || ""}
                              onChange={(e) => setSettings({ ...settings, placeOfSupply: e.target.value, registeredState: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Tamil Nadu (33) or Maharashtra (27)"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Registered Corporate Address
                            </label>
                            <textarea
                              rows={2}
                              value={settings.registeredBusinessAddress || ""}
                              onChange={(e) => setSettings({ ...settings, registeredBusinessAddress: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="Enter full registered address printed on official Tax Invoices..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. BANK PAYOUT ACCOUNT */}
                    {settingsSubTab === "bank" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Bank Payout & Wire Transfer Details</h3>
                          <p className="text-xs text-slate-500">Configure bank details for direct customer NEFT/RTGS wire transfers printed on invoices</p>
                        </div>

                        {/* IFSC Validation Indicator */}
                        {settings.bankDetails?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(settings.bankDetails.ifscCode.toUpperCase()) && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                            <span>Invalid IFSC Code format. IFSC should be 11 characters (e.g. HDFC0001225).</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              value={settings.bankDetails?.bankName || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                bankDetails: { ...(settings.bankDetails || {}), bankName: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. HDFC Bank Limited"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Account Holder Name
                            </label>
                            <input
                              type="text"
                              value={settings.bankDetails?.accountName || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                bankDetails: { ...(settings.bankDetails || {}), accountName: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Acme Retail Private Limited"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Bank Account Number
                            </label>
                            <input
                              type="text"
                              value={settings.bankDetails?.accountNumber || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                bankDetails: { ...(settings.bankDetails || {}), accountNumber: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. 50200026430541"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                IFSC Code (11-Digit)
                              </label>
                              {settings.bankDetails?.ifscCode && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(settings.bankDetails.ifscCode.toUpperCase()) && (
                                <span className="text-[10px] font-bold text-emerald-600">✓ Valid IFSC</span>
                              )}
                            </div>
                            <input
                              type="text"
                              maxLength={11}
                              value={settings.bankDetails?.ifscCode || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                bankDetails: { ...(settings.bankDetails || {}), ifscCode: e.target.value.toUpperCase() }
                              })}
                              className={`w-full px-3.5 py-2.5 border rounded-xl text-slate-900 font-mono text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                                settings.bankDetails?.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(settings.bankDetails.ifscCode.toUpperCase())
                                  ? "border-red-300 bg-red-50/40"
                                  : "border-slate-300"
                              }`}
                              placeholder="e.g. HDFC0001225"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Bank Branch Address
                            </label>
                            <input
                              type="text"
                              value={settings.bankDetails?.bankBranch || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                bankDetails: { ...(settings.bankDetails || {}), bankBranch: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Ground Floor, Anna Nagar West, Chennai 600040"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. INVOICES & RECEIPTS */}
                    {settingsSubTab === "invoices" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Invoice Terms & Signatory Watermark</h3>
                          <p className="text-xs text-slate-500">Customize legal disclaimers, payment terms, and authorized signatures printed on PDF GST Tax Invoices</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Default Invoice Terms
                            </label>
                            <input
                              type="text"
                              value={settings.invoiceConfig?.invoiceTerms || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                invoiceConfig: { ...(settings.invoiceConfig || {}), invoiceTerms: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Net 15 or Due on Receipt"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Authorized Signatory Name
                            </label>
                            <input
                              type="text"
                              value={settings.invoiceConfig?.authorizedSignatoryName || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                invoiceConfig: { ...(settings.invoiceConfig || {}), authorizedSignatoryName: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. R. Badrinath"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Invoice Footer Notes & Thank You Message
                            </label>
                            <input
                              type="text"
                              value={settings.invoiceConfig?.invoiceNotes || ""}
                              onChange={(e) => setSettings({
                                ...settings,
                                invoiceConfig: { ...(settings.invoiceConfig || {}), invoiceNotes: e.target.value }
                              })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              placeholder="e.g. Thanks for your business. For GST queries, please contact store support."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 6. STORE LEGAL POLICIES */}
                    {settingsSubTab === "policies" && (
                      <div className="space-y-5">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="text-base font-bold text-slate-900">Store Legal Policy Pages</h3>
                          <p className="text-xs text-slate-500">Provide legal policy texts. When saved, these will automatically generate public policy links in your storefront footer</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Terms of Service Policy
                            </label>
                            <textarea
                              rows={4}
                              value={settings.termsOfService || ""}
                              onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                              placeholder="Specify buyer rights, store usage conditions, and order policies..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Privacy & Data Collection Policy
                            </label>
                            <textarea
                              rows={4}
                              value={settings.privacyPolicy || ""}
                              onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                              placeholder="Detail how customer email, phone, and delivery address data is used..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Shipping, Refund & Cancellation Policy
                            </label>
                            <textarea
                              rows={4}
                              value={settings.refundPolicy || ""}
                              onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                              placeholder="Outline refund timelines, item return conditions, and cancellation rules..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">
                        Changes are saved instantly to your Cloudflare D1/DO store database.
                      </span>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>{loading ? "Saving Settings..." : "Save Configuration"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
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
                  <div className="hidden md:block lg:col-span-2 bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
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

                {/* Customers Cards - Mobile View */}
                <div className="md:hidden space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="bg-white p-4 border border-slate-200 rounded-card shadow-sm space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-28" />
                        <div className="h-3 bg-slate-200 rounded w-36" />
                      </div>
                    ))
                  ) : (
                    customers.map((cust) => (
                      <div
                        key={cust.email}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          fetchCustomerOrders(cust.email);
                        }}
                        className={`bg-white p-4 border rounded-card shadow-sm space-y-3 cursor-pointer transition-colors ${
                          selectedCustomer?.email === cust.email ? "border-indigo-400 bg-indigo-50/10" : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{cust.name}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{cust.email}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            cust.registered
                              ? "bg-blue-50 text-blue-700 border border-blue-100"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {cust.registered ? "Registered" : "Guest"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider block">Total Spend</span>
                            <span className="text-slate-900 font-extrabold mt-0.5 block">{formatINR(cust.totalSpend)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 font-bold uppercase tracking-wider block">Orders</span>
                            <span className="text-slate-700 font-semibold font-mono mt-0.5 block">{cust.totalOrders}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                    <table className="hidden md:table min-w-full divide-y divide-slate-200 text-left text-sm">
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

                    {/* Transaction Cards - Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {financeSummary.transactions.map((txn: any) => (
                        <div key={txn.orderId} className="p-4 space-y-2 text-xs font-semibold">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">#{txn.orderId.substring(0, 8)}</span>
                            <span className="text-[10px] text-slate-450 font-mono text-slate-500">{txn.customerEmail}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <div>
                              <span className="text-slate-400 font-bold uppercase tracking-wider block">Gross</span>
                              <span className="text-slate-900 font-extrabold mt-0.5 block">{formatINR(txn.total)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold uppercase tracking-wider block">Platform Fee</span>
                              <span className="text-red-600 font-bold mt-0.5 block">-{formatINR(txn.platformFee)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-black uppercase text-[8px] mt-0.5 ${
                                ["paid", "shipped", "delivered"].includes(txn.status)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {txn.status}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 font-bold uppercase tracking-wider block">Reconciliation</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-bold uppercase text-[8px] mt-0.5 ${
                                txn.reconciliationStatus === "settled"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {txn.reconciliationStatus || "pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

              {/* Trial Status Banner */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                    <h4 className="font-bold text-slate-900 text-sm">60-Day Free Trial Active (Growth Tier)</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">No Credit Card Required</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    You have full access to Growth Plan features including unlimited products, AI tools, custom domain setup, and Razorpay checkout.
                  </p>
                </div>
              </div>

              {/* Plans Selection Matrix */}
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-4">Subscription Tiers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starter Tier */}
                  <div className={`bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative ${billingInfo.plan === "starter" ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-slate-200"}`}>
                    {billingInfo.plan === "starter" && (
                      <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Starter Plan</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹299 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-xs font-medium text-slate-600">
                        <li className="flex items-center gap-2">✓ 1 Online Store</li>
                        <li className="flex items-center gap-2">✓ Up to 100 Products</li>
                        <li className="flex items-center gap-2">✓ Custom Domain Setup</li>
                        <li className="flex items-center gap-2 text-slate-500">✓ Zero platform commission markup</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "starter"}
                      onClick={() => changePlan("starter")}
                      className={`w-full py-2 text-xs font-bold rounded-xl mt-8 border transition-all ${
                        billingInfo.plan === "starter"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      {billingInfo.plan === "starter" ? "Current Subscription" : "Select Starter (₹299/mo)"}
                    </button>
                  </div>

                  {/* Growth Tier */}
                  <div className={`bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative ${billingInfo.plan === "growth" || billingInfo.plan === "growth_paid" || !billingInfo.plan ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-slate-200"}`}>
                    <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Growth Plan ⭐</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹799 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-xs font-medium text-slate-600">
                        <li className="flex items-center gap-2 font-bold text-slate-800">✓ Unlimited Products & Orders</li>
                        <li className="flex items-center gap-2">✓ AI Product Description Writer</li>
                        <li className="flex items-center gap-2">✓ Abandoned Cart Recovery</li>
                        <li className="flex items-center gap-2 text-indigo-600 font-bold">✓ Priority Merchant Support</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "growth" || billingInfo.plan === "growth_paid"}
                      onClick={() => changePlan("growth")}
                      className={`w-full py-2 text-xs font-bold rounded-xl mt-8 border transition-all ${
                        billingInfo.plan === "growth" || billingInfo.plan === "growth_paid"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {billingInfo.plan === "growth" || billingInfo.plan === "growth_paid" ? "Current Subscription" : "Select Growth (₹799/mo)"}
                    </button>
                  </div>

                  {/* Business Tier */}
                  <div className={`bg-white border rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all relative ${billingInfo.plan === "business" || billingInfo.plan === "pro" ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-slate-200"}`}>
                    {billingInfo.plan === "business" && (
                      <span className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">Business Plan</h4>
                      <p className="text-2xl font-black mt-2 text-slate-950 font-mono">₹1,499 <span className="text-xs font-medium text-slate-400">/ month</span></p>
                      <ul className="mt-6 space-y-3 text-xs font-medium text-slate-600">
                        <li className="flex items-center gap-2">✓ Everything in Growth</li>
                        <li className="flex items-center gap-2 font-bold text-slate-800">✓ Multi-Staff Accounts (5 Seats)</li>
                        <li className="flex items-center gap-2">✓ Platform API Access Keys</li>
                        <li className="flex items-center gap-2 text-indigo-600 font-bold">✓ Dedicated Account Manager</li>
                      </ul>
                    </div>
                    <button
                      disabled={billingInfo.plan === "business"}
                      onClick={() => changePlan("business")}
                      className={`w-full py-2 text-xs font-bold rounded-xl mt-8 border transition-all ${
                        billingInfo.plan === "business"
                          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {billingInfo.plan === "business" ? "Current Subscription" : "Upgrade to Business (₹1,499/mo)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Monthly Invoices & Statements */}
              <div className="border-t border-slate-200 pt-8 mt-8">
                <h3 className="font-bold text-base text-slate-900 mb-2">Monthly Invoices & Statements</h3>
                <p className="text-xs text-slate-500 mb-4">View and download your monthly subscription bills and paid add-on invoice statements.</p>

                <div className="hidden md:block bg-white border border-slate-200 rounded-card shadow-card overflow-hidden">
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

                {/* Invoices Mobile Cards View */}
                <div className="md:hidden space-y-4">
                  {billingInfo.statements && billingInfo.statements.length > 0 ? (
                    billingInfo.statements.map((stmt: any) => (
                      <div key={stmt.invoiceId} className="bg-white p-4 border border-slate-200 rounded-card shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800 text-sm block">{stmt.billingPeriod}</span>
                            <span className="font-mono text-[10px] text-slate-450 mt-0.5 block text-slate-500">{stmt.invoiceId}</span>
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm font-mono">₹{stmt.amount}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                          <div>
                            <span className="text-slate-400 font-bold uppercase tracking-wider block">Paid Date</span>
                            <span className="text-slate-700 font-semibold mt-0.5 block">{stmt.date}</span>
                          </div>
                          {stmt.addOns && stmt.addOns.length > 0 && (
                            <div className="text-right">
                              <span className="text-slate-400 font-bold uppercase tracking-wider block">Add-ons</span>
                              <div className="flex flex-wrap gap-1 mt-0.5 justify-end">
                                {stmt.addOns.map((a: string) => (
                                  <span key={a} className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-100 uppercase tracking-wider">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          <a
                            href={`${API_URL}/store/billing/statement/${stmt.invoiceId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold py-1.5 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download PDF
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-card p-6 text-center text-slate-400 text-xs shadow-sm">
                      No billing statement records found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* 11. Marketing Tab */}
          {activeTab === "marketing" && (() => {
            const handleSendBroadcast = async (e: React.FormEvent) => {
              e.preventDefault();
              if (!newsletterSubject || !newsletterBody) {
                setNewsletterError("Subject and Body are required.");
                return;
              }
              setNewsletterSending(true);
              setNewsletterError("");
              setNewsletterSuccess("");
              try {
                 const res = await fetch(`${API_URL}/customers/broadcast`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    subject: newsletterSubject,
                    headline: newsletterHeadline,
                    bodyText: newsletterBody,
                    ctaText: newsletterCtaText,
                    ctaUrl: newsletterCtaUrl,
                    targetAudience,
                    spendRange,
                  }),
                  credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to send newsletter");
                setNewsletterSuccess(`Success! Broadcast sent to ${data.sentCount} customers.`);
                setCampaignsList(prev => [
                  {
                    id: Date.now(),
                    subject: newsletterSubject,
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    recipients: data.sentCount,
                    status: "Sent"
                  },
                  ...prev
                ]);
                setNewsletterSubject("");
                setNewsletterHeadline("");
                setNewsletterBody("");
                setNewsletterCtaUrl("");
              } catch (err: any) {
                setNewsletterError(err.message || "An unexpected error occurred.");
              } finally {
                setNewsletterSending(false);
              }
            };

            return (
              <div className="space-y-6 animate-fade-in font-sans">
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-1">Marketing Campaigns</h2>
                  <p className="text-xs text-slate-500">Configure automated customer notifications and launch custom promotional email blasts.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Create Newsletter Form */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Create Email Broadcast Campaign</h3>
                    </div>

                    {newsletterSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        {newsletterSuccess}
                      </div>
                    )}

                    {newsletterError && (
                      <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        {newsletterError}
                      </div>
                    )}

                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                      {/* Segmentation Target Dropdowns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Target Audience (Who to Send to)</label>
                          <select
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700 font-semibold"
                          >
                            <option value="all">All Customers (Registered & Guests)</option>
                            <option value="registered">Registered Accounts Only</option>
                            <option value="guest">Guest Checkouts Only</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Customer Spend Range</label>
                          <select
                            value={spendRange}
                            onChange={(e) => setSpendRange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-slate-700 font-semibold"
                          >
                            <option value="all">All Spenders (No Limit)</option>
                            <option value="purchased">Has purchased at least once</option>
                            <option value="high_1000">High Spenders (Spent &gt; ₹1,000)</option>
                            <option value="high_5000">VIP Spenders (Spent &gt; ₹5,000)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Email Subject Line <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g. Flash Sale: 20% Off All Items!"
                            value={newsletterSubject}
                            onChange={(e) => setNewsletterSubject(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Campaign Headline (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Limited Time Offer"
                            value={newsletterHeadline}
                            onChange={(e) => setNewsletterHeadline(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Email Message Body <span className="text-red-500">*</span></label>
                        <textarea
                          placeholder="Write your email content here. Tell your customers about the promotion, new stock, or update..."
                          value={newsletterBody}
                          onChange={(e) => setNewsletterBody(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Button Text</label>
                          <input
                            type="text"
                            placeholder="e.g. Shop Collection"
                            value={newsletterCtaText}
                            onChange={(e) => setNewsletterCtaText(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">Button Destination URL</label>
                          <input
                            type="url"
                            placeholder={`e.g. https://${settings.subdomain || "demo"}.basecart.app/catalog`}
                            value={newsletterCtaUrl}
                            onChange={(e) => setNewsletterCtaUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={newsletterSending}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                        >
                          {newsletterSending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Sending Broadcast Blast...
                            </>
                          ) : (
                            <>
                              <Send className="h-3.5 w-3.5" />
                              Send Broadcast Blast
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Automated Campaign Triggers & Logs */}
                  <div className="space-y-6">
                    {/* Automated Triggers */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Megaphone className="h-4.5 w-4.5 text-indigo-600" />
                        <h3 className="font-bold text-slate-800 text-sm">Automated Campaigns</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Order Confirmation */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800">Order Confirmation Emails</h4>
                            <p className="text-[10px] text-slate-400">SMTP/SES checkout alerts.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEmailCampaignActive(!emailCampaignActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              emailCampaignActive ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                                emailCampaignActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* WhatsApp Fulfillment */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800">WhatsApp Dispatch Alerts</h4>
                            <p className="text-[10px] text-slate-400">Dispatched via integrated SQS queue.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWhatsappCampaignActive(!whatsappCampaignActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              whatsappCampaignActive ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                                whatsappCampaignActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Abandoned Cart */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800">Abandoned Cart Retargeting</h4>
                            <p className="text-[10px] text-slate-400">Trigger automatically after 1 hour.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAbandonedCartActive(!abandonedCartActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              abandonedCartActive ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                                abandonedCartActive ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Broadcast Logs */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
                      <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Campaign Broadcast History</h3>
                      <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                        {campaignsList.map((c) => (
                          <div key={c.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                            <div className="truncate max-w-[70%]">
                              <h4 className="text-[11px] font-bold text-slate-800 truncate">{c.subject}</h4>
                              <p className="text-[9px] text-slate-400 font-semibold">{c.date} • {c.recipients} Customers</p>
                            </div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-700">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 12. Store Design Tab */}
          {activeTab === "store-design" && (() => {
            const activeTheme = themes.find((t: any) => t.status === "published") || selectedTheme || themes[0];

            const updateThemeSetting = (fieldId: string, value: any) => {
              if (!selectedTheme) return;
              const pageContent = selectedTheme.pageContent || {};
              const settings = pageContent.settings || {};
              const newSettings = { ...settings, [fieldId]: value };
              const newSelectedTheme = {
                ...selectedTheme,
                pageContent: {
                  ...pageContent,
                  settings: newSettings
                }
              };
              setSelectedTheme(newSelectedTheme);

              // Broadcast live postMessage updates to preview iframes
              const iframes = document.querySelectorAll<HTMLIFrameElement>("#storefront-preview-iframe");
              iframes.forEach((iframe) => {
                if (iframe && iframe.contentWindow) {
                  iframe.contentWindow.postMessage({
                    type: "BASECART_THEME_UPDATE",
                    themeData: {
                      name: newSelectedTheme.name,
                      templateBase: newSelectedTheme.templateBase,
                      colors: {
                        primary: newSettings.colorPrimary || newSelectedTheme.colors?.primary || "#2563EB",
                        secondary: newSettings.colorSecondary || newSelectedTheme.colors?.secondary || "#1D4ED8",
                        accent: newSettings.colorAccent || "#F59E0B"
                      },
                      pageContent: newSelectedTheme.pageContent,
                      settings: newSettings
                    }
                  }, "*");
                  iframe.contentWindow.postMessage({ type: "theme-update", settings: newSettings }, "*");
                }
              });
            };

            const handlePublishTheme = async (themeId: string) => {
              setLoading(true);
              try {
                const res = await fetch(`${API_URL}/store/themes/${themeId}/publish`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  credentials: "include",
                });
                if (res.ok) {
                  const promoted = await res.json();
                  setActionSuccess(`Theme "${promoted.name}" is now active!`);
                  await fetchThemes(promoted.themeId);
                } else {
                  alert("Failed to publish theme.");
                }
              } catch (e) { console.error(e); }
              finally { setLoading(false); }
            };

            const handleSelectThemeFromLibrary = async (libTheme: any) => {
              const existing = themes.find((t: any) => t.name.toLowerCase() === libTheme.name.toLowerCase());
              if (existing) { await handlePublishTheme(existing.themeId); return; }
              setLoading(true);
              try {
                const res = await fetch(`${API_URL}/store/themes`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  credentials: "include",
                  body: JSON.stringify({
                    name: libTheme.name,
                    templateBase: libTheme.templateBase,
                    colors: { primary: libTheme.defaults.colorPrimary, accent: libTheme.defaults.colorSecondary },
                    logoUrl: "",
                    pageContent: {
                      home: { heroTitle: "BUILT FOR PERFORMANCE", heroSubtext: "Premium collections for modern shoppers.", ctaText: "SHOP NOW" },
                      catalog: { pageTitle: "Latest Catalog Arrivals", pageSubtext: "Discover our premium selection." },
                      checkout: { pageTitle: "Secure Checkout", instructions: "All transactions are fully encrypted." },
                      settings: libTheme.defaults
                    }
                  })
                });
                if (res.ok) {
                  const newTheme = await res.json();
                  await handlePublishTheme(newTheme.themeId);
                } else { alert("Failed to install theme."); }
              } catch (e) { console.error(e); }
              finally { setLoading(false); }
            };

            // ─── CUSTOMIZER VIEW ───
            if (customizerOpen) {
              const themeSettings = selectedTheme?.pageContent?.settings || {};
              return (
                <div className="space-y-6 animate-fade-in select-none">
                  {/* Header Bar */}
                  <div className="flex items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCustomizerOpen(false)} className="px-3.5 py-1.5 border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg shadow-sm">← Back</button>
                      <div>
                        <span className="text-[10px] font-extrabold text-[#4F46E5] uppercase tracking-wider block">Theme Customizer</span>
                        <h3 className="text-sm font-bold text-slate-800 leading-none mt-0.5">{selectedTheme ? selectedTheme.name : "Active Theme"}</h3>
                      </div>
                    </div>
                    <button onClick={() => setCustomizerOpen(false)} className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm">Save & Close</button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                    {/* Left 2/3: Live Previewer */}
                    <div className="xl:col-span-2 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-slate-50 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 min-h-[520px] relative overflow-hidden select-none">
                      <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40 z-10 shadow-sm">
                        <button onClick={() => setPreviewMode("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all ${previewMode === "desktop" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>
                          <Monitor className="h-3 w-3" /><span>Desktop</span>
                        </button>
                        <button onClick={() => setPreviewMode("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all ${previewMode === "mobile" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>
                          <Smartphone className="h-3 w-3" /><span>Mobile</span>
                        </button>
                      </div>

                      {previewMode === "desktop" ? (
                        <div className="w-full h-[420px] bg-white rounded-2xl shadow-xl border border-slate-200/70 overflow-hidden flex flex-col relative animate-fade-in">
                          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 bg-slate-50/75 select-none text-[10px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                            </div>
                            <div className="bg-slate-200/50 border border-slate-300/30 rounded px-4 py-0.5 text-[9px] font-mono w-60 text-center truncate">{getStorefrontDisplayUrl(settings.subdomain || "demo")}</div>
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">Live Preview</span>
                          </div>
                          <iframe id="storefront-preview-iframe" src={`${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=${selectedTheme?.templateBase || "Aura"}&previewPrimaryColor=${encodeURIComponent(selectedTheme?.pageContent?.settings?.colorPrimary || selectedTheme?.colors?.primary || "#2563EB")}`} className="w-full flex-1 border-none bg-slate-50" />
                        </div>
                      ) : (
                        <div className="w-64 h-[420px] bg-white rounded-[32px] shadow-2xl border-8 border-slate-900 overflow-hidden flex flex-col relative animate-fade-in">
                          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-slate-900 w-16 h-3 rounded-full z-10 flex items-center justify-end px-2"><span className="w-1 h-1 rounded-full bg-blue-500"></span></div>
                          <iframe id="storefront-preview-iframe" src={`${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=${selectedTheme?.templateBase || "Aura"}&previewPrimaryColor=${encodeURIComponent(selectedTheme?.pageContent?.settings?.colorPrimary || selectedTheme?.colors?.primary || "#2563EB")}`} className="w-full h-full border-none bg-slate-50 pt-5" />
                        </div>
                      )}
                    </div>

                    {/* Right 1/3: Settings Panel */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col h-[520px]">
                      <div className="border-b border-slate-100 pb-3 mb-4 text-left">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Theme Settings</span>
                        <h4 className="text-sm font-black text-slate-800 leading-tight mt-0.5">{selectedTheme?.name} Configuration</h4>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-left no-scrollbar">
                        {THEME_SETTINGS_SCHEMA.map((group) => (
                          <div key={group.id} className="space-y-3">
                            <h5 className="text-[10px] font-black text-[#4F46E5] uppercase tracking-wider border-b border-slate-100 pb-1">{group.title}</h5>
                            <div className="space-y-3 pt-1">
                              {group.fields.map((field) => {
                                const val = themeSettings[field.id] !== undefined ? themeSettings[field.id] : field.default;
                                return (
                                  <div key={field.id} className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-600" htmlFor={field.id}>{field.label}</label>
                                    {field.type === "image" && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <input
                                            id={field.id}
                                            type="text"
                                            value={val || ""}
                                            placeholder="https://... image URL"
                                            onChange={(e) => updateThemeSetting(field.id, e.target.value)}
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                          <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shrink-0 flex items-center gap-1">
                                            <Upload className="h-3 w-3 text-slate-500" />
                                            <span>Upload</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const reader = new FileReader();
                                                  reader.onload = (evt) => {
                                                    const res = evt.target?.result as string;
                                                    if (res) updateThemeSetting(field.id, res);
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                        {val ? (
                                          <div className="relative h-16 w-full bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center group">
                                            <img src={val} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                              type="button"
                                              onClick={() => updateThemeSetting(field.id, "")}
                                              className="absolute top-1 right-1 px-1.5 py-0.5 bg-slate-950/80 text-white rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                    {field.type === "color" && (
                                      <div className="flex items-center gap-2">
                                        <input id={`${field.id}-color`} type="color" value={val || "#000000"} onChange={(e) => updateThemeSetting(field.id, e.target.value)} className="h-8 w-8 rounded border border-slate-200 cursor-pointer shrink-0" />
                                        <input id={field.id} type="text" value={val || ""} onChange={(e) => updateThemeSetting(field.id, e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono w-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                      </div>
                                    )}
                                    {field.type === "select" && (
                                      <select id={field.id} value={val || ""} onChange={(e) => updateThemeSetting(field.id, e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {field.options?.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                      </select>
                                    )}
                                    {field.type === "checkbox" && (
                                      <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
                                        <input id={field.id} type="checkbox" checked={!!val} onChange={(e) => updateThemeSetting(field.id, e.target.checked)} className="rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5" />
                                        <span className="text-[11px] font-semibold text-slate-500">Enable</span>
                                      </label>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ─── MARKETPLACE VIEW ───
            return (
              <div className="space-y-6 animate-fade-in select-none">

                {/* 1. Core Web Vitals & Speed Performance Header Bar */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-700">Speed Score & Core Web Vitals</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                      98/100 · Fast
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">LCP P75</span>
                      <span className="font-extrabold text-slate-800">320 ms</span>
                      <span className="ml-1 text-[10px] text-emerald-600 font-bold">Good</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100"></div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">INP P75</span>
                      <span className="font-extrabold text-slate-800">8 ms</span>
                      <span className="ml-1 text-[10px] text-emerald-600 font-bold">Good</span>
                    </div>
                    <div className="h-6 w-px bg-slate-100"></div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">CLS</span>
                      <span className="font-extrabold text-slate-800">0.00</span>
                      <span className="ml-1 text-[10px] text-emerald-600 font-bold">Good</span>
                    </div>
                  </div>
                </div>

                {/* 2. Main Active Theme Preview Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden select-none">
                  {/* Clean Direct Live Storefront View Container */}
                  <div className="relative w-full h-[480px] bg-slate-50 overflow-hidden border-b border-slate-200/80">
                    <iframe
                      id="storefront-preview-iframe"
                      src={`${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=${activeTheme?.templateBase || "Satoshi"}&previewPrimaryColor=${encodeURIComponent(activeTheme?.colors?.primary || "#2563EB")}`}
                      className="w-full h-full border-none bg-white"
                      title="Storefront Live View"
                    />
                  </div>

                  {/* Active Theme Info & Actions Bar (Shopify Style Footer) */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Satoshi</h3>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                          Active Theme
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>Last saved: Just now</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-blue-600 font-bold">● Version 1.0.0</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => { if (activeTheme) setSelectedTheme(activeTheme); setCustomizerOpen(true); }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Palette className="h-3.5 w-3.5" />
                        <span>Customize Theme</span>
                      </button>

                      <button
                        onClick={() => { if (activeTheme) setSelectedTheme(activeTheme); setCustomizerOpen(true); }}
                        className="px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        Theme Settings
                      </button>

                      <a
                        href={getStorefrontLink(settings.subdomain || "demo")}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>View Store</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Fullscreen Theme Preview Modal */}
                {previewThemeModalOpen && themeToPreview && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col z-[9999] animate-fade-in">
                    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm select-none">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Preview</span>
                        <h3 className="text-sm font-black text-slate-800 leading-none">{themeToPreview.name}</h3>
                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{themeToPreview.price}</span>
                      </div>
                      <div className="flex gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-300/30">
                        {(["desktop", "tablet", "mobile"] as const).map((d) => (
                          <button key={d} onClick={() => setPreviewDevice(d)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase rounded-md transition-all ${previewDevice === d ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"}`}>
                            {d === "tablet" ? <Smartphone className="h-3 w-3 rotate-90" /> : d === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                            <span>{d}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={async () => { setPreviewThemeModalOpen(false); await handleSelectThemeFromLibrary(themeToPreview); }} className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm">Apply Theme</button>
                        <button onClick={() => setPreviewThemeModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs rounded-lg shadow-sm">Close</button>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
                      <div className={`bg-white shadow-2xl overflow-hidden flex flex-col relative animate-fade-in ${previewDevice === "desktop" ? "w-full h-full rounded-2xl border border-slate-200" : previewDevice === "tablet" ? "w-[768px] h-full rounded-[32px] border-[12px] border-slate-900" : "w-[375px] h-[550px] rounded-[36px] border-8 border-slate-900"}`}>
                        <iframe src={`${getStorefrontLink(settings.subdomain || "demo")}?previewThemeBase=${themeToPreview.templateBase}&previewPrimaryColor=${encodeURIComponent(themeToPreview.defaults.colorPrimary)}`} className="w-full h-full border-none bg-slate-50" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Feature Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none pt-4 text-left">
                  {[
                    { label: "Mobile Responsive", desc: "Pixel-perfect mobile shopping experience." },
                    { label: "No Code Customization", desc: "No coding or Liquid templates required." },
                    { label: "High Speed Performance", desc: "95+ Lighthouse speed scores pre-tuned." },
                    { label: "Regular Upgrades", desc: "Free feature updates and fixes automatically." }
                  ].map((feat) => (
                    <div key={feat.label} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs space-y-1">
                      <h4 className="text-xs font-black text-slate-800 leading-tight">{feat.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal font-medium">{feat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA Banner */}
                <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left select-none">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{"Can't find the perfect theme?"}</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Our design team can create a custom brand-specific storefront for your store.</p>
                  </div>
                  <button onClick={() => alert("Please open a ticket in settings to contact our designers.")} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-extrabold rounded-lg shadow-sm shrink-0">Contact Our Team</button>
                </div>
              </div>
            );
          })()}

          {/* Emails & Notifications Tab */}
          {activeTab === "emails" && (
            <div className="space-y-6 animate-fade-in">
              <EmailsTab token={token} API_URL={API_URL} storeName={settings.storeName} />
            </div>
          )}

          {/* Headless Architecture Tab */}
          {activeTab === "headless" && (
            <div className="space-y-6 animate-fade-in max-w-2xl">
              <div className="bg-white border border-slate-200/90 p-8 md:p-12 rounded-2xl shadow-xs text-center space-y-4">
                <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto font-bold border border-indigo-100/80 shadow-xs">
                  <Code className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight pt-2">Headless Architecture</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    This feature will be added soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agentic Store & AI / Brand Identity Tab */}
          {(activeTab === "agentic" || activeTab === "brand") && (
            <div className="space-y-6 animate-fade-in">
              <BrandIdentityTab
                token={token}
                API_URL={API_URL}
                settings={settings}
                products={products}
                onUpdateSettings={(newSettings) => setSettings((prev: any) => ({ ...prev, ...newSettings }))}
              />
            </div>
          )}

          {/* 13. Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-2">Payments Setup</h2>
                <p className="text-sm text-slate-500">Configure Indian Payment gateways, link API secret keys, and manage checkout options</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-2xl">
                <form onSubmit={saveSettings} className="space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">Razorpay API Integration</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4">Keys are encrypted at rest. We never share secrets in customer-facing storefront calls.</p>

                    <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/20 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg select-none">RP</div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Razorpay India Checkout</h4>
                          <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">Collect credit cards, UPI, netbanking, and popular wallets instantly.</p>
                        </div>
                        <span className="ml-auto bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 px-2 py-0.5 rounded-full select-none">Installed</span>
                      </div>
                    </div>

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

                  <div className="border-t border-slate-100 pt-4">
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

                  <div className="border-t border-slate-100 pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                      Save Payment Configurations
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DEDICATED BASECART SETTINGS STUDIO */}
          {(activeTab === "settings" || isSettingsPortalOpen) && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col font-sans overflow-hidden animate-fade-in">
              <div className="bg-[#F8FAFC] w-full h-full flex flex-col overflow-hidden">
                {/* Top Settings Studio Control Bar */}
                <div className="h-16 bg-white border-b border-slate-200/90 px-4 md:px-8 flex items-center justify-between shrink-0 shadow-xs">
                  <div className="flex items-center gap-4">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); closeSettingsPortal(); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180 text-slate-500" />
                      <span>Back to Dashboard</span>
                    </a>

                    <div className="h-5 w-px bg-slate-200" />

                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                        {settings.storeName ? settings.storeName.slice(0, 2).toUpperCase() : "PI"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                            {settings.storeName || "Pixelcart"}
                          </h2>
                          <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                            BASECART STUDIO
                          </span>
                        </div>
                        <a
                          href={getStorefrontDisplayUrl(settings.subdomain || "pixelcart")}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <span>{settings.subdomain ? `${settings.subdomain}.basecart.app` : "pixelcart.basecart.app"}</span>
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={loading}
                      onClick={() => handleSaveSettings()}
                      className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
                    >
                      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Theme preferences toggled.")}
                      className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                      title="Toggle Light/Dark Theme"
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); closeSettingsPortal(); }}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer md:hidden"
                      title="Close Settings Studio"
                    >
                      <X className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* Mobile Horizontal Category Pills (md:hidden) */}
                <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
                  {[
                    { id: "general", label: "General", icon: Home },
                    { id: "plan", label: "Plan", icon: Layers },
                    { id: "billing", label: "Billing", icon: DollarSign },
                    { id: "payments", label: "Payments", icon: CreditCard },
                    { id: "shipping", label: "Shipping", icon: Truck },
                    { id: "checkout", label: "Checkout", icon: ShoppingCart },
                    { id: "taxes", label: "Taxes", icon: Scale },
                    { id: "domains", label: "Domains", icon: Globe },
                    { id: "notifications", label: "Emails", icon: Bell },
                    { id: "policies", label: "Policies", icon: FileText },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = settingsSubTab === item.id;
                    const sectionSlug = item.id;
                    const itemHref = `/store/${settings.subdomain || "my-store"}/settings/${sectionSlug}`;
                    return (
                      <a
                        key={item.id}
                        href={itemHref}
                        onClick={(e) => { e.preventDefault(); changeSettingsSubTab(item.id as any); }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                          isActive
                            ? "bg-[#4F46E5] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </div>

                {/* Main Settings Canvas - 320px Sidebar + 1fr Full Viewport Content (Shopify / Stripe / Vercel layout) */}
                <div className="grid h-[calc(100vh-64px)] grid-cols-1 md:grid-cols-[320px_1fr] w-full max-w-none m-0 overflow-hidden">
                  {/* Left Categorized Navigation Panel */}
                  <aside className="hidden md:flex w-[320px] bg-white border-r border-slate-200/90 p-5 flex-col shrink-0 overflow-y-auto h-full rounded-none shadow-none">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search settings..."
                        value={settingsSearchQuery}
                        onChange={(e) => setSettingsSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 font-medium"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[9px] font-mono font-bold bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded">
                        ⌘K
                      </span>
                    </div>

                    {/* Grouped Categorized Navigation */}
                    <div className="space-y-5 flex-1">
                      {[
                        {
                          category: "STORE IDENTITY",
                          items: [
                            { id: "general", label: "Store Profile & Entity", icon: Home, badge: "Active" },
                            { id: "domains", label: "Custom Domains", icon: Globe },
                            { id: "policies", label: "Store Legal Policies", icon: FileText },
                          ],
                        },
                        {
                          category: "FINANCIALS & TAXATION",
                          items: [
                            { id: "payments", label: "Payment Gateways", icon: CreditCard, badge: "Razorpay" },
                            { id: "taxes", label: "GST & Tax Identifiers", icon: Scale, badge: "18% GST" },
                            { id: "billing", label: "Billing & Invoices", icon: DollarSign },
                            { id: "plan", label: "Subscription Plan", icon: Layers, badge: "Growth" },
                          ],
                        },
                        {
                          category: "LOGISTICS & CHECKOUT",
                          items: [
                            { id: "shipping", label: "Shipping & Rates", icon: Truck },
                            { id: "checkout", label: "Checkout Rules", icon: ShoppingCart },
                            { id: "locations", label: "Fulfillment Locations", icon: MapPin },
                          ],
                        },
                        {
                          category: "PLATFORM & TEAM",
                          items: [
                            { id: "users", label: "Staff & Permissions", icon: Users },
                            { id: "notifications", label: "Email Notifications", icon: Bell },
                            { id: "apps", label: "Apps & Integrations", icon: Puzzle },
                            { id: "privacy", label: "Customer Data Privacy", icon: Lock },
                          ],
                        },
                      ].map((grp) => {
                        const matchingItems = grp.items.filter((item) =>
                          item.label.toLowerCase().includes(settingsSearchQuery.toLowerCase())
                        );
                        if (matchingItems.length === 0) return null;
                        return (
                          <div key={grp.category} className="space-y-1">
                            <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                              {grp.category}
                            </div>
                            {matchingItems.map((item) => {
                              const Icon = item.icon;
                              const isActive = settingsSubTab === item.id;
                              const itemHref = `/store/${settings.subdomain || "my-store"}/settings/${item.id}`;
                              return (
                                <a
                                  key={item.id}
                                  href={itemHref}
                                  onClick={(e) => { e.preventDefault(); changeSettingsSubTab(item.id as any); }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isActive
                                      ? "bg-[#EEF2FF] text-[#4F46E5] font-bold shadow-2xs border border-indigo-100/80"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                                  }`}
                                >
                                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#4F46E5]" : "text-slate-400"}`} />
                                  <span className="truncate">{item.label}</span>
                                  {item.badge && (
                                    <span
                                      className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                                        item.badge === "Active"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-slate-100 text-slate-500 border-slate-200/60"
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Profile Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 bg-indigo-100 border border-indigo-200/80 rounded-full flex items-center justify-center font-bold text-xs text-indigo-700 uppercase shrink-0">
                          {(merchantOwnerName || email || "Kiran S")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "KS"}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <div className="text-xs font-extrabold text-slate-900 truncate">
                            {merchantOwnerName || "Kiran S"}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {email || "devkiraa@gmail.com"}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                    </div>
                  </aside>

                  {/* Right Settings Workspace Canvas - Fills 100% Remaining Viewport Width */}
                  <main className="flex-1 bg-[#F8FAFC] w-full max-w-none m-0 p-6 md:p-8 overflow-y-auto space-y-6">
                  {/* 1. GENERAL SETTINGS */}
                  {settingsSubTab === "general" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-slate-700" />
                          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">General</h2>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                          D1 Sync Active
                        </span>
                      </div>

                      {/* Business details (Tailored for India) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Business details</h3>
                            <p className="text-xs text-slate-500">Business entity registered in India for GST compliance, tax invoicing, and storefront operations</p>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-slate-800">
                            <span>🇮🇳</span>
                            <span>India Entity</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Business / Legal Entity Name</label>
                              <input
                                type="text"
                                value={settings.storeName || ""}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                placeholder="e.g. Iron Forge Pvt Ltd"
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Registered GSTIN (15-Digit GST Number)</label>
                              <input
                                type="text"
                                maxLength={15}
                                placeholder="32AAAAA0000A1Z5"
                                value={settings.gstin || ""}
                                onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none uppercase font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Registered State / Union Territory (Place of Supply)</label>
                              <select
                                value={settings.registeredState || "Kerala"}
                                onChange={(e) => setSettings({ ...settings, registeredState: e.target.value, placeOfSupply: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                              >
                                {["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"].map((st) => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Operating Country</label>
                              <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                                <span>India (Domestic INR market)</span>
                                <span>🇮🇳</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Store contact details (Tailored for India) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Store contact details</h3>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Support Email</label>
                              <input
                                type="email"
                                value={settings.supportEmail || email || ""}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Indian Support Phone (+91)</label>
                              <input
                                type="text"
                                placeholder="+91 98765 43210"
                                value={settings.supportPhone || ""}
                                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Indian Store Address (Street, District, State & PIN Code)</label>
                            <textarea
                              rows={2}
                              value={settings.registeredBusinessAddress || ""}
                              onChange={(e) => setSettings({ ...settings, registeredBusinessAddress: e.target.value })}
                              placeholder="Door No, Street Name, District, State, PIN Code..."
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Store defaults (Tailored for Indian Customers) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Store defaults (India Market)</h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Store Currency</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-indigo-700">₹</span>
                                <span className="text-xs font-bold text-slate-900">Indian Rupee (INR ₹)</span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">Primary Currency for Indian Checkout</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Region</label>
                            <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-between">
                              <span>India (Domestic & Interstate Orders)</span>
                              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Unit system</label>
                              <select className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none">
                                <option value="Metric system">Metric system (kg, g, cm, m)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Default weight unit</label>
                              <select
                                value={settings.weightUnit || "Kilogram (kg)"}
                                onChange={(e) => setSettings({ ...settings, weightUnit: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              >
                                <option value="Kilogram (kg)">Kilogram (kg)</option>
                                <option value="Gram (g)">Gram (g)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Time zone</label>
                            <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-between">
                              <span>(GMT+05:30) IST — Chennai, Kolkata, Mumbai, New Delhi</span>
                              <span className="text-[11px] text-slate-500 hidden sm:inline">Indian Standard Time</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                          To change your user level time zone and language visit your <span className="text-indigo-600 underline font-semibold cursor-pointer">account settings</span>
                        </p>
                      </div>

                      {/* Order ID format (Matching Screenshot) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Order ID format</h3>
                          <p className="text-xs text-slate-500">Shown on the order page, customer pages, and customer order notifications to identify order</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Prefix</label>
                            <input
                              type="text"
                              value={settings.orderIdPrefix ?? "#"}
                              onChange={(e) => setSettings({ ...settings, orderIdPrefix: e.target.value })}
                              placeholder="#"
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Suffix</label>
                            <input
                              type="text"
                              value={settings.orderIdSuffix ?? ""}
                              onChange={(e) => setSettings({ ...settings, orderIdSuffix: e.target.value })}
                              placeholder=""
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium pt-1">
                          Your order ID will appear as <span className="font-mono font-bold text-slate-900">{settings.orderIdPrefix ?? "#"}1001{settings.orderIdSuffix ?? ""}</span>, <span className="font-mono font-bold text-slate-900">{settings.orderIdPrefix ?? "#"}1002{settings.orderIdSuffix ?? ""}</span>, <span className="font-mono font-bold text-slate-900">{settings.orderIdPrefix ?? "#"}1003{settings.orderIdSuffix ?? ""}</span>, ...
                        </p>
                      </div>

                      {/* Order processing (Matching Screenshot) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900">Order processing</h3>
                          <span className="text-slate-400 text-xs font-bold" title="Order fulfillment automation rules">ⓘ</span>
                        </div>

                        <div className="space-y-3">
                          <div className="text-xs font-bold text-slate-800">After an order has been paid</div>
                          <div className="space-y-2">
                            {[
                              { id: "all", label: "Automatically fulfill the order's line items" },
                              { id: "gift_cards", label: "Automatically fulfill only the gift cards of the order" },
                              { id: "none", label: "Don't fulfill any of the order's line items automatically" },
                            ].map((opt) => (
                              <label key={opt.id} className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="autoFulfill"
                                  value={opt.id}
                                  checked={(settings.autoFulfill || "none") === opt.id}
                                  onChange={(e) => setSettings({ ...settings, autoFulfill: e.target.value })}
                                  className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="text-xs font-bold text-slate-800">After an order has been fulfilled and paid, or when all items have been refunded</div>
                            <label className="flex items-start gap-3 text-xs font-medium text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.autoArchive !== false}
                                onChange={(e) => setSettings({ ...settings, autoArchive: e.target.checked })}
                                className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                              />
                              <div>
                                <div className="font-bold text-slate-900">Automatically archive the order</div>
                                <div className="text-[11px] text-slate-500">The order will be removed from your list of open orders.</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Store assets (Matching Screenshot) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Store assets</h3>

                        <div className="space-y-3">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <div>
                                <div className="text-xs font-bold text-slate-900">Metafields</div>
                                <div className="text-[11px] text-slate-500 font-medium">Available in themes and configurable for Storefront API</div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Resources (Matching Screenshot) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Resources</h3>

                        <div className="space-y-3">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Code className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-900">Change log</span>
                            </div>
                            <button onClick={() => alert("Showing Basecart Spring '26 release notes")} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">View change log</button>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-900">Basecart Help Center</span>
                            </div>
                            <button onClick={() => alert("Opening Basecart Help Documentation")} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">Get help</button>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-900">Hire a Basecart Partner</span>
                            </div>
                            <button onClick={() => alert("Connecting to Basecart Verified Designers & Developers")} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50">Hire a Partner</button>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60">
                            <div className="flex items-center gap-3">
                              <Layers className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-900">Keyboard shortcuts</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span className="text-xs font-bold text-slate-900">Store activity log</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Transfer store (Matching Screenshot) */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Transfer store</h3>
                            <p className="text-xs text-slate-500">Move this store into an organization or transfer to an external owner. <span className="text-indigo-600 underline font-medium cursor-pointer">Learn more</span></p>
                          </div>
                          <button onClick={() => alert("Store transfer portal initialized.")} className="px-4 py-2 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl hover:bg-slate-50">Manage</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. PAYMENTS SETTINGS */}
                  {settingsSubTab === "payments" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <CreditCard className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Payment Providers & Gateways</h2>
                      </div>

                      {/* Razorpay Gateway */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">Razorpay India Integration</h3>
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            Encrypted at Rest
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Accept Credit Cards, Debit Cards, Netbanking, UPI & Wallets seamlessly in Indian Rupees.</p>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                            <input
                              type="text"
                              placeholder="rzp_live_..."
                              value={settings.razorpayKey || ""}
                              onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
                            <input
                              type="password"
                              placeholder="••••••••••••••••"
                              value={settings.razorpaySecret || ""}
                              onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cash on Delivery & UPI */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Manual Payment Methods</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</div>
                              <div className="text-[11px] text-slate-500 font-medium">Allow customers to pay in cash upon package delivery</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={settings.codEnabled !== false}
                              onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum COD Order Amount (₹)</label>
                              <input
                                type="number"
                                value={settings.codMinAmount || 0}
                                onChange={(e) => setSettings({ ...settings, codMinAmount: Number(e.target.value) })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Direct UPI ID / VPA</label>
                              <input
                                type="text"
                                placeholder="merchant@upi"
                                value={settings.upiVpa || ""}
                                onChange={(e) => setSettings({ ...settings, upiVpa: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. SHIPPING & DELIVERY SETTINGS */}
                  {settingsSubTab === "shipping" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Truck className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Shipping and Delivery</h2>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Standard Shipping Rules</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Flat Rate Shipping Fee (₹)</label>
                            <input
                              type="number"
                              value={settings.shippingFee ?? 50}
                              onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Free Shipping Minimum Threshold (₹)</label>
                            <input
                              type="number"
                              value={settings.freeShippingMinOrder ?? 999}
                              onChange={(e) => setSettings({ ...settings, freeShippingMinOrder: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Handling Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 1-2 business days"
                            value={settings.handlingDays || "1-2 business days"}
                            onChange={(e) => setSettings({ ...settings, handlingDays: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. CHECKOUT SETTINGS */}
                  {settingsSubTab === "checkout" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <ShoppingCart className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Checkout Preferences</h2>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Customer Accounts</h3>
                        <p className="text-xs text-slate-500">Determine whether customer login is required before checkout</p>

                        <select
                          value={settings.customerAccountPolicy || "optional"}
                          onChange={(e) => setSettings({ ...settings, customerAccountPolicy: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        >
                          <option value="optional">Accounts are optional (Guest checkout enabled)</option>
                          <option value="required">Accounts are required (Must sign in before checkout)</option>
                          <option value="disabled">Accounts are disabled (Guest checkout only)</option>
                        </select>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Customer Address Form Options</h3>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.phoneRequired !== false}
                              onChange={(e) => setSettings({ ...settings, phoneRequired: e.target.checked })}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">Require customer phone number</div>
                              <div className="text-[11px] text-slate-500">Needed for SMS updates & delivery courier notifications</div>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.address2Required === true}
                              onChange={(e) => setSettings({ ...settings, address2Required: e.target.checked })}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900">Require Apartment / Suite / Address Line 2</div>
                              <div className="text-[11px] text-slate-500">Make address line 2 a mandatory field</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. TAXES AND DUTIES SETTINGS */}
                  {settingsSubTab === "taxes" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Scale className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Taxes and Duties</h2>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">GST & Indirect Tax Configurations</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
                            <input
                              type="number"
                              value={settings.taxRate ?? 18}
                              onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Place of Supply (State)</label>
                            <input
                              type="text"
                              placeholder="e.g. Kerala / Maharashtra"
                              value={settings.placeOfSupply || ""}
                              onChange={(e) => setSettings({ ...settings, placeOfSupply: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pricesIncludeTax !== false}
                            onChange={(e) => setSettings({ ...settings, pricesIncludeTax: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">All storefront prices include tax</div>
                            <div className="text-[11px] text-slate-500">Tax is calculated as inclusive in cart & invoices</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 6. DOMAINS SETTINGS */}
                  {settingsSubTab === "domains" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Globe className="h-5 w-5 text-slate-700" />
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">Domains & URL Setup</h2>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">Basecart Subdomain</h3>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                          <div className="font-mono text-xs font-bold text-slate-800">
                            {getStorefrontDisplayUrl(settings.subdomain || "demo")}
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Primary Active
                          </span>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-3">
                          <h4 className="text-xs font-bold text-slate-900">Connect Custom Domain (Pro Plan)</h4>
                          <input
                            type="text"
                            placeholder="e.g. shop.yourdomain.com"
                            value={settings.customDomain || ""}
                            onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-500">
                            Point your domain CNAME record to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-indigo-600">custom.basecart.app</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. POLICIES SETTINGS */}
                  {settingsSubTab === "policies" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-slate-700" />
                          <h2 className="text-xl font-bold tracking-tight text-slate-900">Store Legal Policies</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              refundPolicy: `Standard Refund Policy for ${settings.storeName || "Store"}:\nCustomers can request a return within 7 days of package delivery. Items must be unused and in original packaging.`,
                              privacyPolicy: `Privacy Policy for ${settings.storeName || "Store"}:\nWe respect customer data privacy. We never share customer personal information with third parties except for order processing.`,
                              termsOfService: `Terms of Service for ${settings.storeName || "Store"}:\nBy accessing this website, customers agree to comply with our terms and applicable laws.`,
                              shippingPolicy: `Shipping Policy for ${settings.storeName || "Store"}:\nOrders are dispatched within 1-2 business days via express courier with real-time tracking.`,
                            });
                            setActionSuccess("Default policies generated!");
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-indigo-200"
                        >
                          ⚡ Auto-Generate Defaults
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-2">
                          <label className="block text-xs font-bold text-slate-900">Refund Policy</label>
                          <textarea
                            rows={4}
                            value={settings.refundPolicy || ""}
                            onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            placeholder="Enter refund and returns policy terms..."
                          />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-2">
                          <label className="block text-xs font-bold text-slate-900">Privacy Policy</label>
                          <textarea
                            rows={4}
                            value={settings.privacyPolicy || ""}
                            onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            placeholder="Enter privacy policy terms..."
                          />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-2">
                          <label className="block text-xs font-bold text-slate-900">Terms of Service</label>
                          <textarea
                            rows={4}
                            value={settings.termsOfService || ""}
                            onChange={(e) => setSettings({ ...settings, termsOfService: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            placeholder="Enter terms of service..."
                          />
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs space-y-2">
                          <label className="block text-xs font-bold text-slate-900">Shipping Policy</label>
                          <textarea
                            rows={4}
                            value={settings.shippingPolicy || ""}
                            onChange={(e) => setSettings({ ...settings, shippingPolicy: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            placeholder="Enter shipping timelines and courier policies..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. NOTIFICATION & EMAIL SETTINGS */}
                  {settingsSubTab === "notifications" && (
                    <div className="w-full max-w-none space-y-6 animate-fade-in">
                      <EmailsTab token={token} API_URL={API_URL} storeName={settings.storeName} />
                    </div>
                  )}

                  {/* 10. SUBSCRIPTION PLAN SETTINGS */}
                  {settingsSubTab === "plan" && (
                    <div className="w-full space-y-6 animate-fade-in">
                      {/* Sticky Page Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Plan & Subscription</h2>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {billingInfo.isTrial ? "60-Day Free Trial (Growth Tier)" : `Active ${(billingInfo.plan || settings.plan || "growth").toUpperCase()} Tier`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Manage store usage limits, feature entitlements, billing cycles, and subscription preferences.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => fetchBillingData()}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                          >
                            <History className="h-3.5 w-3.5 text-slate-400" />
                            <span>Refresh Live Metrics</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveSettings()}
                            disabled={loading}
                            className="px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
                          >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>

                      {/* 60-Day Free Trial Callout Banner with Razorpay Payment Method Action */}
                      {(billingInfo.isTrial || calculateTrialDaysRemaining(settings.createdAt) > 0) && (
                        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white shrink-0">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold flex items-center gap-2">
                                <span>60-Day Free Trial Active</span>
                                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                                  {billingInfo.trialDaysRemaining ?? calculateTrialDaysRemaining(settings.createdAt)} Days Remaining
                                </span>
                              </h4>
                              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                                Full Growth Plan features unlocked for ₹0. Plan changes are locked during trial, but you can set up your Razorpay payment method below!
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetupRazorpayPaymentMethod()}
                            disabled={loading}
                            className="px-4 py-2 bg-white hover:bg-slate-100 text-[#4F46E5] font-extrabold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition-all active:scale-98 flex items-center gap-1.5"
                          >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> : <Zap className="h-3.5 w-3.5 text-indigo-600 fill-indigo-600" />}
                            <span>{billingInfo.hasPaymentMethod ? "Razorpay Method Attached" : "Set Up Payment Method"}</span>
                          </button>
                        </div>
                      )}

                      {/* 1. Full-Width Current Plan Overview Card */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-[#4F46E5] to-indigo-700 text-white rounded-2xl flex items-center justify-center font-bold shadow-xs shrink-0">
                              <Crown className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Active Plan</span>
                                <span className="bg-indigo-50 text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100 font-mono">
                                  {billingInfo.isTrial ? "Free Trial (₹0 / mo)" : `${formatINR(billingInfo.price ?? 699)} / mo`}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                {(billingInfo.plan || settings.plan || "growth").charAt(0).toUpperCase() + (billingInfo.plan || settings.plan || "growth").slice(1)} Plan
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Next Renewal: <strong className="text-slate-800">{billingInfo.nextBillingDate || "15 Aug 2026"}</strong></span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span>Unlimited API Access</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleSetupRazorpayPaymentMethod()}
                              disabled={loading}
                              className="px-5 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-98"
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />}
                              <span>{billingInfo.hasPaymentMethod ? "Razorpay AutoPay Active" : "Set Up Payment Method"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 2. Individual Usage Metric Analytics Grid (4 Independent Cards) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Orders Metric */}
                        {(() => {
                          const used = billingInfo.ordersUsed ?? 0;
                          const limit = billingInfo.ordersLimit ?? 5000;
                          const percent = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
                          const remaining = Math.max(0, limit - used);
                          return (
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Monthly Orders</span>
                                <span className="text-[11px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                                  {percent}% Used
                                </span>
                              </div>
                              <div>
                                <div className="text-2xl font-black text-slate-900">{used.toLocaleString()}</div>
                                <div className="text-xs text-slate-500 font-medium">of {limit >= 99999 ? "Unlimited" : limit.toLocaleString()} orders limit</div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-[#4F46E5] h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                                  <span>{limit >= 99999 ? "Unlimited" : `${remaining.toLocaleString()} remaining`}</span>
                                  <span>Monthly Cycle</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Products Metric */}
                        {(() => {
                          const used = billingInfo.productsUsed ?? 0;
                          const limit = billingInfo.productsLimit ?? 2000;
                          const percent = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
                          const remaining = Math.max(0, limit - used);
                          return (
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Catalog Products</span>
                                <span className="text-[11px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                                  {percent}% Used
                                </span>
                              </div>
                              <div>
                                <div className="text-2xl font-black text-slate-900">{used.toLocaleString()}</div>
                                <div className="text-xs text-slate-500 font-medium">of {limit >= 99999 ? "Unlimited" : limit.toLocaleString()} items limit</div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                                  <span>{limit >= 99999 ? "Unlimited" : `${remaining.toLocaleString()} remaining`}</span>
                                  <span>Active Catalog</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Storage Metric */}
                        {(() => {
                          const used = billingInfo.storageUsed ?? 0.05;
                          const limit = billingInfo.storageLimit ?? 20;
                          const percent = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
                          const avail = Number(Math.max(0, limit - used).toFixed(1));
                          return (
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Cloud Storage</span>
                                <span className="text-[11px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                  {percent}% Used
                                </span>
                              </div>
                              <div>
                                <div className="text-2xl font-black text-slate-900">{used} GB</div>
                                <div className="text-xs text-slate-500 font-medium">of {limit} GB media storage</div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                                  <span>{avail} GB available</span>
                                  <span>Global Edge CDN</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Staff Metric */}
                        {(() => {
                          const used = billingInfo.staffUsed ?? 1;
                          const limit = billingInfo.staffLimit ?? 10;
                          const percent = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
                          const avail = Math.max(0, limit - used);
                          return (
                            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Staff Accounts</span>
                                <span className="text-[11px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                                  {percent}% Used
                                </span>
                              </div>
                              <div>
                                <div className="text-2xl font-black text-slate-900">{used} Accounts</div>
                                <div className="text-xs text-slate-500 font-medium">of {limit} total staff seats</div>
                              </div>
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                                  <span>{avail} seats available</span>
                                  <span>Role RBAC</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* 3. Main 70% / 30% Expanded Content Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Main Section (70% -> col-span-8) */}
                        <div className="lg:col-span-8 space-y-6">
                          {/* Plan Preferences Cards Grid */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900">Plan Controls & Configuration</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Manage automated alerts, feature toggles, and usage limits.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                { id: "overage", title: "Usage Overage Alerts", desc: "Get notified via email when order volume reaches 80% or 90% of your plan limit.", icon: Bell, color: "bg-indigo-50 text-indigo-600", active: true },
                                { id: "safeguard", title: "Auto-Upgrade Safeguard", desc: "Automatically transition to Pro plan when monthly limit is reached to prevent downtime.", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600", active: true },
                                { id: "routing", title: "Custom Domain Routing", desc: "Connect shop.yourdomain.com with auto-renewing SSL encryption certificates.", icon: Globe, color: "bg-blue-50 text-blue-600", active: true },
                                { id: "cdn", title: "Priority CDN Asset Delivery", desc: "Accelerate storefront image loading using Cloudflare global edge network.", icon: Database, color: "bg-amber-50 text-amber-600", active: true },
                              ].map((pref) => {
                                const PrefIcon = pref.icon;
                                return (
                                  <div key={pref.id} className="p-4 rounded-xl border border-slate-200/90 hover:border-indigo-200 bg-white transition-all space-y-3 shadow-2xs">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${pref.color}`}>
                                        <PrefIcon className="h-4 w-4" />
                                      </div>
                                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${pref.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                        {pref.active ? "Enabled" : "Disabled"}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-extrabold text-slate-900">{pref.title}</h4>
                                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">{pref.desc}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setActionSuccess(`${pref.title} settings updated!`)}
                                      className="text-xs font-bold text-[#4F46E5] hover:text-indigo-700 flex items-center gap-1 pt-1 cursor-pointer"
                                    >
                                      <span>Configure Settings</span>
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Feature Limits & Entitlements Table */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div>
                              <h3 className="text-base font-extrabold text-slate-900">Feature Entitlements</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Overview of features and quota allocations included in your current tier.</p>
                            </div>

                            <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50/80 border-b border-slate-200/90 text-[10px] font-extrabold uppercase text-slate-400">
                                    <th className="py-3 px-4">Feature Name</th>
                                    <th className="py-3 px-4">Allocation / Status</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                  {[
                                    { name: "Razorpay Native Checkout", limit: "Included (0% platform fee)", cat: "Payments", status: "Active" },
                                    { name: "Custom Domain SSL", limit: "1 Domain (CNAME routing)", cat: "Hosting", status: "Active" },
                                    { name: "Multi-Currency Checkout", limit: "15 Currencies Supported", cat: "Storefront", status: "Active" },
                                    { name: "Automated Tax Calculation (GST)", limit: "Automated 18% Rule", cat: "Finance", status: "Active" },
                                    { name: "White-Label Email Templates", limit: "Tier Included", cat: "Marketing", status: "Active" },
                                    { name: "Dedicated API Keys & Webhooks", limit: "10,000 req / min", cat: "Developer", status: "Active" },
                                  ].map((row) => (
                                    <tr key={row.name} className="hover:bg-slate-50/60 transition-colors">
                                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                                      <td className="py-3 px-4 text-slate-600">{row.limit}</td>
                                      <td className="py-3 px-4">
                                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                                          {row.cat}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <button
                                          type="button"
                                          onClick={() => setActionSuccess(`Managing ${row.name}`)}
                                          className="text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer"
                                        >
                                          Manage
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Danger Zone */}
                          <div className="bg-rose-50/40 border border-rose-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div>
                              <h3 className="text-base font-extrabold text-rose-900">Danger Zone</h3>
                              <p className="text-xs text-rose-700 mt-0.5">Critical store subscription actions and ownership controls.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">Cancel Store Subscription</h4>
                                <p className="text-[11px] text-slate-500">Canceling will downgrade your store to Free tier at the end of billing cycle.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (billingInfo.isTrial) {
                                    setActionError("Plan changes are locked during your 60-day free trial as full Growth features are active for ₹0.");
                                  } else {
                                    handleSelectPlanTier("free");
                                  }
                                }}
                                disabled={loading}
                                className="px-4 py-2 border border-rose-300 hover:bg-rose-600 hover:text-white text-rose-700 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer shrink-0"
                              >
                                {loading ? "Updating..." : "Cancel Subscription"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right Sticky Column (30% -> col-span-4) */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                          {/* Razorpay Payment Method & Monthly Plan Subscription Card */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-extrabold text-slate-900">Payment & Plan Checkout</h3>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${billingInfo.hasPaymentMethod ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                {billingInfo.hasPaymentMethod ? "Configured" : "Action Needed"}
                              </span>
                            </div>
                            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 text-xs">
                              <div className="flex items-center gap-2 font-extrabold text-slate-900">
                                <CreditCard className="h-4 w-4 text-indigo-600" />
                                <span>{billingInfo.hasPaymentMethod ? (billingInfo.paymentMethodType || "Razorpay AutoPay Active") : "No Payment Method Attached"}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Choose your desired plan tier below to process monthly subscription billing directly via Razorpay online payment.
                              </p>

                              {/* Plan Selection Dropdown */}
                              <div className="space-y-1 pt-1">
                                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Target Subscription Tier</label>
                                <select
                                  value={selectedPaymentPlan}
                                  onChange={(e) => setSelectedPaymentPlan(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs cursor-pointer"
                                >
                                  <option value="basic">BASIC — ₹99 / month (Instagram & WhatsApp Sellers)</option>
                                  <option value="plus">PLUS — ₹499 / month (Custom Domain Website)</option>
                                  <option value="growth">GROWTH ⭐ — ₹1,499 / month (Recommended D2C Tech Stack)</option>
                                  <option value="business">BUSINESS — ₹2,999 / month (High-Volume Teams & APIs)</option>
                                </select>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSetupRazorpayPaymentMethod(selectedPaymentPlan)}
                              disabled={loading}
                              className="w-full py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                            >
                              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />}
                              <span>
                                {selectedPaymentPlan === "basic" || selectedPaymentPlan === "tier1"
                                  ? "⚡ Pay & Subscribe (₹99/mo)"
                                  : selectedPaymentPlan === "plus" || selectedPaymentPlan === "tier2"
                                  ? "⚡ Pay & Subscribe (₹499/mo)"
                                  : selectedPaymentPlan === "business" || selectedPaymentPlan === "tier4"
                                  ? "⚡ Pay & Subscribe (₹2,999/mo)"
                                  : "⚡ Pay & Subscribe (₹1,499/mo)"}
                              </span>
                            </button>
                          </div>

                          {/* Plan Details Key-Value Card */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                            <h3 className="text-base font-extrabold text-slate-900">Plan Metadata</h3>
                            <div className="space-y-3 text-xs">
                              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Plan Name</span>
                                <span className="font-extrabold text-slate-900 uppercase">
                                  {(billingInfo.plan || settings.plan || "growth")} Plan
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Billing Price</span>
                                <span className="font-extrabold text-slate-900">
                                  {billingInfo.isTrial ? "₹0 (Free Trial)" : `${formatINR(billingInfo.price ?? 699)} / month`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Trial Status</span>
                                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                  {billingInfo.isTrial ? `${billingInfo.trialDaysRemaining ?? 60} Days Left` : "Trial Completed"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Next Renewal</span>
                                <span className="font-bold text-slate-800">{billingInfo.nextBillingDate || "15 Aug 2026"}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Payment Gateway</span>
                                <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                                  ⚡ {billingInfo.paymentGateway || "Razorpay"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2">
                                <span className="text-slate-500 font-medium">Account Status</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                                  {billingInfo.status || "Active & Healthy"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Recent Invoices Card */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-extrabold text-slate-900">Recent Invoices</h3>
                              <span className="text-[11px] font-bold text-slate-500">
                                {billingInfo.statements?.length || 0} Total
                              </span>
                            </div>
                            <div className="space-y-2.5">
                              {(billingInfo.statements || []).map((inv: any) => (
                                <div key={inv.statementId || inv.id} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                                  <div>
                                    <div className="font-bold text-slate-900">{inv.statementId || inv.id}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {inv.createdAt || inv.date} • {formatINR(inv.amount || 0)}
                                    </div>
                                  </div>
                                  <a
                                    href={`${API_URL}/store/billing/statement/${inv.statementId || inv.id}?token=${token}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Download className="h-3 w-3" />
                                    <span>PDF</span>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Documentation & Support Card */}
                          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
                            <h3 className="text-sm font-extrabold text-slate-900">Basecart Merchant Support</h3>
                            <p className="text-xs text-slate-500 leading-normal font-medium">
                              Need assistance with your plan, custom billing, or platform extensions?
                            </p>
                            <div className="pt-1 space-y-2">
                              <button
                                type="button"
                                onClick={() => setActionSuccess("Opening Basecart Platform Documentation")}
                                className="w-full py-2 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-[#4F46E5] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Platform Documentation</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setActionSuccess("Connecting to Basecart Priority Merchant Support")}
                                className="w-full py-2 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-[#4F46E5] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                                <span>Contact Priority Support</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. Full-Width Upgrade Plan Comparison Table Grid */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">Compare Basecart Platform Tiers</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Choose a plan and pay via Razorpay to unlock limits, custom checkout workflows, and priority support.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Billing Currency: INR (₹)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          {[
                            { id: "free", name: "Free", sub: "For getting started", price: "₹0 / month", desc: "Basic storefront & manual order management" },
                            { id: "starter", name: "Starter", sub: "For growing stores", price: "₹299 / month", desc: "Custom domain & 500 monthly orders limit" },
                            { id: "growth", name: "Growth", sub: "For scaling businesses", price: "₹699 / month", desc: "5,000 monthly orders, Razorpay integration & white-label emails" },
                            { id: "pro", name: "Pro", sub: "For high-volume stores", price: "₹1,499 / month", desc: "25,000 monthly orders, custom CSS & multi-warehouse inventory" },
                            { id: "agency", name: "Agency", sub: "For white-label partners", price: "₹4,999 / month", desc: "Unlimited stores, white-label dashboard & priority SLA" },
                          ].map((tier) => {
                            const isCurrent = (billingInfo.plan || settings.plan || "growth").toLowerCase() === tier.id;
                            const isFree = tier.id === "free";
                            return (
                              <div
                                key={tier.id}
                                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all relative ${
                                  isCurrent
                                    ? "border-2 border-[#4F46E5] bg-indigo-50/30 shadow-xs"
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                              >
                                {isCurrent && (
                                  <span className="absolute top-3 right-3 text-[9px] font-black uppercase bg-[#4F46E5] text-white px-2 py-0.5 rounded-full shadow-xs">
                                    Active
                                  </span>
                                )}
                                <div className="space-y-1.5">
                                  <h4 className="text-base font-black text-slate-900">{tier.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{tier.sub}</p>
                                  <p className="text-lg font-black text-slate-900 pt-1">{tier.price}</p>
                                  <p className="text-[11px] text-slate-500 leading-snug pt-1 font-medium">{tier.desc}</p>
                                </div>

                                <button
                                  type="button"
                                  disabled={isCurrent || loading}
                                  onClick={() => {
                                    if (isFree) {
                                      handleSelectPlanTier("free");
                                    } else {
                                      handleSetupRazorpayPaymentMethod(tier.id);
                                    }
                                  }}
                                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                                    isCurrent
                                      ? "bg-indigo-100/90 text-[#4F46E5] border border-indigo-200 cursor-default"
                                      : "bg-[#4F46E5] hover:bg-indigo-700 text-white shadow-xs active:scale-98 cursor-pointer"
                                  }`}
                                >
                                  {isCurrent ? "Current Active Tier" : isFree ? "Switch to Free" : `⚡ Pay & Subscribe (${tier.price.split(" ")[0]})`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 11. STAFF & PERMISSIONS (TEAM USERS) SETTINGS */}
                  {["users", "team", "staff", "members"].includes(settingsSubTab) && (
                    <UsersTeamTab
                      token={token}
                      API_URL={API_URL}
                      staffLimit={billingInfo.staffLimit || 10}
                    />
                  )}

                  {/* 12. OTHER SUB-TABS FALLBACK */}
                  {!["general", "payments", "shipping", "checkout", "taxes", "domains", "policies", "brand", "notifications", "plan", "users", "team", "staff", "members"].includes(settingsSubTab) && (
                    <div className="space-y-4 animate-fade-in max-w-4xl">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 capitalize">{settingsSubTab} Settings</h2>
                      <p className="text-xs text-slate-500">Configure your store settings and automated preferences for {settingsSubTab}.</p>

                      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                        <SettingsIcon className="h-10 w-10 text-indigo-600 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900">Store Configurations</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Preferences and operational settings for {settingsSubTab} are active and managed via your Basecart Merchant account.
                        </p>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Mobile Drawer (Slide-out Hamburger Menu) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />
          {/* Drawer content panel */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 select-none">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[15px] font-bold text-slate-800 tracking-tight whitespace-nowrap">basecart</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-3 overflow-y-auto">
              {/* Core Operations */}
              <div className="space-y-0.5">
                {[
                  { id: "summary", name: "Overview", icon: Home },
                  { id: "orders", name: "Orders & Sales", icon: ShoppingCart, badge: orders.length > 0 ? orders.length : undefined },
                  { id: "products", name: "Catalog & Items", icon: Package },
                  { id: "customers", name: "Customers & Contacts", icon: Users },
                  { id: "marketing", name: "Growth & Campaigns", icon: TrendingUp },
                  { id: "discounts", name: "Coupons & Offers", icon: Tag },
                  { id: "content", name: "Content & Media", icon: FileText },
                  { id: "finances", name: "Analytics & Performance", icon: TrendingUp },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <button
                        onClick={() => {
                          changeTab(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-lg text-xs font-semibold px-3 py-2.5 transition-all ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-200/60">
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {/* Sub-items for Products */}
                      {item.id === "products" && isActive && (
                        <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                          {[
                            { id: "collections", label: "Collections" },
                            { id: "inventory", label: "Inventory" },
                            { id: "purchase-orders", label: "Purchase orders" },
                            { id: "transfers", label: "Transfers" },
                            { id: "gift-cards", label: "Gift cards" },
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                changeTab("products", sub.id);
                                setProductForm(null);
                                setMobileDrawerOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                productsSubTab === sub.id
                                  ? "bg-slate-100 text-slate-900 font-bold"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sub-items for Customers */}
                      {item.id === "customers" && isActive && (
                        <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                          {[
                            { id: "segments", label: "Segments" },
                            { id: "companies", label: "Companies" },
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                changeTab("customers", sub.id);
                                setCustomerForm(null);
                                setMobileDrawerOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                customersSubTab === sub.id
                                  ? "bg-slate-100 text-slate-900 font-bold"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sub-items for Content */}
                      {item.id === "content" && isActive && (
                        <div className="pl-9 pr-2 py-1 space-y-0.5 animate-fade-in">
                          {[
                            { id: "metaobjects", label: "Metaobjects" },
                            { id: "files", label: "Files" },
                            { id: "menus", label: "Menus" },
                            { id: "blog-posts", label: "Blog posts" },
                          ].map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                changeTab("content", sub.id);
                                setMobileDrawerOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                contentSubTab === sub.id
                                  ? "bg-slate-100 text-slate-900 font-bold"
                                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Sales channels section */}
              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Store Channels</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
                {[
                  { id: "store-design", name: "Storefront Studio", icon: Store },
                  { id: "agentic", name: "Agentic Store & AI", icon: Bot },
                  { id: "headless", name: "Headless Store", icon: Code, badge: "Soon" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        changeTab(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-lg text-xs font-semibold px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                      <span className="truncate whitespace-nowrap">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-200 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Apps section */}
              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Apps</span>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                </div>
                <button
                  onClick={() => {
                    changeTab("addons");
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg text-xs font-semibold px-3 py-2.5 transition-all ${
                    activeTab === "addons"
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Puzzle className={`h-4.5 w-4.5 shrink-0 ${activeTab === "addons" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>Apps & Integrations</span>
                </button>
              </div>
            </nav>

            {/* Pinned Bottom Settings & Sign Out */}
            <div className="p-3 border-t border-slate-100 shrink-0 space-y-2">
              <button
                onClick={() => {
                  setIsSettingsPortalOpen(true);
                  setActiveTab("settings");
                  setMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold px-3 py-2.5 transition-all ${
                  activeTab === "settings" || isSettingsPortalOpen
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <SettingsIcon className={`h-4.5 w-4.5 shrink-0 ${activeTab === "settings" || isSettingsPortalOpen ? "text-indigo-600" : "text-slate-400"}`} />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-650 font-bold rounded-xl text-xs transition-colors"
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-2 select-none">
        {[
          { id: "summary", name: "Home", icon: Home },
          { id: "orders", name: "Orders", icon: ShoppingCart },
          { id: "products", name: "Products", icon: Package },
          { id: "store-design", name: "Store", icon: Store },
          { id: "settings", name: "Settings", icon: SettingsIcon },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "settings" && isSettingsPortalOpen);
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "settings") {
                  setIsSettingsPortalOpen(true);
                  setActiveTab("settings");
                } else {
                  setActiveTab(item.id as any);
                  setIsSettingsPortalOpen(false);
                }
                setMobileDrawerOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-all ${
                isActive ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* DEDICATED FULFILL ORDER MODAL */}
      {fulfillingOrder && (
        <div
          onClick={() => setFulfillingOrder(null)}
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-5 cursor-default text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Fulfill & Dispatch Order</h3>
                  <p className="text-xs text-slate-400 font-mono">#{fulfillingOrder.orderId.substring(0, 12).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setFulfillingOrder(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Address Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-900">
                <span>Recipient: {fulfillingOrder.customerInfo?.name || "Customer"}</span>
                <span className="text-slate-500 font-mono">{fulfillingOrder.customerInfo?.phone || "No phone"}</span>
              </div>
              {fulfillingOrder.customerInfo?.address && (
                <div className="text-slate-600 text-[11px] leading-snug pt-1 border-t border-slate-200/60">
                  📍 {fulfillingOrder.customerInfo.address.street}, {fulfillingOrder.customerInfo.address.city}, {fulfillingOrder.customerInfo.address.state} - {fulfillingOrder.customerInfo.address.pincode}
                </div>
              )}
            </div>

            {/* Items to ship */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Items to Dispatch ({fulfillingOrder.lineItems?.length || 0})</label>
              <div className="bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
                {(fulfillingOrder.lineItems || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.sku && <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>}
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold">Qty: {item.quantity || 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fulfillment Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logistics / Courier Partner
                </label>
                <select
                  value={fulfillmentCarrier}
                  onChange={(e) => setFulfillmentCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Shiprocket">Shiprocket (Automated API / Partner)</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="DTDC">DTDC</option>
                  <option value="FedEx">FedEx</option>
                  <option value="India Post">India Post</option>
                  <option value="DHL">DHL Express</option>
                  <option value="Custom Courier">Custom Courier / Local Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tracking Number / AWB Code
                </label>
                <input
                  type="text"
                  value={fulfillmentTracking}
                  onChange={(e) => setFulfillmentTracking(e.target.value)}
                  placeholder="e.g. AWB9876543210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={fulfillmentNotify}
                  onChange={(e) => setFulfillmentNotify(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notifyCustomer" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Send dispatch notification with tracking details via Email & WhatsApp
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setFulfillingOrder(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!fulfillingOrder) return;
                  await updateOrderStatus(
                    fulfillingOrder.orderId,
                    "shipped",
                    fulfillmentTracking || undefined,
                    fulfillmentCarrier || undefined
                  );
                  setFulfillingOrder(null);
                  setFulfillmentTracking("");
                }}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Package className="h-4 w-4" />
                <span>{loading ? "Fulfilling..." : "Confirm & Dispatch Order"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div
          onClick={() => setSelectedOrderForDetail(null)}
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-5 cursor-default text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 font-mono">
                    Order #{selectedOrderForDetail.orderId.substring(0, 12).toUpperCase()}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedOrderForDetail.status === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700"
                  }`}>
                    {selectedOrderForDetail.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Placed on {new Date(selectedOrderForDetail.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer & Shipping Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Customer Details</p>
                <p className="font-bold text-slate-900 text-sm">{selectedOrderForDetail.customerInfo?.name || "N/A"}</p>
                <p className="text-slate-600">{selectedOrderForDetail.customerInfo?.email || "No email"}</p>
                <p className="text-slate-600 font-mono">{selectedOrderForDetail.customerInfo?.phone || "No phone"}</p>
              </div>

              <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Delivery Address</p>
                {selectedOrderForDetail.customerInfo?.address ? (
                  <div className="text-slate-700 leading-snug">
                    <p className="font-semibold">{selectedOrderForDetail.customerInfo.address.street}</p>
                    <p>{selectedOrderForDetail.customerInfo.address.city}, {selectedOrderForDetail.customerInfo.address.state} - {selectedOrderForDetail.customerInfo.address.pincode}</p>
                    <p className="font-bold text-slate-500 text-[10px] uppercase">{selectedOrderForDetail.customerInfo.address.country}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No delivery address provided.</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered Items</h4>
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {(selectedOrderForDetail.lineItems || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{item.sku || "N/A"}</td>
                        <td className="p-3 font-bold text-slate-800">{item.quantity || 1}</td>
                        <td className="p-3 text-right">{formatINR(item.price)}</td>
                        <td className="p-3 text-right font-black text-slate-900">{formatINR(item.price * (item.quantity || 1))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(selectedOrderForDetail.subtotal || selectedOrderForDetail.total)}</span>
              </div>
              {selectedOrderForDetail.shippingFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-slate-800">{formatINR(selectedOrderForDetail.shippingFee)}</span>
                </div>
              )}
              {selectedOrderForDetail.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax</span>
                  <span className="font-semibold text-slate-800">{formatINR(selectedOrderForDetail.tax)}</span>
                </div>
              )}
              {selectedOrderForDetail.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span>-{formatINR(selectedOrderForDetail.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2">
                <span>Total Paid</span>
                <span className="text-blue-600">{formatINR(selectedOrderForDetail.total)}</span>
              </div>
            </div>

            {/* Actions Footer - Responsive flex layout on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <span>Status:</span>
                  {selectedOrderForDetail.status === "paid" && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      🔒 Payment Confirmed
                    </span>
                  )}
                </label>
                <select
                  value={selectedOrderForDetail.status}
                  disabled={selectedOrderForDetail.status === "delivered" || selectedOrderForDetail.status === "cancelled"}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await updateOrderStatus(selectedOrderForDetail.orderId, newStatus);
                    setSelectedOrderForDetail((prev: any) => ({ ...prev, status: newStatus }));
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="pending" disabled={selectedOrderForDetail.status !== "pending"}>
                    Pending {selectedOrderForDetail.status !== "pending" ? "(Locked)" : ""}
                  </option>
                  <option value="paid" disabled={selectedOrderForDetail.status === "shipped"}>
                    Paid
                  </option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered (Locked)</option>
                  <option value="cancelled">Cancelled (Locked)</option>
                </select>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-end">
                {(selectedOrderForDetail.status === "paid" || selectedOrderForDetail.status === "pending") && (
                  <button
                    onClick={() => {
                      const ord = selectedOrderForDetail;
                      setSelectedOrderForDetail(null);
                      setFulfillingOrder(ord);
                      setFulfillmentCarrier("Shiprocket");
                      setFulfillmentTracking("");
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>Fulfill Order</span>
                  </button>
                )}
                <button
                  onClick={() => handleDownloadOrderInvoice(selectedOrderForDetail)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>GST Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT CODE FORM MODAL */}
      {discountForm && (
        <div
          onClick={() => setDiscountForm(null)}
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-5 cursor-default text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{discountForm.isEdit ? "Edit Discount Code" : "New Promotional Coupon"}</h3>
                  <p className="text-xs text-slate-400">Configure discount savings, minimum spend, and redemption limits</p>
                </div>
              </div>
              <button
                onClick={() => setDiscountForm(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveDiscount} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!discountForm.isEdit}
                    value={discountForm.code || ""}
                    onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="e.g. WELCOME20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountForm.type || "flat"}
                    onChange={(e: any) => setDiscountForm({ ...discountForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none"
                  >
                    <option value="flat">Flat Cash Savings (₹)</option>
                    <option value="percentage">Percentage Off (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountForm.value || ""}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm font-bold focus:outline-none"
                    placeholder={discountForm.type === "percentage" ? "e.g. 20 (for 20%)" : "e.g. 100 (for ₹100)"}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    value={discountForm.minOrderAmount || 0}
                    onChange={(e) => setDiscountForm({ ...discountForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none"
                    placeholder="0 for no minimum"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    value={discountForm.usageLimit || ""}
                    onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={discountForm.expiry ? new Date(discountForm.expiry).toISOString().split("T")[0] : ""}
                    onChange={(e) => setDiscountForm({ ...discountForm, expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Campaign Status
                  </label>
                  <select
                    value={discountForm.active === false ? "false" : "true"}
                    onChange={(e) => setDiscountForm({ ...discountForm, active: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold focus:outline-none"
                  >
                    <option value="true">Active (Enabled)</option>
                    <option value="false">Inactive (Disabled)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setDiscountForm(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Discount Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div
          onClick={() => setShowOtpModal(false)}
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 cursor-default text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Verify Email Address</h3>
                  <p className="text-xs text-slate-500">Type the 6-digit OTP received in your email</p>
                </div>
              </div>
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {otpError && (
              <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{otpSuccess}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 892147"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-2xl font-mono tracking-[0.25em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Didn't receive code? Check spam or click <button onClick={handleResendVerification} className="text-blue-600 font-bold hover:underline">Resend Email</button>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-button transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingOtp || inputOtp.length !== 6}
                onClick={handleVerifyOtpSubmit}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-button text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {verifyingOtp ? "Verifying..." : "Verify & Activate Store"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
