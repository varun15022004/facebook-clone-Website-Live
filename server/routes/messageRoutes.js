import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead
} from '../controllers/messageController.js';

const router = express.Router();

// Configure multer for message media uploads (photos/videos)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/:userId', upload.array('media', 6), sendMessage);
router.get('/conversations/:userId', getConversations);
router.get('/:userId/:otherUserId', getMessages);
router.put('/read/:userId/:otherUserId', markAsRead);

export default router;