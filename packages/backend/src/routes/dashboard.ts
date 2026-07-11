import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authenticateMerchant } from "../middleware/auth";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

export async function dashboardRoutes(fastify: FastifyInstance) {
  /**
   * GET /dashboard/summary
   * Provides sales metrics: total revenue, order count, and last 7 days breakdown
   */
  fastify.get(
    "/dashboard/summary",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // 1. Fetch all orders for this tenant
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );

      const orders = result.Items || [];

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

      return reply.send({
        totalRevenue,
        totalOrders: totalOrdersCount,
        paidOrders: paidOrdersCount,
        last7Days,
      });
    }
  );
}
