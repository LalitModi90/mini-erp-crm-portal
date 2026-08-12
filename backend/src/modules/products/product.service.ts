import { prisma } from '../../config/database.js';

export class ProductService {
  async getAll(search?: string) {
    return prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.stockMovement.deleteMany({ where: { productId: id } }).catch(() => {});
    await prisma.challanItem.deleteMany({ where: { productId: id } }).catch(() => {});
    return prisma.product.delete({ where: { id } });
  }
}

