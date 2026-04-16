import {
  createComment, findCommentById, getCommentsByPost,
  updateComment, deleteComment, isCommentLiked, likeComment, unlikeComment
} from '../models/Comment.js';
import { getRawPost } from '../models/Post.js';
import { createNotification } from '../models/Notification.js';

// Create a comment
export const createComment_ = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.params.userId;

    const comment = await createComment({ userId, postId, content });

    // Notify post owner
    const post = await getRawPost(postId);
    if (post && post.user_id !== userId) {
      await createNotification({
        recipientId: post.user_id,
        senderId: userId,
        type: 'comment',
        postId: postId,
        commentId: comment.id
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await getCommentsByPost(postId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a comment
export const updateComment_ = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    const userId = req.params.userId;

    const comment = await findCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    const updated = await updateComment(commentId, content);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment_ = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.params.userId;

    const comment = await findCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await deleteComment(commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like / unlike a comment
export const likeComment_ = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.params.userId;

    const comment = await findCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const alreadyLiked = await isCommentLiked(commentId, userId);
    let updated;

    if (alreadyLiked) {
      updated = await unlikeComment(commentId, userId);
    } else {
      updated = await likeComment(commentId, userId);
      if (comment.user_id !== userId) {
        await createNotification({
          recipientId: comment.user_id,
          senderId: userId,
          type: 'like',
          commentId
        });
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createComment_ as createComment,
  updateComment_ as updateComment,
  deleteComment_ as deleteComment,
  likeComment_ as likeComment
};