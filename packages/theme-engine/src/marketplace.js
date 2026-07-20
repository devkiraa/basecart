"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeMarketplaceEngine = void 0;
const linter_js_1 = require("./linter.js");
class ThemeMarketplaceEngine {
    static validateUploadPackage(files) {
        return linter_js_1.ThemeLinter.lintThemeFiles(files);
    }
    static isVersionUpdate(currentVersion, newVersion) {
        const parse = (v) => v.split(".").map(Number);
        const [cMajor, cMinor, cPatch] = parse(currentVersion);
        const [nMajor, nMinor, nPatch] = parse(newVersion);
        if (nMajor > cMajor)
            return true;
        if (nMajor === cMajor && nMinor > cMinor)
            return true;
        if (nMajor === cMajor && nMinor === cMinor && nPatch > cPatch)
            return true;
        return false;
    }
    static createListingFromManifest(manifest, options = {}) {
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
exports.ThemeMarketplaceEngine = ThemeMarketplaceEngine;
