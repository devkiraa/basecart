import { Hono } from "hono";
import { cors } from "hono/cors";
import { getControlDb } from "./lib/db";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import discountsRouter from "./routes/discounts";
import storeRouter from "./routes/store";
import customersRouter from "./routes/customers";
import dashboardRouter from "./routes/dashboard";
import adminRouter from "./routes/admin";

let isDbMigrated = false;

function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.some((pattern) => {
    if (pattern === "*") return true;
    if (pattern.includes("*")) {
      const escaped = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, (m) => m === "*" ? "*" : "\\" + m);
      const regexPattern = new RegExp("^" + escaped.replace(/\*/g, "[a-zA-Z0-9-]+") + "$");
      return regexPattern.test(origin);
    }
    return pattern === origin;
  });
}

export function buildApp() {
  const app = new Hono();

  // Register CORS
  app.use(
    "*",
    cors({
      origin: (origin, c) => {
        if (!origin) return "";
        
        // Always allow localhost/127.0.0.1 in local dev/test environment
        if (c.env && (c.env.NODE_ENV === "development" || c.env.NODE_ENV === "test")) {
          if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return origin;
          }
        }

        const allowedOriginsStr = (c.env && c.env.ALLOWED_ORIGINS) || "https://dashboard.basecart.app,https://admin.basecart.app,https://*.basecart.store";
        const allowedOrigins = allowedOriginsStr.split(",").map((o) => o.trim());

        if (isOriginAllowed(origin, allowedOrigins)) {
          return origin;
        }

        return "";
      },
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );

  // Global Error Handler
  app.onError((err, c) => {
    console.error("Hono error handler caught error:", err);
    
    const statusCode = (err as any).statusCode || (err as any).status || 500;
    const msg = err.message || "An unexpected error occurred";

    return c.json(
      {
        error: statusCode === 500 ? "Internal Server Error" : "Bad Request",
        message: msg,
      },
      statusCode
    );
  });

  // Auto-migrate CONTROL_DB in development on startup (gated to run once in development)
  app.use("*", async (c, next) => {
    if (c.env && c.env.NODE_ENV === "development" && c.env.CONTROL_DB && !isDbMigrated) {
      try {
        const { controlSchema } = await import("./lib/control_schema");
        const { migrateDatabase } = await import("./lib/db");
        await migrateDatabase(c.env.CONTROL_DB, controlSchema);
        isDbMigrated = true;
      } catch (err) {
        console.error("Failed to auto-migrate CONTROL_DB:", err);
      }
    }
    await next();
  });

  // Health check
  app.get("/health", (c) => {
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Test DB connection endpoint (Part 1 verification)
  app.get("/test-db", async (c) => {
    try {
      const db = getControlDb(c.env);
      const row = await db.prepare("SELECT datetime('now') as now").first<{ now: string }>();
      return c.json({ status: "connected", database_time: row?.now });
    } catch (err: any) {
      return c.json({ status: "error", error: err.message }, 500);
    }
  });

  // Mount Auth Router
  app.route("/", authRouter);

  // Mount Products Router
  app.route("/", productsRouter);

  // Mount Orders Router
  app.route("/", ordersRouter);

  // Mount Discounts Router
  app.route("/", discountsRouter);

  // Mount Store Router
  app.route("/", storeRouter);

  // Mount Customers Router
  app.route("/", customersRouter);

  // Mount Dashboard Router
  app.route("/", dashboardRouter);

  // Mount Admin Router
  app.route("/", adminRouter);

  return app;
}
