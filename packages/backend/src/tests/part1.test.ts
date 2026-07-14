declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { migrateDatabase } from "../lib/db";

// Use Vite raw loader to load SQL files as raw text strings at build time
import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 1: Hono Routing Skeleton & D1 integration", () => {
  const app = buildApp();

  beforeAll(async () => {
    // Run migrations on CONTROL_DB
    await migrateDatabase(env.CONTROL_DB, controlSchema);
  });

  it("should respond to GET /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("healthy");
  });

  it("should respond to GET /test-db using in-memory control D1 database", async () => {
    // Pass env bindings down to Hono request
    const res = await app.request("/test-db", {}, env);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe("connected");
    expect(body.database_time).toBeDefined();
  });
});
