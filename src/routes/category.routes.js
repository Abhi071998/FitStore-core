import { Router } from 'express';
import { getAllCategoriesHandler } from '../controllers/category.controller.js';

const router = Router();

router.get('/getAllCategories', getAllCategoriesHandler);

export default router;
