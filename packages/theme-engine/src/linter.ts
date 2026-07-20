import { validateThemeManifest, ThemeManifest } from "./manifest.js";

export interface LintError {
  file?: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

export interface LintResult {
  valid: boolean;
  manifest?: ThemeManifest;
  errors: LintError[];
  warnings: LintError[];
}

export interface ThemeFile {
  path: string;
  content: string;
}

const PROHIBITED_MODULES = [
  "fs",
  "fs/promises",
  "child_process",
  "cluster",
  "dgram",
  "dns",
  "net",
  "os",
  "path",
  "process",
  "readline",
  "repl",
  "tls",
  "vm",
  "worker_threads",
];

const PROHIBITED_PATTERNS = [
  { pattern: /\beval\s*\(/, rule: "no-eval", message: "Dynamic code execution via eval() is strictly prohibited." },
  { pattern: /\bFunction\s*\(/, rule: "no-new-function", message: "Dynamic function instantiation via Function() is prohibited." },
  { pattern: /process\.env/, rule: "no-process-env", message: "Accessing process.env server secrets directly is prohibited." },
  { pattern: /require\s*\(\s*['"](fs|child_process|net|os|path)['"]\s*\)/, rule: "no-node-builtins", message: "Node.js core modules cannot be imported." },
  { pattern: /import\s+.*\s+from\s+['"](fs|child_process|net|os|path)['"]/, rule: "no-node-builtins", message: "Node.js core modules cannot be imported." },
];

export class ThemeLinter {
  static lintThemeFiles(files: ThemeFile[]): LintResult {
    const errors: LintError[] = [];
    const warnings: LintError[] = [];

    // 1. Check Manifest File Existence
    const manifestFile = files.find((f) => f.path === "manifest.json" || f.path.endsWith("/manifest.json"));
    if (!manifestFile) {
      errors.push({
        rule: "missing-manifest",
        message: "Theme package is missing required 'manifest.json' at root.",
        severity: "error",
      });
      return { valid: false, errors, warnings };
    }

    // 2. Validate Manifest Contents
    let manifestData: ThemeManifest | undefined;
    try {
      const parsedJson = JSON.parse(manifestFile.content);
      const manifestResult = validateThemeManifest(parsedJson);
      if (!manifestResult.success) {
        manifestResult.errors?.forEach((msg) => {
          errors.push({
            file: manifestFile.path,
            rule: "invalid-manifest",
            message: `Manifest Validation Error: ${msg}`,
            severity: "error",
          });
        });
      } else {
        manifestData = manifestResult.data;
      }
    } catch {
      errors.push({
        file: manifestFile.path,
        rule: "invalid-json",
        message: "manifest.json contains invalid JSON syntax.",
        severity: "error",
      });
    }

    // 3. Check Required Directory Structure
    const hasTemplates = files.some((f) => f.path.includes("templates/"));
    const hasSections = files.some((f) => f.path.includes("sections/"));
    const hasPreview = files.some((f) => f.path.includes("preview.") || f.path.includes("thumbnail."));

    if (!hasTemplates) {
      warnings.push({
        rule: "missing-templates",
        message: "Theme does not contain a 'templates/' directory.",
        severity: "warning",
      });
    }

    if (!hasSections) {
      warnings.push({
        rule: "missing-sections",
        message: "Theme does not contain a 'sections/' directory.",
        severity: "warning",
      });
    }

    if (!hasPreview) {
      warnings.push({
        rule: "missing-preview-image",
        message: "Theme package should include a preview.webp or preview.png screenshot.",
        severity: "warning",
      });
    }

    // 4. Source Code Security Audit
    files.forEach((file) => {
      if (file.path.endsWith(".ts") || file.path.endsWith(".tsx") || file.path.endsWith(".js") || file.path.endsWith(".jsx")) {
        // Check for prohibited imports
        PROHIBITED_MODULES.forEach((mod) => {
          const importRegex = new RegExp(`from\\s+['"]${mod}['"]|require\\s*\\(\\s*['"]${mod}['"]\\)`);
          if (importRegex.test(file.content)) {
            errors.push({
              file: file.path,
              rule: "prohibited-import",
              message: `Unauthorized module import detected: '${mod}'. Theme code must be sandboxed.`,
              severity: "error",
            });
          }
        });

        // Check for security vulnerabilities
        PROHIBITED_PATTERNS.forEach(({ pattern, rule, message }) => {
          if (pattern.test(file.content)) {
            errors.push({
              file: file.path,
              rule,
              message: `${message} Found in file: ${file.path}`,
              severity: "error",
            });
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      manifest: manifestData,
      errors,
      warnings,
    };
  }
}
