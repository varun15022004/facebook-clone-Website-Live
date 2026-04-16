import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './pool.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const seedSqlPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedSqlPath, 'utf8');

  try {
    await pool.query('BEGIN');
    await pool.query(sql);
    await pool.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('✅ Seed complete (dummy accounts, posts, reels, stories, notes, etc.)');
  } catch (err) {
    await pool.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('❌ Seed failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();

