import pool from '../db/pool.js';

function formatReel(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    user: row.user_data ? {
      _id: row.user_data.id, id: row.user_data.id,
      firstName: row.user_data.first_name, lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    } : row.user_id,
    video: row.video,
    caption: row.caption || '',
    likes: row.likes || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function _getReelWithDetails(reelId) {
  const { rows } = await pool.query(
    `SELECT r.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data,
       COALESCE((SELECT array_agg(rl.user_id) FROM reel_likes rl WHERE rl.reel_id = r.id), '{}') AS likes,
       COALESCE((
         SELECT json_agg(json_build_object(
           'id', c.id, '_id', c.id, 'content', c.content,
           'created_at', c.created_at,
           'user', json_build_object(
             'id', cu.id, '_id', cu.id,
             'firstName', cu.first_name, 'lastName', cu.last_name,
             'profilePicture', cu.profile_picture
           )
         ) ORDER BY c.created_at ASC)
         FROM comments c JOIN users cu ON c.user_id = cu.id
         WHERE c.reel_id = r.id
       ), '[]'::json) AS comments
     FROM reels r JOIN users u ON r.user_id = u.id
     WHERE r.id = $1`,
    [reelId]
  );
  return rows[0] ? formatReel(rows[0]) : null;
}

export async function createReel({ userId, video, caption = '' }) {
  const { rows } = await pool.query(
    `INSERT INTO reels (user_id, video, caption) VALUES ($1, $2, $3) RETURNING id`,
    [userId, video, caption]
  );
  return _getReelWithDetails(rows[0].id);
}

export async function getAllReels() {
  const { rows } = await pool.query(`SELECT id FROM reels ORDER BY created_at DESC`);
  const reels = await Promise.all(rows.map(r => _getReelWithDetails(r.id)));
  return reels.filter(Boolean);
}

export async function findReelById(id) {
  const { rows } = await pool.query('SELECT * FROM reels WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getReelWithDetails(id) {
  return _getReelWithDetails(id);
}

export async function updateReel(id, { caption, video = null }) {
  if (video) {
    await pool.query(
      `UPDATE reels SET caption = $1, video = $2, updated_at = NOW() WHERE id = $3`,
      [caption, video, id]
    );
  } else {
    await pool.query(
      `UPDATE reels SET caption = $1, updated_at = NOW() WHERE id = $2`,
      [caption, id]
    );
  }
  return _getReelWithDetails(id);
}

export async function deleteReel(id) {
  await pool.query('DELETE FROM reels WHERE id = $1', [id]);
}

export async function isReelLiked(reelId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM reel_likes WHERE reel_id = $1 AND user_id = $2',
    [reelId, userId]
  );
  return rows.length > 0;
}

export async function likeReel(reelId, userId) {
  await pool.query(
    'INSERT INTO reel_likes (reel_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [reelId, userId]
  );
  return _getReelWithDetails(reelId);
}

export async function unlikeReel(reelId, userId) {
  await pool.query(
    'DELETE FROM reel_likes WHERE reel_id = $1 AND user_id = $2',
    [reelId, userId]
  );
  return _getReelWithDetails(reelId);
}

export async function addReelComment({ userId, reelId, content }) {
  const { rows } = await pool.query(
    `INSERT INTO comments (user_id, reel_id, content) VALUES ($1, $2, $3) RETURNING id`,
    [userId, reelId, content]
  );
  // Return populated comment
  const { rows: c } = await pool.query(
    `SELECT c.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data
     FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1`,
    [rows[0].id]
  );
  const r = c[0];
  return {
    _id: r.id, id: r.id,
    user: {
      _id: r.user_data.id, id: r.user_data.id,
      firstName: r.user_data.first_name, lastName: r.user_data.last_name,
      profilePicture: r.user_data.profile_picture || ''
    },
    content: r.content,
    createdAt: r.created_at
  };
}

export async function getUserReels(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM reels WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  const reels = await Promise.all(rows.map(r => _getReelWithDetails(r.id)));
  return reels.filter(Boolean);
}

export default {
  createReel, getAllReels, findReelById, updateReel, deleteReel,
  isReelLiked, likeReel, unlikeReel, addReelComment, getUserReels
};