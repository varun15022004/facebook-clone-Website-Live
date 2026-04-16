import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
import {
  createNote,
  getUserNotes,
  getPublicNotes,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';

const router = express.Router();
const upload = createUploader('notes', 'auto');

// Note routes
router.post('/:userId', upload.single('music'), createNote);
router.get('/user/:userId', getUserNotes);
router.get('/public', getPublicNotes);
router.get('/:id/:userId', getNote);
router.put('/:id/:userId', upload.single('music'), updateNote);
router.delete('/:id/:userId', deleteNote);

export default router;