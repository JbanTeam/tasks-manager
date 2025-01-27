import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
