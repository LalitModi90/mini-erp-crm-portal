import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database.js';
import { HttpError } from '../../utils/http-error.js';
import { AuthService } from '../auth/auth.service.js';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  emailVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UsersService {
  async getAll(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
  }

  async create(data: { name: string; email: string; password: string; role: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new HttpError(400, 'A user with this email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: passwordHash,
        role: data.role as any,
        emailVerified: false,
        isActive: true,
      },
      select: USER_SELECT,
    });

    let emailStatus = 'sent';
    try {
      await new AuthService().createEmailVerificationOtpForUser(user.id);
    } catch (error) {
      console.error('[users] Failed to send verification email:', error);
      emailStatus = 'failed';
    }

    return { ...user, emailStatus };
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string; password?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });
  }

  async createVerificationEmail(id: string) {
    return new AuthService().createEmailVerificationOtpForUser(id);
  }

  async changeRole(id: string, role: string, actorId: string) {
    if (id === actorId) {
      throw new HttpError(400, 'You cannot change your own role.');
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, 'User not found');

    return prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: USER_SELECT,
    });
  }

  async deactivate(id: string, actorId: string) {
    if (id === actorId) {
      throw new HttpError(400, 'You cannot deactivate your own account.');
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, 'User not found');

    return prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
  }

  async activate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, 'User not found');

    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: USER_SELECT,
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}