import fs from 'fs';
import path from 'path';

// Automatically parse root .env file if available
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
} catch (e) {}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.ADD_TO_PROJECT_PAT;

// Comprehensive markdown task registry from all .md files in the repository
const tasks = [
  // --- PRODUCTION COMPLETED MILESTONES ---
  { title: "Cloudflare Workers & Durable Object SQLite backend migration", status: "Done", category: "Architecture" },
  { title: "Web Crypto AES-256-GCM encryption for Razorpay credentials", status: "Done", category: "Security" },
  { title: "Storefront 1280px grid design & mobile responsive layout", status: "Done", category: "Storefront" },
  { title: "Storefront Studio Theme Customizer & non-product asset uploader", status: "Done", category: "Dashboard" },
  { title: "Real Instagram Reel & Media importer with product catalog tagging", status: "Done", category: "Dashboard" },
  { title: "Razorpay HMAC-SHA256 webhook signature verification", status: "Done", category: "Security" },
  { title: "@basecart/theme-sdk and @basecart/theme-engine packages", status: "Done", category: "Theme Engine" },
  { title: "Admin Console D1 database integration across 26 views", status: "Done", category: "Admin" },
  { title: "Session revocation for merchant & admin logout in D1 database", status: "Done", category: "Security" },
  { title: "55/55 Vitest integration test suite coverage", status: "Done", category: "Testing" },
  { title: "CSRF double-submit cookie protection for sensitive admin routes", status: "Done", category: "Security" },
  { title: "Store settings Razorpay secret key redaction in API responses", status: "Done", category: "Security" },
  { title: "Security headers (X-Frame-Options, CSP, Referrer-Policy) across apps", status: "Done", category: "Security" },

  // --- ROADMAP & FUTURE ENHANCEMENTS ---
  { title: "Real WhatsApp Business API integration via Cloudflare Queue Workers", status: "Todo", category: "Integrations" },
  { title: "Real Shiprocket logistics API integration & shipment tracking", status: "Todo", category: "Integrations" },
  { title: "Merchant add-on subscription billing via Razorpay Subscriptions API", status: "Todo", category: "Finances" },
  { title: "Production deployment to Cloudflare Pages & Cloudflare Workers account", status: "Todo", category: "DevOps" },
  { title: "Legal review & approval of Terms of Service, Privacy & Refund policy pages", status: "Todo", category: "Legal" },
  
  // --- PERFORMANCE & DATABASE OPTIMIZATION (CHECK.md) ---
  { title: "Database query indexing: orders(customerEmail, status) & products(category)", status: "Todo", category: "Performance" },
  { title: "Pagination support on high-volume endpoints (/customers, /orders, /products)", status: "Todo", category: "Performance" },
  { title: "Batch DB operations for bulk customer import & checkout order items", status: "Todo", category: "Performance" },
  { title: "Pre-aggregate Admin Metrics via background job into KV cache", status: "Todo", category: "Performance" },
  { title: "Cache-Control headers and ETag validation on public storefront APIs", status: "Todo", category: "Performance" },

  // --- SECURITY AUDIT & SAFEGUARDS (SECURITY-AUDIT.md) ---
  { title: "Cloudflare Turnstile CAPTCHA on public merchant signup routes", status: "Todo", category: "Security" },
  { title: "Per-email login brute-force rate-limiting and account lockout", status: "Todo", category: "Security" },
  { title: "Request body size limits (Hono bodyLimit) on bulk endpoints", status: "Todo", category: "Security" },
  { title: "EXIF metadata stripping on merchant media upload handler", status: "Todo", category: "Security" }
];

async function syncToProject() {
  if (!GITHUB_TOKEN) {
    console.log("⚠️ No GITHUB_TOKEN or ADD_TO_PROJECT_PAT found in environment.");
    return;
  }

  console.log(`🚀 Syncing ${tasks.length} markdown items to GitHub Project via GraphQL API...`);
  
  // 1. Fetch User Projects to find project ID
  const queryUserProjects = `
    query {
      viewer {
        projectsV2(first: 10) {
          nodes {
            id
            title
            number
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "Basecart-Project-Sync"
      },
      body: JSON.stringify({ query: queryUserProjects })
    });

    const data = await res.json();
    const projects = data?.data?.viewer?.projectsV2?.nodes || [];
    if (projects.length === 0) {
      console.error("No GitHub Projects found for user.");
      return;
    }

    const project = projects.find(p => p.title.toLowerCase().includes("basecart")) || projects[0];
    console.log(`Found Target Project: "${project.title}" (ID: ${project.id})`);

    let addedCount = 0;
    // 2. Add each item as a draft card
    for (const item of tasks) {
      const mutation = `
        mutation {
          addProjectV2DraftIssue(input: { projectId: "${project.id}", title: "[${item.category}] ${item.title}" }) {
            projectItem {
              id
            }
          }
        }
      `;

      const addRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Basecart-Project-Sync"
        },
        body: JSON.stringify({ query: mutation })
      });

      const addData = await addRes.json();
      if (addData?.data?.addProjectV2DraftIssue?.projectItem?.id) {
        addedCount++;
        console.log(`[${addedCount}/${tasks.length}] ✅ Added: [${item.category}] ${item.title}`);
      } else {
        console.error(`❌ Error adding: ${item.title}`, addData);
      }
    }

    console.log(`\n🎉 Success! All ${addedCount} cards from your .md files are now live on your GitHub Project Board!`);
  } catch (err) {
    console.error("API Sync error:", err);
  }
}

syncToProject();
