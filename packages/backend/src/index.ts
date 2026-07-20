import { buildApp } from "./app";
import { handleQueueBatch } from "./queue";
export { TenantDO, TenantDOProd, TenantDO_Prod } from "./lib/tenant_do";

const app = buildApp();

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
  async queue(batch: any, env: any, ctx: any): Promise<void> {
    await handleQueueBatch(batch, env, ctx);
  }
};
