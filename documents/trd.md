# Technical Requirement Document (TRD) — Basecart

## 1. System Architecture & Edge Topology
Basecart runs entirely on V8 Isolate engines distributed across global network centers. It operates without static origin web servers or centralized relational databases for storefront queries.

* **Routing & Execution**: Hono HTTP framework running inside Cloudflare Workers.
* **Central Register**: Cloudflare D1 (Serverless SQLite database) for tenant registries, admin accounts, audit logs, and global configuration.
* **Isolated Tenant Storage**: Cloudflare Durable Objects. Each store runs a dedicated instance of `TenantDOProd` which initializes a private, embedded SQLite database.
* **File & Media Storage**: Cloudflare R2 object storage.
* **Message Broker & Queue**: Cloudflare Queues for background email dispatching, webhook retries, and data synchronization.

## 2. Infrastructure Bindings Config (`wrangler.toml`)
```toml
name = "basecart-backend"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = [ "nodejs_compat" ]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["TenantDO"]

[[migrations]]
tag = "v2"
new_sqlite_classes = ["TenantDOProd"]

[durable_objects]
bindings = [
  { name = "TENANT_DO", class_name = "TenantDOProd" }
]

[[d1_databases]]
binding = "CONTROL_DB"
database_name = "basecart-control-prod"
database_id = "5a1c680b-b6d4-4b6d-8283-8bfc8905d227"
```

## 3. Deployment Pipeline
* **Monorepo Build**: Monorepo compilation using Node workspaces:
  - `@basecart/shared`: Shared types and validation utils.
  - `@basecart/theme-sdk` & `@basecart/theme-engine`: Storefront schema validation and layout parsers.
  - `@basecart/backend`: Hono API worker.
  - `@basecart/admin-panel`, `@basecart/merchant-dashboard`, `@basecart/storefront`: Next.js frontend projects.
