import prisma from '../config/prisma.js';

// Fetches every category not soft-deleted, ordered by id.
export async function getAllCategories() {
  return prisma.categories.findMany({
    where: { deleted_at: null },
    orderBy: { id: 'asc' },
  });
}
