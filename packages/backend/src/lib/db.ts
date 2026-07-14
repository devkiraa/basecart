// Basecart D1 Database client wrapper over Durable Object SQLite storage

export interface D1Result<T = any> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: any;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(colName?: string): Promise<T | null>;
  run<T = any>(): Promise<D1Result<T>>;
  all<T = any>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(sql: string): Promise<D1ExecResult>;
}

// -------------------------------------------------------------
// Durable Object SQLite D1 Adapter
// -------------------------------------------------------------
class DoPreparedStatement implements D1PreparedStatement {
  private boundValues: any[] = [];
  constructor(private stub: any, private sql: string) {}

  bind(...values: any[]): D1PreparedStatement {
    this.boundValues = values;
    return this;
  }

  async first<T = any>(colName?: string): Promise<T | null> {
    try {
      const rows = await this.stub.query(this.sql, this.boundValues);
      if (rows.length === 0) return null;
      const row = rows[0];
      if (colName) return row[colName] ?? null;
      return row as T;
    } catch (err: any) {
      console.error(`Durable Object SQL 'first' error for: ${this.sql}`, err);
      throw err;
    }
  }

  async run<T = any>(): Promise<D1Result<T>> {
    // In SQLite, queries and changes use same exec/query paths
    const isSelect = this.sql.trim().toUpperCase().startsWith("SELECT");
    if (isSelect) {
      const results = await this.stub.query(this.sql, this.boundValues);
      return { success: true, results };
    } else {
      const res = await this.stub.exec(this.sql, this.boundValues);
      return res;
    }
  }

  async all<T = any>(): Promise<D1Result<T>> {
    const results = await this.stub.query(this.sql, this.boundValues);
    return { success: true, results };
  }
}

class DoD1Database implements D1Database {
  constructor(private stub: any) {}

  prepare(sql: string): D1PreparedStatement {
    return new DoPreparedStatement(this.stub, sql);
  }

  async batch<T = any>(statements: D1PreparedStatement[]): Promise<D1Result<T>[] | any> {
    try {
      const serialized = statements.map(stmt => ({
        sql: (stmt as any).sql,
        params: (stmt as any).boundValues,
      }));
      const results = await this.stub.batch(serialized);
      return results.map((res: any) => ({
        success: true,
        results: res,
      }));
    } catch (err: any) {
      console.error("Durable Object SQL 'batch' error", err);
      throw err;
    }
  }

  async exec(sql: string): Promise<D1ExecResult> {
    const start = Date.now();
    await this.stub.exec(sql);
    return {
      count: 1,
      duration: Date.now() - start,
    };
  }
}

// -------------------------------------------------------------
// Connection Resolvers
// -------------------------------------------------------------


export function getControlDb(env: any): D1Database {
  if (!env || !env.CONTROL_DB) {
    throw new Error("CONTROL_DB binding not configured on env context");
  }
  return env.CONTROL_DB;
}

export async function getTenantDb(tenantId: string, env: any): Promise<D1Database> {
  if (!env || !env.TENANT_DO) {
    throw new Error("TENANT_DO binding not configured on env context");
  }

  // Resolve standard Durable Object instance via idFromName (dynamic resolver)
  const doId = env.TENANT_DO.idFromName(tenantId);
  const stub = env.TENANT_DO.get(doId);
  
  return new DoD1Database(stub);
}

/**
 * Migration helper to execute complex SQL scripts (e.g. schema.sql)
 */
export async function migrateDatabase(db: D1Database, schemaSql: string): Promise<void> {
  // Normalize Windows CRLF line endings to LF
  const normalized = schemaSql.replace(/\r\n/g, "\n");
  
  // Split statements by semicolon and filter comments
  const statements = normalized
    .split(";")
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const sql of statements) {
    // Collapse multi-line SQL statement into a single-line space-separated string
    const cleanSql = sql
      .split("\n")
      .filter(line => !line.trim().startsWith("--"))
      .join(" ")
      .trim();

    if (cleanSql.length > 0) {
      await db.exec(cleanSql + ";");
    }
  }
}
