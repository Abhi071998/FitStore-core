import prisma from '../config/prisma.js';

export async function getAllCategories() {
  return prisma.categories.findMany({
    where: { deleted_at: null },
    orderBy: { id: 'asc' },
  });
}
