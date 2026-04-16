import pool from '../db/pool.js';

export function formatComment(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    user: row.user_data ? {
      _id: row.user_data.id, id: row.user_data.id,
      firstName: row.user_data.first_name, lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    } : row.user_id,
    post: row.post_id,
    content: row.content,
    likes: row.likes || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getCommentWithUser(commentId) {
  const { rows } = await pool.query(
    `SELECT c.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data,
       COALESCE((SELECT array_agg(cl.user_id) FROM comment_likes cl WHERE cl.comment_id = c.id), '{}') AS likes
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [commentId]
  );
  return rows[0] ? formatComment(rows[0]) : null;
}

export async function createComment({ userId, postId, content, reelId = null }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (user_id, post_id, reel_id, content)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, postId, reelId, content]
  );
  return getCommentWithUser(rows[0].id);
}

export async function findCommentById(id) {
  const { rows } = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getCommentWithDetails(id) {
  return getCommentWithUser(id);
}

export async function getCommentsByPost(postId) {
  const { rows } = await pool.query(
    `SELECT c.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data,
       COALESCE((SELECT array_agg(cl.user_id) FROM comment_likes cl WHERE cl.comment_id = c.id), '{}') AS likes
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows.map(formatComment);
}

export async function updateComment(id, content) {
  await pool.query(
    `UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2`,
    [content, id]
  );
  return getCommentWithUser(id);
}

export async function deleteComment(id) {
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
}

export async function isCommentLiked(commentId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
    [commentId, userId]
  );
  return rows.length > 0;
}

export async function likeComment(commentId, userId) {
  await pool.query(
    'INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [commentId, userId]
  );
  return getCommentWithUser(commentId);
}

export async function unlikeComment(commentId, userId) {
  await pool.query(
    'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
    [commentId, userId]
  );
  return getCommentWithUser(commentId);
}

export default {
  createComment, findCommentById, getCommentWithDetails, getCommentsByPost,
  updateComment, deleteComment, isCommentLiked, likeComment, unlikeComment, formatComment
};