import { prisma } from '../../config/database.js';

export class AuditService {
  async logAction(userId: string, action: string, entity: string, entityId: string, details?: object) {
    return (prisma.auditLog as any).create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || undefined,
      },
    });
  }


  async getLogs(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { action: { contains: search } },
            { entity: { contains: search } },
            { entityId: { contains: search } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      (prisma.auditLog as any).findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      (prisma.auditLog as any).count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
