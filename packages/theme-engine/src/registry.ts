import { ThemeManifest, validateThemeManifest } from "./manifest.js";

export interface ThemeRegistryItem {
  id: string;
  slug: string;
  name: string;
  version: string;
  authorName: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  currency: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  featured: boolean;
  published: boolean;
  minimumVersion: string;
  maximumVersion: string;
  manifest: ThemeManifest;
}

export interface MerchantActiveTheme {
  merchantId: string;
  themeId: string;
  themeSlug: string;
  version: string;
  active: boolean;
  customSettings: Record<string, any>;
}

export class ThemeRegistry {
  private static cachedRegistry: Map<string, ThemeRegistryItem> = new Map();

  static registerTheme(manifestData: unknown, options: { previewUrl?: string; thumbnailUrl?: string } = {}): ThemeRegistryItem {
    const validated = validateThemeManifest(manifestData);
    if (!validated.success || !validated.data) {
      throw new Error(`Invalid Theme Manifest: ${validated.errors?.join(", ")}`);
    }

    const m = validated.data;
    const item: ThemeRegistryItem = {
      id: m.id,
      slug: m.slug,
      name: m.name,
      version: m.version,
      authorName: m.author.name,
      category: m.category,
      subcategory: m.subcategory,
      description: m.description,
      price: m.price,
      currency: m.currency,
      previewUrl: options.previewUrl || m.preview,
      thumbnailUrl: options.thumbnailUrl || m.thumbnail,
      featured: m.featured,
      published: m.published,
      minimumVersion: m.minimumBasecartVersion,
      maximumVersion: m.maximumBasecartVersion,
      manifest: m,
    };

    this.cachedRegistry.set(m.id, item);
    this.cachedRegistry.set(m.slug, item);
    return item;
  }

  static getTheme(idOrSlug: string): ThemeRegistryItem | undefined {
    return this.cachedRegistry.get(idOrSlug);
  }

  static getAllThemes(): ThemeRegistryItem[] {
    const unique = new Set<ThemeRegistryItem>();
    this.cachedRegistry.forEach((item) => unique.add(item));
    return Array.from(unique);
  }

  static checkCompatibility(theme: ThemeRegistryItem, basecartVersion: string = "1.0.0"): { compatible: boolean; reason?: string } {
    const parse = (v: string) => v.split(".").map(Number);
    const [bMajor, bMinor] = parse(basecartVersion);
    const [minMajor, minMinor] = parse(theme.minimumVersion);

    if (bMajor < minMajor || (bMajor === minMajor && bMinor < minMinor)) {
      return {
        compatible: false,
        reason: `Theme requires Basecart version ${theme.minimumVersion} or higher. Current version: ${basecartVersion}`,
      };
    }
    return { compatible: true };
  }
}
