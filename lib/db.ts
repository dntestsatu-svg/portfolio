import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { appEnv, hasDatabaseConfig } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getDb() {
  if (!hasDatabaseConfig) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaMariaDb(appEnv.databaseUrl!);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}

export async function disconnectDb() {
  if (!globalForPrisma.prisma) {
    return;
  }

  await globalForPrisma.prisma.$disconnect();
  delete globalForPrisma.prisma;
}
