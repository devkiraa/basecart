declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 3: Auth Routes (Merchant & Customer)", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);
  });

  it("should successfully signup and login a merchant owner", async () => {
    const signupPayload = {
      email: "owner@mystore.com",
      password: "securepassword123",
      storeName: "My Store",
      subdomain: "mystore-a",
    };

    // 1. Merchant Signup
    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      },
      env
    );

    expect(signupRes.status).toBe(201);
    const signupBody = (await signupRes.json()) as any;
    expect(signupBody.tenantId).toBeDefined();
    expect(signupBody.accessToken).toBeDefined();
    expect(signupBody.refreshToken).toBeDefined();

    // Verify cookies are set
    const cookies = signupRes.headers.get("set-cookie");
    expect(cookies).toContain("basecart_merchant_token");
    expect(cookies).toContain("basecart_merchant_refresh_token");

    // 2. Merchant Login
    const loginPayload = {
      email: "owner@mystore.com",
      password: "securepassword123",
    };

    const loginRes = await app.request(
      "/auth/merchant/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      },
      env
    );

    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.tenantId).toBe(signupBody.tenantId);
    expect(loginBody.accessToken).toBeDefined();
  });

  it("should enforce plan tier limits on customer signup", async () => {
    const customerPayload = {
      email: "customer@gmail.com",
      password: "customerpass123",
      name: "Alice Customer",
    };

    // By default, signup sets plan to 'starter'. Customer accounts should fail on starter plan
    const signupRes = await app.request(
      "/auth/customer/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": "mystore-a",
        },
        body: JSON.stringify(customerPayload),
      },
      env
    );

    expect(signupRes.status).toBe(403);
    const body = (await signupRes.json()) as any;
    expect(body.error).toContain("Feature locked: Customer accounts require the Growth or Pro tier");
  });

  it("should successfully signup and login a customer when plan is upgraded", async () => {
    // 1. Upgrade tenant plan to 'growth' in control DB
    await controlDb
      .prepare("UPDATE tenants SET plan = 'growth' WHERE subdomain = ?")
      .bind("mystore-a")
      .run();

    const customerPayload = {
      email: "customer@gmail.com",
      password: "customerpass123",
      name: "Alice Customer",
    };

    // 2. Customer Signup (scoped to mystore-a)
    const signupRes = await app.request(
      "/auth/customer/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": "mystore-a",
        },
        body: JSON.stringify(customerPayload),
      },
      env
    );

    expect(signupRes.status).toBe(201);
    const signupBody = (await signupRes.json()) as any;
    expect(signupBody.customerId).toBeDefined();
    expect(signupBody.accessToken).toBeDefined();

    // 3. Customer Login
    const loginPayload = {
      email: "customer@gmail.com",
      password: "customerpass123",
    };

    const loginRes = await app.request(
      "/auth/customer/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subdomain": "mystore-a",
        },
        body: JSON.stringify(loginPayload),
      },
      env
    );

    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.customerId).toBe(signupBody.customerId);
  });


  it("should have email auto-verified immediately after merchant signup", async () => {
    // Email is auto-verified at signup — no OTP or verification_tokens row is needed
    const userRecord = await controlDb
      .prepare("SELECT emailVerified FROM merchant_users WHERE email = ?")
      .bind("owner@mystore.com")
      .first<{ emailVerified: number }>();

    expect(userRecord).not.toBeNull();
    expect(userRecord?.emailVerified).toBe(1);

    // No verification_tokens row should exist for this email (OTP flow removed)
    const tokenRecord = await controlDb
      .prepare("SELECT token FROM verification_tokens WHERE email = ?")
      .bind("owner@mystore.com")
      .first<{ token: string }>();

    expect(tokenRecord).toBeNull();
  });
});

