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
  category: z.enum([
    "Fashion",
    "Footwear & Fashion",
    "Electronics",
    "Home & Living",
    "Beauty",
    "Food",
    "Books",
    "Sports",
    "Minimal",
    "General",
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  screenshots: z.array(z.string()).min(1, "At least one screenshot URL is required"),
  preview: z.string().url("Preview URL must be a valid URL").optional(),
  supportedFeatures: z.array(z.string()).default(["Responsive", "SEO Ready"]),
  minimumBasecartVersion: z.string().default("1.0.0"),
  price: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  tags: z.array(z.string()).default([]),
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
