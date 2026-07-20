import { ThemeLinter, ThemeFile, LintResult } from "./linter.js";
import { validateThemeManifest } from "./manifest.js";

export interface PipelineUploadResult {
  success: boolean;
  themeId?: string;
  slug?: string;
  version?: string;
  errors: string[];
  warnings: string[];
  dbRecord?: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    folder_name: string;
    preview: string;
    thumbnail: string;
    featured: number;
    published: number;
    current_version: string;
    minimum_version: string;
    maximum_version: string;
    created_at: string;
    updated_at: string;
  };
}

export class ThemeUploadPipeline {
  static processThemePackage(files: ThemeFile[]): PipelineUploadResult {
    // 1. Run Security & Structure Audit
    const lintResult: LintResult = ThemeLinter.lintThemeFiles(files);
    if (!lintResult.valid) {
      return {
        success: false,
        errors: lintResult.errors.map((e) => `[${e.rule}] ${e.message}`),
        warnings: lintResult.warnings.map((w) => `[${w.rule}] ${w.message}`),
      };
    }

    // 2. Validate Manifest Schema
    const manifestFile = files.find((f) => f.path === "manifest.json" || f.path.endsWith("/manifest.json"));
    if (!manifestFile) {
      return { success: false, errors: ["Missing required manifest.json"], warnings: [] };
    }

    let manifestJson: any;
    try {
      manifestJson = JSON.parse(manifestFile.content);
    } catch {
      return { success: false, errors: ["manifest.json contains invalid JSON"], warnings: [] };
    }

    const manifestValidation = validateThemeManifest(manifestJson);
    if (!manifestValidation.success || !manifestValidation.data) {
      return {
        success: false,
        errors: manifestValidation.errors || ["Manifest schema validation failed"],
        warnings: [],
      };
    }

    const m = manifestValidation.data;
    const now = new Date().toISOString();

    const dbRecord = {
      id: m.id,
      slug: m.slug,
      name: m.name,
      description: m.description,
      category: m.category,
      price: m.price,
      currency: m.currency,
      folder_name: m.slug,
      preview: m.preview || "",
      thumbnail: m.thumbnail || m.preview || "",
      featured: m.featured ? 1 : 0,
      published: m.published ? 1 : 0,
      current_version: m.version,
      minimum_version: m.minimumBasecartVersion,
      maximum_version: m.maximumBasecartVersion,
      created_at: now,
      updated_at: now,
    };

    return {
      success: true,
      themeId: m.id,
      slug: m.slug,
      version: m.version,
      errors: [],
      warnings: lintResult.warnings.map((w) => `[${w.rule}] ${w.message}`),
      dbRecord,
    };
  }
}
