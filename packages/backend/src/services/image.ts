import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageClient, getBucketName } from "../lib/storage";
import crypto from "crypto";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "png" | "jpeg";
  fit?: "scale-down" | "contain" | "cover" | "crop";
}

export class ImageService {
  /**
   * Generates a presigned upload URL for Cloudflare R2
   * Path: tenants/{tenantId}/{type}/{entityId}/{fileId}-{cleanFileName}
   */
  static async generateUploadUrl(
    env: any,
    tenantId: string,
    type: string,
    entityId: string,
    fileName: string,
    contentType: string,
    fileSize: number,
    headerHex: string
  ) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the limit of 10MB`);
    }

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedMimeTypes.includes(contentType)) {
      throw new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed");
    }

    if (!this.validateMagicBytes(headerHex, contentType)) {
      throw new Error("Security Check Failed: File header does not match expected image magic bytes");
    }

    // Tenant folder isolation & safe file naming
    const fileId = crypto.randomBytes(8).toString("hex");
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `tenants/${tenantId}/${type}/${entityId}/${fileId}-${cleanFileName}`;

    const bucketName = getBucketName(env);
    const storageClient = getStorageClient(env);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(storageClient, command, {
      expiresIn: 300,
    });

    return { uploadUrl, key };
  }

  static validateMagicBytes(headerHex: string, contentType: string): boolean {
    const hex = headerHex.toLowerCase();
    if (contentType === "image/jpeg" || contentType === "image/jpg") {
      return hex.startsWith("ffd8ff");
    }
    if (contentType === "image/png") {
      return hex.startsWith("89504e47");
    }
    if (contentType === "image/gif") {
      return hex.startsWith("47494638");
    }
    if (contentType === "image/webp") {
      return hex.startsWith("52494646") && hex.substring(16, 24) === "57454250";
    }
    return false;
  }

  /**
   * Removes object from R2
   */
  static async deleteImage(env: any, key: string) {
    if (!key) return;
    const bucketName = getBucketName(env);
    const storageClient = getStorageClient(env);
    try {
      await storageClient.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );
    } catch (err) {
      console.error(`Failed to delete R2 object key ${key}:`, err);
    }
  }

  /**
   * Dynamic delivery URL builder using Cloudflare Image Transformations
   */
  static getDeliveryUrl(env: any, key: string, options?: ImageTransformOptions) {
    if (!key) return "";

    // If it's already a full HTTP url (for backward compatibility), return as-is
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }

    const isProdOrStaging = env?.NODE_ENV === "production" || env?.NODE_ENV === "staging";
    const zoneUrl = env?.CLOUDFLARE_ZONE_URL;

    // Local development fallback
    if (!isProdOrStaging || !zoneUrl) {
      const apiUrl = env?.API_URL || "http://localhost:3001";
      return `${apiUrl}/media/${key}`;
    }

    if (!options) {
      return `${zoneUrl}/${key}`;
    }

    const parts: string[] = [];
    if (options.width) parts.push(`width=${options.width}`);
    if (options.height) parts.push(`height=${options.height}`);
    if (options.quality) parts.push(`quality=${options.quality}`);
    if (options.format) parts.push(`format=${options.format}`);
    if (options.fit) parts.push(`fit=${options.fit}`);

    const optString = parts.length > 0 ? parts.join(",") : "quality=auto,format=auto";
    return `${zoneUrl}/cdn-cgi/image/${optString}/${key}`;
  }

  static thumbnail(env: any, key: string) {
    return this.getDeliveryUrl(env, key, { width: 150, quality: "auto", format: "auto", fit: "scale-down" });
  }

  static small(env: any, key: string) {
    return this.getDeliveryUrl(env, key, { width: 300, quality: "auto", format: "auto", fit: "scale-down" });
  }

  static medium(env: any, key: string) {
    return this.getDeliveryUrl(env, key, { width: 600, quality: "auto", format: "auto", fit: "scale-down" });
  }

  static large(env: any, key: string) {
    return this.getDeliveryUrl(env, key, { width: 800, quality: "auto", format: "auto", fit: "scale-down" });
  }

  static original(env: any, key: string) {
    return this.getDeliveryUrl(env, key);
  }
}
