import express from 'express';
import { createUploader } from '../utils/cloudinaryUpload.js';
import {
  register,
  login,
  getUserProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  searchUsersCtrl
} from '../controllers/userController.js';

const router = express.Router();
const upload = createUploader('users', 'image');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Search route (MUST be before /:id to avoid matching "search" as an id)
router.get('/search', searchUsersCtrl);

// Profile routes
router.get('/:id', getUserProfile);
router.put('/:id', updateProfile);
router.post('/:id/profile-picture', upload.single('image'), uploadProfilePicture);
router.post('/:id/cover-photo', upload.single('image'), uploadCoverPhoto);

export default router;