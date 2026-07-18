import { env } from "cloudflare:test";

// Copy Miniflare/workerd env bindings to process.env for Node-compatibility code
if (typeof process !== "undefined" && process.env) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      process.env[key] = value;
    }
  }
}
