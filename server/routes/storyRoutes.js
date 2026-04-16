import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
import {
  createStory,
  getStories,
  getStory,
  deleteStory,
  getUserStories
} from '../controllers/storyController.js';

const router = express.Router();
const upload = createUploader('stories', 'image');

// Story routes
router.post('/:userId', upload.single('image'), createStory);
router.get('/feed/:userId', getStories);
router.delete('/:id/:userId', deleteStory);
router.get('/user/:userId', getUserStories);
router.get('/:id/:userId', getStory);

export default router;