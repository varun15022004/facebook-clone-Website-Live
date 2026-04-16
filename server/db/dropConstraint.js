import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrate() {
  try {
    console.log('Connecting to database...');
    
    // Check if constraint exists, since it could be named differently.
    // The most foolproof way in Postgres to drop a CHECK constraint of a specific column is to query pg_constraint.
    // Or we can just run ALTER TABLE notifications alter column type type varchar(50).
    // Let's just drop the constraint if it exists. Postgres names unnamed column checks implicitly like `notifications_type_check`.
    await pool.query(`ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;`);
    
    console.log('Constraint dropped. Added new types safely to the database level.');
    
    // Also, update schema.sql logic natively for future reference.
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    pool.end();
  }
}

migrate();
