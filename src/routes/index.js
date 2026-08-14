import { Router } from 'express';
import categoryRoutes from './category.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/categories', categoryRoutes);

export default router;
