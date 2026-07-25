import { Hono } from "hono";
import { getControlDb } from "../lib/db";
import { authenticateAdmin } from "./admin";
import { authenticateMerchant } from "../middleware/auth";
import { ThemeLinter, ThemeUploadPipeline } from "@basecart/theme-engine";

const app = new Hono<{ Bindings: any; Variables: any }>();

// Enforce authentication on all merchant theme marketplace routes (B2 requirement)
app.use("/merchant/themes/*", authenticateMerchant);

// ─── ADMIN THEME MARKETPLACE MANAGEMENT ─────────────────────

/**
 * GET /admin/themes
 * List all registered marketplace themes with search, category, and status filtering.
 */
app.get("/admin/themes", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    const category = c.req.query("category");
    const q = c.req.query("q");

    let sql = "SELECT * FROM themes WHERE deleted_at IS NULL";
    const params: any[] = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (q) {
      sql += " AND (name LIKE ? OR description LIKE ? OR slug LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await db.prepare(sql).bind(...params).all<any>();
    return c.json(rows.results || []);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to fetch themes" }, 500);
  }
});

/**
 * POST /admin/themes/upload
 * Automated Theme Upload & Lint Pipeline.
 */
app.post("/admin/themes/upload", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    const body = await c.req.json();
    const files = body.files || [];

    const result = ThemeUploadPipeline.processThemePackage(files);
    if (!result.success || !result.dbRecord) {
      return c.json({ success: false, errors: result.errors, warnings: result.warnings }, 400);
    }

    const r = result.dbRecord;
    await db
      .prepare(
        `INSERT INTO themes (id, slug, name, description, category, price, currency, folder_name, preview, thumbnail, featured, published, downloads, purchases, rating, active_stores, current_version, minimum_version, maximum_version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 5.0, 0, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           version = excluded.current_version,
           name = excluded.name,
           description = excluded.description,
           updated_at = excluded.updated_at`
      )
      .bind(
        r.id,
        r.slug,
        r.name,
        r.description,
        r.category,
        r.price,
        r.currency,
        r.folder_name,
        r.preview,
        r.thumbnail,
        r.featured,
        r.published,
        r.current_version,
        r.minimum_version,
        r.maximum_version,
        r.created_at,
        r.updated_at
      )
      .run();

    // Register Version Record
    const versionId = `ver_${r.id}_${r.current_version}`;
    await db
      .prepare(
        `INSERT INTO theme_versions (id, theme_id, version, release_notes, folder, published, created_at)
         VALUES (?, ?, ?, 'Initial Release', ?, 1, ?)
         ON CONFLICT(id) DO NOTHING`
      )
      .bind(versionId, r.id, r.current_version, r.folder_name, r.created_at)
      .run();

    return c.json({ success: true, themeId: r.id, version: r.current_version, warnings: result.warnings });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to process theme package upload" }, 500);
  }
});

/**
 * POST /admin/themes/:id/feature
 */
app.post("/admin/themes/:id/feature", authenticateAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const db = getControlDb(c.env);
    const body = await c.req.json().catch(() => ({}));
    const featured = body.featured !== undefined ? (body.featured ? 1 : 0) : 1;

    await db.prepare("UPDATE themes SET featured = ?, updated_at = ? WHERE id = ?").bind(featured, new Date().toISOString(), id).run();
    return c.json({ success: true, themeId: id, featured: !!featured });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to toggle feature status" }, 500);
  }
});

/**
 * GET /admin/themes/analytics
 */
app.get("/admin/themes/analytics", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    const totalThemes = await db.prepare("SELECT COUNT(*) as count FROM themes WHERE deleted_at IS NULL").first<any>();
    const totalPurchases = await db.prepare("SELECT COUNT(*) as count FROM merchant_themes").first<any>();
    const activeInstallations = await db.prepare("SELECT COUNT(*) as count FROM merchant_themes WHERE activated = 1").first<any>();

    return c.json({
      totalThemes: totalThemes?.count || 0,
      totalPurchases: totalPurchases?.count || 0,
      activeInstallations: activeInstallations?.count || 0,
      totalRevenueUSD: (totalPurchases?.count || 0) * 49,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to load theme analytics" }, 500);
  }
});

// ─── MERCHANT THEME MARKETPLACE & LIBRARY ───────────────────

/**
 * GET /merchant/themes/marketplace
 * Browse themes by Category, Search Query, & Price filters.
 */
app.get("/merchant/themes/marketplace", async (c) => {
  try {
    const db = getControlDb(c.env);
    const category = c.req.query("category");
    const q = c.req.query("q");
    const sort = c.req.query("sort");

    let sql = "SELECT * FROM themes WHERE published = 1 AND deleted_at IS NULL";
    const params: any[] = [];

    if (category && category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }
    if (q) {
      sql += " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (sort === "price-asc") sql += " ORDER BY price ASC";
    else if (sort === "price-desc") sql += " ORDER BY price DESC";
    else if (sort === "popular") sql += " ORDER BY downloads DESC";
    else sql += " ORDER BY featured DESC, created_at DESC";

    const rows = await db.prepare(sql).bind(...params).all<any>();

    // Fallback built-in themes if DB is empty
    if (!rows.results || rows.results.length === 0) {
      return c.json([
        {
          id: "satoshi",
          slug: "satoshi",
          name: "Satoshi",
          description: "Ultra-modern geometric layout with soft off-white product gallery frames, interactive size grids, and high-conversion sneaker storefront spotlight.",
          category: "Footwear & Fashion",
          price: 0,
          currency: "USD",
          preview: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80",
          thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
          featured: 1,
          rating: 5.0,
          downloads: 2450,
          current_version: "1.0.0",
        }
      ]);
    }

    return c.json(rows.results);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to fetch merchant marketplace" }, 500);
  }
});

/**
 * GET /merchant/themes/library
 * List all themes installed / owned by merchant.
 */
app.get("/merchant/themes/library", async (c) => {
  try {
    const merchantId = c.req.query("merchantId") || c.req.header("x-merchant-id") || "default";
    const db = getControlDb(c.env);

    const rows = await db
      .prepare(
        `SELECT m.*, t.name, t.slug, t.preview, t.thumbnail, t.category, t.price
         FROM merchant_themes m
         JOIN themes t ON m.theme_id = t.id
         WHERE m.merchant_id = ?
         ORDER BY m.activated DESC, m.installed_at DESC`
      )
      .bind(merchantId)
      .all<any>();

    return c.json(rows.results || []);
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to fetch merchant theme library" }, 500);
  }
});

/**
 * POST /merchant/themes/activate
 * Set theme active for tenant store.
 */
app.post("/merchant/themes/activate", async (c) => {
  try {
    const db = getControlDb(c.env);
    const body = await c.req.json();
    const { merchantId, themeId } = body;

    if (!merchantId || !themeId) {
      return c.json({ error: "Missing required fields merchantId or themeId" }, 400);
    }

    // 1. Deactivate all current themes for merchant
    await db.prepare("UPDATE merchant_themes SET activated = 0 WHERE merchant_id = ?").bind(merchantId).run();

    // 2. Activate target theme
    const now = new Date().toISOString();
    const result = await db
      .prepare("UPDATE merchant_themes SET activated = 1, updated_at = ? WHERE merchant_id = ? AND theme_id = ?")
      .bind(now, merchantId, themeId)
      .run();

    if (!result.success || result.meta?.changes === 0) {
      // Auto-install if not present in library
      const recordId = `mt_${merchantId}_${themeId}`;
      await db
        .prepare(
          `INSERT INTO merchant_themes (id, merchant_id, theme_id, theme_version, purchase_type, activated, installed_at, updated_at)
           VALUES (?, ?, ?, '1.0.0', 'free', 1, ?, ?)`
        )
        .bind(recordId, merchantId, themeId, now, now)
        .run();
    }

    return c.json({ success: true, merchantId, themeId, activated: true });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to activate theme" }, 500);
  }
});

/**
 * POST /merchant/themes/purchase
 * Create Razorpay Order for paid theme purchase.
 */
app.post("/merchant/themes/purchase", async (c) => {
  try {
    const db = getControlDb(c.env);
    const body = await c.req.json();
    const { merchantId, themeId } = body;

    const theme = await db.prepare("SELECT * FROM themes WHERE id = ?").bind(themeId).first<any>();
    const price = theme ? theme.price : 49;

    const now = new Date().toISOString();
    const recordId = `mt_${merchantId}_${themeId}`;

    if (price === 0) {
      // Free Theme instant license grant
      await db
        .prepare(
          `INSERT INTO merchant_themes (id, merchant_id, theme_id, theme_version, purchase_type, activated, installed_at, updated_at)
           VALUES (?, ?, ?, '1.0.0', 'free', 0, ?, ?)
           ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`
        )
        .bind(recordId, merchantId, themeId, now, now)
        .run();

      return c.json({ success: true, free: true, message: "Free theme added to your library." });
    }

    // Paid Theme Order payload
    const orderId = `order_theme_${Date.now()}`;
    return c.json({
      success: true,
      free: false,
      orderId,
      amount: price * 100, // paise
      currency: "INR",
      razorpayKeyId: c.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      themeId,
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to initiate theme purchase" }, 500);
  }
});

export default app;
