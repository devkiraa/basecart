import { Hono } from "hono";
import { cors } from "hono/cors";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getStorageClient, getBucketName } from "./lib/storage";
import { getControlDb } from "./lib/db";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import ordersRouter from "./routes/orders";
import discountsRouter from "./routes/discounts";
import storeRouter from "./routes/store";
import customersRouter from "./routes/customers";
import dashboardRouter from "./routes/dashboard";
import adminRouter from "./routes/admin";
import storefrontDesignRouter from "./routes/storefront-design";
import reviewsRouter from "./routes/reviews";
import storefrontApiRouter from "./routes/storefront_api";
import themeManagerRouter from "./routes/theme_manager";

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
  const app = new Hono<{ Bindings: any; Variables: any }>();

  // Register CORS
  app.use(
    "*",
    cors({
      origin: (origin, c) => {
        if (!origin) return null;
        
        // Always allow localhost/127.0.0.1 in local dev/test environments
        if (c.env && (c.env.NODE_ENV === "development" || c.env.NODE_ENV === "test")) {
          if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
            return origin;
          }
        }

        const allowedOriginsStr = (c.env && c.env.ALLOWED_ORIGINS) || "https://basecart.app,https://admin.basecart.app,https://*.basecart.app";
        const allowedOrigins = allowedOriginsStr.split(",").map((o: string) => o.trim());

        if (isOriginAllowed(origin, allowedOrigins)) {
          return origin;
        }

        return null;
      },
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposeHeaders: ["Set-Cookie"],
      credentials: true,
      maxAge: 86400,
    })
  );

  // Global Robots header to prevent API route indexing
  app.use("*", async (c, next) => {
    c.header("X-Robots-Tag", "noindex, nofollow");
    await next();
  });

  // Global Rate Limiter Middleware
  app.use("*", async (c, next) => {
    if (c.env && (c.env as any).API_RATE_LIMITER) {
      const ip = c.req.header("cf-connecting-ip") || "unknown";
      try {
        const { success } = await (c.env as any).API_RATE_LIMITER.limit({ key: ip });
        if (!success) {
          return c.json(
            {
              error: "Too Many Requests",
              message: "Rate limit exceeded. Please try again later.",
            },
            429
          );
        }
      } catch (err) {
        console.error("Rate limiter error:", err);
      }
    }
    await next();
  });

  // Global Error Handler
  app.onError((err, c) => {
    console.error("Hono error handler caught error:", err);
    
    const statusCode = (err as any).statusCode || (err as any).status || 500;
    const isProduction = c.env && c.env.NODE_ENV === "production";
    const msg = isProduction
      ? "An unexpected error occurred"
      : (err.message || "An unexpected error occurred");

    return c.json(
      {
        error: statusCode === 500 ? "Internal Server Error" : "Bad Request",
        message: msg,
      },
      statusCode
    );
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

  // Local media proxy route (Step 2)
  app.get("/media/*", async (c) => {
    const key = c.req.path.replace(/^\/media\//, "");
    if (!key) return c.text("Not Found", 404);

    // Prevent path traversal attacks
    if (key.includes("..") || key.includes("%2e%2e") || key.includes("%2E%2E")) {
      return c.text("Not Found", 404);
    }

    const bucketName = getBucketName(c.env);
    const storageClient = getStorageClient(c.env);

    try {
      const response = await storageClient.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );

      const contentType = response.ContentType || "application/octet-stream";
      
      if (response.Body) {
        const bodyBytes = await response.Body.transformToByteArray();
        return c.body(bodyBytes as any, 200, {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000",
        });
      }
      return c.text("Not Found", 404);
    } catch (err: any) {
      console.error(`Failed to serve media object ${key}:`, err);
      return c.text("Not Found", 404);
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

  // Mount Storefront Design Router
  app.route("/", storefrontDesignRouter);

  // Mount Reviews Router
  app.route("/", reviewsRouter);

  // Mount Storefront SDK API Router
  app.route("/api/storefront", storefrontApiRouter);

  // Mount Theme Manager Router
  app.route("/", themeManagerRouter);

  return app;
}
