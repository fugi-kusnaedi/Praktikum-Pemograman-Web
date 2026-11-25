import {prismaClient} from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: typeof prismaClient };

export const prisma = globalForPrisma.prisma || new prismaClient({
    log: ['query'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;