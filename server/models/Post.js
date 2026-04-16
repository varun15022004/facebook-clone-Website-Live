import pool from '../db/pool.js';

export function formatPost(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_data ? {
      _id: row.user_data.id,
      id: row.user_data.id,
      firstName: row.user_data.first_name,
      lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    } : row.user_id,
    content: row.content,
    images: row.images || [],
    likes: row.likes || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getPostWithDetails(postId) {
  const { rows } = await pool.query(
    `SELECT
       p.*,
       json_build_object(
         'id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture
       ) AS user_data,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', c.id, '_id', c.id, 'content', c.content,
           'created_at', c.created_at,
           'likes', (SELECT COALESCE(array_agg(cl.user_id), '{}') FROM comment_likes cl WHERE cl.comment_id = c.id),
           'user', json_build_object(
             'id', cu.id, '_id', cu.id,
             'firstName', cu.first_name, 'lastName', cu.last_name,
             'profilePicture', cu.profile_picture
           )
         ) ORDER BY c.created_at ASC)
         FROM comments c JOIN users cu ON c.user_id = cu.id
         WHERE c.post_id = p.id
       ), '[]'::json) AS comments,
       COALESCE((
         SELECT array_agg(pl.user_id) FROM post_likes pl WHERE pl.post_id = p.id
       ), '{}') AS likes
     FROM posts p JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    _id: row.id, id: row.id,
    user: {
      _id: row.user_data.id, id: row.user_data.id,
      firstName: row.user_data.first_name, lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    },
    content: row.content,
    images: row.images || [],
    likes: row.likes || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createPost({ userId, content, images = [] }) {
  const { rows } = await pool.query(
    `INSERT INTO posts (user_id, content, images)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, content, images]
  );
  return getPostWithDetails(rows[0].id);
}

export async function findPostById(id) {
  return getPostWithDetails(id);
}

export async function getFeedPosts(userId, friendIds) {
  const userAndFriends = [userId, ...friendIds];
  const { rows } = await pool.query(
    `SELECT p.id FROM posts p
     WHERE p.user_id = ANY($1::uuid[])
     ORDER BY p.created_at DESC`,
    [userAndFriends]
  );
  const posts = await Promise.all(rows.map(r => getPostWithDetails(r.id)));
  return posts.filter(Boolean);
}

export async function getAllPosts() {
  const { rows } = await pool.query(
    `SELECT p.id FROM posts p
     ORDER BY p.created_at DESC`
  );
  const posts = await Promise.all(rows.map(r => getPostWithDetails(r.id)));
  return posts.filter(Boolean);
}

export async function getUserPosts(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM posts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  const posts = await Promise.all(rows.map(r => getPostWithDetails(r.id)));
  return posts.filter(Boolean);
}

export async function updatePost(id, { content, newImages = [] }) {
  if (newImages.length > 0) {
    await pool.query(
      `UPDATE posts SET content = $1, images = images || $2, updated_at = NOW() WHERE id = $3`,
      [content, newImages, id]
    );
  } else {
    await pool.query(
      `UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2`,
      [content, id]
    );
  }
  return getPostWithDetails(id);
}

export async function deletePost(id) {
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}

export async function getRawPost(id) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function isPostLiked(postId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );
  return rows.length > 0;
}

export async function likePost(postId, userId) {
  await pool.query(
    'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [postId, userId]
  );
  return getPostWithDetails(postId);
}

export async function unlikePost(postId, userId) {
  await pool.query(
    'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );
  return getPostWithDetails(postId);
}

export default {
  createPost, findPostById, getFeedPosts, getAllPosts, getUserPosts,
  updatePost, deletePost, getRawPost, isPostLiked, likePost, unlikePost, formatPost
};