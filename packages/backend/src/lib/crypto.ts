import { kmsClient } from "./aws";
import { EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

// Task 1: Audit & validate startup config to avoid default keys in production
if (process.env.NODE_ENV === "production" && !process.env.KMS_KEY_ID) {
  throw new Error("FATAL: KMS_KEY_ID environment variable is required in production environment! Shutting down.");
}

/**
 * Encrypts plaintext using AWS KMS
 * Returns base64 ciphertext
 */
export async function encrypt(text: string): Promise<string> {
  const keyId = process.env.KMS_KEY_ID;
  if (!keyId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("KMS_KEY_ID is missing");
    }
    // Fallback for local development/test if KMS key is not yet bootstrapped
    return Buffer.from(`mock-encrypted:${text}`).toString("base64");
  }

  const command = new EncryptCommand({
    KeyId: keyId,
    Plaintext: Buffer.from(text, "utf8"),
  });

  const response = await kmsClient.send(command);
  if (!response.CiphertextBlob) {
    throw new Error("KMS Encrypt failed to return CiphertextBlob");
  }
  return Buffer.from(response.CiphertextBlob).toString("base64");
}

/**
 * Decrypts base64 ciphertext using AWS KMS
 */
export async function decrypt(cipherTextBase64: string): Promise<string> {
  const keyId = process.env.KMS_KEY_ID;
  // Check if we are using the local mock fallback in non-production
  if (!keyId) {
    try {
      const decoded = Buffer.from(cipherTextBase64, "base64").toString("utf8");
      if (decoded.startsWith("mock-encrypted:")) {
        return decoded.replace("mock-encrypted:", "");
      }
    } catch {
      // ignore
    }
  }

  if (!keyId) {
    throw new Error("KMS_KEY_ID is missing");
  }

  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(cipherTextBase64, "base64"),
  });

  const response = await kmsClient.send(command);
  if (!response.Plaintext) {
    throw new Error("KMS Decrypt failed to return Plaintext");
  }
  return Buffer.from(response.Plaintext).toString("utf8");
}
