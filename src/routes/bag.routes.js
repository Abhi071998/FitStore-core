import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { addToBagHandler, getBagHandler, removeBagItemHandler } from '../controllers/bag.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBagHandler);
router.post('/items', addToBagHandler);
router.delete('/items/:id', removeBagItemHandler);

export default router;
