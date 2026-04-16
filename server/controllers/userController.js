import {
  findUserByEmail, findUserById, createUser, updateUser,
  getUserWithFriends, searchUsers, formatUser
} from '../models/User.js';
import bcrypt from 'bcryptjs';

// Register a new user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const savedUser = await createUser({ firstName, lastName, email, password: hashedPassword });

    const { password: _, ...userWithoutPassword } = savedUser;
    const formatted = formatUser(savedUser);
    delete formatted.password;

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const formatted = formatUser(user);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getUserWithFriends(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Don't allow password updates through this route
    delete updates.password;

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(formatUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicture = req.file.path; // Cloudinary secure URL
    const updatedUser = await updateUser(userId, { profilePicture });

    res.status(200).json(formatUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload cover photo
export const uploadCoverPhoto = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const coverPhoto = req.file.path; // Cloudinary secure URL
    const updatedUser = await updateUser(userId, { coverPhoto });

    res.status(200).json(formatUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
export const searchUsersCtrl = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await searchUsers(query);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};