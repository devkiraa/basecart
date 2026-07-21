const fs = require("fs");
const path = require("path");

// 1. Preprocess SQL dump to add DROP TABLE IF EXISTS statements at the top
const sqlFile = path.join(__dirname, "../packages/backend/d1-prod-export.sql");
if (fs.existsSync(sqlFile)) {
  console.log(`Preprocessing exported SQL file: ${sqlFile}...`);
  try {
    const originalSql = fs.readFileSync(sqlFile, "utf8");
    
    const tables = [
      "admins", "tenants", "merchant_users", "verification_tokens", 
      "reset_tokens", "admin_audit_logs", "support_tickets", 
      "refresh_tokens", "email_logs", "platform_notifications", 
      "mail_templates", "feature_flags", "developer_api_keys", 
      "developer_webhooks", "queue_jobs", "system_health_status", 
      "system_settings", "cms_pages", "marketplace_apps"
    ];
    
    const dropStatements = tables.map(t => `DROP TABLE IF EXISTS ${t}; DROP TABLE IF EXISTS "${t}";`).join("\n") + "\n";
    const finalSql = dropStatements + originalSql;
    
    fs.writeFileSync(sqlFile, finalSql, "utf8");
    console.log("✅ SQL preprocess complete. Droppers appended.");
  } catch (err) {
    console.error("Failed to preprocess SQL file:", err.message);
  }
} else {
  console.log("No d1-prod-export.sql found to preprocess.");
}
