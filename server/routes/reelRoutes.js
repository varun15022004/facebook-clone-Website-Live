import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
import {
  createReel,
  getReels,
  getReel,
  updateReel,
  deleteReel,
  likeReel,
  commentOnReel,
  getUserReels,
  shareReel
} from '../controllers/reelController.js';

const router = express.Router();
const upload = createUploader('reels', 'video');

// Reel routes
router.post('/:userId', upload.single('video'), createReel);
router.get('/', getReels);
router.get('/user/:userId', getUserReels);
router.get('/:id', getReel);
router.put('/:id/:userId', upload.single('video'), updateReel);
router.delete('/:id/:userId', deleteReel);
router.post('/:id/like/:userId', likeReel);
router.post('/:id/comment/:userId', commentOnReel);
router.post('/:id/share/:userId', shareReel);

export default router;