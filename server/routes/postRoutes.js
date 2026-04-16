import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts
} from '../controllers/postController.js';

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

// Post routes
router.post('/:userId', upload.array('images', 5), createPost);
router.get('/feed/:userId', getPosts);
router.put('/:id/:userId', upload.array('images', 5), updatePost);
router.delete('/:id/:userId', deletePost);
router.post('/:id/like/:userId', likePost);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);

export default router;