import { ThemeManifest } from "./manifest.js";
import { ThemeFile, LintResult } from "./linter.js";
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
export declare class ThemeMarketplaceEngine {
    static validateUploadPackage(files: ThemeFile[]): LintResult;
    static isVersionUpdate(currentVersion: string, newVersion: string): boolean;
    static createListingFromManifest(manifest: ThemeManifest, options?: {
        previewUrl?: string;
        featured?: boolean;
    }): ThemeListing;
}
