import { getAllCategories } from '../services/category.service.js';

// Returns every active category as JSON.
export async function getAllCategoriesHandler(req, res, next) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}
