import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
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