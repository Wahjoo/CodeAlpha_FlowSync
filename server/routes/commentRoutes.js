import express from 'express';
import {
  getComments,
  createComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/task/:taskId')
  .get(getComments)
  .post(createComment);

export default router;
