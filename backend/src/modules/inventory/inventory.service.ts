import { prisma } from '../../config/database.js';

export class InventoryService {
  async getAllStock() {
    return prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        price: true,
        stock: true,
        minimumStock: true,
        warehouse: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async adjustStock(productId: string, quantity: number, type: 'IN' | 'OUT', reason?: string, createdBy?: string) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');


      if (type === 'OUT' && product.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
      }

      const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          createdBy,
        },
      });

      return { product: updatedProduct, movement };
    });
  }

  async getStockMovements() {
    return prisma.stockMovement.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

