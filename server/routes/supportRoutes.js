import express from 'express';
import { getCategories, getArticles } from '../controllers/supportController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/articles', getArticles);

export default router;
