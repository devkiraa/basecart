import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { D1Database } from "../lib/db";

const ACCESS_TOKEN_EXPIRY = "15d";
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  type: "merchant" | "customer" | "admin";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Resolves JWT_SECRET from the Cloudflare Worker env bindings.
 * Throws a clear error if the secret is not configured.
 */
function resolveJwtSecret(env: any): string {
  const secret = env?.JWT_SECRET || (typeof process !== "undefined" && process.env ? process.env.JWT_SECRET : undefined);
  if (secret) return secret;

  try {
    // @ts-ignore
    const { env: testEnv } = require("cloudflare:test");
    if (testEnv && testEnv.JWT_SECRET) {
      return testEnv.JWT_SECRET;
    }
  } catch (e) {}

  throw new Error("JWT_SECRET is not configured. Set it in your Worker environment bindings.");
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(payload: TokenPayload, db?: D1Database, env?: any): Promise<AuthTokens> {
    const secret = resolveJwtSecret(env);
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        type: payload.type,
      },
      secret,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        type: payload.type,
        jti: crypto.randomUUID(),
      },
      secret,
      { expiresIn: "30d" }
    );

    // Save refresh token to D1 control database if DB client is provided
    if (db) {
      const expiryTime = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY;
      await db
        .prepare(
          "INSERT OR REPLACE INTO refresh_tokens (token, tenantId, userId, email, role, type, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          refreshToken,
          payload.tenantId,
          payload.userId,
          payload.email,
          payload.role,
          payload.type,
          expiryTime,
          new Date().toISOString()
        )
        .run();
    }

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string, env: any): Promise<TokenPayload> {
    const secret = resolveJwtSecret(env);
    try {
      const decoded = jwt.verify(token, secret) as any;
      if (!decoded.userId || !decoded.tenantId || !decoded.type) {
        throw new Error("Invalid token payload");
      }
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || "user",
        tenantId: decoded.tenantId,
        type: decoded.type,
      };
    } catch (error) {
      throw new Error("Unauthorized: Invalid access token");
    }
  }

  async refreshSession(
    refreshToken: string,
    tenantId: string,
    db: D1Database,
    env: any
  ): Promise<AuthTokens> {
    const secret = resolveJwtSecret(env);
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }

    if (decoded.tenantId !== tenantId) {
      throw new Error("Tenant mismatch for refresh token");
    }

    // Lookup refresh token from DB
    const tokenItem = await db
      .prepare("SELECT * FROM refresh_tokens WHERE token = ? AND tenantId = ?")
      .bind(refreshToken, tenantId)
      .first<any>();

    if (!tokenItem) {
      throw new Error("Refresh token not found or revoked");
    }

    // Verify expiration time manually
    const nowSecs = Math.floor(Date.now() / 1000);
    if (tokenItem.expiresAt && tokenItem.expiresAt < nowSecs) {
      await this.revokeSession(refreshToken, tenantId, db);
      throw new Error("Refresh token expired");
    }

    // Rotate refresh token: Revoke old, generate new
    await this.revokeSession(refreshToken, tenantId, db);

    return this.generateTokens({
      userId: tokenItem.userId,
      email: tokenItem.email,
      role: tokenItem.role,
      tenantId: tenantId,
      type: tokenItem.type,
    }, db, env);
  }

  async revokeSession(refreshToken: string, tenantId: string, db: D1Database): Promise<void> {
    await db
      .prepare("DELETE FROM refresh_tokens WHERE token = ? AND tenantId = ?")
      .bind(refreshToken, tenantId)
      .run();
  }
}

export const authService = new AuthService();
