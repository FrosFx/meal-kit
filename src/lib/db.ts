import { PrismaClient } from "@prisma/client";

// Standardni Next.js pattern: u razvoju (dev) se modul ponovo učitava pri
// svakoj izmeni fajla (hot reload), pa bismo bez ovoga otvarali novu konekciju
// ka bazi pri svakom reload-u. Čuvamo instancu na globalThis da je delimo.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
