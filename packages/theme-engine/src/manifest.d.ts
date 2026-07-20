import { z } from "zod";
export declare const ThemeManifestSchema: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    author: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        url?: string;
        email?: string;
    }, {
        name?: string;
        url?: string;
        email?: string;
    }>;
    category: z.ZodEnum<["Fashion", "Footwear & Fashion", "Electronics", "Home & Living", "Beauty", "Food", "Books", "Sports", "Minimal", "General"]>;
    description: z.ZodString;
    screenshots: z.ZodArray<z.ZodString, "many">;
    preview: z.ZodOptional<z.ZodString>;
    supportedFeatures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    minimumBasecartVersion: z.ZodDefault<z.ZodString>;
    price: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    currency?: string;
    name?: string;
    id?: string;
    description?: string;
    tags?: string[];
    version?: string;
    price?: number;
    category?: "Electronics" | "Beauty" | "Food" | "General" | "Fashion" | "Footwear & Fashion" | "Home & Living" | "Books" | "Sports" | "Minimal";
    slug?: string;
    author?: {
        name?: string;
        url?: string;
        email?: string;
    };
    screenshots?: string[];
    preview?: string;
    supportedFeatures?: string[];
    minimumBasecartVersion?: string;
}, {
    currency?: string;
    name?: string;
    id?: string;
    description?: string;
    tags?: string[];
    version?: string;
    price?: number;
    category?: "Electronics" | "Beauty" | "Food" | "General" | "Fashion" | "Footwear & Fashion" | "Home & Living" | "Books" | "Sports" | "Minimal";
    slug?: string;
    author?: {
        name?: string;
        url?: string;
        email?: string;
    };
    screenshots?: string[];
    preview?: string;
    supportedFeatures?: string[];
    minimumBasecartVersion?: string;
}>;
export type ThemeManifest = z.infer<typeof ThemeManifestSchema>;
export declare function validateThemeManifest(manifestJson: unknown): {
    success: boolean;
    data?: ThemeManifest;
    errors?: string[];
};
