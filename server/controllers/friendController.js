import pool from '../db/pool.js';
import { findUserById } from '../models/User.js';
import { createNotification } from '../models/Notification.js';

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.userId;
    const { recipientId } = req.body;

    const sender = await findUserById(senderId);
    const recipient = await findUserById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const { rows: friendCheck } = await pool.query(
      'SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2',
      [senderId, recipientId]
    );
    if (friendCheck.length > 0) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const { rows: reqCheck } = await pool.query(
      'SELECT 1 FROM friend_requests WHERE from_id = $1 AND to_id = $2',
      [senderId, recipientId]
    );
    if (reqCheck.length > 0) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    await pool.query(
      `INSERT INTO friend_requests (from_id, to_id, status) VALUES ($1, $2, 'pending')`,
      [senderId, recipientId]
    );

    await createNotification({
      recipientId,
      senderId,
      type: 'friend_request'
    });

    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const { senderId } = req.body;

    const { rows } = await pool.query(
      `SELECT * FROM friend_requests WHERE from_id = $1 AND to_id = $2 AND status = 'pending'`,
      [senderId, recipientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update request status
    await pool.query(
      `UPDATE friend_requests SET status = 'accepted' WHERE from_id = $1 AND to_id = $2`,
      [senderId, recipientId]
    );

    // Add friendship both ways
    await pool.query(
      `INSERT INTO friends (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING`,
      [senderId, recipientId]
    );

    await createNotification({
      recipientId: senderId,
      senderId: recipientId,
      type: 'friend_accept'
    });

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const { senderId } = req.body;

    const { rows } = await pool.query(
      `SELECT * FROM friend_requests WHERE from_id = $1 AND to_id = $2`,
      [senderId, recipientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await pool.query(
      `UPDATE friend_requests SET status = 'rejected' WHERE from_id = $1 AND to_id = $2`,
      [senderId, recipientId]
    );

    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const { rows } = await pool.query(
      `SELECT fr.id, fr.status, fr.created_at,
         json_build_object(
           '_id', u.id, 'id', u.id,
           'firstName', u.first_name, 'lastName', u.last_name,
           'profilePicture', u.profile_picture
         ) AS from
       FROM friend_requests fr
       JOIN users u ON fr.from_id = u.id
       WHERE fr.to_id = $1 AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;

    const { rows } = await pool.query(
      `SELECT u.id AS "_id", u.id, u.first_name AS "firstName",
              u.last_name AS "lastName", u.profile_picture AS "profilePicture"
       FROM friends f JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { friendId } = req.body;

    await pool.query(
      `DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};