import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Service Client
 * Ensures a single database connection pool is shared across all modules
 */
class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getInstance();
