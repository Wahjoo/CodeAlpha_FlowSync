import express from 'express';
import {
  createList,
  updateList,
  deleteList,
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/project/:projectId', createList);
router.route('/:id')
  .put(updateList)
  .delete(deleteList);

export default router;
