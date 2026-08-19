import { addToBag, getBag, removeBagItem } from '../services/bag.service.js';

// Adds/increments one or more size lines of a product in the caller's bag.
export async function addToBagHandler(req, res, next) {
  try {
    const { productId, items } = req.body;
    if (!productId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'productId and a non-empty items array are required' });
    }

    const rows = await addToBag(req.custUser.id, productId, items);
    res.status(201).json(rows);
  } catch (err) {
    next(err);
  }
}

// Returns the caller's current bag contents.
export async function getBagHandler(req, res, next) {
  try {
    const bag = await getBag(req.custUser.id);
    res.json(bag);
  } catch (err) {
    next(err);
  }
}

// Removes one line from the caller's bag.
export async function removeBagItemHandler(req, res, next) {
  try {
    await removeBagItem(req.custUser.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
