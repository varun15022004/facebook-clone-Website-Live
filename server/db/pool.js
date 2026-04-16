import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Parse connection string manually to strip unsupported params
// pg doesn't support channel_binding — use explicit config instead
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    // Force SSL without channel_binding
    require: true
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection helper
export async function testConnection() {
  const client = await pool.connect();
  client.release();
  return true;
}

export default pool;
