import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { D1Database } from "../lib/db";

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set. Refusing to start without a secure JWT secret.");
}
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

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

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateTokens(payload: TokenPayload, db?: D1Database): Promise<AuthTokens> {
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        type: payload.type,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        type: payload.type,
        jti: crypto.randomUUID(),
      },
      JWT_SECRET,
      { expiresIn: "7d" }
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

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
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
    db: D1Database
  ): Promise<AuthTokens> {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
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
    }, db);
  }

  async revokeSession(refreshToken: string, tenantId: string, db: D1Database): Promise<void> {
    await db
      .prepare("DELETE FROM refresh_tokens WHERE token = ? AND tenantId = ?")
      .bind(refreshToken, tenantId)
      .run();
  }
}

export const authService = new AuthService();
