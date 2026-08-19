import { getAllProductsByCategory } from '../services/product.service.js';

// Returns every active product in the given category, with size/stock and category nested in.
export async function getAllProductsHandler(req, res, next) {
  try {
    const { categoryId } = req.params;
    const products = await getAllProductsByCategory(categoryId);
    res.json(products);
  } catch (err) {
    next(err);
  }
}
