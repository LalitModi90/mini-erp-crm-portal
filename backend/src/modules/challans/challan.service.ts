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
    if (challan.status === 'CANCELLED') throw new Error('Cannot confirm a cancelled challan');

    // Pre-flight checks (outside transaction — read-only guards)
    // 1. Verify customer is active
    if (!challan.customer.isActive) {
      throw new Error(`Customer "${challan.customer.name}" is inactive. Cannot confirm challan.`);
    }

    // 2. Verify all products are active
    for (const item of challan.items) {
      if (!(item.product as any)?.isActive) {
        throw new Error(`Product "${item.productName}" (SKU: ${item.sku}) is inactive. Cannot confirm challan.`);
      }
    }

    // Execute atomic transaction: stock check + deduction + movements + audit + challan update
    return prisma.$transaction(async (tx: any) => {
      const actorId = userId || challan.createdBy;

      // 3. Verify stock availability for ALL items first (fail-fast before any write)
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product "${item.productName}" no longer exists in the system`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}" (SKU: ${item.sku}). ` +
            `Available: ${product.stock}, Required: ${item.quantity}`,
          );
        }
      }

      // 4. For each item: decrement stock + create StockMovement OUT + create AuditLog
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

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
            createdBy: actorId,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: 'CHALLAN_STOCK_OUT',
            entity: 'Challan',
            entityId: challanId,
            details: {
              challanNumber: challan.challanNumber,
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              quantity: item.quantity,
              previousStock: product?.stock ?? null,
              newStock: (product?.stock ?? 0) - item.quantity,
            },
          },
        });
      }

      // 5. Mark Challan as CONFIRMED — final step, triggers commit
      const confirmed = await tx.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' },
        include: { items: true, customer: true },
      });

      // 6. Write a single summary AuditLog for the challan confirmation
      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: 'CHALLAN_CONFIRMED',
          entity: 'Challan',
          entityId: challanId,
          details: {
            challanNumber: challan.challanNumber,
            customerId: challan.customerId,
            customerName: challan.customer.name,
            totalQuantity: challan.totalQuantity,
            totalAmount: challan.totalAmount,
            itemCount: challan.items.length,
          },
        },
      });

      return confirmed;
    });
  }
}

