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

async function findAndDropConstraint() {
  try {
    const { rows } = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'notifications'::regclass
      AND contype = 'c';
    `);
    
    console.log('Constraints found:', rows);
    for (const row of rows) {
      console.log(`Dropping constraint: ${row.conname}`);
      await pool.query(`ALTER TABLE notifications DROP CONSTRAINT ${row.conname}`);
    }
    console.log('Success.');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

findAndDropConstraint();
