import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Notification routes
router.get('/:userId', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all/:userId', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;