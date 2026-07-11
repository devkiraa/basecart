import {
  CreateTableCommand,
  DescribeTableCommand,
  CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { CreateQueueCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs";
import { VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";
import { CreateKeyCommand, ListAliasesCommand, CreateAliasCommand } from "@aws-sdk/client-kms";
import { ddbClient, s3Client, sqsClient, sesClient, kmsClient } from "../lib/aws";
import fs from "fs";
import path from "path";

const TABLE_NAME = "BasecartMain";
const BUCKET_NAME = "basecart-media-bucket";
const QUEUE_NAME = "BasecartJobsQueue";
const VERIFIED_EMAIL = "noreply@basecart.io";

async function bootstrap() {
  console.log("🚀 Starting local infrastructure bootstrap...");

  // 1. DynamoDB Table Setup
  try {
    await ddbClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`✅ DynamoDB Table "${TABLE_NAME}" already exists.`);
  } catch (error: any) {
    if (
      error.name === "ResourceNotFoundException" ||
      error.name === "ResourceNotFound"
    ) {
      console.log(`Creating DynamoDB Table "${TABLE_NAME}"...`);
      const createTableInput: CreateTableCommandInput = {
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
          { AttributeName: "GSI1PK", AttributeType: "S" },
          { AttributeName: "GSI1SK", AttributeType: "S" },
          { AttributeName: "GSI2PK", AttributeType: "S" },
          { AttributeName: "GSI2SK", AttributeType: "S" },
          { AttributeName: "GSI3PK", AttributeType: "S" },
          { AttributeName: "GSI3SK", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "GSI1",
            KeySchema: [
              { AttributeName: "GSI1PK", KeyType: "HASH" },
              { AttributeName: "GSI1SK", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
          {
            IndexName: "GSI2",
            KeySchema: [
              { AttributeName: "GSI2PK", KeyType: "HASH" },
              { AttributeName: "GSI2SK", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
          {
            IndexName: "GSI3",
            KeySchema: [
              { AttributeName: "GSI3PK", KeyType: "HASH" },
              { AttributeName: "GSI3SK", KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          },
        ],
      };
      await ddbClient.send(new CreateTableCommand(createTableInput));
      console.log(`✅ DynamoDB Table "${TABLE_NAME}" created successfully.`);
    } else {
      console.error("❌ Error checking/creating DynamoDB table:", error);
    }
  }

  // 2. S3 Bucket Setup
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ S3 Bucket "${BUCKET_NAME}" already exists.`);
  } catch (error: any) {
    console.log(`Creating S3 Bucket "${BUCKET_NAME}"...`);
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ S3 Bucket "${BUCKET_NAME}" created successfully.`);
    } catch (createErr) {
      console.error("❌ Error creating S3 Bucket:", createErr);
    }
  }

  // 3. SQS Queue Setup
  try {
    await sqsClient.send(new GetQueueUrlCommand({ QueueName: QUEUE_NAME }));
    console.log(`✅ SQS Queue "${QUEUE_NAME}" already exists.`);
  } catch (error: any) {
    console.log(`Creating SQS Queue "${QUEUE_NAME}"...`);
    try {
      await sqsClient.send(new CreateQueueCommand({ QueueName: QUEUE_NAME }));
      console.log(`✅ SQS Queue "${QUEUE_NAME}" created successfully.`);
    } catch (createErr) {
      console.error("❌ Error creating SQS Queue:", createErr);
    }
  }

  // 4. SES Verified Identity Setup
  try {
    console.log(`Verifying SES identity "${VERIFIED_EMAIL}"...`);
    await sesClient.send(
      new VerifyEmailIdentityCommand({ EmailAddress: VERIFIED_EMAIL })
    );
    console.log(`✅ SES Identity "${VERIFIED_EMAIL}" verified.`);
  } catch (error) {
    console.error("❌ Error verifying SES Identity:", error);
  }

  // 5. KMS Key Setup
  let kmsKeyArn = "";
  try {
    console.log("Setting up local KMS Key...");
    const aliases = await kmsClient.send(new ListAliasesCommand({}));
    const existingAlias = (aliases.Aliases || []).find((a) => a.AliasName === "alias/basecart-kms-key");

    if (existingAlias && existingAlias.TargetKeyId) {
      kmsKeyArn = existingAlias.TargetKeyId;
      console.log(`✅ KMS Key already exists with alias "alias/basecart-kms-key". ARN: ${kmsKeyArn}`);
    } else {
      const createKeyRes = await kmsClient.send(
        new CreateKeyCommand({
          Description: "Local basecart KMS Key",
        })
      );

      const keyArn = createKeyRes.KeyMetadata?.Arn;
      if (!keyArn) throw new Error("CreateKey failed to return KeyMetadata.Arn");
      kmsKeyArn = keyArn;

      await kmsClient.send(
        new CreateAliasCommand({
          AliasName: "alias/basecart-kms-key",
          TargetKeyId: keyArn,
        })
      );
      console.log(`✅ Local KMS Key created successfully. ARN: ${kmsKeyArn}`);
    }

    // Write KMS_KEY_ID to root .env
    const envPath = path.join(__dirname, "../../../../.env");
    try {
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }

      if (envContent.includes("KMS_KEY_ID=")) {
        envContent = envContent.replace(/KMS_KEY_ID=.*/g, `KMS_KEY_ID="${kmsKeyArn}"`);
      } else {
        envContent += `\nKMS_KEY_ID="${kmsKeyArn}"\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
      console.log(`✅ Updated .env file at ${envPath} with KMS_KEY_ID`);
    } catch (envErr) {
      console.error("❌ Failed to write KMS_KEY_ID to .env file:", envErr);
    }
  } catch (error) {
    console.error("❌ Error setting up local KMS Key:", error);
  }

  console.log("🎉 Local infrastructure bootstrap complete!");
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap script failed:", err);
  process.exit(1);
});
