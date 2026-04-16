import pool from '../db/pool.js';

function formatStory(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    user: row.user_data ? {
      _id: row.user_data.id, id: row.user_data.id,
      firstName: row.user_data.first_name, lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    } : row.user_id,
    content: row.content || '',
    image: row.image || '',
    viewers: row.viewers || [],
    expiresAt: row.expires_at,
    createdAt: row.created_at
  };
}

async function getStoryWithDetails(storyId) {
  const { rows } = await pool.query(
    `SELECT s.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', vu.id, '_id', vu.id,
           'firstName', vu.first_name, 'lastName', vu.last_name,
           'profilePicture', vu.profile_picture
         ))
         FROM story_viewers sv JOIN users vu ON sv.user_id = vu.id
         WHERE sv.story_id = s.id
       ), '[]'::json) AS viewers
     FROM stories s JOIN users u ON s.user_id = u.id
     WHERE s.id = $1`,
    [storyId]
  );
  return rows[0] ? formatStory(rows[0]) : null;
}

export async function createStory({ userId, content = '', image = '' }) {
  const { rows } = await pool.query(
    `INSERT INTO stories (user_id, content, image) VALUES ($1, $2, $3) RETURNING id`,
    [userId, content, image]
  );
  return getStoryWithDetails(rows[0].id);
}

export async function getFeedStories(userId, friendIds) {
  const userAndFriends = [userId, ...friendIds];
  const { rows } = await pool.query(
    `SELECT s.id FROM stories s
     WHERE s.user_id = ANY($1::uuid[]) AND s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [userAndFriends]
  );
  const stories = await Promise.all(rows.map(r => getStoryWithDetails(r.id)));
  return stories.filter(Boolean);
}

export async function getAllActiveStories() {
  const { rows } = await pool.query(
    `SELECT s.id FROM stories s
     WHERE s.expires_at > NOW()
     ORDER BY s.created_at DESC`
  );
  const stories = await Promise.all(rows.map(r => getStoryWithDetails(r.id)));
  return stories.filter(Boolean);
}

export async function findStoryById(id) {
  const { rows } = await pool.query('SELECT * FROM stories WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getStoryWithViewers(id) {
  return getStoryWithDetails(id);
}

export async function addViewer(storyId, userId) {
  await pool.query(
    `INSERT INTO story_viewers (story_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [storyId, userId]
  );
}

export async function hasViewed(storyId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM story_viewers WHERE story_id = $1 AND user_id = $2',
    [storyId, userId]
  );
  return rows.length > 0;
}

export async function deleteStory(id) {
  await pool.query('DELETE FROM stories WHERE id = $1', [id]);
}

export async function getUserActiveStories(userId) {
  const { rows } = await pool.query(
    `SELECT s.id FROM stories s
     WHERE s.user_id = $1 AND s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [userId]
  );
  const stories = await Promise.all(rows.map(r => getStoryWithDetails(r.id)));
  return stories.filter(Boolean);
}

export default {
  createStory, getFeedStories, getAllActiveStories, findStoryById, getStoryWithViewers,
  addViewer, hasViewed, deleteStory, getUserActiveStories
};