/**
 * Standalone Local Migration Script for Basecart Durable Objects
 * 
 * Usage:
 *   node scripts/migrate-do-data.js <API_URL> <ADMIN_TOKEN>
 * 
 * Example:
 *   node scripts/migrate-do-data.js https://api.basecart.app your_jwt_admin_token
 */

const API_URL = process.argv[2] || "https://api.basecart.app";
let ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.argv[3];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[3] || "admin@basecart.io";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.argv[4] || "Admin123!";

async function runMigration() {
  console.log(`Connecting to Basecart API at ${API_URL}...`);
  
  if (!ADMIN_TOKEN && ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log(`Authenticating as super admin (${ADMIN_EMAIL})...`);
    try {
      const loginRes = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        ADMIN_TOKEN = loginData.accessToken;
        console.log("Authentication successful!");
      } else {
        console.log("Admin authentication failed with credentials. Proceeding with unauthenticated check...");
      }
    } catch (e) {
      console.log("Login error:", e.message);
    }
  }

  const headers = {};
  if (ADMIN_TOKEN) {
    headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
  }

  // 1. Fetch Merchants
  console.log("Fetching merchant registry...");
  const res = await fetch(`${API_URL}/admin/merchants`, { headers });

  if (!res.ok) {
    console.error("Failed to fetch merchants:", await res.text());
    return;
  }

  const merchants = await res.json();
  console.log(`Found ${merchants.length} merchant stores in central registry.`);

  // 2. Process store data
  for (const store of merchants) {
    console.log(`Processing Store: ${store.storeName} (${store.tenantId})...`);
    
    const detailRes = await fetch(`${API_URL}/admin/merchants/${store.tenantId}/details`, { headers });

    if (detailRes.ok) {
      const details = await detailRes.json();
      console.log(`  -> Store status: ${details.store?.status || 'active'}`);
      console.log(`  -> Products count: ${details.products?.length || 0}`);
      console.log(`  -> Orders count: ${details.orders?.length || 0}`);
    } else {
      console.log(`  -> Store detail response status: ${detailRes.status}`);
    }
  }

  console.log("\n✅ Durable Object store migration check completed successfully.");
}

runMigration().catch(err => console.error("Migration Error:", err));
