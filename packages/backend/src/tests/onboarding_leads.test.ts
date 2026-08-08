import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";
import controlSchema from "../lib/control_schema.sql?raw";

describe("Onboarding Leads & Abandoned Recovery Tests", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  beforeAll(async () => {
    await migrateDatabase(controlDb, controlSchema);
  });

  it("should save progress on Step 1 (draft lead)", async () => {
    const res = await app.request(
      "/auth/merchant/save-progress",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "abandoned.merchant@example.com",
          step: 1,
          payload: { email: "abandoned.merchant@example.com", password: "SecretPassword123!" },
        }),
      },
      env
    );

    expect(res.status).toBe(200);
    const json = await res.json<any>();
    expect(json.success).toBe(true);

    // Verify record in DB
    const lead = await controlDb
      .prepare("SELECT * FROM onboarding_leads WHERE email = ?")
      .bind("abandoned.merchant@example.com")
      .first<any>();

    expect(lead).not.toBeNull();
    expect(lead?.email).toBe("abandoned.merchant@example.com");
    expect(lead?.step).toBe(1);
    expect(lead?.status).toBe("draft");
  });

  it("should update progress on Step 2 with store name and subdomain", async () => {
    const res = await app.request(
      "/auth/merchant/save-progress",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "abandoned.merchant@example.com",
          step: 2,
          storeName: "Kochi Handlooms",
          subdomain: "kochi-handlooms",
          payload: {
            email: "abandoned.merchant@example.com",
            storeName: "Kochi Handlooms",
            subdomain: "kochi-handlooms",
          },
        }),
      },
      env
    );

    expect(res.status).toBe(200);

    const lead = await controlDb
      .prepare("SELECT * FROM onboarding_leads WHERE email = ?")
      .bind("abandoned.merchant@example.com")
      .first<any>();

    expect(lead?.step).toBe(2);
    expect(lead?.storeName).toBe("Kochi Handlooms");
    expect(lead?.subdomain).toBe("kochi-handlooms");
  });

  it("should mark lead as completed upon full signup", async () => {
    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "abandoned.merchant@example.com",
          password: "SecurePassword123!",
          storeName: "Kochi Handlooms",
          subdomain: "kochi-handlooms-store",
        }),
      },
      env
    );

    expect(signupRes.status).toBe(201);

    const lead = await controlDb
      .prepare("SELECT * FROM onboarding_leads WHERE email = ?")
      .bind("abandoned.merchant@example.com")
      .first<any>();

    expect(lead?.status).toBe("completed");
  });
});
