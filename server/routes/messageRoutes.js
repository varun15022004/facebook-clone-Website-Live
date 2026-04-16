import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead
} from '../controllers/messageController.js';

const router = express.Router();
const upload = createUploader('messages', 'auto');

router.post('/:userId', upload.array('media', 6), sendMessage);
router.get('/conversations/:userId', getConversations);
router.get('/:userId/:otherUserId', getMessages);
router.put('/read/:userId/:otherUserId', markAsRead);

export default router;