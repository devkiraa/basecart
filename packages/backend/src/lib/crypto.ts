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
  if (process.env.NODE_ENV !== "production" && !secret) {
    return btoa(`mock-encrypted:${text}`);
  }

  if (!secret) {
    throw new Error("ENCRYPTION_SECRET is required for production encryption");
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
  if (process.env.NODE_ENV !== "production" && !secret) {
    try {
      const decoded = atob(cipherTextBase64);
      if (decoded.startsWith("mock-encrypted:")) {
        return decoded.replace("mock-encrypted:", "");
      }
    } catch {
      // ignore decoding fallback
    }
  }

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

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
