import pool from '../db/pool.js';

// Helper to format user output (camelCase from snake_case)
export function formatUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    profilePicture: row.profile_picture || '',
    coverPhoto: row.cover_photo || '',
    bio: row.bio || '',
    location: row.location || '',
    birthday: row.birthday,
    friends: row.friends || [],
    friendRequests: row.friend_requests || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function createUser({ firstName, lastName, email, password }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [firstName, lastName, email.toLowerCase().trim(), password]
  );
  return rows[0];
}

export async function updateUser(id, updates) {
  // Build dynamic SET clause
  const fields = [];
  const values = [];
  let idx = 1;

  const fieldMap = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    profilePicture: 'profile_picture',
    coverPhoto: 'cover_photo',
    bio: 'bio',
    location: 'location',
    birthday: 'birthday',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (fields.length === 0) return findUserById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
}

export async function getUserWithFriends(id) {
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!userResult.rows[0]) return null;

  const friendsResult = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.profile_picture
     FROM friends f JOIN users u ON f.friend_id = u.id
     WHERE f.user_id = $1`,
    [id]
  );

  const user = formatUser(userResult.rows[0]);
  user.friends = friendsResult.rows.map(r => ({
    _id: r.id, id: r.id,
    firstName: r.first_name, lastName: r.last_name,
    profilePicture: r.profile_picture || ''
  }));
  return user;
}

export async function searchUsers(query) {
  const searchTerm = `%${query}%`;
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, email, profile_picture
     FROM users
     WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1`,
    [searchTerm]
  );
  return rows.map(r => ({
    _id: r.id, id: r.id,
    firstName: r.first_name, lastName: r.last_name,
    email: r.email,
    profilePicture: r.profile_picture || ''
  }));
}

export async function getFriendIds(userId) {
  const { rows } = await pool.query(
    'SELECT friend_id FROM friends WHERE user_id = $1',
    [userId]
  );
  return rows.map(r => r.friend_id);
}

export default {
  findUserByEmail, findUserById, createUser, updateUser,
  getUserWithFriends, searchUsers, getFriendIds, formatUser
};