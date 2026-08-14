import { getAllCategories } from '../services/category.service.js';

export async function getAllCategoriesHandler(req, res, next) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}
