import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import { authenticateMerchant } from "../middleware/auth";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

export async function customerRoutes(fastify: FastifyInstance) {
  /**
   * GET /customers
   * Retrieve all unique customers (registered and guest checkouts) with aggregated metrics
   */
  fastify.get(
    "/customers",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;

      // 1. Fetch all customer accounts
      const customersRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "CUSTOMER#",
          },
        })
      );
      const registeredCustomers = customersRes.Items || [];

      // 2. Fetch all orders to compute transaction totals
      const ordersRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );
      const orders = ordersRes.Items || [];

      // Map to track unique customers by email
      const customerMap = new Map<string, any>();

      // Initialize with registered customers
      for (const rc of registeredCustomers) {
        customerMap.set(rc.email.toLowerCase(), {
          customerId: rc.customerId,
          name: rc.name,
          email: rc.email.toLowerCase(),
          registered: true,
          totalOrders: 0,
          totalSpend: 0,
          lastOrderDate: null as string | null,
        });
      }

      // Aggregate orders
      for (const order of orders) {
        const email = order.customerInfo?.email?.toLowerCase();
        if (!email) continue;

        let entry = customerMap.get(email);
        if (!entry) {
          entry = {
            customerId: order.customerId || "GUEST",
            name: order.customerInfo?.name || "Guest Customer",
            email,
            registered: false,
            totalOrders: 0,
            totalSpend: 0,
            lastOrderDate: null,
          };
          customerMap.set(email, entry);
        }

        entry.totalOrders++;
        
        // Include in spend if order is paid, shipped, or delivered
        const isPaid = ["paid", "shipped", "delivered"].includes(order.status);
        if (isPaid) {
          entry.totalSpend += order.total || 0;
        }

        // Keep track of the latest order date
        if (!entry.lastOrderDate || new Date(order.createdAt) > new Date(entry.lastOrderDate)) {
          entry.lastOrderDate = order.createdAt;
        }
      }

      return reply.send(Array.from(customerMap.values()));
    }
  );

  /**
   * GET /customers/:email/orders
   * Retrieve all orders placed by a specific email address
   */
  fastify.get(
    "/customers/:email/orders",
    { preHandler: [authenticateMerchant] },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const tenantId = req.tenantId!;
      const { email } = req.params as any;

      if (!email) {
        return reply.status(400).send({ error: "Customer email is required" });
      }

      const lowerEmail = email.toLowerCase();

      // Fetch all orders for this tenant and filter in-memory
      const ordersRes = await ddbDocClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          ExpressionAttributeValues: {
            ":pk": `TENANT#${tenantId}`,
            ":sk": "ORDER#",
          },
        })
      );
      const allOrders = ordersRes.Items || [];
      const customerOrders = allOrders.filter(
        (o) => o.customerInfo?.email?.toLowerCase() === lowerEmail
      );

      return reply.send(customerOrders);
    }
  );
}
