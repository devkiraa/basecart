"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManifestSchema = void 0;
exports.validateThemeManifest = validateThemeManifest;
const zod_1 = require("zod");
exports.ThemeManifestSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "Theme ID is required"),
    slug: zod_1.z.string().min(1, "Theme slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    name: zod_1.z.string().min(1, "Theme name is required"),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (x.y.z)"),
    author: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email().optional(),
        url: zod_1.z.string().url().optional(),
    }),
    category: zod_1.z.enum([
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
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    screenshots: zod_1.z.array(zod_1.z.string()).min(1, "At least one screenshot URL is required"),
    preview: zod_1.z.string().url("Preview URL must be a valid URL").optional(),
    supportedFeatures: zod_1.z.array(zod_1.z.string()).default(["Responsive", "SEO Ready"]),
    minimumBasecartVersion: zod_1.z.string().default("1.0.0"),
    price: zod_1.z.number().nonnegative().default(0),
    currency: zod_1.z.string().default("USD"),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
function validateThemeManifest(manifestJson) {
    const parseResult = exports.ThemeManifestSchema.safeParse(manifestJson);
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
