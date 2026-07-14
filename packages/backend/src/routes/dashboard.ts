import { Hono } from "hono";
import { getTenantDb } from "../lib/db";
import { authenticateMerchant } from "../middleware/auth";

const app = new Hono();

/**
 * GET /dashboard/summary
 * Provides sales metrics: total revenue, order count, and last 7 days breakdown
 */
app.get("/dashboard/summary", authenticateMerchant, async (c) => {
  const tenantId = c.get("tenantId")!;
  const tenantDb = await getTenantDb(tenantId, c.env);

  // Fetch all orders for this tenant
  const result = await tenantDb.prepare("SELECT * FROM orders").all();
  const orders = result.results || [];

  // Calculate totals
  let totalRevenue = 0;
  let paidOrdersCount = 0;
  const totalOrdersCount = orders.length;

  // Initialize the last 7 days map
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
    dailyMap[dateStr] = { revenue: 0, orders: 0 };
  }

  for (const order of orders) {
    const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
    if (isPaid) {
      totalRevenue += order.total || 0;
      paidOrdersCount++;
    }

    // Add to daily metrics if in range
    const orderDateStr = order.createdAt.split("T")[0];
    if (dailyMap[orderDateStr] !== undefined) {
      dailyMap[orderDateStr].orders++;
      if (isPaid) {
        dailyMap[orderDateStr].revenue += order.total || 0;
      }
    }
  }

  // Format last 7 days chart data
  const last7Days = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  return c.json({
    totalRevenue,
    totalOrders: totalOrdersCount,
    paidOrders: paidOrdersCount,
    last7Days,
  });
});

export default app;
