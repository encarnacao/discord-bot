import { getPool } from "@database";
import { HealthInfo } from "@types";
import { logger } from "@utils";

export async function getHealthInfo(): Promise<HealthInfo> {
  try {
    const pool = await getPool();
    const databaseName = process.env.POSTGRES_DB as string;
    const dbVersionResult = await pool.query("SHOW server_version;");
    const dbVersion = dbVersionResult.rows[0].server_version;
    const { rows: maxConnectionsRows } = await pool.query(
      "SHOW max_connections;"
    );
    const maxConnections: number = maxConnectionsRows[0].max_connections;
    const { rows: openConnectionsRows } = await pool.query(
      "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      [databaseName]
    );
    const openConnections: number = openConnectionsRows[0].count;

    return {
      updated_at: new Date().toISOString(),
      depedencies: {
        database: {
          version: dbVersion,
          max_connections: maxConnections,
          open_connections: openConnections,
        },
      },
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
