import { ThemeManifest } from "./manifest.js";
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
export declare class ThemeLinter {
    static lintThemeFiles(files: ThemeFile[]): LintResult;
}
