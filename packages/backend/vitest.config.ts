import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from workspace root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.toml",
        environment: "dev",
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/tests/setup.ts"],
  },
});
