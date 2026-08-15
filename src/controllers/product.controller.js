import { getAllProductsByCategory } from '../services/product.service.js';

export async function getAllProductsHandler(req, res, next) {
  try {
    const { categoryId } = req.params;
    const products = await getAllProductsByCategory(categoryId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}
