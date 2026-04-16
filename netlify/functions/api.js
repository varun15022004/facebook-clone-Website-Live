import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { initDb } from '../../server/db/initDb.js';
import userRoutes from '../../server/routes/userRoutes.js';
import postRoutes from '../../server/routes/postRoutes.js';
import commentRoutes from '../../server/routes/commentRoutes.js';
import friendRoutes from '../../server/routes/friendRoutes.js';
import storyRoutes from '../../server/routes/storyRoutes.js';
import notificationRoutes from '../../server/routes/notificationRoutes.js';
import noteRoutes from '../../server/routes/noteRoutes.js';
import reelRoutes from '../../server/routes/reelRoutes.js';
import messageRoutes from '../../server/routes/messageRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'NeonDB PostgreSQL' });
});

// Initialize DB once (cached across warm invocations)
let dbReady = false;
const handler = serverless(app);

export default async (req, context) => {
  if (!dbReady) {
    await initDb();
    dbReady = true;
  }
  return handler(req, context);
};
