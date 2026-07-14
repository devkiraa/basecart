const BACKEND_URL = "http://localhost:3001";

async function run() {
  console.log("🚀 Starting Frontend-to-Backend Protocol Integration Verification...");
  
  const rand = Math.floor(Math.random() * 1000000);
  const merchantEmail = `owner-${rand}@verif.com`;
  const subdomain = `store-${rand}`;
  let merchantToken = "";
  let tenantId = "";

  // ==========================================
  // PART 1: MERCHANT DASHBOARD FLOW
  // ==========================================
  console.log("\n--- Testing Merchant Dashboard Flow ---");

  // 1. Signup Merchant
  console.log("1. Signing up merchant owner...");
  const signupRes = await fetch(`${BACKEND_URL}/auth/merchant/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: merchantEmail,
      password: "securepassword123",
      storeName: "Edge Active Wear",
      subdomain,
    }),
  });

  if (signupRes.status !== 201) {
    throw new Error(`Merchant signup failed: ${signupRes.status} ${await signupRes.text()}`);
  }
  const signupBody = (await signupRes.json()) as any;
  merchantToken = signupBody.accessToken;
  tenantId = signupBody.tenantId;
  console.log(`✅ Signup successful! Tenant ID: ${tenantId}`);

  // 2. Login Merchant
  console.log("2. Logging in merchant owner...");
  const loginRes = await fetch(`${BACKEND_URL}/auth/merchant/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: merchantEmail,
      password: "securepassword123",
    }),
  });
  if (loginRes.status !== 200) {
    throw new Error(`Merchant login failed: ${loginRes.status}`);
  }
  console.log("✅ Login successful!");

  // 3. Get Store Settings
  console.log("3. Getting store settings...");
  const settingsRes = await fetch(`${BACKEND_URL}/store/settings`, {
    headers: { "Authorization": `Bearer ${merchantToken}` },
  });
  if (settingsRes.status !== 200) {
    throw new Error("Failed to fetch store settings");
  }
  const settings = (await settingsRes.json()) as any;
  console.log(`✅ Settings loaded. Store name: ${settings.storeName}`);

  // 4. Create Product
  console.log("4. Creating new product...");
  const prodRes = await fetch(`${BACKEND_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${merchantToken}`,
    },
    body: JSON.stringify({
      name: "Speed Runner Pro",
      price: 320.0,
      stockQuantity: 25,
      category: "Clothing",
      status: "active",
      images: [],
    }),
  });
  if (prodRes.status !== 201) {
    throw new Error(`Product creation failed: ${await prodRes.text()}`);
  }
  const product = (await prodRes.json()) as any;
  console.log(`✅ Product created! Product ID: ${product.productId}`);

  // 5. Fetch Products List
  console.log("5. Fetching product catalog...");
  const prodListRes = await fetch(`${BACKEND_URL}/products`, {
    headers: { "Authorization": `Bearer ${merchantToken}` },
  });
  const products = (await prodListRes.json()) as any[];
  if (!products.some(p => p.productId === product.productId)) {
    throw new Error("Created product not found in list");
  }
  console.log(`✅ Product verified in catalog! Total products: ${products.length}`);

  // ==========================================
  // PART 2: ADMIN INITIALIZATION & PLAN UPGRADE
  // ==========================================
  console.log("\n--- Bootstrapping SaaS Super Admin & Upgrading Plan ---");

  // 1. Bootstrap Admin Signup
  console.log("1. Signing up superadmin account...");
  const adminEmail = "superadmin@basecart.io";
  const adminPassword = "adminpassword";
  const adminSignupRes = await fetch(`${BACKEND_URL}/admin/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });
  if (adminSignupRes.status !== 201) {
    console.log("⚠️ Admin signup returned non-201 (already bootstrapped). Trying login...");
  } else {
    console.log("✅ Initial admin signup successful!");
  }

  // 2. Admin Login
  console.log("2. Logging in as admin...");
  const adminLoginRes = await fetch(`${BACKEND_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  });
  if (adminLoginRes.status !== 200) {
    throw new Error(`Admin login failed: ${adminLoginRes.status}`);
  }
  const adminLogin = (await adminLoginRes.json()) as any;
  const adminToken = adminLogin.accessToken;
  console.log("✅ Admin login successful!");

  // 3. Upgrade Merchant Subdomain to Growth
  console.log(`3. Upgrading plan to growth for merchant ${tenantId}...`);
  const planRes = await fetch(`${BACKEND_URL}/admin/merchants/${tenantId}/plan`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ plan: "growth" }),
  });
  if (planRes.status !== 200) {
    throw new Error(`Failed to update store plan: ${await planRes.text()}`);
  }
  console.log("✅ Store plan upgraded to growth successfully!");

  // ==========================================
  // PART 3: STOREFRONT FLOW
  // ==========================================
  console.log("\n--- Testing Storefront Flow ---");

  // 1. Get Store Info
  console.log(`1. Fetching store info for subdomain '${subdomain}'...`);
  const infoRes = await fetch(`${BACKEND_URL}/store/${subdomain}/info`);
  if (infoRes.status !== 200) {
    throw new Error(`Storefront info loading failed: ${await infoRes.text()}`);
  }
  const storeInfo = (await infoRes.json()) as any;
  console.log(`✅ Storefront info: ${storeInfo.storeName} (${storeInfo.plan} plan)`);
  if (storeInfo.plan !== "growth") {
    throw new Error(`Expected storefront plan to be 'growth', got '${storeInfo.plan}'`);
  }

  // 2. Fetch Storefront Products
  console.log("2. Fetching public storefront products...");
  const storeProdRes = await fetch(`${BACKEND_URL}/store/${subdomain}/products`);
  const storeProds = (await storeProdRes.json()) as any[];
  console.log(`✅ Public products count: ${storeProds.length}`);
  if (storeProds.length === 0) {
    throw new Error("Storefront products list should not be empty");
  }

  // 3. Customer Signup (Should succeed since plan is upgraded)
  console.log("3. Signing up store customer...");
  const custEmail = `customer-${rand}@gmail.com`;
  const custSignupRes = await fetch(`${BACKEND_URL}/auth/customer/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-subdomain": subdomain,
    },
    body: JSON.stringify({
      email: custEmail,
      password: "customersecure123",
      name: "Customer Verification",
    }),
  });
  if (custSignupRes.status !== 201) {
    throw new Error(`Customer signup failed: ${await custSignupRes.text()}`);
  }
  const custSignup = (await custSignupRes.json()) as any;
  const customerToken = custSignup.accessToken;
  console.log("✅ Customer signup successful!");

  // 4. Customer Login
  console.log("4. Logging in customer...");
  const custLoginRes = await fetch(`${BACKEND_URL}/auth/customer/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-subdomain": subdomain,
    },
    body: JSON.stringify({
      email: custEmail,
      password: "customersecure123",
    }),
  });
  if (custLoginRes.status !== 200) {
    throw new Error(`Customer login failed: ${custLoginRes.status}`);
  }
  console.log("✅ Customer login successful!");

  // ==========================================
  // PART 4: ADMIN VERIFICATION & METRICS
  // ==========================================
  console.log("\n--- Final Admin Registry Checks ---");

  // 1. Fetch Merchant Details (dynamic D1 connection)
  console.log(`1. Fetching details for merchant ${tenantId}...`);
  const detailsRes = await fetch(`${BACKEND_URL}/admin/merchants/${tenantId}/details`, {
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  if (detailsRes.status !== 200) {
    throw new Error(`Failed to load merchant details: ${await detailsRes.text()}`);
  }
  const details = (await detailsRes.json()) as any;
  console.log(`✅ Details loaded. Products count inside isolated tenant DO: ${details.products.length}`);

  // 2. Verify Audit Logs & Platform Metrics
  console.log("2. Checking admin audit logs...");
  const logsRes = await fetch(`${BACKEND_URL}/admin/audit-logs`, {
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  const logs = (await logsRes.json()) as any[];
  console.log(`✅ Audit logs count: ${logs.length}`);
  if (!logs.some(l => l.action === "change_plan")) {
    throw new Error("Plan update audit log action not found");
  }

  console.log("3. Fetching admins registry list...");
  const adminsRes = await fetch(`${BACKEND_URL}/admin/admins`, {
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  if (adminsRes.status !== 200) {
    throw new Error("Failed to load super admins list");
  }
  const admins = (await adminsRes.json()) as any[];
  console.log(`✅ Admins list loaded! Count: ${admins.length}`);
  if (!admins.some(a => a.email === adminEmail)) {
    throw new Error("Bootstrapped admin email not found in admins list");
  }

  console.log("4. Checking platform metrics...");
  const metricsRes = await fetch(`${BACKEND_URL}/admin/metrics`, {
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  const metrics = (await metricsRes.json()) as any;
  console.log(`✅ Platform Metrics loaded: Merchants=${metrics.totalMerchants}, Est MRR=₹${metrics.estimatedMRR}, Total GMV=₹${metrics.totalGMV}`);

  console.log("\n🎉 ALL FRONTEND-TO-BACKEND FLOW VERIFICATIONS PASSED SUCCESSFULLY!");
}

run().catch(err => {
  console.error("\n❌ Verification Failed with Error:", err);
  process.exit(1);
});
