import prisma from '../config/prisma.js';

// Validates requested quantities (plus whatever's already in the bag) against current stock, then upserts (increments) each size line in the bag.
export async function addToBag(custUserId, productId, items) {
  const sizes = await prisma.product_sizes.findMany({
    where: {
      product_id: BigInt(productId),
      size: { in: items.map((i) => i.size) },
      deleted_at: null,
    },
  });
  const byS = new Map(sizes.map((s) => [s.size, s]));

  const existingRows = await prisma.temp_order.findMany({
    where: {
      cust_user_id: BigInt(custUserId),
      product_size_id: { in: sizes.map((s) => s.id) },
    },
  });
  const existingBySizeId = new Map(existingRows.map((r) => [r.product_size_id.toString(), r.quantity]));

  const insufficient = items
    .filter(({ size, quantity }) => {
      const productSize = byS.get(size);
      if (!productSize) return true;
      const existingQty = existingBySizeId.get(productSize.id.toString()) ?? 0n;
      return productSize.stock < existingQty + BigInt(quantity);
    })
    .map((i) => i.size);

  if (insufficient.length > 0) {
    const err = new Error(`Insufficient stock for size(s): ${insufficient.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const rows = [];
  for (const { size, quantity } of items) {
    const productSize = byS.get(size);
    const row = await prisma.temp_order.upsert({
      where: {
        cust_user_id_product_size_id: {
          cust_user_id: BigInt(custUserId),
          product_size_id: productSize.id,
        },
      },
      update: { quantity: { increment: BigInt(quantity) } },
      create: {
        cust_user_id: BigInt(custUserId),
        product_size_id: productSize.id,
        quantity: BigInt(quantity),
      },
    });
    rows.push(row);
  }

  return rows;
}

// Lists a customer's bag rows with size and product info joined in.
export async function getBag(custUserId) {
  const rows = await prisma.temp_order.findMany({
    where: { cust_user_id: BigInt(custUserId) },
    include: { product_sizes: { include: { products: true } } },
    orderBy: { id: 'asc' },
  });

  return rows.map(({ product_sizes, ...row }) => ({
    ...row,
    size: product_sizes.size,
    stock: product_sizes.stock,
    product: product_sizes.products,
  }));
}

// Deletes one bag row, scoped to its owner so a customer can't remove someone else's line.
export async function removeBagItem(custUserId, id) {
  const result = await prisma.temp_order.deleteMany({
    where: { id: BigInt(id), cust_user_id: BigInt(custUserId) },
  });

  if (result.count === 0) {
    const err = new Error('Bag item not found');
    err.status = 404;
    throw err;
  }
}
