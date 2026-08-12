// ─────────────────────────────────────────────────────────────
// Centralized Competitor Data — single source of truth for all
// comparison / vs pages on the marketing site.
//
// Facts reflect publicly listed pricing & review themes as of
// August 2026. Pricing and features change often — re-verify
// before major campaigns.
// ─────────────────────────────────────────────────────────────

export interface AtAGlance {
  startingPrice: string;
  transactionFee: string;
  payments: string;
  whatsapp: string;
  shipping: string;
  setupTime: string;
  staffAccounts: string;
  freeTrial: string;
}

export interface DetailedCategory {
  name: string;
  basecart: string;
  competitor: string;
  verdict: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Competitor {
  slug: string;
  name: string;
  category: string;
  positioning: string;
  bestFor: string;
  notIdealFor: string;
  strengths: string[];
  weaknesses: string[];
  commonComplaints: string[];
  atAGlance: AtAGlance;
  detailedCategories: DetailedCategory[];
  basecartBestFor: string;
  migrationNotes: string[];
  faqs: Faq[];
}

// ── Basecart's own comparison anchor (used on every page) ────
export const BASECART = {
  name: "Basecart",
  startingPrice: "₹99 /mo (Growth ₹1,499)",
  transactionFee: "0% platform fee — only gateway MDR",
  payments: "Razorpay & Stripe: UPI, cards, netbanking, COD",
  whatsapp: "Native WhatsApp checkout, order alerts & abandoned-cart recovery",
  shipping: "Shiprocket, Delhivery, DTDC, Speed Post + auto-AWB generation",
  setupTime: "~2 minutes, no code",
  staffAccounts: "Up to 5 staff seats (Business)",
  freeTrial: "60-day full-access trial, no credit card",
  pricingNote:
    "Flat ₹99–₹2,999/mo with no per-order platform fee. Growth (₹1,499) includes unlimited products & orders, Shiprocket automation, AI product writer and abandoned-cart recovery.",
  paymentsNote:
    "Built for India out of the box: Razorpay UPI (GPay, PhonePe, Paytm), cards, netbanking, wallets and Cash on Delivery with automated verification. You pay only the gateway's MDR — Basecart adds no cut on top.",
  whatsappNote:
    "WhatsApp is native, not an add-on. Checkout generates a pre-filled WhatsApp order message, you get instant order alerts, and abandoned carts are recovered automatically over WhatsApp and email.",
  shippingNote:
    "One-click Shiprocket, Delhivery, DTDC and Speed Post integration with automatic Air Waybill (AWB) generation, doorstep pickup scheduling and COD verification.",
  easeNote:
    "No hosting, plugins, security patches or themes to maintain. Storefronts render at the edge for sub-100ms loads. Everything lives in one clean dashboard.",
  supportNote:
    "India-based support with priority 24/7 on Business plan. Setup help, migration support and a 3-month trial to evaluate risk-free.",
};

// ── Shopify ──────────────────────────────────────────────────
export const SHOPIFY: Competitor = {
  slug: "shopify",
  name: "Shopify",
  category: "Global SaaS store builder",
  positioning:
    "The world's most popular hosted e-commerce platform, with a huge app ecosystem — but no Shopify Payments in India, so merchants face subscription fees plus a 2% platform surcharge on top of gateway MDR.",
  bestFor:
    "Global brands and established sellers who need a massive app ecosystem, multi-currency selling and are comfortable with the higher total cost of ownership.",
  notIdealFor:
    "Indian sellers on tight margins — without Shopify Payments, effective transaction costs reach ~4–5.5% per order, and essential features hide behind paid apps.",
  strengths: [
    "Massive app marketplace (8,000+ apps)",
    "Mature, reliable infrastructure",
    "Strong global reach & multi-currency",
    "Large ecosystem of agencies & freelancers",
  ],
  weaknesses: [
    "No Shopify Payments in India → extra 2% platform fee on top of gateway MDR",
    "Essential features (reviews, loyalty, WhatsApp) require paid apps",
    "~4–5.5% effective transaction cost for Indian merchants",
    "App subscription costs stack quickly",
  ],
  commonComplaints: [
    "Total cost balloons beyond the ₹1,994/mo sticker once apps are added",
    "Transaction fee stacking (platform surcharge + gateway MDR) eats margins",
    "Uninstalling apps can leave broken code behind in themes",
    "Support escalations can be slow for API/gateway issues",
  ],
  atAGlance: {
    startingPrice: "₹1,994 /mo (Basic, monthly) or ₹1,499/mo billed annually",
    transactionFee: "2% platform surcharge (Basic) + gateway MDR → ~4–5.5% total",
    payments: "Razorpay, Cashfree, PayU via app; Shopify Payments NOT available in India",
    whatsapp: "Not native — paid third-party apps (₹1,000+/mo)",
    shipping: "Shiprocket integration via paid/unpaid app; AWB workflows are app-dependent",
    setupTime: "A few hours to a few days",
    staffAccounts: "2 (Basic), 5 (Shopify), 15 (Advanced)",
    freeTrial: "3-day trial, then ₹20/mo for 3 months promo",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Basic is ₹1,994/mo (or ₹1,499/mo annually). But most stores need apps — reviews, loyalty, WhatsApp, SEO — at ₹500–₹8,000/mo each. A typical Indian store's real bill is frequently ₹5,000–₹15,000/mo before any sales.",
      verdict:
        "Basecart wins for Indian sellers on price transparency: flat ₹99–₹2,999/mo with no app store and no per-order platform fee.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor:
        "Shopify Payments is unavailable in India, so every transaction routes through a third-party gateway — and Shopify charges its 2% platform surcharge on top. Combined with gateway MDR (2–3%), Indian merchants lose ~4–5.5% per order.",
      verdict:
        "Basecart is built around Indian payments (UPI, cards, netbanking, COD) with zero platform surcharge — you only pay the gateway's standard MDR.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor:
        "WhatsApp ordering is not native. Merchants cobble together paid apps or manual DMs, which adds cost and loses the structured order data Basecart captures automatically.",
      verdict: "Basecart makes WhatsApp checkout a first-class, built-in channel; Shopify treats it as an add-on.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor:
        "Shiprocket works on Shopify, but configuration, label workflows and AWB generation depend on third-party apps and their subscription tiers.",
      verdict: "Both integrate Shiprocket; Basecart bundles it with auto-AWB generation at no extra app cost.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor:
        "Shopify is polished but sprawling — themes, apps, markets, tax settings. New sellers commonly spend days configuring and then pay for apps to fill gaps.",
      verdict: "Basecart is simpler by design: set up in minutes, no app maintenance, no plugin conflicts.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor:
        "24/7 support exists, but reviews report tier-1 bottlenecks on technical gateway and API issues, and app-related problems are often the app developer's responsibility.",
      verdict: "Basecart owns the whole stack, so there's a single accountable team for store issues.",
    },
  ],
  basecartBestFor:
    "Indian D2C brands and Instagram/WhatsApp sellers who want Shopify's polish without the ~4–5.5% transaction squeeze — same Razorpay/UPI/COD experience, zero platform fee, WhatsApp-native ordering.",
  migrationNotes: [
    "Export your product catalog, orders and customers from Shopify admin (CSV or via the API).",
    "Recreate collections, variants and pricing in Basecart — bulk import supports CSV.",
    "Point your custom domain to Basecart (free SSL included).",
    "Reconnect Razorpay — most merchants keep the same gateway account.",
    "Recreate email templates & WhatsApp notifications in Basecart's built-in tools.",
  ],
  faqs: [
    {
      q: "Is Basecart a good Shopify alternative in India?",
      a: "Yes — for Indian sellers, Basecart removes the two biggest Shopify pain points: the 2% platform surcharge (since Shopify Payments isn't available in India) and paid-app dependency for WhatsApp ordering, shipping automation and abandoned-cart recovery.",
    },
    {
      q: "Does Shopify charge extra transaction fees in India?",
      a: "Yes. Because Shopify Payments is not available in India, Shopify charges a platform surcharge (2% on Basic, 1% on Shopify, 0.6% on Advanced) on top of your payment gateway's MDR — putting effective costs near 4–5.5% per order. Basecart charges a 0% platform fee.",
    },
    {
      q: "Can I migrate from Shopify to Basecart?",
      a: "Yes. Export your catalog, orders and customers from Shopify, bulk-import them into Basecart, point your domain over (free SSL included) and reconnect Razorpay. Most merchants switch in under a day.",
    },
  ],
};

// ── WooCommerce ──────────────────────────────────────────────
export const WOOCOMMERCE: Competitor = {
  slug: "woocommerce",
  name: "WooCommerce",
  category: "Open-source (WordPress)",
  positioning:
    "A free, open-source plugin that turns WordPress into a store — powerful ownership, but hosting, themes, plugins, security and maintenance push real costs to ₹1,500–₹12,000+/mo for a professional setup.",
  bestFor:
    "Technical founders and developers who want total ownership, no monthly platform fee and are willing to handle hosting, security and updates themselves.",
  notIdealFor:
    "Non-technical sellers — every update, security patch, plugin conflict and performance issue is your problem, and freelancer maintenance runs ₹8,000–₹15,000/mo.",
  strengths: [
    "Plugin itself is free — no platform subscription",
    "Full ownership of code, data and hosting",
    "Huge WordPress plugin ecosystem",
    "No per-order platform transaction fee",
  ],
  weaknesses: [
    "Total cost of ownership is high once hosting, themes, plugins & maintenance are counted",
    "Requires ongoing technical upkeep (updates, backups, security)",
    "Prime target for botnets and brute-force attacks",
    "Performance degrades on cheap shared hosting as catalog grows",
  ],
  commonComplaints: [
    "Maintenance burden: PHP versions, database bloat, caching config",
    "Plugin conflicts break checkout or payment hooks after updates",
    "Security is DIY — malware and bot attacks are common",
    "20–30 plugins are typical, and their subscriptions add up",
  ],
  atAGlance: {
    startingPrice: "Free plugin — ₹1,500–₹12,000+/mo all-in (hosting, theme, plugins)",
    transactionFee: "No platform fee — gateway MDR only (~2%+)",
    payments: "Razorpay, Cashfree, PayU plugins (free) — but integration is DIY",
    whatsapp: "Third-party plugins (Interakt/Wati ₹999+/mo)",
    shipping: "Shiprocket plugin is free; setup & label workflows are manual",
    setupTime: "1–3 days for a basic store; weeks to do properly",
    staffAccounts: "Unlimited (WordPress user roles)",
    freeTrial: "Free software — but hosting, domain & SSL cost from day one",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "The plugin is free, but a production-ready store means: hosting ₹200–₹2,500/mo, domain ₹500–₹900/yr, premium theme ₹4,000–₹7,000, security/caching/backup plugins ₹5,000–₹12,000/yr, GST invoice plugin and WhatsApp automation. Professional setups land at ₹4,500–₹12,000+/mo — plus developer time.",
      verdict:
        "Basecart's flat ₹99–₹2,999/mo replaces the entire WooCommerce cost stack — hosting, SSL, themes, security, shipping and WhatsApp included.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor:
        "Razorpay and Cashfree offer free WooCommerce plugins and charge only gateway MDR — the upside of no platform surcharge. The downside: gateway setup, UPI/COD verification flows and reconciliation are entirely on you.",
      verdict: "Both avoid platform fees. Basecart bundles verified UPI/COD flows out of the box; WooCommerce requires DIY configuration.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor:
        "WhatsApp ordering requires third-party plugins (Interakt, Wati) at ₹999+/mo, and every WooCommerce/plugin update risks breaking the integration.",
      verdict: "Basecart's WhatsApp checkout, alerts and abandoned-cart recovery are native — nothing to install or maintain.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor:
        "Shiprocket's WooCommerce plugin is free, but you manage zone configuration, label workflows and plugin compatibility yourself — a common source of breakage after updates.",
      verdict: "Basecart gives the same Shiprocket/Delhivery/DTDC/Speed Post rails with auto-AWB, no plugin upkeep.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor:
        "WooCommerce assumes technical literacy: PHP versions, caching (Redis/Memcached), database bloat, security hardening. A routine update can white-screen your store.",
      verdict: "Basecart is fully managed — you run a store, not a server.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor:
        "There is no official support — you rely on forums, documentation, freelancers or a maintenance retainer (₹8,000–₹15,000/mo in India).",
      verdict: "Basecart provides accountable, India-based support with the whole stack under one roof.",
    },
  ],
  basecartBestFor:
    "Sellers who chose WooCommerce for 'no platform fees' but are tired of hosting bills, security patches and plugin conflicts — Basecart keeps 0% platform fees while removing the entire maintenance job.",
  migrationNotes: [
    "Export products & orders from WooCommerce (WooCommerce CSV export or a migration plugin).",
    "Bulk-import into Basecart's catalog (CSV supported).",
    "Point your domain to Basecart — free SSL included.",
    "Reconnect your Razorpay/Cashfree gateway (usually just an API key).",
    "Cancel hosting, theme and plugin subscriptions once the switch is verified.",
  ],
  faqs: [
    {
      q: "Is WooCommerce actually free?",
      a: "No — the plugin is free, but a production-ready Indian store costs roughly ₹1,500–₹12,000+/mo once you add hosting, a premium theme, security/caching plugins, GST invoicing and WhatsApp automation, plus the time (or developer fees) to maintain it.",
    },
    {
      q: "Is Basecart cheaper than WooCommerce?",
      a: "For non-technical founders, almost always yes: Basecart's ₹99–₹2,999/mo flat fee includes hosting, SSL, themes, security, WhatsApp and Shiprocket automation. WooCommerce only looks cheap if your own time and risk are worth nothing.",
    },
    {
      q: "Can I migrate from WooCommerce to Basecart?",
      a: "Yes. Export your catalog and orders from WooCommerce, bulk-import into Basecart, point your domain over and reconnect your gateway. You can then cancel hosting and plugin subscriptions.",
    },
  ],
};

// ── Instamojo ────────────────────────────────────────────────
export const INSTAMOJO: Competitor = {
  slug: "instamojo",
  name: "Instamojo",
  category: "India-native SaaS store builder",
  positioning:
    "An India-native store builder with a free tier and simple link-based selling — but transaction fees of 2–5% + ₹3 per order and payout/reliability complaints make it costly as volume grows.",
  bestFor:
    "Bootstrapped solopreneurs, creators and micro-sellers who want a quick, free storefront for low order volumes.",
  notIdealFor:
    "Scaling D2C brands — 5% + ₹3 per transaction on entry tiers heavily penalizes growth, and review themes flag payout delays and KYC friction.",
  strengths: [
    "Free Lite plan to start",
    "India-native: UPI, cards, COD",
    "Simple link-based selling (smart pages)",
    "No coding required",
  ],
  weaknesses: [
    "5% + ₹3 transaction fee on free/Starter tiers (2% + ₹3 only on Growth)",
    "Payout delays & KYC roadblocks reported in reviews",
    "Payment success rates historically trail dedicated gateways",
    "Advanced shipping automation is limited",
  ],
  commonComplaints: [
    "Transaction fees eat thin margins on low-ticket items",
    "Funds held or delayed during high-volume periods",
    "KYC verification friction",
    "Abandoned-cart and WhatsApp features locked to higher tiers",
  ],
  atAGlance: {
    startingPrice: "Free (Lite) — Growth ₹2,999/mo or ₹14,999/yr",
    transactionFee: "5% + ₹3 per order (Lite/Starter); 2% + ₹3 (Growth)",
    payments: "Pre-integrated gateway — UPI, cards, netbanking, COD",
    whatsapp: "Growth plan only; not native to checkout flow",
    shipping: "Basic shipping tools; no auto-AWB generation",
    setupTime: "~30 minutes",
    staffAccounts: "Limited multi-user support",
    freeTrial: "Free tier exists (with 5% fee)",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Lite is free but charges 5% + ₹3 per order — on a ₹499 product that's ~₹28 (5.6%). Starter (₹6,999/yr) keeps the 5% fee. Only Growth (₹14,999/yr) drops to 2% + ₹3. For volume sellers, transaction fees quickly dwarf the subscription.",
      verdict: "Basecart's 0% platform fee with flat ₹99–₹2,999/mo pricing wins at any meaningful volume.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor:
        "Instamojo bundles its own gateway with UPI, cards, netbanking and COD — convenient, but reviews flag payout delays, KYC friction and success rates below dedicated processors like Razorpay.",
      verdict: "Basecart rides Razorpay's proven rails with automated UPI/COD verification and no platform surcharge.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor:
        "WhatsApp capabilities exist mainly on the Growth plan, and the core flow is link-sharing rather than a structured checkout-to-WhatsApp pipeline.",
      verdict: "Basecart turns every checkout into a structured WhatsApp order with alerts and recovery — native on all plans.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor:
        "Instamojo offers basic order management but lacks the deep Shiprocket/Delhivery/DTDC automation (auto-AWB, pickup scheduling) that scaling sellers need.",
      verdict: "Basecart bundles full courier automation; Instamojo expects you to manage logistics manually.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Instamojo is genuinely easy to start with. The friction arrives at scale — fees, payouts and limited automation.",
      verdict: "Both are easy to start; Basecart stays easy to scale.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Support is available but review themes mention slow payout-related resolutions and KYC verification queues.",
      verdict: "Basecart's India-based team owns the full store stack.",
    },
  ],
  basecartBestFor:
    "Instamojo sellers hitting the 2–5% transaction-fee wall as order volume grows — Basecart keeps the India-native experience (UPI, COD, no-code) while removing per-order platform fees and adding WhatsApp-native ordering.",
  migrationNotes: [
    "Export your product catalog and order history from Instamojo.",
    "Bulk-import products into Basecart (CSV supported).",
    "Reconnect Razorpay directly — most merchants already have a Razorpay account.",
    "Point your domain to Basecart with free SSL.",
    "Recreate any paid links/landing pages as product pages in Basecart.",
  ],
  faqs: [
    {
      q: "How do Instamojo's fees compare to Basecart?",
      a: "Instamojo charges 5% + ₹3 per order on its free and Starter tiers (2% + ₹3 on Growth). Basecart charges a flat ₹99–₹2,999/mo with a 0% platform transaction fee — you only pay your gateway's standard MDR.",
    },
    {
      q: "Is Instamojo good for scaling a store?",
      a: "Its per-order fees and payout friction make it better for low-volume sellers. For growing D2C brands, Basecart's 0% platform fee, WhatsApp-native ordering and automated shipping scale far more profitably.",
    },
    {
      q: "Can I migrate from Instamojo to Basecart?",
      a: "Yes — export your catalog and orders, bulk-import into Basecart, reconnect Razorpay and point your domain over. Most switches complete in a day.",
    },
  ],
};

// ── StoreHippo ───────────────────────────────────────────────
export const STOREHIPPO: Competitor = {
  slug: "storehippo",
  name: "StoreHippo",
  category: "India SaaS (mid-market/enterprise)",
  positioning:
    "An India-native SaaS with multi-vendor, B2B and PWA capabilities — but entry pricing starts at ₹15,000/mo, aimed at enterprises rather than small sellers.",
  bestFor:
    "Established enterprises and B2B/multi-vendor operations that need marketplace-style architecture, multilingual stores and deep custom workflows.",
  notIdealFor:
    "Small and mid-size D2C brands — ₹15,000/mo entry pricing is 10× Basecart's Growth plan, and the admin has a steep learning curve.",
  strengths: [
    "Multi-vendor & B2B marketplace features built in",
    "PWA storefronts and mobile app builder",
    "No-plugin architecture (features embedded)",
    "India-native logistics & tax engines",
  ],
  weaknesses: [
    "Entry pricing ₹15,000/mo — prohibitive for small sellers",
    "Steep learning curve and utilitarian UI (per reviews)",
    "Implementation/onboarding often needs developer help",
    "Mid-tier support response times can lag",
  ],
  commonComplaints: [
    "Cost of entry far above competitors",
    "Dashboard complexity and dated UI",
    "Custom workflows require developer assistance",
  ],
  atAGlance: {
    startingPrice: "₹15,000 /mo (Business)",
    transactionFee: "No explicit platform fee, but high subscription cost",
    payments: "Razorpay, Cashfree, PayU supported",
    whatsapp: "Available in higher tiers / custom builds",
    shipping: "Shiprocket & aggregator integrations present",
    setupTime: "Weeks — onboarding & configuration required",
    staffAccounts: "Included (multi-user)",
    freeTrial: "Demo-based; no self-serve free trial",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "StoreHippo starts at ₹15,000/mo (Business) and climbs to ₹30,000/mo (Enterprise) and ₹1.2L+/mo for bespoke setups — 10–100× Basecart's pricing, justified only by multi-vendor/B2B needs.",
      verdict: "For single-brand D2C, Basecart delivers the same India stack for ₹99–₹2,999/mo.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor: "Solid Indian gateway support (Razorpay, Cashfree, PayU) with no platform surcharge.",
      verdict: "Comparable payment rails — Basecart adds it at a fraction of the price.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "Present in higher tiers and custom configurations rather than as a core default flow.",
      verdict: "Basecart ships WhatsApp ordering natively on every plan.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Strong logistics engine for high-volume operations; the complexity assumes a dedicated ops team.",
      verdict: "Basecart automates the same couriers with far less overhead.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Powerful but dense — reviewers consistently note a steep learning curve and developer involvement.",
      verdict: "Basecart is built for a solo founder to operate from day one.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Enterprise-grade support exists, but mid-tier response times draw complaints.",
      verdict: "Basecart gives every plan accountable India-based support.",
    },
  ],
  basecartBestFor:
    "Merchants who need StoreHippo's enterprise power but are overpaying for B2B/multi-vendor features they don't use — Basecart covers catalog, orders, shipping and WhatsApp for ₹99–₹2,999/mo.",
  migrationNotes: [
    "Export your catalog, orders and customer data from StoreHippo.",
    "Bulk-import into Basecart and rebuild storefront sections.",
    "Reconnect your payment gateway and domain (free SSL).",
    "Downscope: most D2C needs are covered by Growth or Business tiers.",
  ],
  faqs: [
    {
      q: "Is StoreHippo worth its price for a small store?",
      a: "StoreHippo starts at ₹15,000/mo and targets enterprises and B2B marketplaces. For a single-brand D2C store, Basecart provides the same India-native stack — payments, shipping, themes — from ₹99/mo.",
    },
    {
      q: "Does StoreHippo charge transaction fees?",
      a: "StoreHippo doesn't add an explicit per-order platform fee, but the ₹15,000/mo+ subscription makes it the most expensive option for small sellers. Basecart is flat ₹99–₹2,999/mo with 0% platform fees.",
    },
    {
      q: "Can I migrate from StoreHippo to Basecart?",
      a: "Yes — export your catalog and customer data, bulk-import into Basecart, reconnect your gateway and domain. Most D2C stores complete the move in days, not weeks.",
    },
  ],
};

// ── Wix ──────────────────────────────────────────────────────
export const WIX: Competitor = {
  slug: "wix",
  name: "Wix",
  category: "Global SaaS site builder",
  positioning:
    "A design-first website builder with e-commerce plans from $29/mo and 0% platform transaction fees — but Indian payment gateways require workarounds and commerce features are tier-gated.",
  bestFor:
    "Design-conscious small businesses that need a beautiful site quickly and operate outside India's payments ecosystem.",
  notIdealFor:
    "Indian sellers — native Razorpay/UPI/COD flows are awkward, and essential commerce features (tax, advanced shipping) sit on pricier tiers.",
  strengths: [
    "Excellent drag-and-drop design flexibility",
    "0% platform transaction fee",
    "Free plan available (no selling)",
    "Huge template library",
  ],
  weaknesses: [
    "No native Razorpay/UPI/COD integration — workarounds required",
    "Commerce features gated behind $29–$159/mo tiers",
    "Site speed lags on larger stores (per reviews)",
    "Auto-renew and tier-upgrade friction reported",
  ],
  commonComplaints: [
    "Essential commerce features paywalled to higher tiers",
    "Performance issues on image-heavy stores",
    "Support loops and upsell pressure",
  ],
  atAGlance: {
    startingPrice: "$29 /mo (Core, annual) — e-commerce entry",
    transactionFee: "0% platform fee — gateway fees apply",
    payments: "Stripe/PayPal native; Razorpay/UPI via workarounds",
    whatsapp: "Not native — manual links or third-party apps",
    shipping: "Basic shipping rules; no auto-AWB generation",
    setupTime: "A few hours to a day",
    staffAccounts: "5 collaborators (Core), more on higher tiers",
    freeTrial: "14-day trial (no free selling plan)",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "E-commerce starts at $29/mo (Core), and automated tax, advanced shipping and multi-currency sit on Business ($39/mo) and up. For Indian merchants the USD pricing plus workaround apps adds real cost.",
      verdict: "Basecart's ₹99–₹2,999/mo is flat, INR-priced and includes commerce features out of the box.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor:
        "Wix lacks native Razorpay/Cashfree/UPI integration. Indian sellers must use workarounds or third-party apps, which breaks the checkout experience and complicates COD.",
      verdict: "Basecart is India-first: Razorpay UPI, cards, netbanking and COD natively integrated.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "No native WhatsApp commerce — at best, manual 'order on WhatsApp' links.",
      verdict: "Basecart generates structured WhatsApp orders with alerts and recovery built in.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Shipping rules exist, but Indian courier automation (Shiprocket auto-AWB, pickups) is not native.",
      verdict: "Basecart automates Shiprocket, Delhivery, DTDC and Speed Post end-to-end.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Design is Wix's strength; commerce workflows are where it gets patchy, especially in India.",
      verdict: "Basecart trades some design freedom for a complete, India-ready commerce flow.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "24/7 support exists, but reviews report automated loops and upsell friction.",
      verdict: "Basecart's India-based team resolves store issues directly.",
    },
  ],
  basecartBestFor:
    "Wix users who love drag-and-drop but keep hitting India commerce walls — UPI/COD checkout, WhatsApp ordering and Shiprocket automation all work natively in Basecart.",
  migrationNotes: [
    "Export products from Wix (CSV).",
    "Rebuild your storefront sections in Basecart's theme customizer.",
    "Reconnect Razorpay and point your domain over (free SSL).",
    "Recreate marketing pages/landing pages as needed.",
  ],
  faqs: [
    {
      q: "Does Wix support Indian payment gateways?",
      a: "Not natively. Wix has no built-in Razorpay/Cashfree/UPI integration, so Indian sellers rely on workarounds or third-party apps. Basecart integrates Razorpay (UPI, cards, netbanking, COD) out of the box.",
    },
    {
      q: "Is Wix cheaper than Basecart?",
      a: "E-commerce on Wix starts at $29/mo (~₹2,400) and INR pricing is not offered. Basecart's Growth plan is ₹1,499/mo with unlimited products, WhatsApp ordering, abandoned-cart recovery and Shiprocket automation included.",
    },
    {
      q: "Can I migrate from Wix to Basecart?",
      a: "Yes — export products as CSV, rebuild your layout in Basecart's theme customizer, reconnect Razorpay and point your domain over with free SSL.",
    },
  ],
};

// ── Zyro / Hostinger ─────────────────────────────────────────
export const ZYRO: Competitor = {
  slug: "zyro",
  name: "Zyro (Hostinger Website Builder)",
  category: "Budget SaaS site builder",
  positioning:
    "A budget-friendly site builder (formerly Zyro, now Hostinger Website Builder) with rock-bottom intro pricing — but e-commerce is capped at 1,000 products, there's no app marketplace, and renewal prices jump sharply.",
  bestFor:
    "Micro-stores and very small catalogs where price is the only consideration and scale isn't on the roadmap.",
  notIdealFor:
    "Growing Indian sellers — the 1,000-product cap, missing Indian payment/shipping depth and steep renewals stall growth.",
  strengths: [
    "Very low introductory pricing (~$3.99/mo)",
    "0% platform transaction fee",
    "Built-in AI tools",
    "Simple, fast setup",
  ],
  weaknesses: [
    "1,000-product and 50GB storage caps",
    "No true app marketplace — limited extensibility",
    "Renewal prices jump 200–300%+ after intro term",
    "No native Indian gateway/shipping depth",
  ],
  commonComplaints: [
    "Product/storage caps block growth",
    "Renewal price shock",
    "Limited integrations for commerce needs",
  ],
  atAGlance: {
    startingPrice: "~$3.99 /mo intro (renews ~$16.99/mo)",
    transactionFee: "0% platform fee — gateway fees apply",
    payments: "100+ payment methods; Razorpay/UPI depth limited",
    whatsapp: "Not native",
    shipping: "Basic; no Shiprocket auto-AWB automation",
    setupTime: "~30 minutes",
    staffAccounts: "Limited collaboration features",
    freeTrial: "14-day trial, 30-day money-back",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Intro pricing looks unbeatable, but after the promotional term the Business plan renews near $16.99/mo — a 300%+ jump — and the 1,000-product/50GB caps force upgrades or a rebuild.",
      verdict: "Basecart's flat INR pricing has no promo traps and no product caps on Growth+.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor: "Broad payment-method list, but Razorpay/UPI/COD flows for India aren't first-class.",
      verdict: "Basecart's native Razorpay integration handles UPI, cards, netbanking and COD cleanly.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "No native WhatsApp ordering capability.",
      verdict: "WhatsApp checkout and alerts are built into Basecart on every plan.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Basic shipping setup; no Indian courier automation with auto-AWB.",
      verdict: "Basecart bundles Shiprocket/Delhivery/DTDC/Speed Post with auto-AWB generation.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Very easy to start — the ceiling (caps, integrations) is the problem, not the learning curve.",
      verdict: "Both are easy; Basecart doesn't cap your growth.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Hostinger support is responsive for hosting issues; commerce-specific help is thinner.",
      verdict: "Basecart's support team owns the full commerce stack.",
    },
  ],
  basecartBestFor:
    "Sellers outgrowing Zyro/Hostinger's 1,000-product cap who want real Indian payments, WhatsApp ordering and shipping automation without the renewal-price shock.",
  migrationNotes: [
    "Export your catalog (CSV) from Hostinger/Zyro.",
    "Bulk-import into Basecart — Growth allows unlimited products.",
    "Reconnect Razorpay and move your domain (free SSL).",
    "Rebuild storefront layout in Basecart's theme customizer.",
  ],
  faqs: [
    {
      q: "Does Zyro/Hostinger limit products?",
      a: "Yes — the e-commerce plan caps stores at 1,000 products and 50GB storage, which stalls growing catalogs. Basecart's Growth plan (₹1,499/mo) supports unlimited products and orders.",
    },
    {
      q: "Is Zyro/Hostinger good for Indian sellers?",
      a: "For very small stores, possibly. But there's no native Razorpay/UPI/COD depth, no WhatsApp commerce and no Indian courier automation — all core to selling in India. Basecart covers these natively.",
    },
    {
      q: "Can I migrate from Zyro to Basecart?",
      a: "Yes — export products as CSV, import into Basecart, reconnect Razorpay and point your domain over with free SSL.",
    },
  ],
};

// ── BigCommerce ──────────────────────────────────────────────
export const BIGCOMMERCE: Competitor = {
  slug: "bigcommerce",
  name: "BigCommerce",
  category: "Global SaaS store builder (mid-market)",
  positioning:
    "A robust mid-market SaaS with no transaction fee when using approved gateways — but Indian payment depth is thin, sales thresholds force auto-upgrades, and open-provider fees penalize flexibility.",
  bestFor:
    "US/UK/AU mid-market brands using Stripe/PayPal/Braintree/Adyen who need strong B2B and multi-currency features.",
  notIdealFor:
    "Indian sellers — Razorpay/UPI/COD workflows aren't first-class, GMV thresholds auto-upgrade plans, and support/features target Western markets.",
  strengths: [
    "0% platform fee with approved gateways (Stripe, PayPal, etc.)",
    "Strong B2B, multi-currency & API capabilities",
    "No staff-account limits on most plans",
    "Reliable enterprise-grade uptime",
  ],
  weaknesses: [
    "No native Indian gateway/UPI/COD depth",
    "Sales thresholds auto-upgrade you to costlier plans",
    "2%/1%/0.6% open-provider fee if you use non-approved gateways",
    "Steep learning curve and US-centric support",
  ],
  commonComplaints: [
    "Automatic plan upgrades when GMV crosses thresholds",
    "Open payment provider fees on manual/offline orders",
    "Complexity for non-technical founders",
  ],
  atAGlance: {
    startingPrice: "$29 /mo (Core, annual) — $30K GMV cap",
    transactionFee: "0% with approved gateways; 2% open-provider fee (Core)",
    payments: "Stripe/PayPal/Adyen native; Razorpay/UPI not first-class",
    whatsapp: "Not native",
    shipping: "Robust US carrier support; thin India courier automation",
    setupTime: "Days to weeks",
    staffAccounts: "Unlimited",
    freeTrial: "15-day trial",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Core is $29/mo but caps GMV at $30K/12 months — cross it and you're auto-upgraded to Growth ($79/mo), then Scale ($299/mo). Growing stores get forced onto pricier plans as they succeed.",
      verdict: "Basecart's flat ₹99–₹2,999/mo never punishes you for selling more.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor:
        "Designed around Stripe/PayPal/Braintree/Adyen. Razorpay and UPI aren't first-class, and using non-approved providers triggers a 2% open-provider fee.",
      verdict: "Basecart integrates Razorpay natively with UPI, cards, netbanking and COD — no provider penalty.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "No native WhatsApp commerce — app/marketplace workarounds only.",
      verdict: "WhatsApp ordering, alerts and recovery are native in Basecart.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Excellent US/UK carrier support; Shiprocket/Delhivery automation for India is thin.",
      verdict: "Basecart automates India's leading couriers with auto-AWB generation.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Powerful but complex — reviewers consistently note a steep learning curve.",
      verdict: "Basecart's dashboard is designed for a solo founder to run end-to-end.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Phone support is tier-gated (not on Core), and support focuses on Western markets.",
      verdict: "Basecart offers India-based support on every plan.",
    },
  ],
  basecartBestFor:
    "Merchants attracted by BigCommerce's 'no transaction fee' who don't need B2B/Western-market features — Basecart gives 0% platform fees with India-first payments and shipping at a fraction of the price.",
  migrationNotes: [
    "Export catalog, orders and customers via BigCommerce's CSV/API tools.",
    "Bulk-import into Basecart.",
    "Reconnect your Indian gateway (Razorpay) — likely easier than on BigCommerce.",
    "Point your domain to Basecart with free SSL.",
  ],
  faqs: [
    {
      q: "Does BigCommerce charge transaction fees?",
      a: "Only if you use non-approved gateways (2% on Core, 1% Growth, 0.6% Scale) or take manual/offline orders. Approved processors like Stripe are free — but none of these are India-first, and Razorpay/UPI depth is thin.",
    },
    {
      q: "Is BigCommerce good for Indian sellers?",
      a: "Generally no — it's built around Western gateways and carriers, GMV thresholds auto-upgrade you to pricier plans, and there's no native UPI/COD or WhatsApp commerce. Basecart is designed for the Indian stack from day one.",
    },
    {
      q: "Can I migrate from BigCommerce to Basecart?",
      a: "Yes — export via CSV/API, import into Basecart, reconnect Razorpay and point your domain over with free SSL.",
    },
  ],
};

// ── Meesho ───────────────────────────────────────────────────
export const MEESHO: Competitor = {
  slug: "meesho",
  name: "Meesho",
  category: "Marketplace (social commerce)",
  positioning:
    "A zero-commission value marketplace with massive reach — but sellers absorb shipping/RTO costs (often 20–35% of order value), own no customer data, and can't build a brand.",
  bestFor:
    "Suppliers who want to move high volumes of low-priced goods on a price-driven platform without managing their own store.",
  notIdealFor:
    "Brands that need margins, customer relationships and repeat purchases — Meesho gives you none of the customer data.",
  strengths: [
    "0% commission on product sales",
    "Huge Tier 2/3 buyer base",
    "Platform handles last-mile logistics",
    "Low barrier to entry",
  ],
  weaknesses: [
    "Shipping/RTO/collection fees consume 20–35% of order value",
    "No customer data — you can't retarget or build loyalty",
    "No brand identity — buyers shop price, not your brand",
    "Returns/RTO rates of 20–40% in fashion categories",
  ],
  commonComplaints: [
    "Razor-thin net margins after fees and RTO",
    "Payment reconciliation and deduction disputes",
    "Return fraud and damaged-item swaps",
    "No way to grow a repeat customer base",
  ],
  atAGlance: {
    startingPrice: "Free to list — fees deducted per order",
    transactionFee: "0% commission, but shipping + RTO eat 20–35% of order value",
    payments: "Meesho handles payments; sellers settle after delivery",
    whatsapp: "N/A — selling happens inside the marketplace",
    shipping: "Meesho/Valmo logistics; RTO costs borne by seller",
    setupTime: "Days (approval + onboarding)",
    staffAccounts: "N/A (marketplace)",
    freeTrial: "N/A (marketplace)",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Meesho advertises 0% commission, but shipping (₹35–₹45 per 500g), reverse-shipping/RTO penalties (₹100–₹200+) and fee deductions routinely consume 20–35% of order value — on a ₹299 item that can leave tens of rupees.",
      verdict: "Basecart keeps 100% of your margin minus gateway MDR, with a flat ₹99–₹2,999/mo platform fee.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor: "Meesho collects from buyers and settles to you — convenient, but you never see the customer or their contact details.",
      verdict: "Basecart pays you directly via Razorpay per order and you own every customer relationship.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "Meesho IS social commerce — but through resellers on the marketplace, not your brand's own channel.",
      verdict: "Basecart lets you convert your own WhatsApp/Instagram audience into direct, branded orders.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Logistics are handled, but sellers absorb RTO/reverse-shipping costs in high-return categories.",
      verdict: "Basecart gives you courier choice (Shiprocket, Delhivery, DTDC, Speed Post) with auto-AWB and COD verification.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Listing on Meesho is easy — growing a brand there is not.",
      verdict: "Basecart is equally easy to start and actually builds brand equity.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Seller support exists but dispute resolution (returns, deductions) is a common pain point.",
      verdict: "Basecart's team supports your store end-to-end.",
    },
  ],
  basecartBestFor:
    "Meesho suppliers who want to stop donating 20–35% of order value to fees and RTO — Basecart gives you your own store, your customer data and full margins, while you can keep Meesho for volume.",
  migrationNotes: [
    "Keep Meesho running for discovery while you launch your Basecart store.",
    "Build your catalog in Basecart (CSV import supported).",
    "Add order inserts/WhatsApp flows inviting Meesho buyers to your store.",
    "Reconnect Razorpay and your courier accounts.",
  ],
  faqs: [
    {
      q: "Can I sell on Meesho and have my own store too?",
      a: "Yes — and it's a smart play. Meesho moves volume, but you own no customer data and margins are thin. A Basecart store captures full margins and customer relationships; use order inserts to drive Meesho buyers to your brand store.",
    },
    {
      q: "Why do Meesho sellers make so little per order?",
      a: "While commission is 0%, shipping, reverse-shipping/RTO penalties and fee deductions can consume 20–35% of order value. Basecart charges a flat platform fee with 0% transaction commission.",
    },
    {
      q: "Can I migrate from Meesho to Basecart?",
      a: "Yes — export your product data, launch your Basecart store, and keep Meesho running for discovery while you build your own customer base.",
    },
  ],
};

// ── Shopsy ───────────────────────────────────────────────────
export const SHOPSY: Competitor = {
  slug: "shopsy",
  name: "Shopsy",
  category: "Marketplace (Flipkart value tier)",
  positioning:
    "Flipkart's hyper-value marketplace with 0% commission across categories — but sellers still pay closing/collection/shipping fees, own no customer data, and compete purely on price.",
  bestFor:
    "Suppliers moving high volumes of budget products through Flipkart's value ecosystem.",
  notIdealFor:
    "Sellers who want to build a brand, own customer relationships or keep healthy margins.",
  strengths: [
    "0% commission across categories",
    "Flipkart ecosystem reach",
    "Cross-listing from Flipkart seller panel",
    "Budget-buyer volume",
  ],
  weaknesses: [
    "Closing/collection (COD) and weight-based shipping fees still apply",
    "No customer data or brand identity",
    "Price-race-to-the-bottom dynamics",
    "High RTO/returns pressure in value categories",
  ],
  commonComplaints: [
    "Net settlements are small after fees and deductions",
    "Reconciliation across fees/deductions is complex",
    "Hard to differentiate a brand on the platform",
  ],
  atAGlance: {
    startingPrice: "Free to list — per-order fees apply",
    transactionFee: "0% commission; closing + COD collection + shipping fees",
    payments: "Flipkart handles payments; COD collection fees higher",
    whatsapp: "N/A — marketplace selling",
    shipping: "Weight-based shipping via Flipkart logistics",
    setupTime: "Days (KYC + listing approval)",
    staffAccounts: "N/A (marketplace)",
    freeTrial: "N/A (marketplace)",
  },
  detailedCategories: [
    {
      name: "Pricing & total cost",
      basecart: BASECART.pricingNote,
      competitor:
        "Shopsy's 0% commission is real, but fixed closing fees, higher COD collection fees and weight-based shipping (plus 18% GST on services) still cut deep into low-ticket margins.",
      verdict: "Basecart's 0% platform fee with flat monthly pricing preserves margins on every order.",
    },
    {
      name: "Payments in India",
      basecart: BASECART.paymentsNote,
      competitor: "Flipkart settles payouts; COD collection fees are higher, and you never receive buyer contact data.",
      verdict: "Basecart pays you directly per order via Razorpay and you own the customer relationship.",
    },
    {
      name: "WhatsApp & social commerce",
      basecart: BASECART.whatsappNote,
      competitor: "N/A — Shopsy is a marketplace, not a channel you can brand.",
      verdict: "Basecart turns your WhatsApp/Instagram audience into branded, direct orders.",
    },
    {
      name: "Shipping & logistics",
      basecart: BASECART.shippingNote,
      competitor: "Weight-based shipping through Flipkart logistics; RTO and returns pressure margins.",
      verdict: "Basecart lets you choose couriers and automate AWBs and pickups for cost control.",
    },
    {
      name: "Ease of use",
      basecart: BASECART.easeNote,
      competitor: "Listing is easy; brand-building and customer retention are not possible.",
      verdict: "Basecart is easy to start and compounds into a real brand asset.",
    },
    {
      name: "Support",
      basecart: BASECART.supportNote,
      competitor: "Marketplace seller support with common disputes around deductions and RTO.",
      verdict: "Basecart supports your own store end-to-end.",
    },
  ],
  basecartBestFor:
    "Shopsy sellers tired of razor-thin settlements and zero customer ownership — Basecart gives you full margins, your own data and a brand storefront, alongside (not instead of) marketplace volume.",
  migrationNotes: [
    "Run Shopsy for volume while launching your Basecart store.",
    "Import your catalog into Basecart (CSV supported).",
    "Use packaging inserts and WhatsApp flows to move buyers to your store.",
    "Reconnect Razorpay and couriers for direct settlement.",
  ],
  faqs: [
    {
      q: "Can I sell on Shopsy and run my own store?",
      a: "Yes — cross-list for marketplace volume while a Basecart store captures full margins, customer data and repeat purchases. Order inserts are the classic bridge between the two.",
    },
    {
      q: "Does Shopsy really charge no commission?",
      a: "Commission is 0%, but closing fees, COD collection fees and weight-based shipping (with 18% GST on services) still reduce settlements. Basecart charges a flat platform fee with 0% per-order commission.",
    },
    {
      q: "Can I migrate from Shopsy to Basecart?",
      a: "Yes — export your product data, launch your Basecart store, and use it to build the customer base and margins the marketplace can't give you.",
    },
  ],
};

// ── Registry ─────────────────────────────────────────────────
export const COMPETITORS: Competitor[] = [
  SHOPIFY,
  WOOCOMMERCE,
  INSTAMOJO,
  STOREHIPPO,
  WIX,
  ZYRO,
  BIGCOMMERCE,
  MEESHO,
  SHOPSY,
];

export function getCompetitor(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}

// ── Competitor vs Competitor pairs ───────────────────────────
export interface CompareCategory {
  name: string;
  a: string; // competitor A's detail
  b: string; // competitor B's detail
  verdict: string; // how Basecart fits
}

export interface ComparePair {
  slug: string;
  a: string; // competitor slug
  b: string; // competitor slug
  headline: string;
  tldr: string;
  categories: CompareCategory[];
  bestForA: string;
  bestForB: string;
  thirdOption: string;
  faqs: Faq[];
}

export const COMPARE_PAIRS: ComparePair[] = [
  {
    slug: "shopify-vs-woocommerce",
    a: "shopify",
    b: "woocommerce",
    headline: "Shopify vs WooCommerce in India (2026): Which Is Right for You?",
    tldr: "Shopify is the managed, app-rich option that costs ₹1,994/mo+ and adds a ~2% platform surcharge in India. WooCommerce is 'free' software whose real cost hides in hosting, plugins and your own maintenance time. Basecart combines Shopify's managed simplicity with WooCommerce's zero platform fees.",
    categories: [
      {
        name: "Pricing",
        a: "₹1,994/mo (Basic) + paid apps for most features.",
        b: "Free plugin, but ₹1,500–₹12,000+/mo all-in for hosting, theme and plugins.",
        verdict: "Basecart's flat ₹99–₹2,999/mo includes everything — no app store, no hosting bill.",
      },
      {
        name: "Transaction fees in India",
        a: "2% platform surcharge (Basic) since Shopify Payments isn't available in India.",
        b: "No platform fee — gateway MDR only (~2%+).",
        verdict: "WooCommerce and Basecart avoid Shopify's surcharge; Basecart also avoids WooCommerce's upkeep cost.",
      },
      {
        name: "Payments in India",
        a: "Third-party gateway apps (Razorpay, Cashfree, PayU).",
        b: "Free gateway plugins, but UPI/COD setup and reconciliation are DIY.",
        verdict: "Basecart gives verified UPI/COD flows out of the box.",
      },
      {
        name: "WhatsApp & social commerce",
        a: "Paid apps (₹1,000+/mo) for WhatsApp ordering.",
        b: "Third-party plugins at ₹999+/mo, breakable by updates.",
        verdict: "Native WhatsApp checkout, alerts and cart recovery in Basecart.",
      },
      {
        name: "Maintenance & security",
        a: "Managed — Shopify runs the infrastructure.",
        b: "You own security, updates, backups and performance.",
        verdict: "Basecart is fully managed like Shopify, without the surcharge.",
      },
      {
        name: "Ease of use",
        a: "A few days to configure properly.",
        b: "1–3 days minimum; weeks done properly.",
        verdict: "Basecart launches in ~2 minutes with no code.",
      },
    ],
    bestForA:
      "Shopify is best for established brands that need a global app ecosystem, multi-currency selling and don't mind ~4–5.5% transaction costs in India.",
    bestForB:
      "WooCommerce is best for technical founders who want full ownership, have no platform-fee appetite, and will maintain their own stack.",
    thirdOption:
      "Basecart is the middle path built for Indian sellers: Shopify's managed, no-code experience with WooCommerce's 0% platform fee — plus native UPI/COD, WhatsApp ordering and Shiprocket automation, from ₹99/mo.",
    faqs: [
      {
        q: "Which is cheaper: Shopify or WooCommerce?",
        a: "It depends on who does the work. Shopify is ₹1,994/mo+ with app costs and a 2% India surcharge. WooCommerce has no subscription but costs ₹1,500–₹12,000+/mo in hosting, plugins and maintenance. Basecart's flat ₹99–₹2,999/mo is usually cheapest for non-technical sellers.",
      },
      {
        q: "Is Basecart better than both for India?",
        a: "For most Indian D2C sellers, yes: it has Shopify's managed simplicity, WooCommerce's zero platform fee, and adds the India stack (UPI/COD, WhatsApp, Shiprocket) natively — no apps, no plugins, no servers.",
      },
      {
        q: "Can I migrate from Shopify or WooCommerce to Basecart?",
        a: "Yes. Both export CSV catalogs and orders; Basecart supports bulk import, free SSL domain moves and Razorpay reconnection.",
      },
    ],
  },
  {
    slug: "shopify-vs-instamojo",
    a: "shopify",
    b: "instamojo",
    headline: "Shopify vs Instamojo for Indian Sellers (2026): Honest Comparison",
    tldr: "Shopify brings global scale but charges ~4–5.5% per order in India. Instamojo is cheap to start but taxes 2–5% + ₹3 per transaction. Basecart keeps the India-native experience with a 0% platform fee — flat pricing that doesn't punish growth.",
    categories: [
      {
        name: "Pricing",
        a: "₹1,994/mo+ for Basic, plus app costs.",
        b: "Free (Lite) to ₹2,999/mo (Growth), but 2–5% transaction fees.",
        verdict: "Basecart is flat ₹99–₹2,999/mo with no per-order platform fee.",
      },
      {
        name: "Transaction fees in India",
        a: "2% platform surcharge + gateway MDR (~4–5.5% total).",
        b: "5% + ₹3 per order (Lite/Starter); 2% + ₹3 (Growth).",
        verdict: "Basecart is the only one without a per-order platform cut.",
      },
      {
        name: "Payments in India",
        a: "Gateway apps; no Shopify Payments in India.",
        b: "Bundled gateway with payout-delay complaints in reviews.",
        verdict: "Basecart rides Razorpay's rails with direct, predictable settlements.",
      },
      {
        name: "WhatsApp & social commerce",
        a: "Paid apps for WhatsApp ordering.",
        b: "WhatsApp features mainly on the Growth plan.",
        verdict: "WhatsApp checkout and alerts are native to Basecart on every plan.",
      },
      {
        name: "Shipping & logistics",
        a: "Shiprocket via app — extra cost and setup.",
        b: "Basic shipping tools; no auto-AWB generation.",
        verdict: "Basecart automates Shiprocket, Delhivery, DTDC and Speed Post natively.",
      },
      {
        name: "Scaling",
        a: "Scales globally, at rising cost.",
        b: "Per-order fees punish volume growth.",
        verdict: "Basecart scales profitably with unlimited products/orders on Growth.",
      },
    ],
    bestForA:
      "Shopify suits global ambitions and sellers comfortable with a rich-but-costly app ecosystem.",
    bestForB:
      "Instamojo suits bootstrapped micro-sellers starting out with low order volumes.",
    thirdOption:
      "Basecart is the India-first scaling path: the native UPI/COD/WhatsApp experience Instamojo promises minus its transaction fees, with Shopify-grade reliability at a flat, honest price.",
    faqs: [
      {
        q: "Shopify or Instamojo for an Indian store?",
        a: "For low volume, Instamojo's free tier works but its 5% fee stings. For scale, Shopify's ~4–5.5% transaction cost stings more. Basecart's 0% platform fee with native UPI/COD and WhatsApp ordering fits Indian growth best.",
      },
      {
        q: "Does Instamojo charge less than Shopify?",
        a: "Instamojo's subscription is cheaper, but its per-order fees (5% + ₹3) can exceed Shopify's surcharge for high-ticket items. Neither beats Basecart's 0% platform fee.",
      },
      {
        q: "Can I migrate from Instamojo to Basecart?",
        a: "Yes — export your catalog, bulk-import into Basecart, reconnect Razorpay and move your domain with free SSL.",
      },
    ],
  },
  {
    slug: "shopify-vs-meesho",
    a: "shopify",
    b: "meesho",
    headline: "Shopify vs Meesho for Indian Sellers (2026): Own Store or Marketplace?",
    tldr: "Shopify gives you a brand and customer data but costs ~4–5.5% per order in India. Meesho gives volume and 0% commission but you own nothing — no customer data, no brand, and fees/RTO eat 20–35% of order value. Basecart is the own-store option without the transaction squeeze.",
    categories: [
      {
        name: "Model",
        a: "Your own branded store — full data ownership.",
        b: "Marketplace — you never see the customer or their data.",
        verdict: "Basecart and Shopify build brand equity; Meesho doesn't.",
      },
      {
        name: "Transaction costs",
        a: "~4–5.5% per order in India (surcharge + MDR).",
        b: "0% commission, but fees + RTO consume 20–35% of order value.",
        verdict: "Basecart preserves the most margin per order.",
      },
      {
        name: "Customer data",
        a: "You own every customer, order and contact.",
        b: "Never shared with sellers — no retargeting possible.",
        verdict: "Basecart (like Shopify) enables retargeting and loyalty.",
      },
      {
        name: "Brand building",
        a: "Full brand control: domain, themes, packaging.",
        b: "None — buyers shop price, not your brand.",
        verdict: "Own your brand on Basecart or Shopify.",
      },
      {
        name: "WhatsApp & social commerce",
        a: "Paid apps for WhatsApp ordering.",
        b: "Reseller-led social commerce — not your channel.",
        verdict: "Basecart makes your own WhatsApp/Instagram channels shoppable.",
      },
      {
        name: "Volume",
        a: "Unlimited products, but at rising transaction cost.",
        b: "High volume, razor-thin margins.",
        verdict: "Use Meesho for discovery; Basecart for margin and retention.",
      },
    ],
    bestForA:
      "Shopify suits sellers who want a global, app-rich storefront and accept its transaction costs.",
    bestForB:
      "Meesho suits suppliers who want fast volume on a price-driven platform and don't need a brand or customer data.",
    thirdOption:
      "Basecart is the 'own your brand' strategy without Shopify's India tax: your store, your data, full margins, native UPI/COD/WhatsApp — while you keep Meesho for discovery.",
    faqs: [
      {
        q: "Should I sell on Meesho or build my own store?",
        a: "Both — they're complementary. Meesho moves volume but hides customers and margins; your own Basecart store captures data, brand and full margins. Use packaging inserts to drive Meesho buyers to your store.",
      },
      {
        q: "Why do sellers leave Meesho for their own store?",
        a: "Fees and RTO consume 20–35% of order value, no customer data is shared, and price competition prevents brand building. An own store on Basecart fixes all three.",
      },
      {
        q: "Can I run Shopify or Basecart alongside Meesho?",
        a: "Yes. Many sellers cross-list on Meesho for volume and run a Basecart store for branded, margin-positive direct sales with native WhatsApp ordering.",
      },
    ],
  },
  {
    slug: "woocommerce-vs-instamojo",
    a: "woocommerce",
    b: "instamojo",
    headline: "WooCommerce vs Instamojo (2026): Best Store Builder for Indian Sellers",
    tldr: "WooCommerce gives ownership but demands technical upkeep (₹1,500–₹12,000+/mo all-in). Instamojo is easy and India-native but charges 2–5% + ₹3 per transaction. Basecart delivers Instamojo's ease with WooCommerce's no-platform-fee economics — flat ₹99–₹2,999/mo.",
    categories: [
      {
        name: "Pricing",
        a: "Free plugin, but ₹1,500–₹12,000+/mo all-in (hosting, theme, plugins).",
        b: "Free tier with 5% fees, or ₹14,999/yr for Growth.",
        verdict: "Basecart's flat ₹99–₹2,999/mo includes hosting, SSL and themes.",
      },
      {
        name: "Transaction fees in India",
        a: "No platform fee — gateway MDR only.",
        b: "2–5% + ₹3 per order depending on plan.",
        verdict: "WooCommerce and Basecart avoid Instamojo's per-order tax.",
      },
      {
        name: "Payments in India",
        a: "Free Razorpay/Cashfree plugins — DIY setup.",
        b: "Bundled gateway with payout-delay complaints.",
        verdict: "Basecart gives verified India payment flows without DIY or per-order fees.",
      },
      {
        name: "WhatsApp & social commerce",
        a: "Plugins at ₹999+/mo, breakable by updates.",
        b: "WhatsApp features mainly on the Growth plan.",
        verdict: "Native WhatsApp checkout and alerts on every Basecart plan.",
      },
      {
        name: "Maintenance & security",
        a: "You handle updates, backups and security.",
        b: "Managed platform.",
        verdict: "Basecart is fully managed like Instamojo, without the fees.",
      },
      {
        name: "Ease of use",
        a: "1–3+ days to set up; ongoing upkeep.",
        b: "~30 minutes to start.",
        verdict: "Basecart is easy to start and scales without fee walls.",
      },
    ],
    bestForA:
      "WooCommerce suits developers and technical founders who value ownership over convenience.",
    bestForB:
      "Instamojo suits non-technical micro-sellers starting with low volumes who accept its fees.",
    thirdOption:
      "Basecart is Instamojo's simplicity without the transaction fees and WooCommerce's economics without the maintenance — the India-native middle path.",
    faqs: [
      {
        q: "Is Instamojo or WooCommerce better for beginners?",
        a: "Instamojo is easier to start, but its per-order fees grow painful. WooCommerce is free of platform fees but assumes technical skill. Basecart is beginner-friendly and fee-free, with WhatsApp and shipping automation built in.",
      },
      {
        q: "Which is cheaper long-term?",
        a: "WooCommerce's DIY path can be cheap for technical founders, but professional setups run ₹4,500–₹12,000+/mo. Instamojo adds 2–5% per order. Basecart's flat ₹99–₹2,999/mo is predictable for most sellers.",
      },
      {
        q: "Can I migrate from WooCommerce or Instamojo to Basecart?",
        a: "Yes — both support CSV export. Bulk-import into Basecart, reconnect Razorpay and move your domain with free SSL.",
      },
    ],
  },
];

export function getComparePair(slug: string): ComparePair | undefined {
  return COMPARE_PAIRS.find((p) => p.slug === slug);
}

// Related compare pairs for a given competitor slug (internal linking)
export function comparePairsFor(slug: string): ComparePair[] {
  return COMPARE_PAIRS.filter((p) => p.a === slug || p.b === slug);
}

// Related competitors (exclude self) for cross-linking
export function relatedCompetitors(slug: string, limit = 3): Competitor[] {
  return COMPETITORS.filter((c) => c.slug !== slug).slice(0, limit);
}
