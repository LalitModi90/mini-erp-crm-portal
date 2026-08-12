import { prisma } from '../../config/database.js';

export class ChallanService {
  async getAll() {
    return prisma.challan.findMany({
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
  }

  async create(data: { customerId: string; createdBy?: string; items: { productId: string; quantity: number }[] }) {
    // Generate unique Challan number
    const count = await prisma.challan.count();
    const challanNumber = `CH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Fetch product details for snapshotting
    const productIds = data.items.map((i) => i.productId);
    const products = await (prisma.product as any).findMany({ where: { id: { in: productIds } } });
    const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const snapshotItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ID ${item.productId} not found`);

      totalQuantity += item.quantity;
      totalAmount += product.price * item.quantity;

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
      };
    });

    return (prisma.challan as any).create({
      data: {
        challanNumber,
        customerId: data.customerId,
        createdBy: data.createdBy,
        status: 'DRAFT',
        totalQuantity,
        totalAmount,
        items: {
          create: snapshotItems,
        },
      },
      include: { items: true, customer: true },
    });
  }

  async confirmChallan(challanId: string, userId?: string) {
    const challan = await this.getById(challanId);
    if (!challan) throw new Error('Challan not found');
    if (challan.status === 'CONFIRMED') throw new Error('Challan is already confirmed');

    // Execute atomic transaction for stock verification and reduction
    return prisma.$transaction(async (tx: any) => {
      // 1. Verify stock availability for all items
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productName} no longer exists`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName} (SKU: ${item.sku}). Available: ${product.stock}, Required: ${item.quantity}`
          );
        }
      }

      // 2. Reduce stock & record stock movement OUT for each item
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'OUT',
            reason: `CHALLAN_CONFIRMED: ${challan.challanNumber}`,
            createdBy: userId || challan.createdBy,
          },
        });
      }

      // 3. Mark Challan as CONFIRMED
      return tx.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' },
        include: { items: true, customer: true },
      });
    });
  }
}


