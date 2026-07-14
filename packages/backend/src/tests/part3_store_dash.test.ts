declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 3: Store settings, Themes & Dashboard summary Routes", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let merchantToken = "";
  let tenantId = "";
  let subdomain = "";

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);

    // Randomize subdomain to prevent test environment pollution
    const rand = Math.floor(Math.random() * 1000000);
    subdomain = `mystore-sd-${rand}`;

    const signupPayload = {
      email: `owner-${rand}@store-dash.com`,
      password: "securepassword123",
      storeName: "Store Dash Test Store",
      subdomain,
    };

    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      },
      env
    );

    const body = (await signupRes.json()) as any;
    merchantToken = body.accessToken;
    tenantId = body.tenantId;

    // Upgrade store to growth plan
    await controlDb
      .prepare("UPDATE tenants SET plan = 'growth' WHERE tenantId = ?")
      .bind(tenantId)
      .run();
  });

  it("should fetch public store info (Storefront Read Path - Future-Cacheable)", async () => {
    const infoRes = await app.request(
      `/store/${subdomain}/info`,
      { method: "GET" },
      env
    );

    expect(infoRes.status).toBe(200);
    const body = (await infoRes.json()) as any;
    expect(body.storeName).toBe("Store Dash Test Store");
    expect(body.subdomain).toBe(subdomain);
    expect(body.theme).toBeDefined();
  });

  it("should update and fetch store settings as a merchant", async () => {
    const getRes = await app.request(
      "/store/settings",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(getRes.status).toBe(200);
    const getBody = (await getRes.json()) as any;
    expect(getBody.plan).toBe("growth");

    const patchPayload = {
      storeName: "Store Dash Test Store Updated",
      gstin: "12AAAAA1111A1Z1",
      branding: {
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#FF5733",
        accentColor: "#C70039",
      },
    };

    const patchRes = await app.request(
      "/store/settings",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${merchantToken}`,
        },
        body: JSON.stringify(patchPayload),
      },
      env
    );

    expect(patchRes.status).toBe(200);
  });

  it("should manage merchant storefront themes library", async () => {
    // 1. Fetch themes list
    const listRes = await app.request(
      "/store/themes",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(listRes.status).toBe(200);
    const themes = (await listRes.json()) as any[];
    expect(themes.length).toBe(1);
    expect(themes[0].status).toBe("published"); // Horizon defaults should be seeded

    // 2. Create draft theme
    const createRes = await app.request(
      "/store/themes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${merchantToken}`,
        },
        body: JSON.stringify({
          name: "Vibrant Summer",
          templateBase: "Aura",
          colors: { primary: "#FFC300", accent: "#FF5733" },
        }),
      },
      env
    );

    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as any;
    expect(created.themeId).toBeDefined();
    expect(created.status).toBe("draft");

    // 3. Publish theme
    const publishRes = await app.request(
      `/store/themes/${created.themeId}/publish`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(publishRes.status).toBe(200);
    const published = (await publishRes.json()) as any;
    expect(published.status).toBe("published");
  });

  it("should fetch dashboard summary metrics", async () => {
    const dashRes = await app.request(
      "/dashboard/summary",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(dashRes.status).toBe(200);
    const dash = (await dashRes.json()) as any;
    expect(dash.totalRevenue).toBe(0);
    expect(dash.totalOrders).toBe(0);
    expect(dash.last7Days.length).toBe(7);
  });
});
