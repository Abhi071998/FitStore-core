import prisma from '../config/prisma.js';

// Submits the whole bag as one order. Stock is reserved here, not at
// add-to-bag time - each line is checked and decremented atomically
// (the WHERE clause enforces stock >= quantity at the DB level), so a
// stock shortfall on any single line rolls back the entire submission
// and nothing is left partially reserved.
export async function submitOrder(custUserId) {
  const bagItems = await prisma.temp_order.findMany({
    where: { cust_user_id: BigInt(custUserId) },
    include: { product_sizes: { include: { products: true } } },
  });

  if (bagItems.length === 0) {
    const err = new Error('Bag is empty');
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({
      data: { cust_user_id: BigInt(custUserId), status: 'pending_approval' },
    });

    for (const item of bagItems) {
      const decremented = await tx.product_sizes.updateMany({
        where: { id: item.product_size_id, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (decremented.count === 0) {
        const err = new Error(
          `Insufficient stock for ${item.product_sizes.products.name} (${item.product_sizes.size})`
        );
        err.status = 409;
        throw err;
      }

      await tx.order_items.create({
        data: {
          order_id: order.id,
          product_size_id: item.product_size_id,
          quantity: item.quantity,
          unit_price: item.product_sizes.products.selling_price,
        },
      });
    }

    await tx.temp_order.deleteMany({ where: { cust_user_id: BigInt(custUserId) } });

    return order;
  });
}

// Lists a customer's orders with each line item's size and product info joined in.
export async function getOrders(custUserId) {
  const orders = await prisma.orders.findMany({
    where: { cust_user_id: BigInt(custUserId) },
    include: { order_items: { include: { product_sizes: { include: { products: true } } } } },
    orderBy: { id: 'desc' },
  });

  return orders.map((order) => ({
    ...order,
    order_items: order.order_items.map(({ product_sizes, ...item }) => ({
      ...item,
      size: product_sizes.size,
      product: product_sizes.products,
    })),
  }));
}

// Only reversible while the parent order is still pending_approval - once
// an admin decides, cancellation has to go through the admin/Go side
// instead, since stock and approval state must move together there.
export async function cancelOrderItem(custUserId, orderItemId) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.order_items.findFirst({
      where: {
        id: BigInt(orderItemId),
        status: 'active',
        orders: { cust_user_id: BigInt(custUserId), status: 'pending_approval' },
      },
    });

    if (!item) {
      const err = new Error('Order item not found or can no longer be cancelled');
      err.status = 404;
      throw err;
    }

    await tx.product_sizes.update({
      where: { id: item.product_size_id },
      data: { stock: { increment: item.quantity } },
    });

    return tx.order_items.update({
      where: { id: item.id },
      data: { status: 'cancelled' },
    });
  });
}
