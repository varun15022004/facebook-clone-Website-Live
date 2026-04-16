import pool from '../db/pool.js';

function formatNotification(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    recipient: row.recipient_id,
    sender: row.sender_data ? {
      _id: row.sender_data.id, id: row.sender_data.id,
      firstName: row.sender_data.first_name, lastName: row.sender_data.last_name,
      profilePicture: row.sender_data.profile_picture || ''
    } : row.sender_id,
    type: row.type,
    post: row.post_id,
    comment: row.comment_id,
    read: row.read,
    createdAt: row.created_at
  };
}

export async function createNotification({ recipientId, senderId, type, postId = null, commentId = null }) {
  // Avoid duplicate notifications
  await pool.query(
    `INSERT INTO notifications (recipient_id, sender_id, type, post_id, comment_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [recipientId, senderId, type, postId, commentId]
  );
}

export async function getNotificationsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT n.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS sender_data
     FROM notifications n
     JOIN users u ON n.sender_id = u.id
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return rows.map(formatNotification);
}

export async function markNotificationRead(id) {
  const { rows } = await pool.query(
    `UPDATE notifications SET read = true WHERE id = $1 RETURNING *`,
    [id]
  );
  if (!rows[0]) return null;
  const { rows: full } = await pool.query(
    `SELECT n.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS sender_data
     FROM notifications n JOIN users u ON n.sender_id = u.id
     WHERE n.id = $1`, [id]
  );
  return full[0] ? formatNotification(full[0]) : null;
}

export async function markAllNotificationsRead(userId) {
  await pool.query(
    `UPDATE notifications SET read = true WHERE recipient_id = $1`,
    [userId]
  );
}

export async function deleteNotification(id) {
  await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
}

export default {
  createNotification, getNotificationsByUser, markNotificationRead,
  markAllNotificationsRead, deleteNotification
};