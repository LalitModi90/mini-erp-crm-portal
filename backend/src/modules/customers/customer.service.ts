import { prisma } from '../../config/database.js';

export class CustomerService {
  async getAll(search?: string) {
    return prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { businessName: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: { challans: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async create(data: any) {
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }
    return prisma.customer.create({ data });
  }

  async update(id: string, data: any) {
    if (data.followUpDate) {
      data.followUpDate = new Date(data.followUpDate);
    }
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    // Delete linked challans if any exist to ensure clean cascade
    await prisma.challanItem.deleteMany({
      where: { challan: { customerId: id } },
    }).catch(() => {});

    await prisma.challan.deleteMany({
      where: { customerId: id },
    }).catch(() => {});

    // Permanently delete customer record from database
    return prisma.customer.delete({
      where: { id },
    });
  }
}
