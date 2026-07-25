import { execSync } from "child_process";

export interface BackupOptions {
  databaseName: string;
  outputDir?: string;
  isProduction?: boolean;
}

/**
 * Creates an automated export / snapshot backup of a Cloudflare D1 Database.
 */
export function backupD1Database(options: BackupOptions): { success: boolean; filePath: string } {
  const { databaseName, outputDir = "./backups", isProduction = false } = options;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${databaseName}_backup_${timestamp}.sql`;
  const filePath = `${outputDir}/${filename}`;

  const envFlag = isProduction ? "--remote" : "--local";
  const cmd = `npx wrangler d1 export ${databaseName} ${envFlag} --output=${filePath}`;

  console.log(`[D1 Backup Strategy] Exporting database '${databaseName}'...`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`[D1 Backup Strategy] Successfully created backup at ${filePath}`);
    return { success: true, filePath };
  } catch (error: any) {
    console.error(`[D1 Backup Strategy] Backup failed for ${databaseName}:`, error?.message || error);
    return { success: false, filePath: "" };
  }
}

/**
 * Restores a Cloudflare D1 Database from a backup SQL dump file (PITR procedure).
 */
export function restoreD1Database(databaseName: string, backupFilePath: string, isProduction = false): boolean {
  const envFlag = isProduction ? "--remote" : "--local";
  const cmd = `npx wrangler d1 execute ${databaseName} ${envFlag} --file=${backupFilePath}`;

  console.log(`[D1 Restore Strategy] Restoring database '${databaseName}' from ${backupFilePath}...`);
  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`[D1 Restore Strategy] Successfully restored database '${databaseName}'`);
    return true;
  } catch (error: any) {
    console.error(`[D1 Restore Strategy] Restore failed for ${databaseName}:`, error?.message || error);
    return false;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0] || "backup";
  const dbName = args[1] || "basecart-control-db";
  const targetFile = args[2] || "./backups/backup.sql";
  const isRemote = args.includes("--remote");

  if (action === "restore") {
    restoreD1Database(dbName, targetFile, isRemote);
  } else {
    backupD1Database({ databaseName: dbName, isProduction: isRemote });
  }
}
