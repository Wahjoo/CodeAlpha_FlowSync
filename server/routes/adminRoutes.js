import express from 'express';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProjects,
  updateProject,
  deleteProject,
  getAllTasks,
  updateTask,
  deleteTask,
  getAllComments,
  deleteComment
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected by auth and admin middleware
router.use(protect);
router.use(admin);

// User Routes
router.route('/users')
  .get(getAllUsers);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Project Routes
router.route('/projects')
  .get(getAllProjects);
router.route('/projects/:id')
  .put(updateProject)
  .delete(deleteProject);

// Task Routes
router.route('/tasks')
  .get(getAllTasks);
router.route('/tasks/:id')
  .put(updateTask)
  .delete(deleteTask);

// Comment Routes
router.route('/comments')
  .get(getAllComments);
router.route('/comments/:id')
  .delete(deleteComment);

export default router;
