import { Context } from "hono";

export interface LockoutCheckResult {
  locked: boolean;
  remainingMinutes?: number;
}

export async function ensureAuthSecurityTables(db: any): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      identifier TEXT PRIMARY KEY,
      failedCount INTEGER NOT NULL DEFAULT 0,
      lockedUntil INTEGER DEFAULT 0,
      updatedAt TEXT NOT NULL
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS auth_logs (
      logId TEXT PRIMARY KEY,
      eventType TEXT NOT NULL,
      userType TEXT NOT NULL,
      identifier TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      timestamp TEXT NOT NULL
    );
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_auth_logs_identifier ON auth_logs (identifier, timestamp DESC);
  `).run();
}

/**
 * Checks whether an account/identifier is currently locked out due to >= 5 failed attempts.
 */
export async function checkAccountLockout(
  db: any,
  identifier: string
): Promise<LockoutCheckResult> {
  try {
    await ensureAuthSecurityTables(db);
    const nowSec = Math.floor(Date.now() / 1000);
    const lowerId = identifier.toLowerCase().trim();

    const row: any = await db
      .prepare("SELECT failedCount, lockedUntil FROM login_attempts WHERE identifier = ?")
      .bind(lowerId)
      .first();

    if (row && row.lockedUntil > nowSec) {
      const remainingSec = row.lockedUntil - nowSec;
      const remainingMinutes = Math.ceil(remainingSec / 60);
      return { locked: true, remainingMinutes };
    }

    return { locked: false };
  } catch (error) {
    console.error("checkAccountLockout error:", error);
    return { locked: false };
  }
}

/**
 * Records a failed login attempt. If failedCount reaches 5, locks account for 15 minutes.
 */
export async function recordFailedAttempt(
  db: any,
  identifier: string,
  userType: "merchant" | "customer" | "admin",
  c: Context
): Promise<{ locked: boolean; attemptsLeft: number }> {
  try {
    await ensureAuthSecurityTables(db);
    const nowSec = Math.floor(Date.now() / 1000);
    const nowIso = new Date().toISOString();
    const lowerId = identifier.toLowerCase().trim();

    const existing: any = await db
      .prepare("SELECT failedCount, lockedUntil FROM login_attempts WHERE identifier = ?")
      .bind(lowerId)
      .first();

    let newCount = (existing?.failedCount || 0) + 1;
    let newLockedUntil = 0;

    // Lock for 15 minutes (900 seconds) if >= 5 failed attempts
    if (newCount >= 5) {
      newLockedUntil = nowSec + 15 * 60;
    }

    await db
      .prepare(
        `INSERT INTO login_attempts (identifier, failedCount, lockedUntil, updatedAt)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(identifier) DO UPDATE SET
           failedCount = excluded.failedCount,
           lockedUntil = excluded.lockedUntil,
           updatedAt = excluded.updatedAt`
      )
      .bind(lowerId, newCount, newLockedUntil, nowIso)
      .run();

    // Log the failed login event in auth_logs
    await logAuthEvent(
      db,
      newCount >= 5 ? "account_locked" : "login_failed",
      userType,
      lowerId,
      c
    );

    const attemptsLeft = Math.max(0, 5 - newCount);
    return {
      locked: newCount >= 5,
      attemptsLeft,
    };
  } catch (error) {
    console.error("recordFailedAttempt error:", error);
    return { locked: false, attemptsLeft: 4 };
  }
}

/**
 * Resets failed login attempts on successful login.
 */
export async function recordSuccessfulLogin(
  db: any,
  identifier: string,
  userType: "merchant" | "customer" | "admin",
  c: Context
): Promise<void> {
  try {
    await ensureAuthSecurityTables(db);
    const nowIso = new Date().toISOString();
    const lowerId = identifier.toLowerCase().trim();

    await db
      .prepare(
        `INSERT INTO login_attempts (identifier, failedCount, lockedUntil, updatedAt)
         VALUES (?, 0, 0, ?)
         ON CONFLICT(identifier) DO UPDATE SET
           failedCount = 0,
           lockedUntil = 0,
           updatedAt = excluded.updatedAt`
      )
      .bind(lowerId, nowIso)
      .run();

    await logAuthEvent(db, "login_success", userType, lowerId, c);
  } catch (error) {
    console.error("recordSuccessfulLogin error:", error);
  }
}

/**
 * Logs an authentication audit event into auth_logs (K1 requirement).
 */
export async function logAuthEvent(
  db: any,
  eventType: string,
  userType: string,
  identifier: string,
  c: Context
): Promise<void> {
  try {
    await ensureAuthSecurityTables(db);
    const logId = `auth_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ipAddress = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "127.0.0.1";
    const userAgent = c.req.header("user-agent") || "unknown";
    const nowIso = new Date().toISOString();
    const lowerId = identifier.toLowerCase().trim();

    await db
      .prepare(
        `INSERT INTO auth_logs (logId, eventType, userType, identifier, ipAddress, userAgent, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(logId, eventType, userType, lowerId, ipAddress, userAgent, nowIso)
      .run();
  } catch (error) {
    console.error("logAuthEvent error:", error);
  }
}
