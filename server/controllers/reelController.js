import {
  createReel, getAllReels, findReelById, updateReel, deleteReel,
  isReelLiked, likeReel, unlikeReel, addReelComment, getUserReels
} from '../models/Reel.js';
import { createNotification } from '../models/Notification.js';
import { createMessage } from '../models/Message.js';

// Create a reel
export const createReel_ = async (req, res) => {
  try {
    const { caption } = req.body;
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const video = req.file.path; // Cloudinary secure URL
    const reel = await createReel({ userId, video, caption: caption || '' });
    res.status(201).json(reel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reels
export const getReels = async (req, res) => {
  try {
    const reels = await getAllReels();
    res.status(200).json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single reel
export const getReel = async (req, res) => {
  try {
    const reelId = req.params.id;
    // Use internal helper via model
    const { rows } = await import('../db/pool.js').then(m => m.default.query(
      `SELECT r.*,
         json_build_object('id', u.id, 'first_name', u.first_name,
           'last_name', u.last_name, 'profile_picture', u.profile_picture) AS user_data,
         COALESCE((SELECT array_agg(rl.user_id) FROM reel_likes rl WHERE rl.reel_id = r.id), '{}') AS likes,
         COALESCE((
           SELECT json_agg(json_build_object(
             'id', c.id, '_id', c.id, 'content', c.content, 'created_at', c.created_at,
             'user', json_build_object(
               'id', cu.id, '_id', cu.id, 'firstName', cu.first_name,
               'lastName', cu.last_name, 'profilePicture', cu.profile_picture
             )
           ) ORDER BY c.created_at ASC)
           FROM comments c JOIN users cu ON c.user_id = cu.id WHERE c.reel_id = r.id
         ), '[]'::json) AS comments
       FROM reels r JOIN users u ON r.user_id = u.id WHERE r.id = $1`,
      [reelId]
    ));

    if (!rows[0]) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const row = rows[0];
    res.status(200).json({
      _id: row.id, id: row.id,
      user: {
        _id: row.user_data.id, id: row.user_data.id,
        firstName: row.user_data.first_name, lastName: row.user_data.last_name,
        profilePicture: row.user_data.profile_picture || ''
      },
      video: row.video, caption: row.caption,
      likes: row.likes || [], comments: row.comments || [],
      createdAt: row.created_at
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a reel
export const updateReel_ = async (req, res) => {
  try {
    const reelId = req.params.id;
    const { caption } = req.body;
    const userId = req.params.userId;

    const reel = await findReelById(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this reel' });
    }

    const video = req.file ? req.file.path : null; // Cloudinary secure URL
    const updated = await updateReel(reelId, { caption, video });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a reel
export const deleteReel_ = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.params.userId;

    const reel = await findReelById(reelId);

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this reel' });
    }

    await deleteReel(reelId);
    res.status(200).json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like / unlike a reel
export const likeReel_ = async (req, res) => {
  try {
    const reelId = req.params.id;
    const userId = req.params.userId;

    const reel = await findReelById(reelId);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const alreadyLiked = await isReelLiked(reelId, userId);
    let updated;

    if (alreadyLiked) {
      updated = await unlikeReel(reelId, userId);
    } else {
      updated = await likeReel(reelId, userId);
      if (reel.user_id !== userId) {
        await createNotification({
          recipientId: reel.user_id, senderId: userId,
          type: 'like',
          // notifications.post_id references posts(id) so it can't store reel ids
          postId: null
        });
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Comment on a reel
export const commentOnReel = async (req, res) => {
  try {
    const { content } = req.body;
    const reelId = req.params.id;
    const userId = req.params.userId;

    const reel = await findReelById(reelId);
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const comment = await addReelComment({ userId, reelId, content });

    if (reel.user_id !== userId) {
      await createNotification({
        recipientId: reel.user_id, senderId: userId,
        type: 'comment',
        // notifications.post_id references posts(id) so it can't store reel ids
        postId: null,
        commentId: comment.id
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's reels
export const getUserReels_ = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reels = await getUserReels(userId);
    res.status(200).json(reels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share a reel
export const shareReel = async (req, res) => {
  try {
    const { friendId } = req.body;
    const reelId = req.params.id;
    const userId = req.params.userId;
    
    // Create an explicit notification
    await createNotification({
      recipientId: friendId,
      senderId: userId,
      type: 'reel_share'
    });

    // Also send a direct message so it appears in Chat!
    const content = `Check out this reel: http://localhost:5173/reels/${reelId}`;
    await createMessage({
      senderId: userId,
      recipientId: friendId,
      content,
      attachments: []
    });

    res.status(200).json({ message: 'Reel shared successfully' });
  } catch (error) {
    console.error('Share Reel error:', error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createReel_ as createReel, updateReel_ as updateReel,
  deleteReel_ as deleteReel, likeReel_ as likeReel,
  getUserReels_ as getUserReels
};