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
const ADMIN_TOKEN = process.argv[3];

if (!ADMIN_TOKEN) {
  console.log("Usage: node scripts/migrate-do-data.js <API_URL> <ADMIN_TOKEN>");
  process.exit(1);
}

async function runMigration() {
  console.log(`Connecting to Basecart API at ${API_URL}...`);
  
  // 1. Fetch Merchants
  const res = await fetch(`${API_URL}/admin/merchants`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
  });

  if (!res.ok) {
    console.error("Failed to fetch merchants:", await res.text());
    process.exit(1);
  }

  const merchants = await res.json();
  console.log(`Found ${merchants.length} merchant stores to process.`);

  // 2. Process store data
  for (const store of merchants) {
    console.log(`Processing Store: ${store.storeName} (${store.tenantId})...`);
    
    // Read store details
    const detailRes = await fetch(`${API_URL}/admin/merchants/${store.tenantId}/details`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });

    if (detailRes.ok) {
      const details = await detailRes.json();
      console.log(`  -> Store fetched successfully. Products: ${details.products?.length || 0}, Orders: ${details.orders?.length || 0}`);
    }
  }

  console.log("Store audit & migration check complete.");
}

runMigration().catch(err => console.error("Migration Error:", err));
