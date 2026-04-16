import {
  createPost, findPostById, getFeedPosts, getAllPosts, getUserPosts,
  updatePost, deletePost, getRawPost, isPostLiked, likePost, unlikePost
} from '../models/Post.js';
import { getFriendIds } from '../models/User.js';
import { createNotification } from '../models/Notification.js';

// Create a new post
export const createPost_ = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.params.userId;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path); // Cloudinary secure URL
    }

    const post = await createPost({ userId, content, images });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get feed posts
export const getPosts = async (req, res) => {
  try {
    // Global feed: show all posts to all users
    // (keeps UI functional for new users with no friends yet)
    const posts = await getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post
export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await findPostById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
export const updatePost_ = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.params.userId;

    const post = await getRawPost(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => file.path); // Cloudinary secure URL
    }

    const updatedPost = await updatePost(postId, { content, newImages });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
export const deletePost_ = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.params.userId;

    const post = await getRawPost(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await deletePost(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like / unlike a post
export const likePost_ = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.params.userId;

    const post = await getRawPost(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = await isPostLiked(postId, userId);

    let updatedPost;
    if (alreadyLiked) {
      updatedPost = await unlikePost(postId, userId);
    } else {
      updatedPost = await likePost(postId, userId);
      // Notify post owner if liker is not the owner
      if (post.user_id !== userId) {
        await createNotification({
          recipientId: post.user_id,
          senderId: userId,
          type: 'like',
          postId: postId
        });
      }
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's own posts
export const getUserPosts_ = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await getUserPosts(userId);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Named exports matching original route imports
export { createPost_ as createPost, updatePost_ as updatePost, deletePost_ as deletePost, likePost_ as likePost, getUserPosts_ as getUserPosts };