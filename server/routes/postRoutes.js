import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
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
const upload = createUploader('posts', 'image');

// Post routes
router.post('/:userId', upload.array('images', 5), createPost);
router.get('/feed/:userId', getPosts);
router.put('/:id/:userId', upload.array('images', 5), updatePost);
router.delete('/:id/:userId', deletePost);
router.post('/:id/like/:userId', likePost);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);

export default router;