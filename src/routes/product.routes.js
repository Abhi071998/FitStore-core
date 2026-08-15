import { Router } from 'express';
import { getAllProductsHandler } from '../controllers/product.controller.js';

const router = Router();

router.get('/getAllProducts/:categoryId', getAllProductsHandler);

export default router;
