import pg from "pg";

let pool: pg.Pool;

function getSSLValues() {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    return {
      rejectUnauthorized: false,
    };
  }
  return false;
}

async function initialize() {
  pool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSLValues(),
  });
}

export async function getPool() {
  if (!pool) {
    await initialize();
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (!pool) {
    return;
  }

  try {
    await pool.end();
  } catch (error) {
    throw error;
  }
}
