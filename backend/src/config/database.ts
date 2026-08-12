import { PrismaClient } from '@prisma/client';

const isDev = process.env.NODE_ENV !== 'production';

export const prisma = new PrismaClient({
  log: isDev ? ['error', 'warn'] : ['error'],
});

// Graceful shutdown — release Supabase connection pool on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
