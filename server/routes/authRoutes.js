import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateMe,
  updateUserRole,
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/me')
  .get(protect, getMe)
  .put(protect, updateMe);
router.get('/users', protect, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

export default router;
