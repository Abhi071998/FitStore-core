import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;
