import { StorefrontConfig } from "./types.js";
import { StorefrontClient } from "./client.js";

export * from "./types.js";
export * from "./client.js";

export function createStorefrontClient(config: StorefrontConfig): StorefrontClient {
  return new StorefrontClient(config);
}
