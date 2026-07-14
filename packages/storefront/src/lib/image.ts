export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "png" | "jpeg";
  fit?: "scale-down" | "contain" | "cover" | "crop";
}

export function getOptimizedImageUrl(
  keyOrUrl: string | undefined | null,
  size: "thumbnail" | "small" | "medium" | "large" | "original" = "original"
): string {
  if (!keyOrUrl) return "";

  // Support legacy full URLs as-is
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    return keyOrUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const zoneUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ZONE_URL;

  const optionsMap: Record<string, ImageTransformOptions> = {
    thumbnail: { width: 150, quality: "auto", format: "auto", fit: "scale-down" },
    small: { width: 300, quality: "auto", format: "auto", fit: "scale-down" },
    medium: { width: 600, quality: "auto", format: "auto", fit: "scale-down" },
    large: { width: 800, quality: "auto", format: "auto", fit: "scale-down" },
    original: {},
  };

  const options = optionsMap[size] || {};

  // If local development (no NEXT_PUBLIC_CLOUDFLARE_ZONE_URL defined), use local API media proxy
  if (!zoneUrl) {
    return `${apiUrl}/media/${keyOrUrl}`;
  }

  if (size === "original") {
    return `${zoneUrl}/${keyOrUrl}`;
  }

  const parts: string[] = [];
  if (options.width) parts.push(`width=${options.width}`);
  if (options.height) parts.push(`height=${options.height}`);
  if (options.quality) parts.push(`quality=${options.quality}`);
  if (options.format) parts.push(`format=${options.format}`);
  if (options.fit) parts.push(`fit=${options.fit}`);

  const optString = parts.length > 0 ? parts.join(",") : "quality=auto,format=auto";
  return `${zoneUrl}/cdn-cgi/image/${optString}/${keyOrUrl}`;
}
