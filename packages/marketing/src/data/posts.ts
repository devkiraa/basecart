// ─────────────────────────────────────────────────────────────
// Blog posts data — single source of truth for the /blog index
// and individual /blog/[slug] article pages (with JSON-LD
// Article/BlogPosting schema).
// ─────────────────────────────────────────────────────────────

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO 8601 date for schema markup */
  date: string;
  /** Human-readable date for display */
  displayDate: string;
  /** ISO 8601 date — last substantive update */
  updatedDate: string;
  readTime: string;
  category: "Engineering" | "E-commerce" | "Guides" | "Product";
  /** Standalone 40–60 word answer block (extractable by AI engines) */
  excerpt: string;
  image: string;
  author: {
    name: string;
    role: string;
  };
  sections: BlogSection[];
  faqs?: BlogFaq[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "isolated-databases-ecommerce-security-performance",
    title: "How Isolated Databases Improve E-commerce Security & Performance",
    date: "2026-07-15",
    displayDate: "July 15, 2026",
    updatedDate: "2026-08-10",
    readTime: "5 min read",
    category: "Engineering",
    excerpt:
      "Isolated databases give every e-commerce merchant their own private database instead of sharing one giant table with other stores. Isolation prevents cross-tenant data leaks, removes noisy-neighbor slowdowns, and keeps each merchant's checkout fast even when other stores on the platform spike in traffic.",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80",
    author: {
      name: "Basecart Engineering",
      role: "Platform Team, Basecart",
    },
    sections: [
      {
        paragraphs: [
          "Most e-commerce platforms store every merchant's products, orders, and customers in a single shared database. A table that serves one store of 1,000 products and another of 100,000 products is the same table — and the heavy query patterns of the large store slow down the small one. Basecart takes the opposite approach: each tenant receives a private, isolated database (a dedicated D1 SQLite instance) with its own schema, indexes, and data.",
        ],
      },
      {
        heading: "Why the shared-database pattern causes bottlenecks",
        paragraphs: [
          "Shared multi-tenant databases optimize for storage cost, not for performance. Every query competes for the same connection pool, buffer cache, and CPU. A runaway analytics query from one merchant can degrade checkout latency for hundreds of others — a problem known as the noisy-neighbor effect.",
          "Scaling a shared table also compounds the problem: adding indexes to support one merchant's new report changes write amplification for everyone. Database isolation sidesteps all of this because each tenant's workload is bounded by its own resources.",
        ],
      },
      {
        heading: "Security: isolation is the strongest tenant boundary",
        paragraphs: [
          "The hardest security problem in multi-tenant software is proving that one customer can never read another customer's data. Shared databases rely on every query carrying the correct tenant ID in its WHERE clause — one missed filter in a future code change becomes a data breach.",
          "With isolated databases, the boundary is physical: there is no table, index, or row belonging to another tenant inside your database at all. Even a query written without a tenant filter cannot return another store's records, because those records do not exist in that database. This eliminates an entire class of cross-tenant vulnerabilities.",
        ],
        list: [
          "No shared tables or indexes between merchants",
          "Tenant data cannot leak through a missed WHERE clause",
          "Per-tenant backup, restore, and export without touching other stores",
          "Breach blast radius is limited to a single database",
        ],
      },
      {
        heading: "Performance: no noisy neighbors, faster checkouts",
        paragraphs: [
          "Checkout performance is the metric that decides whether customers complete a purchase. A 100ms increase in page latency can measurably reduce conversion, and in a shared database that latency spike can come from another merchant's import job, not from your own store.",
          "Isolation removes that variable. Each store's queries only contend with its own traffic, which makes latency predictable during flash sales, festival peaks, and campaign launches. Predictable latency is what lets merchants plan inventory and promotions without gambling on platform noise.",
        ],
      },
      {
        heading: "Compliance and data ownership",
        paragraphs: [
          "Isolated databases also simplify compliance. When a merchant needs a data export or a deletion under consumer protection rules, the operation touches exactly one database. There is no cross-tenant cleanup process and no risk of accidentally pruning another store's rows.",
          "For Indian sellers handling GST invoices, order records, and customer PII, the ability to export a complete, self-contained dataset per store is both a compliance requirement and an operational convenience.",
        ],
      },
      {
        heading: "What isolation costs — and why it's worth it",
        paragraphs: [
          "The trade-off is storage efficiency: per-tenant databases use more total storage than a shared table, because each database reserves schema and index overhead. In practice, the security boundary and performance predictability more than repay that cost for any store that cares about conversion and data safety.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is an isolated database in e-commerce?",
        a: "An isolated database is a private database dedicated to a single store or tenant. Unlike shared multi-tenant databases, no other merchant's data exists in it, which prevents cross-tenant access and removes shared-resource slowdowns.",
      },
      {
        q: "Does database isolation affect checkout speed?",
        a: "Yes, positively. Isolated databases make latency predictable because queries never compete with other tenants' traffic. This helps checkout stay fast during traffic spikes and flash sales.",
      },
      {
        q: "How does an isolated database improve security?",
        a: "It creates a physical boundary between tenants. Even a buggy query without a tenant filter cannot return another store's records, because those records do not exist in the same database — eliminating an entire class of cross-tenant data leak vulnerabilities.",
      },
    ],
  },
  {
    slug: "conversion-tactics-headless-checkout-flow",
    title: "5 Conversion Tactics to Optimize Your Headless Checkout Flow",
    date: "2026-06-28",
    displayDate: "June 28, 2026",
    updatedDate: "2026-08-10",
    readTime: "4 min read",
    category: "E-commerce",
    excerpt:
      "Cart abandonment typically affects roughly 70% of online shopping carts, and most of that loss happens at checkout. Optimizing the checkout flow — fewer form fields, faster payment options like UPI, and mobile-first layout — can reduce abandonment by up to 30% and lift conversion without spending a rupee on ads.",
    image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
    author: {
      name: "Basecart Product",
      role: "Product Team, Basecart",
    },
    sections: [
      {
        paragraphs: [
          "Checkout is where e-commerce revenue is won or lost. Industry studies consistently put cart abandonment around 70%, and the single biggest recoverable cause is a checkout that demands too much effort. The tactics below are ordered by impact per unit of effort — start at the top.",
        ],
      },
      {
        heading: "1. Cut the number of form fields",
        paragraphs: [
          "Every input field is a place where a shopper decides the purchase isn't worth it. Audit your checkout for fields you collect but never use — a 'company name' field on a B2C store is a classic offender. Remove or defer anything non-essential, and keep address capture to what the courier actually needs.",
          "Inline validation with clear error messages matters just as much. A shopper who has to guess why a form rejected their phone number is a shopper about to leave.",
        ],
      },
      {
        heading: "2. Offer instant UPI as a first-class payment option",
        paragraphs: [
          "For Indian shoppers, UPI is the default way to pay — GPay, PhonePe, and Paytm combined account for hundreds of millions of users. If UPI requires leaving the checkout or entering card details, you're adding friction to the most popular payment method in the market.",
          "Native UPI at checkout (via Razorpay or similar) lets customers confirm payment in one tap with no OTP, no card, and no redirect to a third-party wallet. Zero-transaction-fee platforms like Basecart make instant UPI even more attractive because the merchant isn't absorbing per-order platform fees.",
        ],
      },
      {
        heading: "3. Design for mobile first",
        paragraphs: [
          "A large share of Indian e-commerce traffic is mobile-only. Checkout forms built for desktop look cramped on a 360px viewport, and pinch-zooming to tap a button is a conversion killer. Test the full flow — product to payment — at 360px width, with thumb-sized tap targets and no horizontal scrolling.",
        ],
      },
      {
        heading: "4. Show trust and security signals at the point of payment",
        paragraphs: [
          "Shoppers abandon checkout when they aren't sure a store is legitimate. Display the payment methods you accept, a visible '100% secure payments' indicator, and a clear refund or COD policy near the pay button. For new or small brands, COD availability is itself a trust signal that measurably improves conversion.",
        ],
      },
      {
        heading: "5. Save progress and support WhatsApp follow-up",
        paragraphs: [
          "Not every shopper completes checkout in one session. Save the cart and address so a returning visitor resumes where they left off, and send an abandoned-cart reminder — WhatsApp works exceptionally well in India, where it's the most-used messaging app. A single reminder message with a checkout link can recover a meaningful share of abandoned carts.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the average cart abandonment rate?",
        a: "Industry studies place cart abandonment at roughly 70% of online shopping carts. Most of that loss occurs during checkout, which is why checkout optimization has one of the highest returns on effort in e-commerce.",
      },
      {
        q: "Why does UPI increase checkout conversion in India?",
        a: "UPI is the default payment method for most Indian shoppers. Native UPI checkout removes the need for card details, OTPs, and wallet redirects, letting customers confirm payment in one tap — which directly reduces friction-driven abandonment.",
      },
      {
        q: "How much can checkout optimization improve conversion?",
        a: "Tactical checkout improvements — fewer fields, faster payment options, mobile-first layout — have been shown to reduce cart abandonment by up to 30%, with most of the gain coming from the largest friction points.",
      },
    ],
  },
  {
    slug: "custom-domains-cloudflare-guide",
    title: "Setting Up Custom Domains on Cloudflare: A Complete Guide",
    date: "2026-05-12",
    displayDate: "May 12, 2026",
    updatedDate: "2026-08-10",
    readTime: "6 min read",
    category: "Guides",
    excerpt:
      "Connecting a custom domain to your store takes about two minutes: create a CNAME record pointing your domain to your storefront host, wait for propagation, then verify SSL. Once the DNS record resolves, Cloudflare provisions a free SSL certificate automatically, and caching rules can be tuned per path for faster page loads.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80",
    author: {
      name: "Basecart Engineering",
      role: "Platform Team, Basecart",
    },
    sections: [
      {
        paragraphs: [
          "A custom domain (yourbrand.com) is one of the first upgrades serious sellers make — it signals a real brand instead of a subdomain, and it's what customers remember. This guide covers the DNS mechanics, SSL, and caching configuration that make the switch fast and safe.",
        ],
      },
      {
        heading: "Step 1: Point your domain with a CNAME record",
        paragraphs: [
          "At your domain registrar (GoDaddy, Namecheap, Cloudflare, or any provider), create a CNAME record that points your domain to your storefront host. The exact target depends on your platform — Basecart provides a per-store target like yourstore.basecart.store that handles the routing.",
          "The host field is typically @ or your subdomain (www), and the target is the canonical storefront address. DNS propagation usually completes within minutes to a couple of hours.",
        ],
        list: [
          "Registrar: your domain provider's DNS panel",
          "Record type: CNAME",
          "Host: @ (apex) or www",
          "Target: your store's canonical hostname",
        ],
      },
      {
        heading: "Step 2: Let SSL provisioning happen automatically",
        paragraphs: [
          "Once the CNAME resolves, Cloudflare automatically issues and provisions a free SSL certificate for your domain. There's no certificate purchase and no manual installation. If you see a 'pending' SSL state, it simply means propagation is still finishing — it usually clears within an hour.",
          "After SSL is active, enforce HTTPS so all traffic upgrades to the secure version. This also ensures payment pages and customer data are always encrypted in transit.",
        ],
      },
      {
        heading: "Step 3: Tune caching for speed",
        paragraphs: [
          "Cloudflare sits in front of your store and can cache static assets — images, CSS, JavaScript, and product catalog data — at its edge. Cache static paths aggressively (long TTL) and keep dynamic paths like checkout uncached so order state is always fresh.",
          "Image transformations (resizing, WebP/AVIF conversion) run at the edge too, so the browser downloads only the size it needs. This is the single biggest page-speed lever for image-heavy catalogs.",
        ],
      },
      {
        heading: "Troubleshooting common issues",
        paragraphs: [
          "If the domain doesn't resolve: confirm the CNAME target is exact (trailing dots or extra spaces break records) and that propagation has finished. If you see a certificate warning: the SSL cert is still provisioning — wait and reload. If a page looks unstyled: purge the edge cache once after DNS switchover to drop any stale cached HTML.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does a custom domain take to connect?",
        a: "About two minutes of setup plus DNS propagation, which typically completes within minutes to a few hours. SSL is provisioned automatically by Cloudflare once the CNAME record resolves.",
      },
      {
        q: "Do I need to buy an SSL certificate for my custom domain?",
        a: "No. Cloudflare provisions a free SSL certificate automatically for domains connected through its network. There is no certificate to purchase or install.",
      },
      {
        q: "What DNS record do I need for my store domain?",
        a: "A CNAME record pointing your domain (for example, yourbrand.com) to your storefront host (for example, yourstore.basecart.store). Subdomain and apex configurations differ slightly, but the CNAME target is the same.",
      },
    ],
  },
];

export const CATEGORIES = ["All", "Engineering", "E-commerce", "Guides", "Product"] as const;

export type PostCategory = (typeof CATEGORIES)[number];

export interface BlogPostSummary {
  slug: string;
  title: string;
  displayDate: string;
  readTime: string;
  category: PostCategory;
  excerpt: string;
  image: string;
}

/** Card-level fields only — keeps the /blog index client bundle lean. */
export function getPostSummaries(category: string): BlogPostSummary[] {
  const filtered = category === "All" ? POSTS : POSTS.filter((p) => p.category === category);
  return filtered.map(({ slug, title, displayDate, readTime, category: c, excerpt, image }) => ({
    slug,
    title,
    displayDate,
    readTime,
    category: c,
    excerpt,
    image,
  }));
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
