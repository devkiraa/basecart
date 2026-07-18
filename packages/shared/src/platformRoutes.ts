export const SYSTEM_SUBDOMAINS = [
  "admin",
  "merchant",
  "api",
  "www",
  "docs",
  "status",
] as const;

export const NETWORK_SUBDOMAINS = [
  "mail",
  "smtp",
  "imap",
  "mx",
  "ftp",
  "pop",
] as const;

export const STATIC_SUBDOMAINS = [
  "cdn",
  "assets",
  "static",
  "images",
  "media",
] as const;

export const AUTH_SUBDOMAINS = [
  "login",
  "auth",
  "account",
  "dashboard",
] as const;

export const FUTURE_SUBDOMAINS = [
  "billing",
  "payments",
  "developers",
  "partners",
  "monitor",
  "metrics",
  "internal",
  "future",
] as const;

// All reserved subdomains list for lookup caching
export const ALL_RESERVED_SUBDOMAINS = [
  ...SYSTEM_SUBDOMAINS,
  ...NETWORK_SUBDOMAINS,
  ...STATIC_SUBDOMAINS,
  ...AUTH_SUBDOMAINS,
  ...FUTURE_SUBDOMAINS,
];

// Initialize the Set once for caching and performance
export const reservedSubdomains = new Set<string>(ALL_RESERVED_SUBDOMAINS);

// Single source of truth for platform hostnames
export const PLATFORM_HOSTS = new Set<string>([
  "basecart.app",
  "www.basecart.app",
  "merchant.basecart.app",
  "admin.basecart.app",
  "api.basecart.app",
  "docs.basecart.app",
  "status.basecart.app",
  "login.basecart.app",
  "auth.basecart.app",
  "dashboard.basecart.app",
  "billing.basecart.app",
  "payments.basecart.app",
  "developers.basecart.app",
  "partners.basecart.app",
  "monitor.basecart.app",
  "metrics.basecart.app",
  "internal.basecart.app",
  "future.basecart.app",
]);

// Helper to check if a hostname is a platform host
export function isPlatformHost(hostname: string): boolean {
  if (!hostname) return false;
  const clean = hostname.trim().toLowerCase();
  return PLATFORM_HOSTS.has(clean);
}
