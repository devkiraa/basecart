import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";
const JWT_SECRET =
  process.env.JWT_SECRET || "local_jwt_secret_key_for_testing_purposes";
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

  async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
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
        jti: Math.random().toString(36).substring(2),
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token to DynamoDB (under the matching tenant partition key)
    const expiryTime = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY;

    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `TENANT#${payload.tenantId}`,
          SK: `REFRESH_TOKEN#${refreshToken}`,
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          type: payload.type,
          expiresAt: expiryTime, // Managed by DynamoDB TTL
          createdAt: new Date().toISOString(),
        },
      })
    );

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
    tenantId: string
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
    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `REFRESH_TOKEN#${refreshToken}`,
        },
      })
    );

    const tokenItem = result.Item;
    if (!tokenItem) {
      throw new Error("Refresh token not found or revoked");
    }

    // Verify expiration time manually in case DynamoDB TTL hasn't cleared it yet
    if (
      tokenItem.expiresAt &&
      tokenItem.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      await this.revokeSession(refreshToken, tenantId);
      throw new Error("Refresh token expired");
    }

    // Rotate refresh token: Revoke old, generate new
    await this.revokeSession(refreshToken, tenantId);

    return this.generateTokens({
      userId: tokenItem.userId,
      email: tokenItem.email,
      role: tokenItem.role,
      tenantId: tenantId,
      type: tokenItem.type,
    });
  }

  async revokeSession(refreshToken: string, tenantId: string): Promise<void> {
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `TENANT#${tenantId}`,
          SK: `REFRESH_TOKEN#${refreshToken}`,
        },
      })
    );
  }
}
export const authService = new AuthService();
