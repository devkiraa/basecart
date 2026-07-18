import { Hono } from "hono";
import { getControlDb, getTenantDb } from "../lib/db";
import { resolveStorefrontTenant, authenticateCustomer } from "../middleware/auth";

const app = new Hono<{ Bindings: any; Variables: any }>();

/**
 * GET /store/:subdomain/products/:productId/reviews
 * Public: List reviews for a product
 */
app.get("/store/:subdomain/products/:productId/reviews", resolveStorefrontTenant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("productId");
  const tenantDb = await getTenantDb(tenantId, c.env);

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const offset = (page - 1) * limit;

  // Get total count
  const countRow = await tenantDb
    .prepare("SELECT COUNT(*) as total FROM product_reviews WHERE productId = ?")
    .bind(productId)
    .first<{ total: number }>();

  const total = countRow?.total || 0;

  // Get reviews
  const result = await tenantDb
    .prepare("SELECT * FROM product_reviews WHERE productId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?")
    .bind(productId, limit, offset)
    .all();

  // Get aggregate rating
  const aggRow = await tenantDb
    .prepare("SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM product_reviews WHERE productId = ?")
    .bind(productId)
    .first<{ avgRating: number; reviewCount: number }>();

  return c.json({
    reviews: result.results || [],
    aggregateRating: {
      ratingValue: aggRow?.avgRating ? Number(aggRow.avgRating.toFixed(1)) : null,
      reviewCount: aggRow?.reviewCount || 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /store/:subdomain/products/:productId/reviews
 * Authenticated: Submit a review for a product
 */
app.post("/store/:subdomain/products/:productId/reviews", resolveStorefrontTenant, authenticateCustomer, async (c) => {
  const tenantId = c.get("tenantId")!;
  const productId = c.req.param("productId");
  const user = c.get("user")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const body = await c.req.json().catch(() => ({}));
  const { rating, title, comment } = body;

  // Validate rating
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return c.json({ error: "Rating must be a number between 1 and 5" }, 400);
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
    return c.json({ error: "Comment must be at least 5 characters" }, 400);
  }

  // Check if customer has already reviewed this product
  const existingReview = await tenantDb
    .prepare("SELECT reviewId FROM product_reviews WHERE productId = ? AND customerId = ?")
    .bind(productId, user.userId)
    .first();

  if (existingReview) {
    return c.json({ error: "You have already reviewed this product" }, 400);
  }

  // Check if customer has purchased this product (verified buyer)
  const orderItem = await tenantDb
    .prepare("SELECT oi.itemId FROM order_items oi JOIN orders o ON oi.orderId = o.orderId WHERE oi.productId = ? AND o.customerId = ? AND o.status IN ('paid', 'shipped', 'delivered')")
    .bind(productId, user.userId)
    .first();

  const reviewId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await tenantDb
    .prepare(
      "INSERT INTO product_reviews (reviewId, productId, customerId, customerName, rating, title, comment, verified, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      reviewId,
      productId,
      user.userId,
      user.email?.split("@")[0] || "Customer",
      rating,
      title || null,
      comment.trim(),
      orderItem ? 1 : 0,
      createdAt
    )
    .run();

  return c.json({
    success: true,
    reviewId,
    message: "Review submitted successfully",
  }, 201);
});

/**
 * DELETE /store/:subdomain/products/:productId/reviews/:reviewId
 * Authenticated: Delete own review
 */
app.delete("/store/:subdomain/products/:productId/reviews/:reviewId", resolveStorefrontTenant, authenticateCustomer, async (c) => {
  const tenantId = c.get("tenantId")!;
  const reviewId = c.req.param("reviewId");
  const user = c.get("user")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  const review = await tenantDb
    .prepare("SELECT * FROM product_reviews WHERE reviewId = ? AND customerId = ?")
    .bind(reviewId, user.userId)
    .first();

  if (!review) {
    return c.json({ error: "Review not found or not authorized to delete" }, 404);
  }

  await tenantDb
    .prepare("DELETE FROM product_reviews WHERE reviewId = ?")
    .bind(reviewId)
    .run();

  return c.json({ success: true, message: "Review deleted successfully" });
});

export default app;
