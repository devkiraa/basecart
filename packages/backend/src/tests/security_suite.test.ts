import { describe, it, expect, beforeEach } from "vitest";
import { buildApp } from "../app";
import { checkAccountLockout, recordFailedAttempt, recordSuccessfulLogin } from "../services/auth_lockout";
import { encryptPII, decryptPII } from "../lib/crypto";

describe("Security Suite (X3 Requirement)", () => {
  let mockDb: any;

  beforeEach(() => {
    const attemptsMap = new Map<string, any>();
    mockDb = {
      prepare: (sql: string) => {
        return {
          bind: (...args: any[]) => {
            return {
              first: async () => {
                if (sql.includes("FROM login_attempts")) {
                  return attemptsMap.get(args[0]) || null;
                }
                return null;
              },
              run: async () => {
                if (sql.includes("INSERT INTO login_attempts")) {
                  const id = args[0];
                  const count = args[1];
                  const lockedUntil = args[2];
                  attemptsMap.set(id, { failedCount: count, lockedUntil });
                }
                return { success: true };
              },
            };
          },
          run: async () => ({ success: true }),
        };
      },
    };
  });

  it("should enforce Account Lockout after 5 failed login attempts (A2)", async () => {
    const email = "attacker@example.com";
    const dummyContext: any = {
      req: {
        header: () => "127.0.0.1",
      },
    };

    // First 4 failed attempts should not lock account
    for (let i = 1; i <= 4; i++) {
      const res = await recordFailedAttempt(mockDb, email, "merchant", dummyContext);
      expect(res.locked).toBe(false);
      expect(res.attemptsLeft).toBe(5 - i);
    }

    // 5th failed attempt must trigger lock
    const finalRes = await recordFailedAttempt(mockDb, email, "merchant", dummyContext);
    expect(finalRes.locked).toBe(true);

    // Verify checkAccountLockout returns locked: true
    const check = await checkAccountLockout(mockDb, email);
    expect(check.locked).toBe(true);
    expect(check.remainingMinutes).toBeGreaterThan(0);
  });

  it("should reset failed login attempts upon successful login", async () => {
    const email = "user@example.com";
    const dummyContext: any = {
      req: { header: () => "127.0.0.1" },
    };

    await recordFailedAttempt(mockDb, email, "merchant", dummyContext);
    await recordSuccessfulLogin(mockDb, email, "merchant", dummyContext);

    const check = await checkAccountLockout(mockDb, email);
    expect(check.locked).toBe(false);
  });

  it("should correctly encrypt and decrypt PII data at rest (L1)", async () => {
    const originalPhone = "+919895123456";
    const secret = "test-secret-32-character-length!!";

    const encrypted = await encryptPII(originalPhone, secret);
    expect(encrypted).not.toBe(originalPhone);
    expect(encrypted?.length).toBeGreaterThan(10);

    const decrypted = await decryptPII(encrypted, secret);
    expect(decrypted).toBe(originalPhone);
  });
});
