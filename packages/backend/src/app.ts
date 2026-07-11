import fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth";
import { storeRoutes } from "./routes/store";
import { orderRoutes } from "./routes/orders";
import { discountRoutes } from "./routes/discounts";
import { dashboardRoutes } from "./routes/dashboard";
import { adminRoutes } from "./routes/admin";
import { customerRoutes } from "./routes/customers";

// Note: Ensure we import the correct file names (productRoutes is in product.ts or products.ts)
// Wait! We named the file "products.ts" earlier. Let's make sure we import from "./routes/products".
import { productRoutes as prodRoutes } from "./routes/products";

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
  });

  // Register cookie support for session storage
  app.register(cookie, {
    secret: "basecart-cookie-secret-key-12345",
  });

  // Protect authentication paths with strict rate limits (brute force protection)
  app.register(rateLimit, {
    max: 100,
    timeWindow: "5 minutes",
  });

  // Explicit CORS Lock: Allow only localhost and basecart.io subdomains
  app.register(cors, {
    origin: (origin, cb) => {
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".basecart.io")
      ) {
        cb(null, true);
        return;
      }
      cb(new Error("CORS Blocked: Origin not authorized by Basecart"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Global Error Handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.statusCode) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    return reply.status(500).send({
      error: "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  });

  // Register Routes
  app.register(authRoutes);
  app.register(storeRoutes);
  app.register(prodRoutes);
  app.register(orderRoutes);
  app.register(discountRoutes);
  app.register(dashboardRoutes);
  app.register(adminRoutes);
  app.register(customerRoutes);

  // Health check
  app.get("/health", async () => {
    return { status: "healthy", timestamp: new Date().toISOString() };
  });

  return app;
}
