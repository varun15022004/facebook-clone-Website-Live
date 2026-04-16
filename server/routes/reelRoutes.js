import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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