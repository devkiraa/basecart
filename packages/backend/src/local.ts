import dotenv from "dotenv";
import path from "path";

// Load environmental variables locally
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { buildApp } from "./app";

const app = buildApp();
const port = Number(process.env.PORT) || 3001;

app.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Basecart Local Backend API running at ${address}`);
});
