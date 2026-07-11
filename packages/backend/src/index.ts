import { awsLambdaFastify } from "@fastify/aws-lambda";
import { buildApp } from "./app";

const app = buildApp();
const proxyHandler = awsLambdaFastify(app);

// AWS Lambda Handler for HTTP API Gateway integration
export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return proxyHandler(event, context);
};
