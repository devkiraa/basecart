// ─────────────────────────────────────────────────────────────
// Centralized Pricing & Plans data — single source of truth for
// the /pricing page, its JSON-LD schema, and the machine-readable
// /pricing.md route. Update pricing here and every surface syncs.
//
// Canonical scheme (as of August 2026):
//   Trial ₹0 → Basic ₹99 → Plus ₹499 → Growth ₹1,499 → Business ₹2,999
//   0% platform transaction fees on all paid plans.
// ─────────────────────────────────────────────────────────────

export const PRICING_LAST_UPDATED = "August 10, 2026";

export interface Plan {
  id: string;
  name: string;
  price: number;
  recommended?: boolean;
  tagline: string;
  accent: "slate" | "blue" | "indigo" | "purple";
  features: string[];
  ctaHref: string;
  /** Short machine-readable summary for /pricing.md */
  summary: string;
}

export const TRIAL = {
  price: 0,
  label: "3-month free trial (Growth features)",
  description:
    "Full Growth-plan features for 3 months, or your first 1,000 orders / ₹25,000 in sales — whichever comes first. No credit card required.",
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "BASIC",
    price: 99,
    tagline: "Ideal for Instagram sellers & WhatsApp order intake.",
    accent: "slate",
    features: [
      "Up to 100 Product Listings",
      "Direct WhatsApp Checkout",
      "Razorpay & Stripe Payment Gateways",
      "Manual UPI & COD Tracking",
      "Standard Storefront Theme",
      "0% Platform Transaction Fees",
    ],
    ctaHref: "https://dashboard.basecart.app/signup?plan=basic",
    summary: "100 products, WhatsApp checkout, Razorpay/Stripe gateways, manual UPI & COD tracking.",
  },
  {
    id: "plus",
    name: "PLUS",
    price: 499,
    tagline: "Full custom domain website for growing D2C stores.",
    accent: "blue",
    features: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Up to 500 Product Listings",
      "Custom Storefront Themes",
      "Direct WhatsApp & Email Notifications",
      "0% Platform Transaction Fees",
    ],
    ctaHref: "https://dashboard.basecart.app/signup?plan=plus",
    summary: "Custom domain, 500 products, custom themes, WhatsApp & email notifications.",
  },
  {
    id: "growth",
    name: "GROWTH",
    price: 1499,
    recommended: true,
    tagline: "Built for scaling D2C brands with automated shipping.",
    accent: "indigo",
    features: [
      "Custom Domain Mapping (yourbrand.com)",
      "Razorpay & Stripe Payment Gateways",
      "Unlimited Products & Orders",
      "Shiprocket Automated Shipping & AWBs",
      "Abandoned Cart Recovery (WhatsApp & Email)",
      "AI Description Writer & Marketing Tools",
      "Product Options Matrix (Sizes, Colors)",
      "0% Platform Transaction Fees",
    ],
    ctaHref: "https://dashboard.basecart.app/signup?plan=growth",
    summary:
      "Unlimited products & orders, Shiprocket auto-AWB, abandoned-cart recovery, AI writer, product options matrix.",
  },
  {
    id: "business",
    name: "BUSINESS",
    price: 2999,
    tagline: "For high-volume brands and multi-member teams.",
    accent: "purple",
    features: [
      "Multi-Staff Accounts (5 Team Seats)",
      "Developer REST API & Custom Webhooks",
      "Custom CSS / JS Code Injection",
      "Automated GST Invoices & PDF Export",
      "Dedicated Account Manager & 24/7 Support",
      "0% Platform Transaction Fees",
    ],
    ctaHref: "https://dashboard.basecart.app/signup?plan=business",
    summary:
      "5 staff seats, REST API & webhooks, custom CSS/JS, GST invoices, dedicated account manager.",
  },
];

export const FAQS = [
  {
    q: "Is there a free trial and do I need a credit card?",
    a: "Yes — every new store gets full Growth-plan features free for 3 months, or your first 1,000 orders / ₹25,000 in sales (whichever comes first). No credit card is required to start.",
  },
  {
    q: "Does Basecart charge transaction fees?",
    a: "No. Basecart charges 0% platform transaction fees on every paid plan. You only pay the standard payment gateway MDR (e.g. Razorpay UPI/card fees).",
  },
  {
    q: "What happens when my free trial ends?",
    a: "When the trial ends (3 months, 1,000 orders, or ₹25,000 GMV — whichever comes first), you choose a plan to continue. Your storefront pauses until you upgrade, and your dashboard stays accessible so you can export your data.",
  },
  {
    q: "Can I upgrade or cancel anytime?",
    a: "Yes. Upgrade or downgrade between plans anytime from your dashboard, and cancel whenever you like — there are no lock-ins or cancellation fees.",
  },
  {
    q: "Are there any hidden costs like paid apps?",
    a: "No. Unlike platforms with paid app stores, WhatsApp checkout, abandoned-cart recovery, Shiprocket automation and the AI product writer are built into the relevant plans — there is no per-app subscription stack.",
  },
];
