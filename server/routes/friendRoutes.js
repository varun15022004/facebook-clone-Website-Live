import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend
} from '../controllers/friendController.js';

const router = express.Router();

// Friend routes
router.post('/request/:userId', sendFriendRequest);
router.post('/accept/:userId', acceptFriendRequest);
router.post('/reject/:userId', rejectFriendRequest);
router.get('/requests/:userId', getFriendRequests);
router.get('/:userId', getFriends);
router.post('/remove/:userId', removeFriend);

export default router;