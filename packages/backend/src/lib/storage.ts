import { S3Client } from "@aws-sdk/client-s3";

/**
 * Creates and returns an S3Client instance configured for Cloudflare R2 in production,
 * falling back to local S3 simulation (LocalStack) in development or tests.
 */
export function getStorageClient(env: any): S3Client {
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env?.R2_ACCESS_KEY_ID;
  const secretAccessKey = env?.R2_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey && accountId) {
    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // Block mock credentials in real deployed production environment
  const envName = env?.ENVIRONMENT || env?.NODE_ENV;
  const isLocalDev = Boolean(env?.VITEST || env?.TEST_ENV || !env?.CLOUDFLARE_ACCOUNT_ID);
  if (envName === "production" && !isLocalDev) {
    throw new Error("FATAL: Mock S3 credentials cannot be used in production. Configure R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY via environment bindings.");
  }

  // Local/Testing S3 simulation fallback (e.g. LocalStack)
  const endpoint = env?.AWS_ENDPOINT_URL || "http://localhost:4566";
  return new S3Client({
    region: "us-east-1",
    endpoint,
    credentials: {
      accessKeyId: "mock-access-key-id",
      secretAccessKey: "mock-secret-access-key",
    },
    forcePathStyle: true, // Required for LocalStack
  });
}

/**
 * Returns the configured media bucket name.
 */
export function getBucketName(env: any): string {
  return env?.S3_BUCKET || "basecart-media-bucket";
}
