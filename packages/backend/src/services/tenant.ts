import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

export interface TenantDetails {
  tenantId: string;
  storeName: string;
  subdomain: string;
  plan?: string;
  status?: string;
  razorpayKeyId?: string;
  razorpaySecret?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  createdAt: string;
}

/**
 * Resolves a store tenant by its subdomain using GSI1.
 */
export async function getTenantBySubdomain(
  subdomain: string
): Promise<TenantDetails | null> {
  try {
    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk",
        ExpressionAttributeValues: {
          ":gsi1pk": `SUBDOMAIN#${subdomain.toLowerCase()}`,
          ":gsi1sk": "METADATA",
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];
    const pk = item.PK as string;
    const tenantId = pk.replace("TENANT#", "");

    return {
      tenantId,
      storeName: item.storeName,
      subdomain: item.subdomain,
      plan: item.plan,
      status: item.status,
      razorpayKeyId: item.razorpayKeyId,
      razorpaySecret: item.razorpaySecret,
      branding: item.branding,
      createdAt: item.createdAt,
    };
  } catch (error) {
    console.error("Error looking up tenant by subdomain:", error);
    return null;
  }
}
