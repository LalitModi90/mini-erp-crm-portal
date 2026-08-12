import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(['WHOLESALE', 'RETAIL', 'DISTRIBUTOR']).optional(),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LEAD']).optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
