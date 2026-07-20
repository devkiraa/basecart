import { DurableObject } from "cloudflare:workers";
import { tenantSchema } from "./tenant_schema";

/**
 * TenantDO is a Durable Object class managing an isolated SQLite database per tenant.
 */
export class TenantDO extends DurableObject {
  private schemaEnsured = false;

  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  private ensureSchema() {
    if (this.schemaEnsured) return;
    try {
      const statements = tenantSchema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const sql of statements) {
        const cleanSql = sql
          .split("\n")
          .filter((line) => !line.trim().startsWith("--"))
          .join(" ")
          .trim();

        if (cleanSql.length > 0) {
          this.ctx.storage.sql.exec(cleanSql + ";");
        }
      }
      this.schemaEnsured = true;
    } catch (e) {
      console.error("Failed to auto-ensure tenant schema in Durable Object:", e);
    }
  }

  /**
   * Execute schema migrations or parameterized write statements.
   */
  async exec(sql: string, params: any[] = []): Promise<any> {
    this.ensureSchema();
    // Normalise boolean values for SQLite storage (map true/false to 1/0)
    const boundParams = params.map(val => {
      if (typeof val === "boolean") return val ? 1 : 0;
      return val;
    });

    this.ctx.storage.sql.exec(sql, ...boundParams);

    let changes = 0;
    let lastInsertRowid = 0;
    try {
      const metaCursor = this.ctx.storage.sql.exec("SELECT changes() as changes, last_insert_rowid() as rowid");
      const results = Array.from(metaCursor);
      if (results.length > 0) {
        changes = (results[0] as any).changes || 0;
        lastInsertRowid = (results[0] as any).rowid || 0;
      }
    } catch (e) {}

    return {
      success: true,
      meta: {
        changes,
        lastInsertRowid,
      },
    };
  }

  /**
   * Execute parameterized SELECT / UPDATE / INSERT queries and return row objects.
   */
  async query(sql: string, params: any[]): Promise<any[]> {
    this.ensureSchema();
    // Normalise boolean values for SQLite storage (map true/false to 1/0)
    const boundParams = params.map(val => {
      if (typeof val === "boolean") return val ? 1 : 0;
      return val;
    });

    const cursor = this.ctx.storage.sql.exec(sql, ...boundParams);
    const results = Array.from(cursor);

    // Parse boolean fields back to true/false in the client return mapping
    return results.map((row: any) => {
      if (!row) return row;
      const copy = { ...row };
      for (const k in copy) {
        if (
          k === "emailVerified" ||
          k === "continueSellingOutOfStock" ||
          k === "active"
        ) {
          copy[k] = copy[k] === 1;
        }
      }
      return copy;
    });
  }

  /**
   * Run multiple statements atomically in a single execution queue batch.
   */
  async batch(statements: { sql: string; params: any[] }[]): Promise<any[][]> {
    this.ensureSchema();
    const results: any[][] = [];
    for (const stmt of statements) {
      const boundParams = stmt.params.map(val => {
        if (typeof val === "boolean") return val ? 1 : 0;
        return val;
      });
      const cursor = this.ctx.storage.sql.exec(stmt.sql, ...boundParams);
      results.push(Array.from(cursor));
    }
    return results;
  }
}

export class TenantDOProd extends TenantDO {}
export class TenantDO_Prod extends TenantDO {}


