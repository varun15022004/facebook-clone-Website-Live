import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createStory,
  getStories,
  getStory,
  deleteStory,
  getUserStories
} from '../controllers/storyController.js';

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

// Story routes
router.post('/:userId', upload.single('image'), createStory);
router.get('/feed/:userId', getStories);
router.delete('/:id/:userId', deleteStory);
router.get('/user/:userId', getUserStories);
router.get('/:id/:userId', getStory);

export default router;