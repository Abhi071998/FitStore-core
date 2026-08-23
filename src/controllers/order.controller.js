import { submitOrder, getOrders, cancelOrderItem } from '../services/order.service.js';

// Converts the caller's bag into a pending_approval order, stores the shipping details, clears the bag, and emails the store.
export async function submitOrderHandler(req, res, next) {
  try {
    const { name, email, addressLine, city, state, pincode } = req.body;
    if (!name || !email || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({ message: 'name, email, addressLine, city, state and pincode are required' });
    }

    const order = await submitOrder(req.custUser.id, { name, email, addressLine, city, state, pincode });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// Returns the caller's orders with their line items.
export async function getOrdersHandler(req, res, next) {
  try {
    const orders = await getOrders(req.custUser.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// Cancels one line of a still-pending order and releases its reserved stock.
export async function cancelOrderItemHandler(req, res, next) {
  try {
    const item = await cancelOrderItem(req.custUser.id, req.params.itemId);
    res.json(item);
  } catch (err) {
    next(err);
  }
}
