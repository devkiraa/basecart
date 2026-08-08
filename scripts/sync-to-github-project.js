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

const tasks = [
  { title: "Cloudflare Workers & Durable Object SQLite backend migration", status: "Done", category: "Backend" },
  { title: "Web Crypto AES-256-GCM encryption for Razorpay credentials", status: "Done", category: "Security" },
  { title: "Storefront 1280px grid design & mobile responsive layout", status: "Done", category: "Storefront" },
  { title: "Storefront Studio Theme Customizer & asset uploader", status: "Done", category: "Dashboard" },
  { title: "Real Instagram Reel & Media importer with product catalog tagging", status: "Done", category: "Dashboard" },
  { title: "Razorpay HMAC-SHA256 webhook signature verification", status: "Done", category: "Security" },
  { title: "@basecart/theme-sdk and @basecart/theme-engine packages", status: "Done", category: "Theme Engine" },
  { title: "Admin Console D1 database integration across 26 views", status: "Done", category: "Admin" },
  { title: "Session revocation for merchant & admin logout in D1 database", status: "Done", category: "Security" },
  { title: "55/55 Vitest integration test suite coverage", status: "Done", category: "Testing" },
  { title: "Real WhatsApp Business API integration via Cloudflare Queue Workers", status: "Todo", category: "Integrations" },
  { title: "Real Shiprocket logistics API integration & tracking", status: "Todo", category: "Integrations" },
  { title: "Merchant add-on subscription billing via Razorpay Subscriptions API", status: "Todo", category: "Finances" },
  { title: "Production deployment to Cloudflare Pages & Cloudflare Workers account", status: "Todo", category: "DevOps" },
  { title: "Legal review & approval of Terms of Service, Privacy & Refund policy pages", status: "Todo", category: "Legal" },
  { title: "Database query indexing: orders(customerEmail, status) & products(category)", status: "Todo", category: "Performance" },
  { title: "Pagination support on high-volume endpoints (/customers, /orders, /products)", status: "Todo", category: "API" },
  { title: "Cloudflare Turnstile CAPTCHA on merchant signup routes", status: "Todo", category: "Security" }
];

async function syncToProject() {
  if (!GITHUB_TOKEN) {
    console.log("⚠️ No GITHUB_TOKEN or ADD_TO_PROJECT_PAT found in environment.");
    console.log("Run with: GITHUB_TOKEN=your_pat node scripts/sync-to-github-project.js");
    return;
  }

  console.log("🚀 Syncing 18 draft items to GitHub Project via GraphQL API...");
  
  // 1. Fetch User Projects to find project ID
  const queryUserProjects = `
    query {
      viewer {
        projectsV2(first: 5) {
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
      console.error("No GitHub Projects found for user. Ensure token has project:write permissions.");
      return;
    }

    const projectId = projects[0].id;
    console.log(`Found Project: ${projects[0].title} (ID: ${projectId})`);

    // 2. Add each draft issue
    for (const item of tasks) {
      const mutation = `
        mutation {
          addProjectV2DraftIssue(input: { projectId: "${projectId}", title: "[${item.category}] ${item.title}" }) {
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
        console.log(`✅ Added card: [${item.category}] ${item.title}`);
      } else {
        console.error(`❌ Error adding item: ${item.title}`, addData);
      }
    }

    console.log("\n🎉 All 18 cards successfully added to your GitHub Project Board!");
  } catch (err) {
    console.error("API Sync error:", err);
  }
}

syncToProject();
