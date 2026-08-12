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

  async adjustStock(
    productId: string,
    quantity: number,
    type: 'IN' | 'OUT',
    reason?: string,
    createdBy?: string,
  ) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Fetch product — verify it exists and is active
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      if (!product.isActive) throw new Error('Product is inactive and cannot be adjusted');

      // 2. Guard against negative stock on OUT
      if (type === 'OUT' && product.stock < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        );
      }

      const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;

      // 3. Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      // 4. Create StockMovement record
      const movement = await tx.stockMovement.create({
        data: { productId, quantity, type, reason, createdBy },
      });

      // 5. Create AuditLog (immutable — no update/delete API)
      if (createdBy) {
        await tx.auditLog.create({
          data: {
            userId: createdBy,
            action: `STOCK_${type}`,
            entity: 'Product',
            entityId: productId,
            details: {
              productName: product.name,
              sku: product.sku,
              quantity,
              previousStock: product.stock,
              newStock,
              reason: reason ?? null,
            },
          },
        });
      }

      return { product: updatedProduct, movement };
    });
  }

  async getMovements() {
    return prisma.stockMovement.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

