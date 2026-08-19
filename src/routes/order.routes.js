import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { submitOrderHandler, getOrdersHandler, cancelOrderItemHandler } from '../controllers/order.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', submitOrderHandler);
router.get('/', getOrdersHandler);
router.delete('/items/:itemId', cancelOrderItemHandler);

export default router;
