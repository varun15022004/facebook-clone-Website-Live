import app from '../server/index.js';
import { initDb } from '../server/db/initDb.js';

// Initialize DB once on cold start
let dbInitialized = false;

export default async function handler(req, res) {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (err) {
      console.error('DB init failed:', err);
      return res.status(500).json({ error: 'Database initialization failed' });
    }
  }
  return app(req, res);
}
