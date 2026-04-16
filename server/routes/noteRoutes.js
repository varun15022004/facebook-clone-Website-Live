import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createNote,
  getUserNotes,
  getPublicNotes,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Note routes
router.post('/:userId', upload.single('music'), createNote);
router.get('/user/:userId', getUserNotes);
router.get('/public', getPublicNotes);
router.get('/:id/:userId', getNote);
router.put('/:id/:userId', upload.single('music'), updateNote);
router.delete('/:id/:userId', deleteNote);

export default router;