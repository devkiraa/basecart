import { z } from "zod";

export const ThemeManifestSchema = z.object({
  id: z.string().min(1, "Theme ID is required"),
  slug: z.string().min(1, "Theme slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1, "Theme name is required"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (x.y.z)"),
  author: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }),
  authorWebsite: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  minimumBasecartVersion: z.string().default("1.0.0"),
  maximumBasecartVersion: z.string().default("2.5.0"),
  preview: z.string().optional(),
  thumbnail: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  license: z.string().default("Basecart Standard License"),
  supportedFeatures: z.array(z.string()).default(["Responsive", "SEO Ready"]),
  demoUrl: z.string().optional(),
  colorPalette: z.record(z.string(), z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
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
