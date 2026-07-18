import { reservedSubdomains } from "./platformRoutes";

export function isReservedSubdomain(slug: string): boolean {
  if (!slug) return true;

  // 1. Trim and convert to lowercase
  let clean = slug.trim().toLowerCase();

  // 2. Remove duplicate dots
  clean = clean.replace(/\.+/g, ".");

  // 3. Reject Unicode (any non-ASCII characters)
  if (/[^\x00-\x7F]/.test(clean)) return true;

  // 4. Reject spaces
  if (/\s/.test(clean)) return true;

  // 5. Reject invalid RFC hostname characters
  // Hostname labels must only contain letters, numbers, hyphens, and dots.
  // We also reject empty strings or leading/trailing hyphens/dots.
  if (!/^[a-z0-9.-]+$/.test(clean)) return true;

  // 6. Reject dots and leading/trailing hyphens
  if (
    clean.includes(".") ||
    clean.startsWith("-") ||
    clean.endsWith("-")
  ) {
    return true;
  }

  // 7. Length check (3-63 characters)
  if (clean.length < 3 || clean.length > 63) return true;

  // 8. Check if exists in reserved subdomains list (Set lookup)
  if (reservedSubdomains.has(clean)) return true;

  return false;
}
