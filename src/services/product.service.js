import prisma from '../config/prisma.js';

// Fetches every active product in a category and renames the Prisma relation keys to category/sizes.
export async function getAllProductsByCategory(categoryId) {
  const products = await prisma.products.findMany({
    where: { category_id: BigInt(categoryId), deleted_at: null },
    include: {
      categories: true,
      product_sizes: { where: { deleted_at: null } },
    },
    orderBy: { id: 'asc' },
  });

  return products.map(({ categories, product_sizes, ...product }) => ({
    ...product,
    category: categories,
    sizes: product_sizes,
  }));
}
