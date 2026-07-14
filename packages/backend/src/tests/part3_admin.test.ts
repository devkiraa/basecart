declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 3: SaaS Super Admin Routes", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let adminToken = "";
  let merchantToken = "";
  let merchantTenantId = "";

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);

    // Create a mock merchant tenant so we have someone to audit/manage
    const subdomain = `admin-merchant-${Math.floor(Math.random() * 1000000)}`;
    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "merchant-admin-test@owner.com",
          password: "securepassword123",
          storeName: "Admin Test Store",
          subdomain,
        }),
      },
      env
    );

    const body = (await signupRes.json()) as any;
    merchantTenantId = body.tenantId;
    merchantToken = body.accessToken;
  });

  it("should successfully signup the initial bootstrap admin account", async () => {
    const signupRes = await app.request(
      "/admin/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "superadmin@basecart.com",
          password: "adminsecurepassword123",
        }),
      },
      env
    );

    expect(signupRes.status).toBe(201);
    const body = (await signupRes.json()) as any;
    expect(body.email).toBe("superadmin@basecart.com");
    expect(body.role).toBe("admin");
    expect(body.accessToken).toBeDefined();

    adminToken = body.accessToken;

    // Subsequent signups should be blocked (only 1 admin allowed to bootstrap)
    const secondSignupRes = await app.request(
      "/admin/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "secondadmin@basecart.com",
          password: "adminsecurepassword123",
        }),
      },
      env
    );
    expect(secondSignupRes.status).toBe(403);
  });

  it("should reject non-admin merchant token access on all /admin/* endpoints", async () => {
    const listRes = await app.request(
      "/admin/merchants",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(listRes.status).toBe(403);
    const body = (await listRes.json()) as any;
    expect(body.error).toBe("Forbidden: Admin access required");

    const meRes = await app.request(
      "/admin/auth/me",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${merchantToken}` },
      },
      env
    );

    expect(meRes.status).toBe(403);
  });

  it("should allow admin login and profile check", async () => {
    const loginRes = await app.request(
      "/admin/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "superadmin@basecart.com",
          password: "adminsecurepassword123",
        }),
      },
      env
    );

    expect(loginRes.status).toBe(200);
    const loginBody = (await loginRes.json()) as any;
    expect(loginBody.role).toBe("admin");

    const meRes = await app.request(
      "/admin/auth/me",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(meRes.status).toBe(200);
    const meBody = (await meRes.json()) as any;
    expect(meBody.email).toBe("superadmin@basecart.com");
  });

  it("should list all merchants and perform merchant details drill-down", async () => {
    const listRes = await app.request(
      "/admin/merchants",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as any[];
    expect(list.some(m => m.tenantId === merchantTenantId)).toBe(true);

    const detailsRes = await app.request(
      `/admin/merchants/${merchantTenantId}/details`,
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(detailsRes.status).toBe(200);
    const details = (await detailsRes.json()) as any;
    expect(details.store.storeName).toBe("Admin Test Store");
    expect(details.products).toBeDefined();
    expect(details.orders).toBeDefined();
  });

  it("should update merchant status and plan and write to audit logs", async () => {
    // 1. Suspend merchant store
    const statusRes = await app.request(
      `/admin/merchants/${merchantTenantId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "suspended" }),
      },
      env
    );

    expect(statusRes.status).toBe(200);

    // 2. Change plan to pro
    const planRes = await app.request(
      `/admin/merchants/${merchantTenantId}/plan`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ plan: "pro" }),
      },
      env
    );

    expect(planRes.status).toBe(200);

    // 3. Verify audit logs
    const auditRes = await app.request(
      "/admin/audit-logs",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(auditRes.status).toBe(200);
    const logs = (await auditRes.json()) as any[];
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.some(l => l.action === "suspend_store")).toBe(true);
    expect(logs.some(l => l.action === "change_plan")).toBe(true);
  });

  it("should calculate platform metrics correctly", async () => {
    const metricsRes = await app.request(
      "/admin/metrics",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(metricsRes.status).toBe(200);
    const metrics = (await metricsRes.json()) as any;
    expect(metrics.totalMerchants).toBeGreaterThanOrEqual(1);
    expect(metrics.estimatedMRR).toBeDefined();
    expect(metrics.totalGMV).toBeDefined();
  });

  it("should list all super administrators for auth admins", async () => {
    const listRes = await app.request(
      "/admin/admins",
      {
        method: "GET",
        headers: { "Authorization": `Bearer ${adminToken}` },
      },
      env
    );

    expect(listRes.status).toBe(200);
    const list = (await listRes.json()) as any[];
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some(a => a.email === "superadmin@basecart.com")).toBe(true);
  });
});
