import {
  createNote, findNoteById, getNoteWithDetails,
  getUserNotes, getPublicNotes, updateNote, deleteNote
} from '../models/Note.js';

// Create a note
export const createNote_ = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    const userId = req.params.userId;

    let music = '';
    if (req.file) {
      music = `/uploads/${req.file.filename}`;
    }

    const note = await createNote({
      userId, title, content, music,
      isPublic: isPublic === 'true' || isPublic === true
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's notes
export const getUserNotes_ = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notes = await getUserNotes(userId);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get public notes
export const getPublicNotes_ = async (req, res) => {
  try {
    const notes = await getPublicNotes();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single note
export const getNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.params.userId;

    const note = await getNoteWithDetails(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.isPublic && note.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this note' });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a note
export const updateNote_ = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content, isPublic } = req.body;
    const userId = req.params.userId;

    const note = await findNoteById(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    let music = null;
    if (req.file) {
      music = `/uploads/${req.file.filename}`;
    }

    const updated = await updateNote(noteId, {
      title, content,
      isPublic: isPublic === 'true' || isPublic === true,
      music
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a note
export const deleteNote_ = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.params.userId;

    const note = await findNoteById(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await deleteNote(noteId);
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createNote_ as createNote,
  getUserNotes_ as getUserNotes,
  getPublicNotes_ as getPublicNotes,
  updateNote_ as updateNote,
  deleteNote_ as deleteNote
};