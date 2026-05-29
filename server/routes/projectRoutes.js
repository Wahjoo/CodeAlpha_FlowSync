import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  addProjectMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all routes in this router

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById);

router.route('/:id/members')
  .post(addProjectMember);

export default router;
