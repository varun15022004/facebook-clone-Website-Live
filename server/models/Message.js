import pool from '../db/pool.js';

function formatMessage(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    sender: row.sender_data ? {
      _id: row.sender_data.id, id: row.sender_data.id,
      firstName: row.sender_data.first_name, lastName: row.sender_data.last_name,
      profilePicture: row.sender_data.profile_picture || ''
    } : row.sender_id,
    recipient: row.recipient_data ? {
      _id: row.recipient_data.id, id: row.recipient_data.id,
      firstName: row.recipient_data.first_name, lastName: row.recipient_data.last_name,
      profilePicture: row.recipient_data.profile_picture || ''
    } : row.recipient_id,
    content: row.content,
    attachments: row.attachments || [],
    read: row.read,
    createdAt: row.created_at
  };
}

async function getMessageWithUsers(messageId) {
  const { rows } = await pool.query(
    `SELECT m.*,
       json_build_object('id', s.id, 'first_name', s.first_name,
         'last_name', s.last_name, 'profile_picture', s.profile_picture) AS sender_data,
       json_build_object('id', r.id, 'first_name', r.first_name,
         'last_name', r.last_name, 'profile_picture', r.profile_picture) AS recipient_data
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.recipient_id = r.id
     WHERE m.id = $1`,
    [messageId]
  );
  return rows[0] ? formatMessage(rows[0]) : null;
}

export async function createMessage({ senderId, recipientId, content = '', attachments = [] }) {
  const { rows } = await pool.query(
    `INSERT INTO messages (sender_id, recipient_id, content, attachments)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [senderId, recipientId, content, attachments]
  );
  return getMessageWithUsers(rows[0].id);
}

export async function getMessagesBetween(userId, otherUserId) {
  const { rows } = await pool.query(
    `SELECT m.*,
       json_build_object('id', s.id, 'first_name', s.first_name,
         'last_name', s.last_name, 'profile_picture', s.profile_picture) AS sender_data,
       json_build_object('id', r.id, 'first_name', r.first_name,
         'last_name', r.last_name, 'profile_picture', r.profile_picture) AS recipient_data
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.recipient_id = r.id
     WHERE (m.sender_id = $1 AND m.recipient_id = $2)
        OR (m.sender_id = $2 AND m.recipient_id = $1)
     ORDER BY m.created_at ASC`,
    [userId, otherUserId]
  );
  return rows.map(formatMessage);
}

export async function getConversations(userId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (other_user_id) other_user_id,
       m.id, m.sender_id, m.recipient_id, m.content, m.read, m.created_at,
       json_build_object('id', s.id, 'first_name', s.first_name,
         'last_name', s.last_name, 'profile_picture', s.profile_picture) AS sender_data,
       json_build_object('id', r.id, 'first_name', r.first_name,
         'last_name', r.last_name, 'profile_picture', r.profile_picture) AS recipient_data,
       (SELECT COUNT(*) FROM messages um
        WHERE um.sender_id = other_user_id AND um.recipient_id = $1 AND um.read = false) AS unread_count
     FROM messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.recipient_id = r.id,
     LATERAL (
       SELECT CASE WHEN m.sender_id = $1 THEN m.recipient_id ELSE m.sender_id END AS other_user_id
     ) AS ou
     WHERE m.sender_id = $1 OR m.recipient_id = $1
     ORDER BY other_user_id, m.created_at DESC`,
    [userId]
  );

  return rows.map(row => {
    const msg = formatMessage(row);
    const otherUser = row.sender_data.id === userId ? {
      _id: row.recipient_data.id, id: row.recipient_data.id,
      firstName: row.recipient_data.first_name, lastName: row.recipient_data.last_name,
      profilePicture: row.recipient_data.profile_picture || ''
    } : {
      _id: row.sender_data.id, id: row.sender_data.id,
      firstName: row.sender_data.first_name, lastName: row.sender_data.last_name,
      profilePicture: row.sender_data.profile_picture || ''
    };
    return { user: otherUser, lastMessage: msg, unreadCount: parseInt(row.unread_count) || 0 };
  });
}

export async function markMessagesRead(recipientId, senderId) {
  await pool.query(
    `UPDATE messages SET read = true
     WHERE sender_id = $1 AND recipient_id = $2 AND read = false`,
    [senderId, recipientId]
  );
}

export default { createMessage, getMessagesBetween, getConversations, markMessagesRead };