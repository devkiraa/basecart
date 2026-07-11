import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../../.env") });
dotenv.config();

const getAwsConfig = () => {
  const config: any = {
    region: process.env.AWS_REGION || "us-east-1",
  };

  // If NODE_ENV is development or test, or endpoint overrides are provided, configure for LocalStack
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test" ||
    process.env.LOCALSTACK_HOSTNAME ||
    process.env.AWS_ENDPOINT_URL
  ) {
    const endpoint =
      process.env.AWS_ENDPOINT_URL ||
      `http://${process.env.LOCALSTACK_HOSTNAME || "localhost"}:4566`;
    config.endpoint = endpoint;
    config.credentials = {
      accessKeyId: "mock-access-key-id",
      secretAccessKey: "mock-secret-access-key",
    };
    config.forcePathStyle = true; // S3 path style routing for localstack
  }

  return config;
};

const awsConfig = getAwsConfig();

export const ddbClient = new DynamoDBClient(awsConfig);
export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

export const s3Client = new S3Client({
  ...awsConfig,
  // Ensure path style is active for local S3
  forcePathStyle:
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test" ||
    !!process.env.LOCALSTACK_HOSTNAME ||
    !!process.env.AWS_ENDPOINT_URL,
});

export const sqsClient = new SQSClient(awsConfig);
export const sesClient = new SESClient(awsConfig);

import { KMSClient } from "@aws-sdk/client-kms";
export const kmsClient = new KMSClient(awsConfig);
