import { Hono } from "hono";
import { getControlDb } from "../lib/db";
import { authenticateAdmin } from "./admin";
import { ThemeLinter } from "@basecart/theme-engine";

const app = new Hono<{ Bindings: any; Variables: any }>();

// ─── ADMIN THEME MARKETPLACE MANAGEMENT ─────────────────────

/**
 * POST /admin/themes/lint-check
 * Lints an uploaded theme package and returns validation results.
 */
app.post("/admin/themes/lint-check", authenticateAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const files = body.files || [];

    const lintResult = ThemeLinter.lintThemeFiles(files);
    return c.json(lintResult);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to lint theme files" }, 400);
  }
});

/**
 * POST /admin/themes/publish
 * Publishes a new theme to the central Theme Marketplace in D1.
 */
app.post("/admin/themes/publish", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    const body = await c.req.json();
    const manifest = body.manifest;

    if (!manifest || !manifest.id || !manifest.name) {
      return c.json({ error: "Invalid theme manifest payload" }, 400);
    }

    const themeId = manifest.id;
    const slug = manifest.slug || themeId;
    const name = manifest.name;
    const version = manifest.version || "1.0.0";
    const authorName = manifest.author?.name || "Official Basecart";
    const category = manifest.category || "Fashion";
    const description = manifest.description || "Production-ready Basecart Theme";
    const price = manifest.price || 0;
    const currency = manifest.currency || "USD";
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO marketplace_themes (id, slug, name, version, authorName, category, description, price, currency, manifestJson, rating, downloadsCount, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 'published', ?)
         ON CONFLICT(id) DO UPDATE SET
           version = excluded.version,
           name = excluded.name,
           description = excluded.description,
           manifestJson = excluded.manifestJson,
           createdAt = excluded.createdAt`
      )
      .bind(themeId, slug, name, version, authorName, category, description, price, currency, JSON.stringify(manifest), now)
      .run();

    return c.json({ success: true, themeId, message: "Theme published successfully to Marketplace." });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to publish theme" }, 500);
  }
});

// ─── MERCHANT THEME MARKETPLACE & CUSTOMIZER ────────────────

/**
 * GET /merchant/themes/marketplace
 * Returns all published themes available in the marketplace.
 */
app.get("/merchant/themes/marketplace", async (c) => {
  try {
    const db = getControlDb(c.env);
    const rows = await db.prepare("SELECT * FROM marketplace_themes WHERE status = 'published' ORDER BY createdAt DESC").all<any>();
    const themes = rows.results.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      version: r.version,
      authorName: r.authorName,
      category: r.category,
      description: r.description,
      price: r.price,
      currency: r.currency,
      rating: r.rating,
      downloadsCount: r.downloadsCount,
      manifest: JSON.parse(r.manifestJson),
    }));

    return c.json(themes);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to load marketplace themes" }, 500);
  }
});

/**
 * POST /merchant/themes/install
 * Installs a theme for a merchant tenant.
 */
app.post("/merchant/themes/install", async (c) => {
  try {
    const db = getControlDb(c.env);
    const body = await c.req.json();
    const { tenantId, themeId, active } = body;

    if (!tenantId || !themeId) {
      return c.json({ error: "Missing required fields tenantId or themeId" }, 400);
    }

    const theme = await db.prepare("SELECT * FROM marketplace_themes WHERE id = ?").bind(themeId).first<any>();
    if (!theme) {
      return c.json({ error: "Theme not found in Marketplace" }, 404);
    }

    const installationId = `inst_${tenantId}_${themeId}`;
    const now = new Date().toISOString();

    if (active) {
      // Deactivate current active theme
      await db.prepare("UPDATE merchant_theme_installations SET active = 0 WHERE tenantId = ?").bind(tenantId).run();
    }

    await db
      .prepare(
        `INSERT INTO merchant_theme_installations (id, tenantId, themeId, installedVersion, active, customSettingsJson, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           installedVersion = excluded.installedVersion,
           active = excluded.active,
           updatedAt = excluded.updatedAt`
      )
      .bind(installationId, tenantId, themeId, theme.version, active ? 1 : 0, theme.manifestJson, now)
      .run();

    return c.json({ success: true, installationId, active: !!active });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to install theme" }, 500);
  }
});

export default app;
