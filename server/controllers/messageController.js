import { createMessage, getMessagesBetween, getConversations, markMessagesRead } from '../models/Message.js';
import { createNotification } from '../models/Notification.js';
import pool from '../db/pool.js';

async function assertFriends(senderId, recipientId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2',
    [senderId, recipientId]
  );
  return rows.length > 0;
}

export const sendMessage = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.params.userId;

    const isFriends = await assertFriends(senderId, recipientId);
    if (!isFriends) {
      return res.status(403).json({ message: 'You can only message your friends' });
    }

    const content = (req.body.content || '').toString();
    const attachments = (req.files || []).map((f) => f.path); // Cloudinary secure URL

    if (!content.trim() && attachments.length === 0) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    const message = await createMessage({ senderId, recipientId, content, attachments });

    // Create granular notification type based on attachment presence
    const notifType = attachments.length > 0 ? 'message_photo' : 'message';
    await createNotification({
      recipientId,
      senderId,
      type: notifType
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const otherUserId = req.params.otherUserId;

    const messages = await getMessagesBetween(userId, otherUserId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations_ = async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await getConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    const otherUserId = req.params.otherUserId;

    await markMessagesRead(userId, otherUserId);
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getConversations_ as getConversations };