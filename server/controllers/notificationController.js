import {
  getNotificationsByUser, markNotificationRead,
  markAllNotificationsRead, deleteNotification
} from '../models/Notification.js';

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await getNotificationsByUser(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const notification = await markNotificationRead(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    await markAllNotificationsRead(userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification_ = async (req, res) => {
  try {
    const notificationId = req.params.id;
    await deleteNotification(notificationId);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { deleteNotification_ as deleteNotification };