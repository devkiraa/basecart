const fs = require("fs");
const path = require("path");

// 1. Preprocess SQL dump to dynamically add DROP TABLE IF EXISTS statements at the top
const sqlFile = path.join(__dirname, "../packages/backend/d1-prod-export.sql");
if (fs.existsSync(sqlFile)) {
  console.log(`Preprocessing exported SQL file: ${sqlFile}...`);
  try {
    const originalSql = fs.readFileSync(sqlFile, "utf8");
    
    // Dynamically extract all table names from CREATE TABLE statements
    const tables = [];
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?([a-zA-Z0-9_\-]+)"?)/gi;
    let match;
    while ((match = tableRegex.exec(originalSql)) !== null) {
      if (match[1]) {
        tables.push(match[1]);
      }
    }
    
    if (tables.length > 0) {
      console.log(`Found tables in SQL export: ${tables.join(", ")}`);
      const dropStatements = tables.map(t => `DROP TABLE IF EXISTS "${t}";`).join("\n") + "\n";
      const finalSql = dropStatements + originalSql;
      fs.writeFileSync(sqlFile, finalSql, "utf8");
      console.log("✅ SQL preprocess complete. Droppers dynamically appended.");
    } else {
      console.log("No CREATE TABLE statements found in SQL export.");
    }
  } catch (err) {
    console.error("Failed to preprocess SQL file:", err.message);
  }
} else {
  console.log("No d1-prod-export.sql found to preprocess.");
}
