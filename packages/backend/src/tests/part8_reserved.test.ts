declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";
import { 
  isReservedSubdomain, 
  isPlatformHost,
  SYSTEM_SUBDOMAINS,
  NETWORK_SUBDOMAINS,
  STATIC_SUBDOMAINS,
  AUTH_SUBDOMAINS,
  FUTURE_SUBDOMAINS
} from "@basecart/shared";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 8: Production-Grade Reserved Subdomains & Platform Hosts", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  describe("Shared module: platformRoutes sets and categories", () => {
    it("should export categorized sets containing matching subdomains", () => {
      expect(SYSTEM_SUBDOMAINS).toContain("admin");
      expect(NETWORK_SUBDOMAINS).toContain("smtp");
      expect(STATIC_SUBDOMAINS).toContain("cdn");
      expect(AUTH_SUBDOMAINS).toContain("dashboard");
      expect(FUTURE_SUBDOMAINS).toContain("billing");
    });

    it("should classify platform hostnames correctly", () => {
      expect(isPlatformHost("basecart.app")).toBe(true);
      expect(isPlatformHost("www.basecart.app")).toBe(true);
      expect(isPlatformHost("api.basecart.app")).toBe(true);
      expect(isPlatformHost("merchant.basecart.app")).toBe(true);
      expect(isPlatformHost("admin.basecart.app")).toBe(true);
      expect(isPlatformHost("docs.basecart.app")).toBe(true);
      expect(isPlatformHost("status.basecart.app")).toBe(true);
      expect(isPlatformHost("nike.basecart.app")).toBe(false);
    });
  });

  describe("Normalization & RFC Hostname Checks", () => {
    it("should trim, lowercase, and validate reserved subdomains", () => {
      expect(isReservedSubdomain("  merchant  ")).toBe(true);
      expect(isReservedSubdomain("ADMIN")).toBe(true);
    });

    it("should reject spaces and invalid RFC characters", () => {
      expect(isReservedSubdomain("ni ke")).toBe(true);
      expect(isReservedSubdomain("nike_store")).toBe(true); // contains underscore
    });

    it("should reject Unicode characters", () => {
      expect(isReservedSubdomain("nïke")).toBe(true); // cyrillic / umlaut
      expect(isReservedSubdomain("αdmin")).toBe(true);
    });

    it("should reject invalid dots/duplicate dots", () => {
      expect(isReservedSubdomain("ni..ke")).toBe(true);
      expect(isReservedSubdomain(".nike")).toBe(true);
      expect(isReservedSubdomain("nike.")).toBe(true);
    });

    it("should accept clean valid subdomains", () => {
      expect(isReservedSubdomain("nike")).toBe(false);
      expect(isReservedSubdomain("coffee-hub")).toBe(false);
    });
  });

  describe("API Endpoint: Signup and Check-Subdomain with Abuse Audit Logging", () => {
    it("should reject signup for reserved subdomains, return 409, and write an audit log", async () => {
      warnSpy.mockClear();

      const signupPayload = {
        email: "owner-abuse@mystore.com",
        password: "Securepassword123!",
        storeName: "Admin Store",
        subdomain: "admin",
      };

      const res = await app.request(
        "/auth/merchant/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupPayload),
        },
        env
      );

      expect(res.status).toBe(409);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.code).toBe("RESERVED_SUBDOMAIN");

      // Verify console warning audit log was written
      expect(warnSpy).toHaveBeenCalled();
      const lastLog = warnSpy.mock.calls[0][0];
      expect(lastLog).toContain("RESERVED_SUBDOMAIN_ABUSE");
      expect(lastLog).toContain("admin");
    });

    it("should reject check-subdomain for reserved subdomains, return 409, and write an audit log", async () => {
      warnSpy.mockClear();

      const res = await app.request(
        "/auth/merchant/check-subdomain?subdomain=api",
        { method: "GET" },
        env
      );

      expect(res.status).toBe(409);
      expect(warnSpy).toHaveBeenCalled();
      const lastLog = warnSpy.mock.calls[0][0];
      expect(lastLog).toContain("RESERVED_SUBDOMAIN_ABUSE");
      expect(lastLog).toContain("api");
    });
  });

  describe("Middleware & Routing performance (Early return guards)", () => {
    it("should bypass DB queries entirely for platform hosts and return 404", async () => {
      const wildcardHosts = [
        "merchant.basecart.app",
        "admin.basecart.app",
        "api.basecart.app",
        "docs.basecart.app",
        "status.basecart.app",
      ];

      for (const host of wildcardHosts) {
        // Spy on database prepare to assert no SQL runs
        const dbSpy = vi.spyOn(controlDb, "prepare");

        const res = await app.request(
          "/storefront-info-dummy-path-that-requires-tenant-context",
          {
            method: "GET",
            headers: {
              "Host": host,
            }
          },
          env
        );

        expect(res.status).toBe(404);
        
        // Assert no SQL statements were run during tenant resolution
        const calls = dbSpy.mock.calls;
        const tenantLookups = calls.filter(call => call[0].includes("tenants"));
        expect(tenantLookups.length).toBe(0);

        dbSpy.mockRestore();
      }
    });
  });
});
