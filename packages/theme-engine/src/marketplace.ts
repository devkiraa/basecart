import { ThemeManifest } from "./manifest.js";
import { ThemeLinter, ThemeFile, LintResult } from "./linter.js";

export interface ThemeListing {
  id: string;
  slug: string;
  name: string;
  version: string;
  authorName: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  isNew: boolean;
  featured: boolean;
  previewUrl?: string;
  screenshots: string[];
  supportedFeatures: string[];
  downloadsCount: number;
  rating: number;
}

export class ThemeMarketplaceEngine {
  static validateUploadPackage(files: ThemeFile[]): LintResult {
    return ThemeLinter.lintThemeFiles(files);
  }

  static isVersionUpdate(currentVersion: string, newVersion: string): boolean {
    const parse = (v: string) => v.split(".").map(Number);
    const [cMajor, cMinor, cPatch] = parse(currentVersion);
    const [nMajor, nMinor, nPatch] = parse(newVersion);

    if (nMajor > cMajor) return true;
    if (nMajor === cMajor && nMinor > cMinor) return true;
    if (nMajor === cMajor && nMinor === cMinor && nPatch > cPatch) return true;
    return false;
  }

  static createListingFromManifest(manifest: ThemeManifest, options: { previewUrl?: string; featured?: boolean } = {}): ThemeListing {
    return {
      id: manifest.id,
      slug: manifest.slug,
      name: manifest.name,
      version: manifest.version,
      authorName: manifest.author.name,
      category: manifest.category,
      description: manifest.description,
      price: manifest.price,
      currency: manifest.currency,
      isNew: true,
      featured: options.featured || false,
      previewUrl: options.previewUrl || manifest.preview,
      screenshots: manifest.screenshots,
      supportedFeatures: manifest.supportedFeatures,
      downloadsCount: 0,
      rating: 5.0,
    };
  }
}
