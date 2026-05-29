import express from 'express';
import {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  getMyTasks,
  getAllTasks,
  getWorkspaceAnalytics,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/all', getAllTasks);
router.get('/my-tasks', getMyTasks);
router.get('/analytics/workspace', getWorkspaceAnalytics);
router.post('/list/:listId', createTask);
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);
router.put('/:id/move', moveTask);

export default router;
