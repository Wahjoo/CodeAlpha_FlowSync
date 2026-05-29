import express from 'express';
import { getConversation, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:userId').get(protect, getConversation);

export default router;
