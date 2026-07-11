import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../lib/aws";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const TABLE_NAME = process.env.TABLE_NAME || "BasecartMain";

async function run() {
  const email = "admin@basecart.io";
  const password = "adminpassword123";
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  console.log(`Creating super-admin in ${TABLE_NAME}...`);

  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ADMIN#${email}`,
        SK: "METADATA",
        userId,
        email,
        hashedPassword,
        role: "admin",
        createdAt,
      },
    })
  );

  console.log("-----------------------------------------");
  console.log("✅ Super-Admin Account Created in DynamoDB!");
  console.log(`Username (Email): ${email}`);
  console.log(`Password:         ${password}`);
  console.log("-----------------------------------------");
}

run().catch(console.error);
