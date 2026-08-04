import type { z } from "zod";
import * as ZodModule from "zod";

const zVal: typeof z = (ZodModule as any).z || (ZodModule as any).default || ZodModule;

export const ThemeManifestSchema = zVal.object({
  id: zVal.string().min(1, "Theme ID is required"),
  slug: zVal.string().min(1, "Theme slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: zVal.string().min(1, "Theme name is required"),
  version: zVal.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (x.y.z)"),
  author: zVal.object({
    name: zVal.string().min(1),
    email: zVal.string().email().optional(),
    url: zVal.string().url().optional(),
  }),
  authorWebsite: zVal.string().optional(),
  category: zVal.string().min(1, "Category is required"),
  subcategory: zVal.string().optional(),
  description: zVal.string().min(10, "Description must be at least 10 characters"),
  price: zVal.number().nonnegative().default(0),
  currency: zVal.string().default("USD"),
  featured: zVal.boolean().default(false),
  published: zVal.boolean().default(true),
  minimumBasecartVersion: zVal.string().default("1.0.0"),
  maximumBasecartVersion: zVal.string().default("2.5.0"),
  preview: zVal.string().optional(),
  thumbnail: zVal.string().optional(),
  screenshots: zVal.array(zVal.string()).default([]),
  tags: zVal.array(zVal.string()).default([]),
  license: zVal.string().default("Basecart Standard License"),
  supportedFeatures: zVal.array(zVal.string()).default(["Responsive", "SEO Ready"]),
  demoUrl: zVal.string().optional(),
  colorPalette: zVal.record(zVal.string(), zVal.string()).optional(),
  createdAt: zVal.string().optional(),
  updatedAt: zVal.string().optional(),
});

export type ThemeManifest = z.infer<typeof ThemeManifestSchema>;

export function validateThemeManifest(manifestJson: unknown): { success: boolean; data?: ThemeManifest; errors?: string[] } {
  const parseResult = ThemeManifestSchema.safeParse(manifestJson);
  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
    };
  }
  return {
    success: true,
    data: parseResult.data,
  };
}
