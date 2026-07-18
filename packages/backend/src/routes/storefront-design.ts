import { Hono } from "hono";
import { getControlDb } from "../lib/db";
import { authenticateAdmin } from "./admin";
import { authenticateCustomer, resolveStorefrontTenant } from "../middleware/auth";

const app = new Hono<{ Bindings: any; Variables: any }>();

const DEFAULT_DESIGN = {
  defaultTemplate: "Aura",
  defaultPrimaryColor: "#4F46E5",
  defaultAccentColor: "#1D4ED8",
  defaultFontFamily: "sans",
  defaultButtonRadius: "8px",
  announcementBarEnabled: true,
  announcementBarText: "Welcome to our store!",
  stickyHeaderEnabled: true,
  customerDesignEnabled: false,
  customerAllowColors: true,
  customerAllowFonts: true,
  customerAllowLayout: true,
  customerAllowAnnouncement: true,
};

async function ensureDesignTables(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS storefront_design_defaults (
        id TEXT PRIMARY KEY DEFAULT 'platform',
        defaultTemplate TEXT DEFAULT 'Aura',
        defaultPrimaryColor TEXT DEFAULT '#4F46E5',
        defaultAccentColor TEXT DEFAULT '#1D4ED8',
        defaultFontFamily TEXT DEFAULT 'sans',
        defaultButtonRadius TEXT DEFAULT '8px',
        announcementBarEnabled INTEGER DEFAULT 1,
        announcementBarText TEXT DEFAULT 'Welcome to our store!',
        stickyHeaderEnabled INTEGER DEFAULT 1,
        customerDesignEnabled INTEGER DEFAULT 0,
        customerAllowColors INTEGER DEFAULT 1,
        customerAllowFonts INTEGER DEFAULT 1,
        customerAllowLayout INTEGER DEFAULT 1,
        customerAllowAnnouncement INTEGER DEFAULT 1,
        updatedAt TEXT
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS merchant_design_settings (
        tenantId TEXT PRIMARY KEY,
        designCustomizationEnabled INTEGER DEFAULT 1,
        overrideTemplate TEXT,
        customOverrides TEXT,
        updatedAt TEXT
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS customer_design_preferences (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL,
        customerId TEXT NOT NULL,
        settings TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT
      )`
    )
    .run();
}

// ─── Platform Defaults ───────────────────────────────────────

/**
 * GET /admin/storefront-design
 * Returns platform-wide storefront design defaults.
 */
app.get("/admin/storefront-design", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    await ensureDesignTables(db);

    const row = await db
      .prepare("SELECT * FROM storefront_design_defaults WHERE id = 'platform'")
      .first<any>();

    if (!row) {
      return c.json({
        id: "platform",
        ...DEFAULT_DESIGN,
        updatedAt: null,
      });
    }

    return c.json({
      id: row.id,
      defaultTemplate: row.defaultTemplate,
      defaultPrimaryColor: row.defaultPrimaryColor,
      defaultAccentColor: row.defaultAccentColor,
      defaultFontFamily: row.defaultFontFamily,
      defaultButtonRadius: row.defaultButtonRadius,
      announcementBarEnabled: row.announcementBarEnabled === 1,
      announcementBarText: row.announcementBarText,
      stickyHeaderEnabled: row.stickyHeaderEnabled === 1,
      customerDesignEnabled: row.customerDesignEnabled === 1,
      customerAllowColors: row.customerAllowColors === 1,
      customerAllowFonts: row.customerAllowFonts === 1,
      customerAllowLayout: row.customerAllowLayout === 1,
      customerAllowAnnouncement: row.customerAllowAnnouncement === 1,
      updatedAt: row.updatedAt,
    });
  } catch (error: any) {
    return c.json(
      { error: "Internal Server Error", message: error.message },
      500
    );
  }
});

/**
 * PUT /admin/storefront-design
 * Updates platform-wide storefront design defaults.
 */
app.put("/admin/storefront-design", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    await ensureDesignTables(db);

    const body = await c.req.json().catch(() => ({}));
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO storefront_design_defaults (
          id, defaultTemplate, defaultPrimaryColor, defaultAccentColor,
          defaultFontFamily, defaultButtonRadius, announcementBarEnabled,
          announcementBarText, stickyHeaderEnabled, customerDesignEnabled,
          customerAllowColors, customerAllowFonts, customerAllowLayout,
          customerAllowAnnouncement, updatedAt
        ) VALUES (
          'platform', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          defaultTemplate = excluded.defaultTemplate,
          defaultPrimaryColor = excluded.defaultPrimaryColor,
          defaultAccentColor = excluded.defaultAccentColor,
          defaultFontFamily = excluded.defaultFontFamily,
          defaultButtonRadius = excluded.defaultButtonRadius,
          announcementBarEnabled = excluded.announcementBarEnabled,
          announcementBarText = excluded.announcementBarText,
          stickyHeaderEnabled = excluded.stickyHeaderEnabled,
          customerDesignEnabled = excluded.customerDesignEnabled,
          customerAllowColors = excluded.customerAllowColors,
          customerAllowFonts = excluded.customerAllowFonts,
          customerAllowLayout = excluded.customerAllowLayout,
          customerAllowAnnouncement = excluded.customerAllowAnnouncement,
          updatedAt = excluded.updatedAt`
      )
      .bind(
        body.defaultTemplate ?? DEFAULT_DESIGN.defaultTemplate,
        body.defaultPrimaryColor ?? DEFAULT_DESIGN.defaultPrimaryColor,
        body.defaultAccentColor ?? DEFAULT_DESIGN.defaultAccentColor,
        body.defaultFontFamily ?? DEFAULT_DESIGN.defaultFontFamily,
        body.defaultButtonRadius ?? DEFAULT_DESIGN.defaultButtonRadius,
        body.announcementBarEnabled !== undefined
          ? body.announcementBarEnabled
            ? 1
            : 0
          : DEFAULT_DESIGN.announcementBarEnabled
            ? 1
            : 0,
        body.announcementBarText ?? DEFAULT_DESIGN.announcementBarText,
        body.stickyHeaderEnabled !== undefined
          ? body.stickyHeaderEnabled
            ? 1
            : 0
          : DEFAULT_DESIGN.stickyHeaderEnabled
            ? 1
            : 0,
        body.customerDesignEnabled !== undefined
          ? body.customerDesignEnabled
            ? 1
            : 0
          : DEFAULT_DESIGN.customerDesignEnabled
            ? 1
            : 0,
        body.customerAllowColors !== undefined
          ? body.customerAllowColors
            ? 1
            : 0
          : DEFAULT_DESIGN.customerAllowColors
            ? 1
            : 0,
        body.customerAllowFonts !== undefined
          ? body.customerAllowFonts
            ? 1
            : 0
          : DEFAULT_DESIGN.customerAllowFonts
            ? 1
            : 0,
        body.customerAllowLayout !== undefined
          ? body.customerAllowLayout
            ? 1
            : 0
          : DEFAULT_DESIGN.customerAllowLayout
            ? 1
            : 0,
        body.customerAllowAnnouncement !== undefined
          ? body.customerAllowAnnouncement
            ? 1
            : 0
          : DEFAULT_DESIGN.customerAllowAnnouncement
            ? 1
            : 0,
        now
      )
      .run();

    return c.json({ success: true, updatedAt: now });
  } catch (error: any) {
    return c.json(
      { error: "Internal Server Error", message: error.message },
      500
    );
  }
});

// ─── Merchant Design Management ──────────────────────────────

/**
 * GET /admin/storefront-design/merchants
 * Returns all merchants with their current design settings.
 */
app.get("/admin/storefront-design/merchants", authenticateAdmin, async (c) => {
  try {
    const db = getControlDb(c.env);
    await ensureDesignTables(db);

    const result = await db
      .prepare(
        `SELECT
          t.tenantId,
          t.storeName,
          t.subdomain,
          t.plan,
          m.designCustomizationEnabled,
          m.overrideTemplate,
          m.customOverrides
        FROM tenants t
        LEFT JOIN merchant_design_settings m ON t.tenantId = m.tenantId
        ORDER BY t.storeName ASC`
      )
      .all<any>();

    const merchants = (result.results || []).map((row: any) => ({
      tenantId: row.tenantId,
      storeName: row.storeName,
      subdomain: row.subdomain,
      plan: row.plan,
      currentTemplate: row.overrideTemplate || null,
      designCustomizationEnabled: row.designCustomizationEnabled === 1,
      customOverrides: row.customOverrides
        ? typeof row.customOverrides === "string"
          ? JSON.parse(row.customOverrides)
          : row.customOverrides
        : null,
    }));

    return c.json(merchants);
  } catch (error: any) {
    return c.json(
      { error: "Internal Server Error", message: error.message },
      500
    );
  }
});

/**
 * PATCH /admin/storefront-design/merchants/:tenantId
 * Updates design settings for a specific merchant.
 */
app.patch(
  "/admin/storefront-design/merchants/:tenantId",
  authenticateAdmin,
  async (c) => {
    try {
      const tenantId = c.req.param("tenantId");
      const db = getControlDb(c.env);
      await ensureDesignTables(db);

      const body = await c.req.json().catch(() => ({}));
      const now = new Date().toISOString();

      // Verify tenant exists
      const tenant = await db
        .prepare("SELECT tenantId FROM tenants WHERE tenantId = ?")
        .bind(tenantId)
        .first<any>();

      if (!tenant) {
        return c.json({ error: "Merchant not found" }, 404);
      }

      const {
        designCustomizationEnabled,
        overrideTemplate,
        resetToDefaults,
      } = body;

      if (resetToDefaults) {
        // Delete merchant overrides entirely, reverting to platform defaults
        await db
          .prepare("DELETE FROM merchant_design_settings WHERE tenantId = ?")
          .bind(tenantId)
          .run();
      } else {
        await db
          .prepare(
            `INSERT INTO merchant_design_settings (tenantId, designCustomizationEnabled, overrideTemplate, customOverrides, updatedAt)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(tenantId) DO UPDATE SET
              designCustomizationEnabled = excluded.designCustomizationEnabled,
              overrideTemplate = excluded.overrideTemplate,
              customOverrides = excluded.customOverrides,
              updatedAt = excluded.updatedAt`
          )
          .bind(
            tenantId,
            designCustomizationEnabled !== undefined
              ? designCustomizationEnabled
                ? 1
                : 0
              : 1,
            overrideTemplate ?? null,
            body.customOverrides
              ? JSON.stringify(body.customOverrides)
              : null,
            now
          )
          .run();
      }

      return c.json({ success: true, tenantId });
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

// ─── Public Storefront Design Settings ───────────────────────

/**
 * GET /store/:subdomain/design-settings
 * Returns the effective design settings for a storefront.
 * Combines: platform defaults + merchant overrides + customer customizations.
 */
app.get(
  "/store/:subdomain/design-settings",
  resolveStorefrontTenant,
  async (c) => {
    try {
      const tenantId = c.get("tenantId")!;
      const db = getControlDb(c.env);
      await ensureDesignTables(db);

      // 1. Platform defaults
      const defaultsRow = await db
        .prepare("SELECT * FROM storefront_design_defaults WHERE id = 'platform'")
        .first<any>();

      let settings: Record<string, any> = { ...DEFAULT_DESIGN };
      if (defaultsRow) {
        settings = {
          defaultTemplate: defaultsRow.defaultTemplate,
          defaultPrimaryColor: defaultsRow.defaultPrimaryColor,
          defaultAccentColor: defaultsRow.defaultAccentColor,
          defaultFontFamily: defaultsRow.defaultFontFamily,
          defaultButtonRadius: defaultsRow.defaultButtonRadius,
          announcementBarEnabled: defaultsRow.announcementBarEnabled === 1,
          announcementBarText: defaultsRow.announcementBarText,
          stickyHeaderEnabled: defaultsRow.stickyHeaderEnabled === 1,
          customerDesignEnabled: defaultsRow.customerDesignEnabled === 1,
          customerAllowColors: defaultsRow.customerAllowColors === 1,
          customerAllowFonts: defaultsRow.customerAllowFonts === 1,
          customerAllowLayout: defaultsRow.customerAllowLayout === 1,
          customerAllowAnnouncement: defaultsRow.customerAllowAnnouncement === 1,
        };
      }

      // 2. Merchant overrides
      const merchantRow = await db
        .prepare(
          "SELECT * FROM merchant_design_settings WHERE tenantId = ?"
        )
        .bind(tenantId)
        .first<any>();

      if (!merchantRow || merchantRow.designCustomizationEnabled === 0) {
        // No merchant customization — return platform defaults only
        return c.json({
          template: settings.defaultTemplate,
          primaryColor: settings.defaultPrimaryColor,
          accentColor: settings.defaultAccentColor,
          fontFamily: settings.defaultFontFamily,
          buttonRadius: settings.defaultButtonRadius,
          announcementBar: {
            enabled: settings.announcementBarEnabled,
            text: settings.announcementBarText,
          },
          stickyHeader: settings.stickyHeaderEnabled,
          customerDesignEnabled: settings.customerDesignEnabled,
          customerAllowColors: settings.customerAllowColors,
          customerAllowFonts: settings.customerAllowFonts,
          customerAllowLayout: settings.customerAllowLayout,
          customerAllowAnnouncement: settings.customerAllowAnnouncement,
          source: "platform",
        });
      }

      // Merchant has customization enabled — merge overrides
      let customOverrides: Record<string, any> = {};
      if (merchantRow.customOverrides) {
        try {
          customOverrides =
            typeof merchantRow.customOverrides === "string"
              ? JSON.parse(merchantRow.customOverrides)
              : merchantRow.customOverrides;
        } catch {
          customOverrides = {};
        }
      }

      const effective: Record<string, any> = {
        template: merchantRow.overrideTemplate || settings.defaultTemplate,
        primaryColor:
          customOverrides.primaryColor || settings.defaultPrimaryColor,
        accentColor:
          customOverrides.accentColor || settings.defaultAccentColor,
        fontFamily:
          customOverrides.fontFamily || settings.defaultFontFamily,
        buttonRadius:
          customOverrides.buttonRadius || settings.defaultButtonRadius,
        announcementBar: {
          enabled:
            customOverrides.announcementBarEnabled !== undefined
              ? customOverrides.announcementBarEnabled
              : settings.announcementBarEnabled,
          text:
            customOverrides.announcementBarText ||
            settings.announcementBarText,
        },
        stickyHeader:
          customOverrides.stickyHeaderEnabled !== undefined
            ? customOverrides.stickyHeaderEnabled
            : settings.stickyHeaderEnabled,
        customerDesignEnabled: settings.customerDesignEnabled,
        customerAllowColors: settings.customerAllowColors,
        customerAllowFonts: settings.customerAllowFonts,
        customerAllowLayout: settings.customerAllowLayout,
        customerAllowAnnouncement: settings.customerAllowAnnouncement,
        source: "merchant",
      };

      return c.json(effective);
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

/**
 * PATCH /store/:subdomain/design-settings
 * Saves customer design customizations (if enabled by admin).
 */
app.patch(
  "/store/:subdomain/design-settings",
  resolveStorefrontTenant,
  async (c) => {
    try {
      const tenantId = c.get("tenantId")!;
      const db = getControlDb(c.env);
      await ensureDesignTables(db);

      // Check if customer design is enabled platform-wide
      const defaultsRow = await db
        .prepare("SELECT customerDesignEnabled FROM storefront_design_defaults WHERE id = 'platform'")
        .first<any>();

      const customerDesignEnabled =
        defaultsRow?.customerDesignEnabled === 1 || !defaultsRow;

      if (!customerDesignEnabled) {
        return c.json(
          {
            error: "Forbidden",
            message: "Customer design customizations are not enabled",
          },
          403
        );
      }

      // Verify merchant has customization enabled
      const merchantRow = await db
        .prepare(
          "SELECT designCustomizationEnabled FROM merchant_design_settings WHERE tenantId = ?"
        )
        .bind(tenantId)
        .first<any>();

      if (merchantRow && merchantRow.designCustomizationEnabled === 0) {
        return c.json(
          {
            error: "Forbidden",
            message: "This store does not allow design customizations",
          },
          403
        );
      }

      const body = await c.req.json().catch(() => ({}));
      const { settings: customerSettings, customerId } = body;

      if (!customerSettings || typeof customerSettings !== "object") {
        return c.json(
          { error: "Bad Request", message: "settings object is required" },
          400
        );
      }

      if (!customerId) {
        return c.json(
          { error: "Bad Request", message: "customerId is required" },
          400
        );
      }

      // Validate allowed customization types against platform defaults
      const allowColors =
        defaultsRow?.customerAllowColors !== undefined
          ? defaultsRow.customerAllowColors === 1
          : true;
      const allowFonts =
        defaultsRow?.customerAllowFonts !== undefined
          ? defaultsRow.customerAllowFonts === 1
          : true;
      const allowLayout =
        defaultsRow?.customerAllowLayout !== undefined
          ? defaultsRow.customerAllowLayout === 1
          : true;
      const allowAnnouncement =
        defaultsRow?.customerAllowAnnouncement !== undefined
          ? defaultsRow.customerAllowAnnouncement === 1
          : true;

      const validatedSettings: Record<string, any> = {};

      if (allowColors) {
        if (customerSettings.primaryColor)
          validatedSettings.primaryColor = customerSettings.primaryColor;
        if (customerSettings.accentColor)
          validatedSettings.accentColor = customerSettings.accentColor;
      }
      if (allowFonts) {
        if (customerSettings.fontFamily)
          validatedSettings.fontFamily = customerSettings.fontFamily;
      }
      if (allowLayout) {
        if (customerSettings.buttonRadius)
          validatedSettings.buttonRadius = customerSettings.buttonRadius;
        if (customerSettings.stickyHeader !== undefined)
          validatedSettings.stickyHeader = customerSettings.stickyHeader;
      }
      if (allowAnnouncement) {
        if (customerSettings.announcementBar)
          validatedSettings.announcementBar =
            customerSettings.announcementBar;
      }

      const id = `cdp_${tenantId}_${customerId}`;
      const now = new Date().toISOString();

      await db
        .prepare(
          `INSERT INTO customer_design_preferences (id, tenantId, customerId, settings, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            settings = excluded.settings,
            updatedAt = excluded.updatedAt`
        )
        .bind(
          id,
          tenantId,
          customerId,
          JSON.stringify(validatedSettings),
          now,
          now
        )
        .run();

      return c.json({
        success: true,
        settings: validatedSettings,
        updatedAt: now,
      });
    } catch (error: any) {
      return c.json(
        { error: "Internal Server Error", message: error.message },
        500
      );
    }
  }
);

export default app;
