import express from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment
} from '../controllers/commentController.js';

const router = express.Router();

// Comment routes
router.post('/:postId/:userId', createComment);
router.get('/:postId', getComments);
router.put('/:id/:userId', updateComment);
router.delete('/:id/:userId', deleteComment);
router.post('/:id/like/:userId', likeComment);

export default router;