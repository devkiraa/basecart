const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

/**
 * Derives a CryptoKey from a secret key string using PBKDF2.
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret.padEnd(32, "0").substring(0, 32)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("basecart-salt-string-for-pbkdf2"),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts plaintext using Web Crypto AES-256-GCM
 */
export async function encrypt(text: string, secret?: string): Promise<string> {
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET is required for encryption");
  }

  const key = await getCryptoKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    enc.encode(text)
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts base64 ciphertext using Web Crypto AES-256-GCM
 */
export async function decrypt(cipherTextBase64: string, secret?: string): Promise<string> {
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET is required for decryption");
  }

  const key = await getCryptoKey(secret);
  const binaryString = atob(cipherTextBase64);
  const combined = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    combined[i] = binaryString.charCodeAt(i);
  }

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const dec = new (globalThis as any).TextDecoder();
  return dec.decode(decrypted);
}

/**
 * Helper to encrypt PII data fields at rest (L1 requirement)
 */
export async function encryptPII(value: string | null | undefined, secret?: string): Promise<string | null> {
  if (!value) return null;
  const encSecret = secret || (typeof process !== "undefined" && process.env ? process.env.ENCRYPTION_SECRET : "basecart-fallback-encryption-secret-32-chars");
  try {
    return await encrypt(value, encSecret);
  } catch (err) {
    console.error("encryptPII error:", err);
    return value;
  }
}

/**
 * Helper to decrypt PII data fields at rest (L1 requirement)
 */
export async function decryptPII(cipherText: string | null | undefined, secret?: string): Promise<string | null> {
  if (!cipherText) return null;
  const encSecret = secret || (typeof process !== "undefined" && process.env ? process.env.ENCRYPTION_SECRET : "basecart-fallback-encryption-secret-32-chars");
  try {
    return await decrypt(cipherText, encSecret);
  } catch (err) {
    // If text was not encrypted or legacy plaintext, return as is
    return cipherText;
  }
}
