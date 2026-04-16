import {
  createStory, getFeedStories, getAllActiveStories, findStoryById, getStoryWithViewers,
  addViewer, hasViewed, deleteStory, getUserActiveStories
} from '../models/Story.js';
import { getFriendIds } from '../models/User.js';

// Create a story
export const createStory_ = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.params.userId;

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const story = await createStory({ userId, content: content || '', image });
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get stories for feed
export const getStories = async (req, res) => {
  try {
    // Global stories feed: show all active stories to all users
    const stories = await getAllActiveStories();
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single story
export const getStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.params.userId;

    const story = await getStoryWithViewers(storyId);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Add viewer if not already viewed and not own story
    const alreadyViewed = await hasViewed(storyId, userId);
    if (!alreadyViewed && story.user.id !== userId) {
      await addViewer(storyId, userId);
    }

    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a story
export const deleteStory_ = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.params.userId;

    const story = await findStoryById(storyId);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await deleteStory(storyId);
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's own active stories
export const getUserStories = async (req, res) => {
  try {
    const userId = req.params.userId;
    const stories = await getUserActiveStories(userId);
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createStory_ as createStory, deleteStory_ as deleteStory };