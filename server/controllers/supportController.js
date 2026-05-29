import SupportArticle from '../models/SupportArticle.js';
import SupportCategory from '../models/SupportCategory.js';

// @desc    Get all support categories
// @route   GET /api/support/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await SupportCategory.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support articles
// @route   GET /api/support/articles
// @access  Public
export const getArticles = async (req, res, next) => {
  try {
    const articles = await SupportArticle.find({});
    res.json(articles);
  } catch (error) {
    next(error);
  }
};
