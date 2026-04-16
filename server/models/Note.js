import pool from '../db/pool.js';

function formatNote(row) {
  if (!row) return null;
  return {
    _id: row.id, id: row.id,
    user: row.user_data ? {
      _id: row.user_data.id, id: row.user_data.id,
      firstName: row.user_data.first_name, lastName: row.user_data.last_name,
      profilePicture: row.user_data.profile_picture || ''
    } : row.user_id,
    title: row.title,
    content: row.content,
    music: row.music || '',
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getNoteWithUser(noteId) {
  const { rows } = await pool.query(
    `SELECT n.*,
       json_build_object('id', u.id, 'first_name', u.first_name,
         'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data
     FROM notes n JOIN users u ON n.user_id = u.id
     WHERE n.id = $1`,
    [noteId]
  );
  return rows[0] ? formatNote(rows[0]) : null;
}

export async function createNote({ userId, title, content, music = '', isPublic = false }) {
  const { rows } = await pool.query(
    `INSERT INTO notes (user_id, title, content, music, is_public)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, title, content, music, isPublic]
  );
  return getNoteWithUser(rows[0].id);
}

export async function findNoteById(id) {
  const { rows } = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getNoteWithDetails(id) {
  return getNoteWithUser(id);
}

export async function getUserNotes(userId) {
  const { rows } = await pool.query(
    `SELECT n.id FROM notes n WHERE n.user_id = $1 ORDER BY n.created_at DESC`,
    [userId]
  );
  const notes = await Promise.all(rows.map(r => getNoteWithUser(r.id)));
  return notes.filter(Boolean);
}

export async function getPublicNotes() {
  const { rows } = await pool.query(
    `SELECT n.id FROM notes n WHERE n.is_public = true ORDER BY n.created_at DESC`
  );
  const notes = await Promise.all(rows.map(r => getNoteWithUser(r.id)));
  return notes.filter(Boolean);
}

export async function updateNote(id, { title, content, isPublic, music = null }) {
  if (music !== null) {
    await pool.query(
      `UPDATE notes SET title = $1, content = $2, is_public = $3, music = $4, updated_at = NOW() WHERE id = $5`,
      [title, content, isPublic, music, id]
    );
  } else {
    await pool.query(
      `UPDATE notes SET title = $1, content = $2, is_public = $3, updated_at = NOW() WHERE id = $4`,
      [title, content, isPublic, id]
    );
  }
  return getNoteWithUser(id);
}

export async function deleteNote(id) {
  await pool.query('DELETE FROM notes WHERE id = $1', [id]);
}

export default {
  createNote, findNoteById, getNoteWithDetails, getUserNotes,
  getPublicNotes, updateNote, deleteNote
};