import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

async function run() {
  console.log(`Scanning table ${TABLE_NAME} to remove all non-admin entities...`);

  const scan = await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = scan.Items || [];

  let count = 0;
  for (const item of items) {
    if (item.PK.startsWith("ADMIN#")) {
      // Keep admin account
      continue;
    }

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      })
    );
    count++;
  }

  console.log(`✅ Cleared ${count} merchant/store data records. Only admin records remain!`);
}

run().catch(console.error);
