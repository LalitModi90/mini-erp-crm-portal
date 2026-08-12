import { z } from 'zod';
import { passwordSchema } from '../auth/auth.validation.js';

export const USER_ROLES = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  role: z.enum(USER_ROLES, { errorMap: () => ({ message: 'Invalid role' }) }),
  phone: z.string().optional(),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    password: passwordSchema.optional(),
  })
  .strict();

export const changeRoleSchema = z.object({
  role: z.enum(USER_ROLES, { errorMap: () => ({ message: 'Invalid role' }) }),
});